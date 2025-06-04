
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
          
          {/* النواة المركزية - محسنة مع تأثيرات أقوى */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-yellow-300/95 bg-gradient-to-br from-yellow-400/60 to-orange-600/60 flex items-center justify-center backdrop-blur-sm shadow-2xl"
            style={{
              width: `${NUCLEUS_RADIUS * 2}px`,
              height: `${NUCLEUS_RADIUS * 2}px`,
              boxShadow: '0 0 80px rgba(255, 215, 0, 1), inset 0 0 50px rgba(255, 215, 0, 0.5), 0 0 150px rgba(255, 165, 0, 0.8)',
              filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.9))',
              animation: 'pulse 3s infinite'
            }}
          >
            <div className="text-center">
              <div className="text-yellow-100 text-sm font-bold">النواة</div>
              <div className="text-yellow-200 text-xs mt-1">
                {nucleons.length} جسيم
              </div>
            </div>
          </div>

          {/* مسارات الإلكترونات - محسنة مع تأثيرات ضوئية أقوى */}
          {ORBITAL_RADII.map((radius, index) => {
            const capacity = ORBITAL_CAPACITY[index];
            const current = electronsByLevel[index] || 0;
            const isFull = current >= capacity;
            const isEmpty = current === 0;
            
            return (
              <div
                key={index}
                className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-3 rounded-full ${
                  isFull ? 'border-green-300/95' : 
                  isEmpty ? 'border-blue-300/60' : 'border-blue-300/85'
                }`}
                style={{
                  width: `${radius * 2}px`,
                  height: `${radius * 2}px`,
                  borderWidth: '3px',
                  boxShadow: isFull ? 
                    `0 0 35px rgba(34, 197, 94, 0.9), inset 0 0 25px rgba(34, 197, 94, 0.4), 0 0 70px rgba(34, 197, 94, 0.6)` :
                    `0 0 ${25 + index * 8}px rgba(59, 130, 246, 0.8), inset 0 0 ${20 + index * 5}px rgba(59, 130, 246, 0.3), 0 0 ${50 + index * 10}px rgba(59, 130, 246, 0.5)`,
                  background: isFull ? 
                    `radial-gradient(circle, transparent 96%, rgba(34, 197, 94, 0.25) 100%)` :
                    `radial-gradient(circle, transparent 96%, rgba(59, 130, 246, 0.2) 100%)`,
                  animation: isEmpty ? 'none' : `pulse 4s infinite, spin ${8 + index * 3}s linear infinite`,
                  filter: `drop-shadow(0 0 ${15 + index * 3}px ${isFull ? 'rgba(34, 197, 94, 0.5)' : 'rgba(59, 130, 246, 0.5)'})`
                }}
              >
                <div 
                  className={`absolute -top-12 left-1/2 transform -translate-x-1/2 ${
                    isFull ? 'bg-green-400/95 border-green-200 text-white' : 
                    isEmpty ? 'bg-gray-600/80 border-gray-400 text-gray-200' : 'bg-blue-400/95 border-blue-200 text-white'
                  } text-xs px-5 py-2 rounded-full font-bold shadow-xl border-2 backdrop-blur-sm`}
                  style={{ fontSize: '12px', fontWeight: '700' }}
                >
                  مستوى {index + 1}: {current}/{capacity}
                </div>
              </div>
            );
          })}

          {/* الجسيمات - محسنة مع أحجام أكبر وتأثيرات أقوى */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute"
              style={{
                left: particle.x,
                top: particle.y,
                transform: 'translate(-50%, -50%)',
                zIndex: particle.type === 'electron' ? 15 : 25,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 400 }}
              whileHover={{ scale: 1.4, zIndex: 35 }}
            >
              <div
                className="rounded-full border-3 border-white/95 flex items-center justify-center text-xs font-bold text-white shadow-2xl cursor-pointer"
                style={{ 
                  width: `${PARTICLE_SIZE * 3}px`,
                  height: `${PARTICLE_SIZE * 3}px`,
                  borderWidth: '3px',
                  backgroundColor: getParticleColor(particle.type),
                  boxShadow: `0 0 30px ${getParticleColor(particle.type)}, inset 0 0 15px rgba(255,255,255,0.6), 0 0 60px ${getParticleColor(particle.type)}90`,
                  filter: particle.type === 'electron' ? 
                           'drop-shadow(0 0 15px #3b82f6) drop-shadow(0 0 30px #3b82f680)' : 
                           particle.type === 'proton' ? 
                           'drop-shadow(0 0 15px #ef4444) drop-shadow(0 0 30px #ef444480)' :
                           'drop-shadow(0 0 15px #64748b) drop-shadow(0 0 30px #64748b80)',
                  animation: particle.type === 'electron' ? 'pulse 2.5s infinite' : 'pulse 4s infinite'
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
          <div className="absolute bottom-4 left-4 bg-black/90 p-5 rounded-xl text-xs text-white border-2 border-white/40 backdrop-blur-sm shadow-2xl">
            <div className="font-bold mb-4 text-yellow-300 text-base">مفتاح الذرة:</div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-red-500 border-3 border-white/80 shadow-lg"></div>
                <span className="text-sm font-medium">بروتونات (P+) - في النواة</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-gray-500 border-3 border-white/80 shadow-lg"></div>
                <span className="text-sm font-medium">نيوترونات (n°) - في النواة</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 rounded-full bg-blue-500 border-3 border-white/80 shadow-lg animate-pulse"></div>
                <span className="text-sm font-medium">إلكترونات (e-) - في المدارات</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/40 text-xs text-gray-300">
              <div className="font-medium">المدارات: الأخضر = ممتلئ، الأزرق = جزئي، الرمادي = فارغ</div>
            </div>
          </div>

          {/* إحصائيات سريعة محسنة */}
          <div className="absolute top-4 right-4 bg-black/90 p-5 rounded-xl text-xs text-white border-2 border-white/40 backdrop-blur-sm shadow-2xl">
            <div className="font-bold mb-4 text-purple-300 text-base">إحصائيات الذرة:</div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">البروتونات:</span>
                <span className="text-red-400 font-bold text-sm">{particles.filter(p => p.type === 'proton').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">النيوترونات:</span>
                <span className="text-gray-400 font-bold text-sm">{particles.filter(p => p.type === 'neutron').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">الإلكترونات:</span>
                <span className="text-blue-400 font-bold text-sm">{particles.filter(p => p.type === 'electron').length}</span>
              </div>
              <div className="pt-3 border-t border-white/40 flex justify-between">
                <span className="font-medium">المجموع:</span>
                <span className="text-yellow-400 font-bold text-sm">{particles.length} جسيم</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
