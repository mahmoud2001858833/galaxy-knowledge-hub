
import { 
  ELECTRON_SHELL_ORDER, 
  SHELL_CAPACITIES, 
  SHELL_TO_LEVEL,
  ATOM_CENTER,
  ORBITAL_RADII,
  NUCLEUS_RADIUS
} from '@/types/atom';
import { allElements } from '@/data/all-elements';
import type { Particle, AtomData } from '@/types/atom';

// حساب التوزيع الإلكتروني
export const generateElectronConfiguration = (electronCount: number): string => {
  if (electronCount === 0) return '';
  
  const config: string[] = [];
  let remainingElectrons = electronCount;
  
  for (const shell of ELECTRON_SHELL_ORDER) {
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

// حساب المستوى المداري للإلكترون - تم إصلاحه بالكامل
export const getElectronOrbitalLevel = (electronIndex: number) => {
  let electronCount = 0;
  
  for (const shell of ELECTRON_SHELL_ORDER) {
    const capacity = SHELL_CAPACITIES[shell] || 0;
    
    if (electronIndex < electronCount + capacity) {
      return {
        level: SHELL_TO_LEVEL[shell] || 0,
        positionInLevel: electronIndex - electronCount,
        shell: shell
      };
    }
    
    electronCount += capacity;
  }
  
  return { level: 0, positionInLevel: 0, shell: '1s' };
};

// حساب بيانات الذرة
export const calculateAtomData = (particles: Particle[]): AtomData => {
  const protons = particles.filter(p => p.type === 'proton').length;
  const neutrons = particles.filter(p => p.type === 'neutron').length;
  const electrons = particles.filter(p => p.type === 'electron').length;

  const element = allElements.find(e => e.atomic_number === protons);
  const massNumber = protons + neutrons;
  const charge = protons - electrons;
  const isStable = element ? Math.abs(neutrons - element.commonNeutrons) <= 2 && Math.abs(charge) <= 1 : false;
  const electronConfiguration = generateElectronConfiguration(electrons);

  return {
    protons,
    neutrons,
    electrons,
    element: element ? element.name : 'غير معروف',
    symbol: element ? element.symbol : '?',
    massNumber,
    charge,
    isStable,
    electronConfiguration
  };
};

// حساب موضع النوكليون في النواة - تم إصلاحه بالكامل
export const calculateNucleonPosition = (index: number) => {
  if (index === 0) {
    // الجسيم الأول في المركز التام
    return { x: ATOM_CENTER.x, y: ATOM_CENTER.y };
  }
  
  // توزيع دائري متدرج داخل النواة
  const layer = Math.floor((index - 1) / 6) + 1;
  const positionInLayer = (index - 1) % 6;
  
  // نصف قطر متدرج داخل النواة
  const radius = Math.min(8 + layer * 6, NUCLEUS_RADIUS - 8);
  
  // توزيع الجسيمات في دوائر
  const particlesInLayer = Math.min(6, 6 + (layer - 1) * 2);
  const angleStep = (2 * Math.PI) / particlesInLayer;
  const angle = positionInLayer * angleStep + (layer * 0.5); // إزاحة طفيفة لكل طبقة
  
  return {
    x: ATOM_CENTER.x + Math.cos(angle) * radius,
    y: ATOM_CENTER.y + Math.sin(angle) * radius
  };
};

// حساب موضع الإلكترون في المدار - تم إصلاحه بالكامل
export const calculateElectronPosition = (electronIndex: number, totalElectrons: number) => {
  const { level } = getElectronOrbitalLevel(electronIndex);
  
  // حساب عدد الإلكترونات في نفس المستوى
  let electronsInLevel = 0;
  let electronPositionInLevel = 0;
  
  for (let i = 0; i <= electronIndex; i++) {
    const { level: currentLevel } = getElectronOrbitalLevel(i);
    if (currentLevel === level) {
      if (i === electronIndex) {
        electronPositionInLevel = electronsInLevel;
      }
      electronsInLevel++;
    }
  }
  
  // حساب إجمالي الإلكترونات في هذا المستوى
  let totalInLevel = 0;
  for (let i = 0; i < totalElectrons; i++) {
    const { level: l } = getElectronOrbitalLevel(i);
    if (l === level) totalInLevel++;
  }
  
  // حساب الزاوية مع توزيع أفضل
  const angleStep = (2 * Math.PI) / Math.max(totalInLevel, 2);
  const angle = electronPositionInLevel * angleStep + (level * 0.3); // إزاحة لكل مستوى
  
  // التأكد من أن المدار داخل النطاق المسموح
  const orbitalRadius = ORBITAL_RADII[Math.min(level, ORBITAL_RADII.length - 1)];
  
  return {
    x: ATOM_CENTER.x + Math.cos(angle) * orbitalRadius,
    y: ATOM_CENTER.y + Math.sin(angle) * orbitalRadius,
    level,
    angle
  };
};

// إعادة تنظيم الجسيمات - تم تحسينه
export const reorganizeParticles = (particles: Particle[], removedType?: string): Particle[] => {
  const protons = particles.filter(p => p.type === 'proton');
  const neutrons = particles.filter(p => p.type === 'neutron');
  const electrons = particles.filter(p => p.type === 'electron');
  
  // إعادة تنظيم النوكليونات مع الحفاظ على النمط
  const reorganizedNucleons = [...protons, ...neutrons].map((particle, index) => {
    const position = calculateNucleonPosition(index);
    return {
      ...particle,
      x: position.x,
      y: position.y
    };
  });
  
  // إعادة تنظيم الإلكترونات مع التوزيع الصحيح
  const reorganizedElectrons = electrons.map((electron, index) => {
    const position = calculateElectronPosition(index, electrons.length);
    return {
      ...electron,
      x: position.x,
      y: position.y,
      orbitalLevel: position.level,
      angle: position.angle
    };
  });
  
  return [...reorganizedNucleons, ...reorganizedElectrons];
};

// إنشاء جسيم جديد - تم إصلاحه بالكامل
export const createNewParticle = (type: 'proton' | 'neutron' | 'electron', particles: Particle[]): Particle => {
  const newParticle: Particle = {
    id: `${type}-${Date.now()}-${Math.random()}`,
    type,
    x: 0,
    y: 0
  };

  if (type === 'proton' || type === 'neutron') {
    // حساب موضع النوكليون الجديد
    const nucleons = particles.filter(p => p.type === 'proton' || p.type === 'neutron');
    const position = calculateNucleonPosition(nucleons.length);
    newParticle.x = position.x;
    newParticle.y = position.y;
  } else if (type === 'electron') {
    // حساب موضع الإلكترون الجديد
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
