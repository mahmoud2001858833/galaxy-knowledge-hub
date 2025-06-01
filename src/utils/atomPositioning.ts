
import { ATOM_CENTER, NUCLEUS_RADIUS, ORBITAL_RADII, ORBITAL_CAPACITY } from '@/types/atom';
import type { Particle } from '@/types/atom';

// حساب موضع النوكليون في النواة - مبسط وصحيح
export const calculateNucleonPosition = (nucleonIndex: number): { x: number; y: number } => {
  if (nucleonIndex === 0) {
    // الجسيم الأول في المركز
    return { x: ATOM_CENTER.x, y: ATOM_CENTER.y };
  }
  
  // توزيع النوكليونات في دوائر متحدة المركز داخل النواة
  const layer = Math.floor((nucleonIndex - 1) / 6) + 1;
  const positionInLayer = (nucleonIndex - 1) % 6;
  
  // نصف قطر الطبقة داخل النواة (بحد أقصى النواة)
  const maxRadius = NUCLEUS_RADIUS - 10; // هامش أمان
  const layerRadius = Math.min(15 + layer * 12, maxRadius);
  
  // حساب الزاوية
  const particlesInLayer = 6;
  const angleStep = (2 * Math.PI) / particlesInLayer;
  const angle = positionInLayer * angleStep + (layer * 0.3);
  
  return {
    x: ATOM_CENTER.x + Math.cos(angle) * layerRadius,
    y: ATOM_CENTER.y + Math.sin(angle) * layerRadius
  };
};

// حساب موضع الإلكترون في المدار - مبسط وحسب القواعد الصحيحة
export const calculateElectronPosition = (electronIndex: number, totalElectrons: number): { x: number; y: number; level: number; angle: number } => {
  // توزيع الإلكترونات حسب قاعدة 2, 8, 18, 32
  let level = 0;
  let electronCount = 0;
  let positionInLevel = 0;
  
  // تحديد المستوى والموضع فيه
  for (let i = 0; i < ORBITAL_CAPACITY.length; i++) {
    if (electronIndex < electronCount + ORBITAL_CAPACITY[i]) {
      level = i;
      positionInLevel = electronIndex - electronCount;
      break;
    }
    electronCount += ORBITAL_CAPACITY[i];
  }
  
  // حساب عدد الإلكترونات في نفس المستوى
  let electronsInSameLevel = 0;
  for (let i = 0; i < totalElectrons; i++) {
    const tempLevel = getElectronLevel(i);
    if (tempLevel === level) {
      electronsInSameLevel++;
    }
  }
  
  // حساب الزاوية مع توزيع متساو
  const angleStep = (2 * Math.PI) / Math.max(electronsInSameLevel, 2);
  const angle = positionInLevel * angleStep + (level * 0.5);
  
  // نصف قطر المدار
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
  
  return 0; // افتراضي
};

// التحقق من صحة توضع الجسيمات
export const validateParticlePlacement = (particles: Particle[]): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  
  const protons = particles.filter(p => p.type === 'proton').length;
  const electrons = particles.filter(p => p.type === 'electron').length;
  
  // تحقق من توازن الشحنة
  if (Math.abs(protons - electrons) > 3) {
    warnings.push(`عدم توازن في الشحنة: ${protons} بروتون، ${electrons} إلكترون`);
  }
  
  // تحقق من سعة المدارات
  const electronsByLevel: number[] = new Array(ORBITAL_CAPACITY.length).fill(0);
  particles.filter(p => p.type === 'electron').forEach((electron, index) => {
    const level = getElectronLevel(index);
    electronsByLevel[level]++;
  });
  
  electronsByLevel.forEach((count, level) => {
    if (count > ORBITAL_CAPACITY[level]) {
      warnings.push(`المستوى ${level + 1} ممتلئ بزيادة: ${count}/${ORBITAL_CAPACITY[level]}`);
    }
  });
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
};
