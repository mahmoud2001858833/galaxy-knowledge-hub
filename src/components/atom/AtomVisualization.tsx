
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
  const electrons = particles.filter(p => p.type === 'electron');
  const nucleons = particles.filter(p => p.type === 'proton' || p.type === 'neutron');

  // حساب عدد الإلكترونات في كل مستوى
  const electronsByLevel = ORBITAL_CAPACITY.map(() => 0);
  electrons.forEach((_, index) => {
    let electronCount = 0;
    for (let level = 0; level < ORBITAL_CAPACITY.length; level++) {
      if (index < electronCount + ORBITAL_CAPACITY[level]) {
        electronsByLevel[level]++;
        break;
      }
      electronCount += ORBITAL_CAPACITY[level];
    }
  });

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 h-[700px]">
      <CardContent className="p-4 h-full">
        <div className="relative w-full h-full bg-gradient-to-br from-gray-900/50 to-black/50 rounded-lg border-2 border-dashed border-gray-500/30 overflow-hidden">
          
          {/* النواة المركزية - أكبر وأوضح مع تأثيرات محسنة */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-yellow-400/90 bg-gradient-to-br from-yellow-500/40 to-orange-500/40 flex items-center justify-center backdrop-blur-sm shadow-2xl animate-pulse"
            style={{
              width: `${NUCLEUS_RADIUS * 2}px`,
              height: `${NUCLEUS_RADIUS * 2}px`,
              boxShadow: '0 0 60px rgba(255, 215, 0, 0.9), inset 0 0 40px rgba(255, 215, 0, 0.4), 0 0 120px rgba(255, 165, 0, 0.6)',
              filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))'
            }}
          >
            <div className="text-center">
              <div className="text-yellow-300 text-sm font-bold">النواة</div>
              <div className="text-yellow-200 text-xs mt-1">
                {nucleons.length} جسيم
              </div>
            </div>
          </div>

          {/* مسارات الإلكترونات - أوضح مع تأثيرات ضوئية */}
          {ORBITAL_RADII.map((radius, index) => {
            const capacity = ORBITAL_CAPACITY[index];
            const current = electronsByLevel[index] || 0;
            const isFull = current >= capacity;
            const isEmpty = current === 0;
            
            return (
              <div
                key={index}
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 rounded-full ${
                  isFull ? 'border-green-400/90' : 
                  isEmpty ? 'border-blue-400/60' : 'border-blue-400/80'
                }`}
                style={{
                  width: `${radius * 2}px`,
                  height: `${radius * 2}px`,
                  boxShadow: isFull ? 
                    `0 0 25px rgba(34, 197, 94, 0.8), inset 0 0 20px rgba(34, 197, 94, 0.3)` :
                    `0 0 ${20 + index * 5}px rgba(59, 130, 246, 0.6), inset 0 0 ${15 + index * 3}px rgba(59, 130, 246, 0.2)`,
                  background: isFull ? 
                    `radial-gradient(circle, transparent 97%, rgba(34, 197, 94, 0.2) 100%)` :
                    `radial-gradient(circle, transparent 97%, rgba(59, 130, 246, 0.15) 100%)`,
                  animation: isEmpty ? 'none' : `pulse 3s infinite, rotate ${5 + index * 2}s linear infinite`,
                  filter: `drop-shadow(0 0 ${10 + index * 2}px ${isFull ? 'rgba(34, 197, 94, 0.4)' : 'rgba(59, 130, 246, 0.4)'})`
                }}
              >
                <div 
                  className={`absolute -top-10 left-1/2 transform -translate-x-1/2 ${
                    isFull ? 'bg-green-500/95 border-green-300' : 
                    isEmpty ? 'bg-gray-500/70 border-gray-400' : 'bg-blue-500/95 border-blue-300'
                  } text-white text-xs px-4 py-2 rounded-full font-bold shadow-lg border border-white/40 backdrop-blur-sm`}
                  style={{ fontSize: '11px' }}
                >
                  مستوى {index + 1}: {current}/{capacity}
                </div>
              </div>
            );
          })}

          {/* الجسيمات - أكبر وأوضح مع تأثيرات محسنة */}
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
              transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.3, zIndex: 30 }}
            >
              <div
                className="rounded-full border-2 border-white/90 flex items-center justify-center text-xs font-bold text-white shadow-xl cursor-pointer"
                style={{ 
                  width: `${PARTICLE_SIZE * 2.5}px`,
                  height: `${PARTICLE_SIZE * 2.5}px`,
                  backgroundColor: getParticleColor(particle.type),
                  boxShadow: `0 0 25px ${getParticleColor(particle.type)}, inset 0 0 12px rgba(255,255,255,0.5), 0 0 50px ${getParticleColor(particle.type)}80`,
                  filter: particle.type === 'electron' ? 
                           'drop-shadow(0 0 12px #3b82f6) drop-shadow(0 0 25px #3b82f680)' : 
                           particle.type === 'proton' ? 
                           'drop-shadow(0 0 12px #ef4444) drop-shadow(0 0 25px #ef444480)' :
                           'drop-shadow(0 0 12px #64748b) drop-shadow(0 0 25px #64748b80)',
                  animation: particle.type === 'electron' ? 'pulse 2s infinite' : 'none'
                }}
                title={`${particle.type === 'proton' ? 'بروتون' : 
                         particle.type === 'neutron' ? 'نيوترون' : 'إلكترون'} (${particle.id})`}
              >
                {particle.type === 'proton' ? 'P+' : 
                 particle.type === 'neutron' ? 'n°' : 'e-'}
              </div>
            </motion.div>
          ))}

          {/* مؤشر التوضع المحسن */}
          <div className="absolute bottom-4 left-4 bg-black/80 p-4 rounded-lg text-xs text-white border border-white/30 backdrop-blur-sm">
            <div className="font-bold mb-3 text-yellow-300 text-sm">مفتاح الذرة:</div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white/70 shadow-lg"></div>
                <span className="text-sm">بروتونات (P+) - في النواة</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-gray-500 border-2 border-white/70 shadow-lg"></div>
                <span className="text-sm">نيوترونات (n°) - في النواة</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white/70 shadow-lg animate-pulse"></div>
                <span className="text-sm">إلكترونات (e-) - في المدارات</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-white/30 text-xs text-gray-300">
              <div>المدارات: الأخضر = ممتلئ، الأزرق = جزئي، الرمادي = فارغ</div>
            </div>
          </div>

          {/* إحصائيات سريعة محسنة */}
          <div className="absolute top-4 right-4 bg-black/80 p-4 rounded-lg text-xs text-white border border-white/30 backdrop-blur-sm">
            <div className="font-bold mb-3 text-purple-300 text-sm">إحصائيات الذرة:</div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>البروتونات:</span>
                <span className="text-red-400 font-bold">{particles.filter(p => p.type === 'proton').length}</span>
              </div>
              <div className="flex justify-between">
                <span>النيوترونات:</span>
                <span className="text-gray-400 font-bold">{particles.filter(p => p.type === 'neutron').length}</span>
              </div>
              <div className="flex justify-between">
                <span>الإلكترونات:</span>
                <span className="text-blue-400 font-bold">{particles.filter(p => p.type === 'electron').length}</span>
              </div>
              <div className="pt-2 border-t border-white/30 flex justify-between">
                <span>المجموع:</span>
                <span className="text-yellow-400 font-bold">{particles.length} جسيم</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
