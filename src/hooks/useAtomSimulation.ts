
import { useState, useCallback, useRef, useEffect } from 'react';
import type { Particle, AtomData, SuggestedElement } from '@/types/atom';
import { calculateAtomData, createNewParticle, reorganizeParticles } from '@/utils/atomCalculations';
import { ATOM_CENTER, ORBITAL_RADII } from '@/types/atom';

export const useAtomSimulation = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [selectedSuggestedElement, setSelectedSuggestedElement] = useState<SuggestedElement | null>(null);
  const animationFrameRef = useRef<number>();

  // حساب بيانات الذرة
  const atomData: AtomData = calculateAtomData(particles);

  // تحريك الإلكترونات
  const animateElectrons = useCallback(() => {
    setParticles(prevParticles => {
      return prevParticles.map(particle => {
        if (particle.type === 'electron' && particle.orbitalLevel !== undefined) {
          // سرعة أبطأ للمدارات الخارجية
          const speedFactor = 0.015 / Math.pow(particle.orbitalLevel + 1, 0.3);
          const newAngle = (particle.angle || 0) + speedFactor;
          const radius = ORBITAL_RADII[particle.orbitalLevel];
          
          return {
            ...particle,
            x: ATOM_CENTER.x + Math.cos(newAngle) * radius,
            y: ATOM_CENTER.y + Math.sin(newAngle) * radius,
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

  // إضافة جسيم
  const addParticle = useCallback((type: 'proton' | 'neutron' | 'electron') => {
    const newParticle = createNewParticle(type, particles);
    const newParticles = [...particles, newParticle];
    setParticles(newParticles);
  }, [particles]);

  // حذف جسيم
  const removeParticle = useCallback((type: 'proton' | 'neutron' | 'electron') => {
    const particleIndex = particles.findIndex(p => p.type === type);
    if (particleIndex === -1) return;

    let newParticles = particles.filter((_, index) => index !== particleIndex);
    newParticles = reorganizeParticles(newParticles, type);
    
    setParticles(newParticles);
  }, [particles]);

  // بناء عنصر مقترح
  const buildSuggestedElement = useCallback((element: SuggestedElement) => {
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
    
    setParticles(newParticles);
    setSelectedSuggestedElement(element);
  }, []);

  // مسح الكل
  const clearAll = useCallback(() => {
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
    clearAll
  };
};
