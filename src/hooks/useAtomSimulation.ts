
import { useState, useCallback, useRef, useEffect } from 'react';
import type { Particle, AtomData, SuggestedElement } from '@/types/atom';
import { calculateAtomData, createNewParticle, reorganizeParticles } from '@/utils/atomCalculations';
import { ATOM_CENTER, ORBITAL_RADII } from '@/types/atom';

export const useAtomSimulation = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [selectedSuggestedElement, setSelectedSuggestedElement] = useState<SuggestedElement | null>(null);
  const animationFrameRef = useRef<number>();

  // حساب بيانات الذرة مع التحقق من الصحة
  const atomData: AtomData = calculateAtomData(particles);

  // تحريك الإلكترونات - محسن مع سرعات متنوعة وحركة أكثر سلاسة
  const animateElectrons = useCallback(() => {
    setParticles(prevParticles => {
      return prevParticles.map(particle => {
        if (particle.type === 'electron' && particle.orbitalLevel !== undefined) {
          // سرعة محسنة ومتنوعة حسب المستوى (المستويات الأقرب أسرع)
          const baseSpeed = 0.025; // سرعة أساسية أعلى
          const levelMultiplier = 1 / Math.pow(particle.orbitalLevel + 1, 0.4); // تنوع أكبر في السرعة
          const randomVariation = 0.8 + (Math.sin(Date.now() * 0.001 + particle.orbitalLevel) * 0.4); // تنوع عشوائي
          const speedFactor = baseSpeed * levelMultiplier * randomVariation;
          
          const newAngle = (particle.angle || 0) + speedFactor;
          const radius = ORBITAL_RADII[Math.min(particle.orbitalLevel, ORBITAL_RADII.length - 1)];
          
          // إضافة اهتزاز طفيف لجعل الحركة أكثر طبيعية
          const oscillation = Math.sin(newAngle * 3) * 2;
          const adjustedRadius = radius + oscillation;
          
          return {
            ...particle,
            x: ATOM_CENTER.x + Math.cos(newAngle) * adjustedRadius,
            y: ATOM_CENTER.y + Math.sin(newAngle) * adjustedRadius,
            angle: newAngle
          };
        }
        return particle;
      });
    });

    animationFrameRef.current = requestAnimationFrame(animateElectrons);
  }, []);

  // بدء التحريك
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animateElectrons);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animateElectrons]);

  // إضافة جسيم مع التحقق من الحدود
  const addParticle = useCallback((type: 'proton' | 'neutron' | 'electron') => {
    console.log(`إضافة جسيم: ${type}`);
    
    // تحقق من الحدود مع زيادة مرونة للنوكليونات
    if (type === 'electron') {
      const currentElectrons = particles.filter(p => p.type === 'electron').length;
      if (currentElectrons >= 118) {
        console.warn('تم الوصول للحد الأقصى من الإلكترونات');
        return;
      }
    } else if (type === 'proton' || type === 'neutron') {
      const currentNucleons = particles.filter(p => p.type === 'proton' || p.type === 'neutron').length;
      if (currentNucleons >= 50) { // حد أعلى للنوكليونات لاستغلال النواة المكبرة
        console.warn('تم الوصول للحد الأقصى من النوكليونات في النواة');
        return;
      }
    }
    
    const newParticle = createNewParticle(type, particles);
    const newParticles = [...particles, newParticle];
    
    // إعادة تنظيم جميع الجسيمات
    const reorganizedParticles = reorganizeParticles(newParticles);
    
    console.log(`تم إضافة ${type} في الموضع:`, { x: newParticle.x, y: newParticle.y });
    setParticles(reorganizedParticles);
  }, [particles]);

  // حذف جسيم مع إعادة التنظيم
  const removeParticle = useCallback((type: 'proton' | 'neutron' | 'electron') => {
    console.log(`حذف جسيم: ${type}`);
    
    const particleIndex = particles.findIndex(p => p.type === type);
    if (particleIndex === -1) return;

    let newParticles = particles.filter((_, index) => index !== particleIndex);
    
    // إعادة تنظيم الجسيمات بعد الحذف
    newParticles = reorganizeParticles(newParticles);
    
    console.log(`تم حذف ${type}, الجسيمات المتبقية:`, newParticles.length);
    setParticles(newParticles);
  }, [particles]);

  // بناء عنصر مقترح مع التوزيع الصحيح
  const buildSuggestedElement = useCallback((element: SuggestedElement) => {
    console.log(`بناء العنصر: ${element.name}`);
    
    const newParticles: Particle[] = [];
    
    // إضافة البروتونات والنيوترونات
    for (let i = 0; i < element.protons + element.neutrons; i++) {
      const type = i < element.protons ? 'proton' : 'neutron';
      const particle = createNewParticle(type, newParticles);
      newParticles.push(particle);
    }
    
    // إضافة الإلكترونات
    for (let i = 0; i < element.electrons; i++) {
      const particle = createNewParticle('electron', newParticles);
      newParticles.push(particle);
    }
    
    // تنظيم نهائي لجميع الجسيمات
    const finalParticles = reorganizeParticles(newParticles);
    
    console.log(`تم بناء ${element.name} بنجاح، إجمالي الجسيمات:`, finalParticles.length);
    setParticles(finalParticles);
    setSelectedSuggestedElement(element);
  }, []);

  // مسح الكل
  const clearAll = useCallback(() => {
    console.log('مسح جميع الجسيمات');
    setParticles([]);
    setSelectedSuggestedElement(null);
  }, []);

  return {
    particles,
    atomData,
    selectedSuggestedElement,
    addParticle,
    removeParticle,
    buildSuggestedElement,
    clearAll,
    setParticles
  };
};
