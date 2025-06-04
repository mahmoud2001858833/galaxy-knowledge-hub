
import { ATOM_CENTER, NUCLEUS_RADIUS, ORBITAL_RADII, ORBITAL_CAPACITY } from '@/types/atom';
import type { Particle } from '@/types/atom';

// حساب موضع النوكليون في النواة - مُحسَّن للوضع المُحدد في المركز
export const calculateNucleonPosition = (nucleonIndex: number): { x: number; y: number } => {
  if (nucleonIndex === 0) {
    // الجسيم الأول في مركز النواة تماماً
    return { x: ATOM_CENTER.x, y: ATOM_CENTER.y };
  }
  
  // توزيع النوكليونات في طبقات دائرية مُحكمة داخل النواة
  const particlesPerLayer = 6;
  const layer = Math.floor((nucleonIndex - 1) / particlesPerLayer);
  const positionInLayer = (nucleonIndex - 1) % particlesPerLayer;
  
  // نصف قطر الطبقة داخل النواة - محدود بشدة للبقاء في المركز
  const maxSafeRadius = NUCLEUS_RADIUS * 0.4; // 40% فقط من نصف قطر النواة
  const layerRadius = Math.min(5 + layer * 8, maxSafeRadius);
  
  // حساب الزاوية مع توزيع متساو
  const angleStep = (2 * Math.PI) / particlesPerLayer;
  const angle = positionInLayer * angleStep + (layer * 0.15);
  
  const x = ATOM_CENTER.x + Math.cos(angle) * layerRadius;
  const y = ATOM_CENTER.y + Math.sin(angle) * layerRadius;
  
  return { x, y };
};

// حساب موضع الإلكترون في المدار - مُحسَّن للدوران الدقيق على مستويات الطاقة
export const calculateElectronPosition = (electronIndex: number, totalElectrons: number): { x: number; y: number; level: number; angle: number } => {
  // تحديد المستوى حسب قاعدة 2, 8, 18, 32
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
  
  // حساب الزاوية مع توزيع متساو للحصول على مدارات دقيقة
  const angleStep = (2 * Math.PI) / Math.max(electronsInLevel, 1);
  const angle = positionInLevel * angleStep;
  
  // نصف قطر المدار المُثبت - دقيق تماماً لمستويات الطاقة
  const orbitalRadius = ORBITAL_RADII[Math.min(level, ORBITAL_RADII.length - 1)];
  
  // موضع الإلكترون بالضبط على مستوى الطاقة
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

// التحقق من صحة توضع الجسيمات مع قيود مُحسنة
export const validateParticlePlacement = (particles: Particle[]): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  
  const protons = particles.filter(p => p.type === 'proton').length;
  const neutrons = particles.filter(p => p.type === 'neutron').length;
  const electrons = particles.filter(p => p.type === 'electron').length;
  
  // تحقق من توازن الشحنة
  if (Math.abs(protons - electrons) > 3) {
    warnings.push(`عدم توازن في الشحنة: ${protons} بروتون، ${electrons} إلكترون`);
  }
  
  // تحقق من سعة المدارات
  const electronsByLevel: number[] = new Array(ORBITAL_CAPACITY.length).fill(0);
  for (let i = 0; i < electrons; i++) {
    const level = getElectronLevel(i);
    if (level < electronsByLevel.length) {
      electronsByLevel[level]++;
    }
  }
  
  electronsByLevel.forEach((count, level) => {
    if (count > ORBITAL_CAPACITY[level]) {
      warnings.push(`المستوى ${level + 1} مملوء بزيادة: ${count}/${ORBITAL_CAPACITY[level]}`);
    }
  });
  
  // تحقق من ترتيب ملء المدارات
  for (let i = 0; i < electronsByLevel.length - 1; i++) {
    if (electronsByLevel[i] < ORBITAL_CAPACITY[i] && electronsByLevel[i + 1] > 0) {
      warnings.push(`يجب ملء المستوى ${i + 1} قبل البدء في المستوى ${i + 2}`);
    }
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
};

// دالة لضمان وضع الجسيمات في المكان الصحيح فقط
export const enforceParticlePlacement = (particle: Particle): Particle => {
  if (particle.type === 'proton' || particle.type === 'neutron') {
    // التأكد من أن النوكليونات في مركز النواة
    const distanceFromCenter = Math.sqrt(
      Math.pow(particle.x - ATOM_CENTER.x, 2) + Math.pow(particle.y - ATOM_CENTER.y, 2)
    );
    
    if (distanceFromCenter > NUCLEUS_RADIUS * 0.6) {
      // إعادة وضعه في مركز النواة
      const angle = Math.atan2(particle.y - ATOM_CENTER.y, particle.x - ATOM_CENTER.x);
      const safeRadius = NUCLEUS_RADIUS * 0.3;
      return {
        ...particle,
        x: ATOM_CENTER.x + Math.cos(angle) * safeRadius,
        y: ATOM_CENTER.y + Math.sin(angle) * safeRadius,
        isLocked: true
      };
    }
  } else if (particle.type === 'electron') {
    // التأكد من أن الإلكترونات على المدارات الصحيحة
    if (particle.orbitalLevel !== undefined) {
      const orbitalRadius = ORBITAL_RADII[Math.min(particle.orbitalLevel, ORBITAL_RADII.length - 1)];
      const angle = particle.angle || 0;
      return {
        ...particle,
        x: ATOM_CENTER.x + Math.cos(angle) * orbitalRadius,
        y: ATOM_CENTER.y + Math.sin(angle) * orbitalRadius
      };
    }
  }
  
  return particle;
};
