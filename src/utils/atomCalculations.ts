
import { 
  ELECTRON_SHELL_ORDER, 
  SHELL_CAPACITIES, 
  SHELL_TO_LEVEL,
  ORBITAL_CAPACITY
} from '@/types/atom';
import { 
  calculateNucleonPosition, 
  calculateElectronPosition, 
  validateParticlePlacement 
} from '@/utils/atomPositioning';
import { allElements } from '@/data/all-elements';
import type { Particle, AtomData } from '@/types/atom';

// حساب التوزيع الإلكتروني المبسط
export const generateElectronConfiguration = (electronCount: number): string => {
  if (electronCount === 0) return '';
  
  const config: string[] = [];
  let remainingElectrons = electronCount;
  
  // توزيع مبسط حسب المستويات
  const levels = ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '4p', '5s', '4d', '5p', '6s', '4f', '5d', '6p', '7s'];
  
  for (const shell of levels) {
    if (remainingElectrons <= 0) break;
    
    const capacity = SHELL_CAPACITIES[shell] || 0;
    const electronsInShell = Math.min(remainingElectrons, capacity);
    
    if (electronsInShell > 0) {
      config.push(`${shell}${electronsInShell > 1 ? `^${electronsInShell}` : '¹'}`);
      remainingElectrons -= electronsInShell;
    }
  }
  
  return config.join(' ');
};

// حساب بيانات الذرة مع التحقق من الصحة
export const calculateAtomData = (particles: Particle[]): AtomData => {
  const protons = particles.filter(p => p.type === 'proton').length;
  const neutrons = particles.filter(p => p.type === 'neutron').length;
  const electrons = particles.filter(p => p.type === 'electron').length;

  const element = allElements.find(e => e.atomic_number === protons);
  const massNumber = protons + neutrons;
  const charge = protons - electrons;
  const isStable = element ? Math.abs(neutrons - element.commonNeutrons) <= 2 && Math.abs(charge) <= 1 : false;
  const electronConfiguration = generateElectronConfiguration(electrons);
  
  // التحقق من صحة التوزيع
  const validation = validateParticlePlacement(particles);

  return {
    protons,
    neutrons,
    electrons,
    element: element ? element.name : 'غير معروف',
    symbol: element ? element.symbol : '?',
    massNumber,
    charge,
    isStable,
    electronConfiguration,
    isValid: validation.isValid,
    warnings: validation.warnings
  };
};

// إعادة تنظيم الجسيمات مع الضوابط الجديدة
export const reorganizeParticles = (particles: Particle[]): Particle[] => {
  const protons = particles.filter(p => p.type === 'proton');
  const neutrons = particles.filter(p => p.type === 'neutron');
  const electrons = particles.filter(p => p.type === 'electron');
  
  // إعادة تنظيم النوكليونات مع القفل داخل النواة
  const reorganizedNucleons = [...protons, ...neutrons].map((particle, index) => {
    const position = calculateNucleonPosition(index);
    return {
      ...particle,
      x: position.x,
      y: position.y,
      isLocked: true // منع السحب خارج النواة
    };
  });
  
  // إعادة تنظيم الإلكترونات في المدارات الصحيحة
  const reorganizedElectrons = electrons.map((electron, index) => {
    const position = calculateElectronPosition(index, electrons.length);
    return {
      ...electron,
      x: position.x,
      y: position.y,
      orbitalLevel: position.level,
      angle: position.angle,
      isLocked: false // يمكن تحريكها بين المدارات
    };
  });
  
  return [...reorganizedNucleons, ...reorganizedElectrons];
};

// إنشاء جسيم جديد مع الموضع الصحيح
export const createNewParticle = (type: 'proton' | 'neutron' | 'electron', particles: Particle[]): Particle => {
  const newParticle: Particle = {
    id: `${type}-${Date.now()}-${Math.random()}`,
    type,
    x: 0,
    y: 0,
    isLocked: type !== 'electron' // النوكليونات مقفلة في النواة
  };

  if (type === 'proton' || type === 'neutron') {
    const nucleons = particles.filter(p => p.type === 'proton' || p.type === 'neutron');
    const position = calculateNucleonPosition(nucleons.length);
    newParticle.x = position.x;
    newParticle.y = position.y;
  } else if (type === 'electron') {
    const electrons = particles.filter(p => p.type === 'electron');
    const position = calculateElectronPosition(electrons.length, electrons.length + 1);
    newParticle.x = position.x;
    newParticle.y = position.y;
    newParticle.orbitalLevel = position.level;
    newParticle.angle = position.angle;
  }

  return newParticle;
};

// لون الجسيم
export const getParticleColor = (type: string): string => {
  switch (type) {
    case 'proton': return '#ef4444';
    case 'neutron': return '#64748b';
    case 'electron': return '#3b82f6';
    default: return '#6b7280';
  }
};

// التوزيع التلقائي للإلكترونات
export const autoDistributeElectrons = (atomicNumber: number): Particle[] => {
  const particles: Particle[] = [];
  
  // إضافة البروتونات والنيوترونات
  const element = allElements.find(e => e.atomic_number === atomicNumber);
  const neutrons = element?.commonNeutrons || atomicNumber;
  
  for (let i = 0; i < atomicNumber + neutrons; i++) {
    const type = i < atomicNumber ? 'proton' : 'neutron';
    const particle = createNewParticle(type, particles);
    particles.push(particle);
  }
  
  // إضافة الإلكترونات مع التوزيع الصحيح
  for (let i = 0; i < atomicNumber; i++) {
    const particle = createNewParticle('electron', particles);
    particles.push(particle);
  }
  
  return reorganizeParticles(particles);
};
