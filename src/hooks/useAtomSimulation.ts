
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

  // تحريك الإلكترونات - محسن للثبات التام للمدارات
  const animateElectrons = useCallback(() => {
    setParticles(prevParticles => {
      return prevParticles.map(particle => {
        if (particle.type === 'electron' && particle.orbitalLevel !== undefined) {
          // سرعة محسنة مع ثبات المدار
          const baseSpeed = 0.025; // سرعة ثابتة
          const levelMultiplier = 1 / Math.pow(particle.orbitalLevel + 1, 0.2); // تنوع خفيف
          const speedFactor = baseSpeed * levelMultiplier;
          
          const newAngle = (particle.angle || 0) + speedFactor;
          
          // نصف قطر المدار ثابت تماماً - لا تغيير أبداً
          const orbitalRadius = ORBITAL_RADII[Math.min(particle.orbitalLevel, ORBITAL_RADII.length - 1)];
          
          // موضع ثابت ودقيق على المدار
          const x = ATOM_CENTER.x + Math.cos(newAngle) * orbitalRadius;
          const y = ATOM_CENTER.y + Math.sin(newAngle) * orbitalRadius;
          
          return {
            ...particle,
            x,
            y,
            angle: newAngle
          };
        }
        return particle; // النوكليونات تبقى ثابتة في النواة
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

  // إضافة جسيم مع ضمان الموضع الصحيح
  const addParticle = useCallback((type: 'proton' | 'neutron' | 'electron') => {
    console.log(`إضافة جسيم: ${type}`);
    
    // تحقق من الحدود
    if (type === 'electron') {
      const currentElectrons = particles.filter(p => p.type === 'electron').length;
      if (currentElectrons >= 118) {
        console.warn('تم الوصول للحد الأقصى من الإلكترونات');
        return;
      }
    } else if (type === 'proton' || type === 'neutron') {
      const currentNucleons = particles.filter(p => p.type === 'proton' || p.type === 'neutron').length;
      if (currentNucleons >= 80) {
        console.warn('تم الوصول للحد الأقصى من النوكليونات في النواة');
        return;
      }
    }
    
    const newParticle = createNewParticle(type, particles);
    const newParticles = [...particles, newParticle];
    
    // إعادة تنظيم جميع الجسيمات مع ضمان الثبات
    const reorganizedParticles = reorganizeParticles(newParticles);
    
    console.log(`تم إضافة ${type} في الموضع الصحيح`);
    setParticles(reorganizedParticles);
  }, [particles]);

  // حذف جسيم مع إعادة التنظيم
  const removeParticle = useCallback((type: 'proton' | 'neutron' | 'electron') => {
    console.log(`حذف جسيم: ${type}`);
    
    const particleIndex = particles.findIndex(p => p.type === type);
    if (particleIndex === -1) return;

    let newParticles = particles.filter((_, index) => index !== particleIndex);
    
    // إعادة تنظيم الجسيمات بعد الحذف مع ضمان الثبات
    newParticles = reorganizeParticles(newParticles);
    
    console.log(`تم حذف ${type}, الجسيمات المتبقية:`, newParticles.length);
    setParticles(newParticles);
  }, [particles]);

  // بناء عنصر مقترح مع التوزيع الصحيح والثابت
  const buildSuggestedElement = useCallback((element: SuggestedElement) => {
    console.log(`بناء العنصر: ${element.name}`);
    
    const newParticles: Particle[] = [];
    
    // إضافة البروتونات والنيوترونات في مركز النواة
    for (let i = 0; i < element.protons + element.neutrons; i++) {
      const type = i < element.protons ? 'proton' : 'neutron';
      const particle = createNewParticle(type, newParticles);
      newParticles.push(particle);
    }
    
    // إضافة الإلكترونات على المدارات الثابتة
    for (let i = 0; i < element.electrons; i++) {
      const particle = createNewParticle('electron', newParticles);
      newParticles.push(particle);
    }
    
    // تنظيم نهائي لجميع الجسيمات مع ضمان الثبات
    const finalParticles = reorganizeParticles(newParticles);
    
    console.log(`تم بناء ${element.name} بنجاح مع مدارات ثابتة`);
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
