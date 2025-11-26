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
    const particleCount = Math.min(Math.floor(energy / 150) + 20, 120); // More particles
    const newParticles: Particle[] = [];

    const particleTypeKeys = Object.keys(particleTypes) as (keyof typeof particleTypes)[];
    const isHighEnergy = energy >= 10000;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.8;
      let particleType = particleTypeKeys[Math.floor(Math.random() * particleTypeKeys.length)];
      
      if (isHighEnergy && Math.random() < 0.02) {
        particleType = 'higgs-like';
      }

      newParticles.push({
        id: `particle-${i}`,
        type: particleType,
        angle,
        speed: 1.5 + Math.random() * 2.5,
        distance: 0
      });
    }

    setParticles(newParticles);
    
    setTimeout(() => {
      if (onComplete) {
        onComplete(newParticles);
      }
    }, 3000);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <AnimatePresence>
        {showFlash && (
          <>
            <motion.div
              className="absolute w-96 h-96 rounded-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0.8, 0], 
                scale: [0, 1, 2.5, 4],
                background: [
                  'radial-gradient(circle, #ffffff 0%, #ffff00 20%, #ff6600 40%, #ff0000 60%, transparent 100%)',
                  'radial-gradient(circle, #ffff00 0%, #ff6600 20%, #ff0000 40%, #000000 60%, transparent 100%)',
                  'radial-gradient(circle, #ff0000 0%, #000000 30%, transparent 60%)'
                ]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{ filter: 'blur(40px)' }}
            />
            <motion.div
              className="absolute w-64 h-64 rounded-full bg-white"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0.5, 0], scale: [0, 0.5, 1.5, 3] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{ filter: 'blur(20px)' }}
            />
          </>
        )}
      </AnimatePresence>

      {particles.map(particle => {
        const particleInfo = particleTypes[particle.type];
        const x = Math.cos(particle.angle) * 350;
        const y = Math.sin(particle.angle) * 350;

        return (
          <motion.div
            key={particle.id}
            className="absolute"
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ 
              x, 
              y,
              opacity: particle.type === 'neutrino' ? [1, 0.5, 0] : [1, 1, 0.8],
              scale: [0, 1.5, 1],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: particle.speed,
              ease: 'easeOut'
            }}
          >
            {/* Particle glow */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: particle.type === 'higgs-like' ? '24px' : '16px',
                height: particle.type === 'higgs-like' ? '24px' : '16px',
                left: '-12px',
                top: '-12px',
                backgroundColor: particleInfo.color,
                boxShadow: `0 0 30px ${particleInfo.color}, 0 0 60px ${particleInfo.color}`,
                filter: 'blur(4px)'
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            
            {/* Particle core */}
            <div
              className="rounded-full"
              style={{
                width: particle.type === 'higgs-like' ? '12px' : '8px',
                height: particle.type === 'higgs-like' ? '12px' : '8px',
                left: '-6px',
                top: '-6px',
                position: 'absolute',
                backgroundColor: particleInfo.color,
                boxShadow: `0 0 20px ${particleInfo.color}, inset 0 0 10px rgba(255,255,255,0.8)`,
                filter: particle.type === 'higgs-like' ? 'brightness(2)' : 'brightness(1.5)'
              }}
            />
            
            {/* Particle trail with spiral effect */}
            <motion.div
              className="absolute top-0 left-0 h-1 origin-left"
              style={{
                width: '200px',
                background: `linear-gradient(90deg, ${particleInfo.color} 0%, transparent 100%)`,
                opacity: 0.8,
                transform: `rotate(${particle.angle}rad)`,
                filter: 'blur(1px)'
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ 
                scaleX: [0, 1, 0.5],
                opacity: [0, 0.8, 0]
              }}
              transition={{ duration: particle.speed }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};
