
import { ATOM_CENTER, NUCLEUS_RADIUS, ORBITAL_RADII, ORBITAL_CAPACITY } from '@/types/atom';
import type { Particle } from '@/types/atom';

// حساب موضع النوكليون في النواة - محسن للوضع الدقيق في المركز
export const calculateNucleonPosition = (nucleonIndex: number): { x: number; y: number } => {
  if (nucleonIndex === 0) {
    // الجسيم الأول في مركز النواة تماماً
    return { x: ATOM_CENTER.x, y: ATOM_CENTER.y };
  }
  
  // توزيع النوكليونات في دوائر متحدة المركز داخل النواة
  const particlesPerLayer = 6; // عدد أقل لكل طبقة للحصول على توزيع أكثر دقة
  const layer = Math.floor((nucleonIndex - 1) / particlesPerLayer);
  const positionInLayer = (nucleonIndex - 1) % particlesPerLayer;
  
  // نصف قطر الطبقة داخل النواة - مع ضمان البقاء في المركز
  const maxLayerRadius = NUCLEUS_RADIUS * 0.7; // استخدام 70% من نصف قطر النواة
  const layerRadius = Math.min(8 + layer * 12, maxLayerRadius); // طبقات أكثر تقارباً من المركز
  
  // حساب الزاوية مع توزيع متساو
  const angleStep = (2 * Math.PI) / particlesPerLayer;
  const angle = positionInLayer * angleStep + (layer * 0.2); // تنوع أقل بين الطبقات
  
  const x = ATOM_CENTER.x + Math.cos(angle) * layerRadius;
  const y = ATOM_CENTER.y + Math.sin(angle) * layerRadius;
  
  // التحقق من أن الموضع داخل النواة
  const distanceFromCenter = Math.sqrt(Math.pow(x - ATOM_CENTER.x, 2) + Math.pow(y - ATOM_CENTER.y, 2));
  if (distanceFromCenter > NUCLEUS_RADIUS * 0.8) {
    // إذا كان خارج المنطقة المسموحة، ضعه أقرب للمركز
    const safeRadius = Math.min(layerRadius, NUCLEUS_RADIUS * 0.6);
    return {
      x: ATOM_CENTER.x + Math.cos(angle) * safeRadius,
      y: ATOM_CENTER.y + Math.sin(angle) * safeRadius
    };
  }
  
  return { x, y };
};

// حساب موضع الإلكترون في المدار - محسن للدوران الدقيق حول مستويات الطاقة
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
  
  // نصف قطر المدار المحدد - الضبط الدقيق لمستويات الطاقة
  const orbitalRadius = ORBITAL_RADII[Math.min(level, ORBITAL_RADII.length - 1)];
  
  return {
    x: ATOM_CENTER.x + Math.cos(angle) * orbitalRadius,
    y: ATOM_CENTER.y + Math.sin(angle) * orbitalRadius,
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

// التحقق من صحة توضع الجسيمات مع قيود محسنة
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
  
  // تحقق من وضع النوكليونات في النواة
  particles.forEach(particle => {
    if (particle.type === 'proton' || particle.type === 'neutron') {
      const distanceFromCenter = Math.sqrt(
        Math.pow(particle.x - ATOM_CENTER.x, 2) + Math.pow(particle.y - ATOM_CENTER.y, 2)
      );
      if (distanceFromCenter > NUCLEUS_RADIUS * 0.8) {
        warnings.push(`${particle.type === 'proton' ? 'بروتون' : 'نيوترون'} بعيد عن مركز النواة`);
      }
    }
  });
  
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
    
    if (distanceFromCenter > NUCLEUS_RADIUS * 0.8) {
      // إعادة وضعه في مركز النواة
      const angle = Math.atan2(particle.y - ATOM_CENTER.y, particle.x - ATOM_CENTER.x);
      const safeRadius = NUCLEUS_RADIUS * 0.5; // نصف المسافة من المركز
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
