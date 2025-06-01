
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
          
          {/* النواة المركزية - أكبر وأوضح */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-yellow-400/90 bg-gradient-to-br from-yellow-500/40 to-orange-500/40 flex items-center justify-center backdrop-blur-sm shadow-2xl"
            style={{
              width: `${NUCLEUS_RADIUS * 2}px`,
              height: `${NUCLEUS_RADIUS * 2}px`,
              boxShadow: '0 0 50px rgba(255, 215, 0, 0.8), inset 0 0 30px rgba(255, 215, 0, 0.3)'
            }}
          >
            <div className="text-center">
              <div className="text-yellow-300 text-xs font-bold">النواة</div>
              <div className="text-yellow-200 text-xs mt-1">
                {nucleons.length} جسيم
              </div>
            </div>
          </div>

          {/* المدارات الإلكترونية - أوضح مع عرض السعة */}
          {ORBITAL_RADII.map((radius, index) => {
            const capacity = ORBITAL_CAPACITY[index];
            const current = electronsByLevel[index] || 0;
            const isFull = current >= capacity;
            const isEmpty = current === 0;
            
            return (
              <div
                key={index}
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 rounded-full ${
                  isFull ? 'border-green-400/80' : 
                  isEmpty ? 'border-blue-400/50' : 'border-blue-400/70'
                }`}
                style={{
                  width: `${radius * 2}px`,
                  height: `${radius * 2}px`,
                  boxShadow: isFull ? 
                    `0 0 20px rgba(34, 197, 94, 0.6), inset 0 0 15px rgba(34, 197, 94, 0.2)` :
                    `0 0 ${15 + index * 5}px rgba(59, 130, 246, 0.4), inset 0 0 ${10 + index * 3}px rgba(59, 130, 246, 0.1)`,
                  background: isFull ? 
                    `radial-gradient(circle, transparent 98%, rgba(34, 197, 94, 0.1) 100%)` :
                    `radial-gradient(circle, transparent 98%, rgba(59, 130, 246, 0.1) 100%)`,
                  animation: isEmpty ? 'none' : 'pulse 3s infinite'
                }}
              >
                <div 
                  className={`absolute -top-8 left-1/2 transform -translate-x-1/2 ${
                    isFull ? 'bg-green-500/90' : 
                    isEmpty ? 'bg-gray-500/60' : 'bg-blue-500/90'
                  } text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg border border-white/30`}
                  style={{ fontSize: '10px' }}
                >
                  مستوى {index + 1}: {current}/{capacity}
                </div>
              </div>
            );
          })}

          {/* الجسيمات - أكبر وأوضح */}
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
              whileHover={{ scale: 1.2 }}
            >
              <div
                className="rounded-full border-2 border-white/90 flex items-center justify-center text-xs font-bold text-white shadow-xl cursor-pointer"
                style={{ 
                  width: `${PARTICLE_SIZE * 3}px`,
                  height: `${PARTICLE_SIZE * 3}px`,
                  backgroundColor: getParticleColor(particle.type),
                  boxShadow: `0 0 20px ${getParticleColor(particle.type)}, inset 0 0 10px rgba(255,255,255,0.4)`,
                  filter: particle.type === 'electron' ? 'drop-shadow(0 0 8px #3b82f6)' : 
                           particle.type === 'proton' ? 'drop-shadow(0 0 8px #ef4444)' :
                           'drop-shadow(0 0 8px #64748b)'
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
          <div className="absolute bottom-4 left-4 bg-black/70 p-3 rounded-lg text-xs text-white border border-white/20">
            <div className="font-bold mb-2 text-yellow-300">مفتاح الذرة:</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-500 border border-white/50"></div>
                <span>بروتونات (P+) - في النواة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gray-500 border border-white/50"></div>
                <span>نيوترونات (n°) - في النواة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500 border border-white/50"></div>
                <span>إلكترونات (e-) - في المدارات</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-white/20 text-xs text-gray-300">
              <div>المدارات: الأخضر = ممتلئ، الأزرق = جزئي، الرمادي = فارغ</div>
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="absolute top-4 right-4 bg-black/70 p-3 rounded-lg text-xs text-white border border-white/20">
            <div className="font-bold mb-2 text-purple-300">إحصائيات الذرة:</div>
            <div className="space-y-1">
              <div>البروتونات: {particles.filter(p => p.type === 'proton').length}</div>
              <div>النيوترونات: {particles.filter(p => p.type === 'neutron').length}</div>
              <div>الإلكترونات: {particles.filter(p => p.type === 'electron').length}</div>
              <div className="pt-1 border-t border-white/20">
                المجموع: {particles.length} جسيم
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
