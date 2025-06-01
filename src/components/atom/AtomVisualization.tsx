
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
          
          {/* النواة المركزية - محسنة */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-yellow-400/90 bg-gradient-to-br from-yellow-500/40 to-orange-500/40 flex items-center justify-center backdrop-blur-sm shadow-2xl"
            style={{
              width: `${NUCLEUS_RADIUS * 2}px`,
              height: `${NUCLEUS_RADIUS * 2}px`,
              boxShadow: '0 0 40px rgba(255, 215, 0, 0.8), inset 0 0 20px rgba(255, 215, 0, 0.3)'
            }}
          >
            <span className="text-yellow-300 text-xs font-bold">النواة</span>
          </div>

          {/* المدارات الإلكترونية - محسنة */}
          {ORBITAL_RADII.map((radius, index) => (
            <div
              key={index}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-blue-400/70 rounded-full"
              style={{
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                boxShadow: `0 0 ${15 + index * 5}px rgba(59, 130, 246, 0.4), inset 0 0 ${10 + index * 3}px rgba(59, 130, 246, 0.1)`,
                background: `radial-gradient(circle, transparent 98%, rgba(59, 130, 246, 0.1) 100%)`,
                animation: 'pulse 3s infinite'
              }}
            >
              <div 
                className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg border border-blue-300/50"
                style={{ fontSize: '9px' }}
              >
                مستوى {index + 1}
              </div>
            </div>
          ))}

          {/* الجسيمات - محسنة */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute"
              style={{
                left: particle.x,
                top: particle.y,
                transform: 'translate(-50%, -50%)',
                zIndex: particle.type === 'electron' ? 15 : 20,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            >
              <div
                className="rounded-full border-2 border-white/90 flex items-center justify-center text-xs font-bold text-white shadow-xl"
                style={{ 
                  width: `${PARTICLE_SIZE * 2.5}px`,
                  height: `${PARTICLE_SIZE * 2.5}px`,
                  backgroundColor: getParticleColor(particle.type),
                  boxShadow: `0 0 15px ${getParticleColor(particle.type)}, inset 0 0 8px rgba(255,255,255,0.4)`,
                  filter: particle.type === 'electron' ? 'drop-shadow(0 0 6px #3b82f6)' : 
                           particle.type === 'proton' ? 'drop-shadow(0 0 6px #ef4444)' :
                           'drop-shadow(0 0 6px #64748b)'
                }}
              >
                {particle.type === 'proton' ? 'P+' : 
                 particle.type === 'neutron' ? 'n°' : 'e-'}
              </div>
            </motion.div>
          ))}

          {/* مؤشر التوضع */}
          <div className="absolute bottom-4 left-4 bg-black/60 p-2 rounded-lg text-xs text-white">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>بروتونات (في النواة)</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span>نيوترونات (في النواة)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>إلكترونات (في المدارات)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
