import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { particleTypes } from '@/data/lhc-educational-content';

interface Particle {
  id: string;
  type: keyof typeof particleTypes;
  angle: number;
  speed: number;
  distance: number;
}

interface CollisionEffectProps {
  isActive: boolean;
  energy: number;
  onComplete?: (particles: Particle[]) => void;
}

export const CollisionEffect = ({ isActive, energy, onComplete }: CollisionEffectProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    if (isActive) {
      setShowFlash(true);
      
      setTimeout(() => {
        setShowFlash(false);
        generateParticles();
      }, 300);
    } else {
      setParticles([]);
    }
  }, [isActive, energy]);

  const generateParticles = () => {
    const particleCount = Math.min(Math.floor(energy / 200) + 10, 80);
    const newParticles: Particle[] = [];

    const particleTypeKeys = Object.keys(particleTypes) as (keyof typeof particleTypes)[];
    const isHighEnergy = energy >= 10000;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      let particleType = particleTypeKeys[Math.floor(Math.random() * particleTypeKeys.length)];
      
      if (isHighEnergy && Math.random() < 0.01) {
        particleType = 'higgs-like';
      }

      newParticles.push({
        id: `particle-${i}`,
        type: particleType,
        angle,
        speed: 1 + Math.random() * 2,
        distance: 0
      });
    }

    setParticles(newParticles);
    
    setTimeout(() => {
      if (onComplete) {
        onComplete(newParticles);
      }
    }, 2000);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <AnimatePresence>
        {showFlash && (
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-white"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 2] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ filter: 'blur(30px)' }}
          />
        )}
      </AnimatePresence>

      {particles.map(particle => {
        const particleInfo = particleTypes[particle.type];
        const x = Math.cos(particle.angle) * 250;
        const y = Math.sin(particle.angle) * 250;

        return (
          <motion.div
            key={particle.id}
            className="absolute"
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ 
              x, 
              y,
              opacity: particle.type === 'neutrino' ? [1, 0] : 1
            }}
            transition={{ 
              duration: particle.speed,
              ease: 'linear'
            }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: particleInfo.color,
                boxShadow: `0 0 10px ${particleInfo.color}`,
                filter: particle.type === 'higgs-like' ? 'brightness(2)' : 'none'
              }}
            />
            <motion.div
              className="absolute top-0 left-0 w-full h-0.5 origin-left"
              style={{
                backgroundColor: particleInfo.color,
                opacity: 0.6,
                transform: `rotate(${particle.angle}rad)`
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 50 }}
              transition={{ duration: particle.speed }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};
