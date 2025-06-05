
import { ATOM_CENTER, NUCLEUS_RADIUS, ORBITAL_RADII, ORBITAL_CAPACITY } from '@/types/atom';
import type { Particle } from '@/types/atom';

// حساب موضع النوكليون في النواة - مثبت في المركز تماماً
export const calculateNucleonPosition = (nucleonIndex: number): { x: number; y: number } => {
  // جميع النوكليونات في مركز النواة تماماً - لا انحراف
  if (nucleonIndex === 0) {
    return { x: ATOM_CENTER.x, y: ATOM_CENTER.y };
  }
  
  // توزيع محكم جداً في مركز النواة
  const particlesPerLayer = 6;
  const layer = Math.floor((nucleonIndex - 1) / particlesPerLayer);
  const positionInLayer = (nucleonIndex - 1) % particlesPerLayer;
  
  // نصف قطر محدود جداً - أقل من 15% من نصف قطر النواة
  const maxRadius = NUCLEUS_RADIUS * 0.1; // 10% فقط من نصف قطر النواة
  const layerRadius = Math.min(2 + layer * 2, maxRadius);
  
  const angleStep = (2 * Math.PI) / particlesPerLayer;
  const angle = positionInLayer * angleStep;
  
  const x = ATOM_CENTER.x + Math.cos(angle) * layerRadius;
  const y = ATOM_CENTER.y + Math.sin(angle) * layerRadius;
  
  return { x, y };
};

// حساب موضع الإلكترون - مثبت على المدارات تماماً
export const calculateElectronPosition = (electronIndex: number, totalElectrons: number): { x: number; y: number; level: number; angle: number } => {
  // تحديد المستوى حسب قاعدة ملء المدارات
  let level = 0;
  let electronCount = 0;
  let positionInLevel = 0;
  
  for (let i = 0; i < ORBITAL_CAPACITY.length; i++) {
    if (electronIndex < electronCount + ORBITAL_CAPACITY[i]) {
      level = i;
      positionInLevel = electronIndex - electronCount;
      break;
    }
    electronCount += ORBITAL_CAPACITY[i];
  }
  
  // حساب عدد الإلكترونات في نفس المستوى
  let electronsInLevel = 0;
  for (let i = 0; i < totalElectrons; i++) {
    const tempLevel = getElectronLevel(i);
    if (tempLevel === level) {
      electronsInLevel++;
    }
  }
  
  // حساب الزاوية مع توزيع متساو تماماً
  const angleStep = (2 * Math.PI) / Math.max(electronsInLevel, 1);
  const angle = positionInLevel * angleStep;
  
  // نصف القطر الثابت للمدار - بدون أي انحراف
  const orbitalRadius = ORBITAL_RADII[Math.min(level, ORBITAL_RADII.length - 1)];
  
  // موضع مثبت تماماً على المدار - لا يمكن الخروج منه
  const x = ATOM_CENTER.x + Math.cos(angle) * orbitalRadius;
  const y = ATOM_CENTER.y + Math.sin(angle) * orbitalRadius;
  
  return {
    x,
    y,
    level,
    angle
  };
};

// دالة مساعدة لتحديد مستوى الإلكترون
const getElectronLevel = (electronIndex: number): number => {
  let electronCount = 0;
  
  for (let level = 0; level < ORBITAL_CAPACITY.length; level++) {
    if (electronIndex < electronCount + ORBITAL_CAPACITY[level]) {
      return level;
    }
    electronCount += ORBITAL_CAPACITY[level];
  }
  
  return 0;
};

