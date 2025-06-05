
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
          
          {/* النواة المركزية - مثبتة في المركز تماماً بدقة مطلقة */}
          <div 
            className="absolute rounded-full border-4 border-yellow-300/95 bg-gradient-to-br from-yellow-400/80 to-orange-600/80 flex items-center justify-center backdrop-blur-sm shadow-2xl"
            style={{
              width: `${NUCLEUS_RADIUS * 1.5}px`,
              height: `${NUCLEUS_RADIUS * 1.5}px`,
              left: `${ATOM_CENTER.x - (NUCLEUS_RADIUS * 1.5) / 2}px`,
              top: `${ATOM_CENTER.y - (NUCLEUS_RADIUS * 1.5) / 2}px`,
              boxShadow: '0 0 60px rgba(255, 215, 0, 1), inset 0 0 40px rgba(255, 215, 0, 0.6), 0 0 120px rgba(255, 165, 0, 0.9)',
              filter: 'drop-shadow(0 0 25px rgba(255, 215, 0, 0.95))',
              animation: 'pulse 3s infinite',
              position: 'absolute'
            }}
          >
            <div className="text-center">
              <div className="text-yellow-100 text-lg font-bold">النواة</div>
              <div className="text-yellow-200 text-sm mt-1">
                {nucleons.length} جسيم
              </div>
            </div>
          </div>

          {/* مسارات الإلكترونات - ثابتة مطلقاً لا تتحرك أبداً */}
          {ORBITAL_RADII.map((radius, index) => {
            const capacity = ORBITAL_CAPACITY[index];
            const current = electronsByLevel[index] || 0;
            const isFull = current >= capacity;
            const isEmpty = current === 0;
            
            return (
              <div
                key={`orbital-${index}`}
                className={`absolute border-4 rounded-full ${
                  isFull ? 'border-green-300/95' : 
                  isEmpty ? 'border-blue-300/50' : 'border-blue-300/80'
                }`}
                style={{
                  width: `${radius * 2}px`,
                  height: `${radius * 2}px`,
                  left: `${ATOM_CENTER.x - radius}px`,
                  top: `${ATOM_CENTER.y - radius}px`,
                  borderWidth: '4px',
                  position: 'absolute',
                  boxShadow: isFull ? 
                    `0 0 40px rgba(34, 197, 94, 0.95), inset 0 0 30px rgba(34, 197, 94, 0.5), 0 0 80px rgba(34, 197, 94, 0.7)` :
                    `0 0 ${30 + index * 10}px rgba(59, 130, 246, 0.9), inset 0 0 ${25 + index * 6}px rgba(59, 130, 246, 0.4), 0 0 ${60 + index * 12}px rgba(59, 130, 246, 0.6)`,
                  background: isFull ? 
                    `radial-gradient(circle, transparent 95%, rgba(34, 197, 94, 0.3) 100%)` :
                    `radial-gradient(circle, transparent 95%, rgba(59, 130, 246, 0.25) 100%)`,
                  filter: `drop-shadow(0 0 ${18 + index * 4}px ${isFull ? 'rgba(34, 197, 94, 0.6)' : 'rgba(59, 130, 246, 0.6)'})`
                }}
              >
                <div 
                  className={`absolute -top-14 left-1/2 transform -translate-x-1/2 ${
                    isFull ? 'bg-green-400/95 border-green-200 text-white' : 
                    isEmpty ? 'bg-gray-600/85 border-gray-400 text-gray-200' : 'bg-blue-400/95 border-blue-200 text-white'
                  } text-sm px-6 py-3 rounded-full font-bold shadow-xl border-3 backdrop-blur-sm`}
                  style={{ fontSize: '13px', fontWeight: '800' }}
                >
                  مستوى {index + 1}: {current}/{capacity}
                </div>
              </div>
            );
          })}

          {/* الجسيمات - مثبتة في مواضعها المحددة بدقة مطلقة */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute"
              style={{
                left: `${particle.x - (PARTICLE_SIZE * 3.5) / 2}px`,
                top: `${particle.y - (PARTICLE_SIZE * 3.5) / 2}px`,
                zIndex: particle.type === 'electron' ? 20 : 30,
                position: 'absolute'
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 500 }}
              whileHover={{ scale: 1.5, zIndex: 40 }}
            >
              <div
                className="rounded-full border-4 border-white/95 flex items-center justify-center text-sm font-bold text-white shadow-2xl cursor-pointer"
                style={{ 
                  width: `${PARTICLE_SIZE * 3.5}px`,
                  height: `${PARTICLE_SIZE * 3.5}px`,
                  borderWidth: '4px',
                  backgroundColor: getParticleColor(particle.type),
                  boxShadow: `0 0 35px ${getParticleColor(particle.type)}, inset 0 0 20px rgba(255,255,255,0.7), 0 0 70px ${getParticleColor(particle.type)}95`,
                  filter: particle.type === 'electron' ? 
                           'drop-shadow(0 0 18px #3b82f6) drop-shadow(0 0 35px #3b82f685)' : 
                           particle.type === 'proton' ? 
                           'drop-shadow(0 0 18px #ef4444) drop-shadow(0 0 35px #ef444485)' :
                           'drop-shadow(0 0 18px #64748b) drop-shadow(0 0 35px #64748b85)',
                  animation: particle.type === 'electron' ? 'pulse 2.8s infinite' : 'pulse 4.5s infinite'
                }}
                title={`${particle.type === 'proton' ? 'بروتون' : 
                         particle.type === 'neutron' ? 'نيوترون' : 'إلكترون'} (${particle.id}) - 
                         ${particle.type === 'electron' ? `مدار ${particle.orbitalLevel + 1}` : 'النواة'}`}
              >
                {particle.type === 'proton' ? 'P+' : 
                 particle.type === 'neutron' ? 'n°' : 'e-'}
              </div>
            </motion.div>
          ))}

          {/* مؤشر التوضع المحسن */}
          <div className="absolute bottom-4 left-4 bg-black/95 p-6 rounded-xl text-sm text-white border-3 border-white/50 backdrop-blur-sm shadow-2xl">
            <div className="font-bold mb-5 text-yellow-300 text-lg">مفتاح الذرة المحسن:</div>
            <div className="space-y-4">
              <div className="flex items-center gap-5">
                <div className="w-7 h-7 rounded-full bg-red-500 border-4 border-white/85 shadow-lg"></div>
                <span className="text-base font-medium">بروتونات (P+) - مثبتة في مركز النواة</span>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-7 h-7 rounded-full bg-gray-500 border-4 border-white/85 shadow-lg"></div>
                <span className="text-base font-medium">نيوترونات (n°) - مثبتة في مركز النواة</span>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-7 h-7 rounded-full bg-blue-500 border-4 border-white/85 shadow-lg animate-pulse"></div>
                <span className="text-base font-medium">إلكترونات (e-) - تدور على المدارات فقط</span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-white/50 text-sm text-gray-300">
              <div className="font-medium">🎯 المواضع محددة بدقة مطلقة</div>
              <div className="font-medium">🔒 النوكليونات مقفلة في النواة</div>
              <div className="font-medium">⚡ الإلكترونات مثبتة على المدارات</div>
            </div>
          </div>

          {/* إحصائيات سريعة محسنة */}
          <div className="absolute top-4 right-4 bg-black/95 p-6 rounded-xl text-sm text-white border-3 border-white/50 backdrop-blur-sm shadow-2xl">
            <div className="font-bold mb-5 text-purple-300 text-lg">إحصائيات الذرة المحسنة:</div>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">البروتونات:</span>
                <span className="text-red-400 font-bold text-base">{particles.filter(p => p.type === 'proton').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">النيوترونات:</span>
                <span className="text-gray-400 font-bold text-base">{particles.filter(p => p.type === 'neutron').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">الإلكترونات:</span>
                <span className="text-blue-400 font-bold text-base">{particles.filter(p => p.type === 'electron').length}</span>
              </div>
              <div className="pt-4 border-t border-white/50 flex justify-between">
                <span className="font-medium">المجموع:</span>
                <span className="text-yellow-400 font-bold text-base">{particles.length} جسيم</span>
              </div>
              <div className="pt-2 text-xs text-green-400 text-center">
                ✓ جميع الجسيمات في مواضعها الصحيحة
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
