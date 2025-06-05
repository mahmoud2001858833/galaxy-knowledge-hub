
import { useState, useCallback, useRef, useEffect } from 'react';
import type { Particle, AtomData, SuggestedElement } from '@/types/atom';
import { calculateAtomData, createNewParticle, reorganizeParticles } from '@/utils/atomCalculations';
import { enforceParticlePlacement, resetAllParticlePositions } from '@/utils/atomPositioning';
import { ATOM_CENTER, ORBITAL_RADII } from '@/types/atom';

export const useAtomSimulation = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [selectedSuggestedElement, setSelectedSuggestedElement] = useState<SuggestedElement | null>(null);
  const animationFrameRef = useRef<number>();

  // حساب بيانات الذرة مع التحقق من الصحة
  const atomData: AtomData = calculateAtomData(particles);

  // تحريك الإلكترونات - محسن للثبات المطلق للمدارات
  const animateElectrons = useCallback(() => {
    setParticles(prevParticles => {
      return prevParticles.map(particle => {
        if (particle.type === 'electron' && particle.orbitalLevel !== undefined) {
          // سرعة ثابتة ومدروسة
          const baseSpeed = 0.02;
          const levelMultiplier = 1 / Math.pow(particle.orbitalLevel + 1, 0.15);
          const speedFactor = baseSpeed * levelMultiplier;
          
          const newAngle = (particle.angle || 0) + speedFactor;
          
          // نصف قطر المدار ثابت مطلقاً - لا تغيير أبداً
          const orbitalRadius = ORBITAL_RADII[Math.min(particle.orbitalLevel, ORBITAL_RADII.length - 1)];
          
          // موضع مثبت بدقة مطلقة على المدار
          const x = ATOM_CENTER.x + Math.cos(newAngle) * orbitalRadius;
          const y = ATOM_CENTER.y + Math.sin(newAngle) * orbitalRadius;
          
          return {
            ...particle,
            x,
            y,
            angle: newAngle
          };
        }
        
        // النوكليونات تبقى ثابتة تماماً في النواة
        if (particle.type === 'proton' || particle.type === 'neutron') {
          return enforceParticlePlacement(particle);
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

  // إضافة جسيم مع ضمان الموضع الصحيح المطلق
  const addParticle = useCallback((type: 'proton' | 'neutron' | 'electron') => {
    console.log(`إضافة جسيم: ${type} في الموضع الصحيح المحدد`);
    
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
    
    // إعادة تنظيم جميع الجسيمات مع فرض المواضع الصحيحة
    const reorganizedParticles = resetAllParticlePositions(newParticles);
    
    console.log(`تم إضافة ${type} في الموضع المحدد بدقة:`, {
      x: newParticle.x,
      y: newParticle.y,
      level: newParticle.orbitalLevel
    });
    
    setParticles(reorganizedParticles);
  }, [particles]);

  // حذف جسيم مع إعادة التنظيم المحكم
  const removeParticle = useCallback((type: 'proton' | 'neutron' | 'electron') => {
    console.log(`حذف جسيم: ${type} مع إعادة ترتيب دقيق`);
    
    const particleIndex = particles.findIndex(p => p.type === type);
    if (particleIndex === -1) return;

    let newParticles = particles.filter((_, index) => index !== particleIndex);
    
    // إعادة تنظيم محكم مع فرض المواضع الصحيحة
    newParticles = resetAllParticlePositions(newParticles);
    
    console.log(`تم حذف ${type}, إعادة ترتيب ${newParticles.length} جسيم في مواضعهم الصحيحة`);
    setParticles(newParticles);
  }, [particles]);

  // بناء عنصر مقترح مع التوزيع المحكم
  const buildSuggestedElement = useCallback((element: SuggestedElement) => {
    console.log(`بناء العنصر: ${element.name} مع مواضع محكمة`);
    
    const newParticles: Particle[] = [];
    
    // إضافة البروتونات والنيوترونات في مركز النواة
    for (let i = 0; i < element.protons + element.neutrons; i++) {
      const type = i < element.protons ? 'proton' : 'neutron';
      const particle = createNewParticle(type, newParticles);
      newParticles.push(particle);
    }
    
    // إضافة الإلكترونات على المدارات المحددة
    for (let i = 0; i < element.electrons; i++) {
      const particle = createNewParticle('electron', newParticles);
      newParticles.push(particle);
    }
    
    // تنظيم نهائي محكم لجميع الجسيمات
    const finalParticles = resetAllParticlePositions(newParticles);
    
    console.log(`تم بناء ${element.name} بدقة مطلقة مع ${finalParticles.length} جسيم في مواضعهم الصحيحة`);
    setParticles(finalParticles);
    setSelectedSuggestedElement(element);
  }, []);

  // مسح الكل
  const clearAll = useCallback(() => {
    console.log('مسح جميع الجسيمات');
    setParticles([]);
    setSelectedSuggestedElement(null);
  }, []);

  // دالة لفرض المواضع الصحيحة لجميع الجسيمات
  const enforceCorrectPositions = useCallback(() => {
    setParticles(prevParticles => resetAllParticlePositions(prevParticles));
  }, []);

  return {
    particles,
    atomData,
    selectedSuggestedElement,
    addParticle,
    removeParticle,
    buildSuggestedElement,
    clearAll,
    setParticles,
    enforceCorrectPositions
  };
};