// التحقق من صحة توضع الجسيمات مع فرض القيود الصارمة
export const validateParticlePlacement = (particles: Particle[]): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  
  const protons = particles.filter(p => p.type === 'proton').length;
  const neutrons = particles.filter(p => p.type === 'neutron').length;
  const electrons = particles.filter(p => p.type === 'electron').length;
  
  // تحقق من توازن الشحنة
  if (Math.abs(protons - electrons) > 3) {
    warnings.push(`عدم توازن في الشحنة: ${protons} بروتون، ${electrons} إلكترون`);
  }
  
  // تحقق صارم من مواضع النوكليونات
  particles.forEach(particle => {
    if (particle.type === 'proton' || particle.type === 'neutron') {
      const distanceFromCenter = Math.sqrt(
        Math.pow(particle.x - ATOM_CENTER.x, 2) + 
        Math.pow(particle.y - ATOM_CENTER.y, 2)
      );
      
      if (distanceFromCenter > NUCLEUS_RADIUS * 0.15) {
        warnings.push(`${particle.type} خارج حدود النواة المسموحة`);
      }
    }
  });
  
  // تحقق صارم من مواضع الإلكترونات
  particles.forEach(particle => {
    if (particle.type === 'electron' && particle.orbitalLevel !== undefined) {
      const expectedRadius = ORBITAL_RADII[particle.orbitalLevel];
      const actualRadius = Math.sqrt(
        Math.pow(particle.x - ATOM_CENTER.x, 2) + 
        Math.pow(particle.y - ATOM_CENTER.y, 2)
      );
      
      const radiusDifference = Math.abs(actualRadius - expectedRadius);
      if (radiusDifference > 5) { // تساهل 5 بيكسل فقط
        warnings.push(`إلكترون خارج المدار المحدد: المستوى ${particle.orbitalLevel}`);
      }
    }
  });
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
};

// فرض المواضع الصحيحة بقوة - لا استثناءات
export const enforceParticlePlacement = (particle: Particle): Particle => {
  if (particle.type === 'proton' || particle.type === 'neutron') {
    // إجبار النوكليونات على البقاء في مركز النواة تماماً
    const distanceFromCenter = Math.sqrt(
      Math.pow(particle.x - ATOM_CENTER.x, 2) + Math.pow(particle.y - ATOM_CENTER.y, 2)
    );
    
    // إذا خرج من الحد المسموح، أعده للمركز فوراً
    if (distanceFromCenter > NUCLEUS_RADIUS * 0.12) {
      return {
        ...particle,
        x: ATOM_CENTER.x, // مركز تماماً
        y: ATOM_CENTER.y, // مركز تماماً
        isLocked: true // مقفل تماماً
      };
    }
  } else if (particle.type === 'electron') {
    // إجبار الإلكترونات على البقاء على المدارات بدقة مطلقة
    if (particle.orbitalLevel !== undefined) {
      const orbitalRadius = ORBITAL_RADII[Math.min(particle.orbitalLevel, ORBITAL_RADII.length - 1)];
      const angle = particle.angle || 0;
      
      // موضع مثبت تماماً على المدار - لا انحراف مطلقاً
      return {
        ...particle,
        x: ATOM_CENTER.x + Math.cos(angle) * orbitalRadius,
        y: ATOM_CENTER.y + Math.sin(angle) * orbitalRadius,
        isLocked: false // يمكن الدوران لكن على المدار فقط
      };
    }
  }
  
  return particle;
};

// دالة لإعادة تعيين جميع الجسيمات لمواضعها الصحيحة
export const resetAllParticlePositions = (particles: Particle[]): Particle[] => {
  const protons = particles.filter(p => p.type === 'proton');
  const neutrons = particles.filter(p => p.type === 'neutron');
  const electrons = particles.filter(p => p.type === 'electron');
  
  // إعادة تموضع النوكليونات في المركز
  const repositionedNucleons = [...protons, ...neutrons].map((particle, index) => {
    const position = calculateNucleonPosition(index);
    return {
      ...particle,
      x: position.x,
      y: position.y,
      isLocked: true
    };
  });
  
  // إعادة تموضع الإلكترونات على المدارات
  const repositionedElectrons = electrons.map((electron, index) => {
    const position = calculateElectronPosition(index, electrons.length);
    return {
      ...electron,
      x: position.x,
      y: position.y,
      orbitalLevel: position.level,
      angle: position.angle,
      isLocked: false
    };
  });
  
  return [...repositionedNucleons, ...repositionedElectrons];
};
