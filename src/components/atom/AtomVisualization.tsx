
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ATOM_CENTER, NUCLEUS_RADIUS, ORBITAL_RADII, ORBITAL_CAPACITY, PARTICLE_SIZE } from '@/types/atom';
import { getParticleColor } from '@/utils/atomCalculations';
import type { Particle } from '@/types/atom';

interface AtomVisualizationProps {
  particles: Particle[];
}

export const AtomVisualization: React.FC<AtomVisualizationProps> = ({ particles }) => {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 h-[700px]">
      <CardContent className="p-4 h-full">
        <div className="relative w-full h-full bg-gradient-to-br from-gray-900/50 to-black/50 rounded-lg border-2 border-dashed border-gray-500/30 overflow-hidden">
          
          {/* النواة المركزية */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-yellow-400/80 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 flex items-center justify-center backdrop-blur-sm shadow-2xl"
            style={{
              width: `${NUCLEUS_RADIUS * 2}px`,
              height: `${NUCLEUS_RADIUS * 2}px`,
              boxShadow: '0 0 50px rgba(255, 215, 0, 0.8), inset 0 0 30px rgba(255, 215, 0, 0.4)'
            }}
          >
            <span className="text-yellow-300 text-sm font-bold">النواة</span>
          </div>

          {/* المدارات الإلكترونية */}
          {ORBITAL_RADII.map((radius, index) => (
            <div
              key={index}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-blue-400/60 rounded-full"
              style={{
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                boxShadow: `0 0 ${20 + index * 8}px rgba(59, 130, 246, 0.5), inset 0 0 ${15 + index * 5}px rgba(59, 130, 246, 0.2)`,
                background: `radial-gradient(circle, transparent 95%, rgba(59, 130, 246, 0.15) 100%)`,
                animation: 'pulse 4s infinite'
              }}
            >
              <div 
                className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-500/90 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg border border-blue-300/50"
                style={{ fontSize: '10px' }}
              >
                مستوى {index + 1} (سعة: {ORBITAL_CAPACITY[index]})
              </div>
            </div>
          ))}

          {/* الجسيمات */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute"
              style={{
                left: particle.x,
                top: particle.y,
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              <div
                className="rounded-full border-2 border-white/90 flex items-center justify-center text-xs font-bold text-white shadow-2xl"
                style={{ 
                  width: `${PARTICLE_SIZE * 3}px`,
                  height: `${PARTICLE_SIZE * 3}px`,
                  backgroundColor: getParticleColor(particle.type),
                  boxShadow: `0 0 20px ${getParticleColor(particle.type)}, inset 0 0 10px rgba(255,255,255,0.5)`,
                  filter: particle.type === 'electron' ? 'drop-shadow(0 0 8px #3b82f6)' : 'none'
                }}
              >
                {particle.type === 'proton' ? 'P+' : 
                 particle.type === 'neutron' ? 'n°' : 'e-'}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
