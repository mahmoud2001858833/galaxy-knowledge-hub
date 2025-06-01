
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

// حساب المستوى المداري للإلكترون
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

// حساب موضع النوكليون في النواة
export const calculateNucleonPosition = (index: number) => {
  if (index === 0) {
    return { x: ATOM_CENTER.x, y: ATOM_CENTER.y };
  }
  
  const layer = Math.floor((index - 1) / 6);
  const positionInLayer = (index - 1) % 6;
  const radius = Math.min(20 + layer * 12, NUCLEUS_RADIUS - 10);
  const angleStep = (2 * Math.PI) / Math.max(6, 6 + layer * 2);
  const angle = positionInLayer * angleStep;
  
  return {
    x: ATOM_CENTER.x + Math.cos(angle) * radius,
    y: ATOM_CENTER.y + Math.sin(angle) * radius
  };
};

// حساب موضع الإلكترون في المدار
export const calculateElectronPosition = (electronIndex: number, allElectrons: Particle[]) => {
  const { level } = getElectronOrbitalLevel(electronIndex);
  
  // حساب عدد الإلكترونات في نفس المستوى
  let electronsInLevel = 0;
  for (let i = 0; i < electronIndex; i++) {
    const { level: prevLevel } = getElectronOrbitalLevel(i);
    if (prevLevel === level) electronsInLevel++;
  }
  
  // حساب إجمالي الإلكترونات في هذا المستوى
  let totalInLevel = 0;
  for (let i = 0; i < allElectrons.length; i++) {
    const { level: l } = getElectronOrbitalLevel(i);
    if (l === level) totalInLevel++;
  }
  
  // حساب الزاوية
  const angleStep = (2 * Math.PI) / Math.max(totalInLevel, 2);
  const angle = electronsInLevel * angleStep;
  
  return {
    x: ATOM_CENTER.x + Math.cos(angle) * ORBITAL_RADII[level],
    y: ATOM_CENTER.y + Math.sin(angle) * ORBITAL_RADII[level],
    level,
    angle
  };
};

// إعادة تنظيم الجسيمات
export const reorganizeParticles = (particles: Particle[], removedType?: string): Particle[] => {
  const protons = particles.filter(p => p.type === 'proton');
  const neutrons = particles.filter(p => p.type === 'neutron');
  const electrons = particles.filter(p => p.type === 'electron');
  
  // إعادة تنظيم النوكليونات
  const reorganizedNucleons = [...protons, ...neutrons].map((particle, index) => {
    const position = calculateNucleonPosition(index);
    return {
      ...particle,
      x: position.x,
      y: position.y
    };
  });
  
  // إعادة تنظيم الإلكترونات
  const reorganizedElectrons = electrons.map((electron, index) => {
    const position = calculateElectronPosition(index, electrons);
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

// إنشاء جسيم جديد
export const createNewParticle = (type: 'proton' | 'neutron' | 'electron', particles: Particle[]): Particle => {
  const newParticle: Particle = {
    id: `${type}-${Date.now()}-${Math.random()}`,
    type,
    x: 0,
    y: 0
  };

  if (type === 'proton' || type === 'neutron') {
    const nucleons = particles.filter(p => p.type === 'proton' || p.type === 'neutron');
    const position = calculateNucleonPosition(nucleons.length);
    newParticle.x = position.x;
    newParticle.y = position.y;
  } else if (type === 'electron') {
    const electrons = particles.filter(p => p.type === 'electron');
    const position = calculateElectronPosition(electrons.length, [...electrons, newParticle]);
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
