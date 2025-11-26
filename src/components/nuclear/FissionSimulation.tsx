import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { NucleusVisualization } from './NucleusVisualization';
import { NUCLEAR_ELEMENTS, FISSION_REACTIONS } from '@/data/nuclear-data';
import { Zap, Play, RotateCcw } from 'lucide-react';

export const FissionSimulation = () => {
  const [stage, setStage] = useState<'initial' | 'neutron' | 'excited' | 'split' | 'products'>('initial');
  const [energyReleased, setEnergyReleased] = useState(0);
  const [neutronsReleased, setNeutronsReleased] = useState(0);

  const reaction = FISSION_REACTIONS[0];

  const startFission = () => {
    setStage('neutron');
    setTimeout(() => setStage('excited'), 1000);
    setTimeout(() => setStage('split'), 2000);
    setTimeout(() => {
      setStage('products');
      setEnergyReleased(reaction.products.energyMeV);
      setNeutronsReleased(reaction.products.neutrons);
    }, 3000);
  };

  const reset = () => {
    setStage('initial');
    setEnergyReleased(0);
    setNeutronsReleased(0);
  };

  return (
    <div className="space-y-6">
      {/* منطقة المحاكاة */}
      <div className="relative h-[500px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-green-500/20 overflow-hidden">
        {/* خلفية متوهجة */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent" />
        
        {/* شبكة الخلفية */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            {/* المرحلة الأولية */}
            {stage === 'initial' && (
              <motion.div
                key="initial"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center gap-4"
              >
                <NucleusVisualization nucleus={NUCLEAR_ELEMENTS.uranium235} size="large" />
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">يورانيوم-235</div>
                  <div className="text-sm text-muted-foreground">جاهز للانشطار</div>
                </div>
              </motion.div>
            )}

            {/* مرحلة النيوترون القادم */}
            {stage === 'neutron' && (
              <motion.div
                key="neutron"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
              >
                <NucleusVisualization nucleus={NUCLEAR_ELEMENTS.uranium235} size="large" />
                
                {/* النيوترون القادم */}
                <motion.div
                  className="absolute w-8 h-8 rounded-full bg-blue-500"
                  style={{
                    boxShadow: '0 0 20px #3b82f6',
                    left: '-100px',
                    top: '50%'
                  }}
                  animate={{
                    left: '50%',
                    top: '50%',
                    x: '-50%',
                    y: '-50%'
                  }}
                  transition={{ duration: 1, ease: 'easeIn' }}
                />
                
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center">
                  <div className="text-lg font-bold text-blue-400">نيوترون قادم ⚡</div>
                </div>
              </motion.div>
            )}

            {/* مرحلة الإثارة */}
            {stage === 'excited' && (
              <motion.div
                key="excited"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1.2],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: 2
                  }}
                >
                  <NucleusVisualization nucleus={NUCLEAR_ELEMENTS.uranium235} size="large" />
                </motion.div>
                
                {/* توهج الإثارة */}
                <motion.div
                  className="absolute inset-0 rounded-full blur-3xl"
                  style={{ backgroundColor: '#10b981' }}
                  animate={{
                    scale: [1, 2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: 2
                  }}
                />
                
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center">
                  <div className="text-lg font-bold text-yellow-400">النواة في حالة إثارة! ⚠️</div>
                </div>
              </motion.div>
            )}

            {/* مرحلة الانقسام */}
            {stage === 'split' && (
              <motion.div
                key="split"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
              >
                {/* انفجار الضوء */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: 'white' }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
                
                {/* خطوط الطاقة */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-32 bg-gradient-to-t from-yellow-500 to-transparent"
                    style={{
                      left: '50%',
                      top: '50%',
                      transformOrigin: 'bottom center',
                      rotate: `${i * 30}deg`
                    }}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: [0, 1, 0] }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                  />
                ))}
              </motion.div>
            )}

            {/* مرحلة النواتج */}
            {stage === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-12"
              >
                {/* النواة الأولى */}
                <motion.div
                  initial={{ x: 0, y: 0 }}
                  animate={{ x: -100, y: -30 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                >
                  <NucleusVisualization nucleus={reaction.products.nucleus1} size="medium" />
                </motion.div>

                {/* النواة الثانية */}
                <motion.div
                  initial={{ x: 0, y: 0 }}
                  animate={{ x: 100, y: 30 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                >
                  <NucleusVisualization nucleus={reaction.products.nucleus2} size="medium" />
                </motion.div>

                {/* النيوترونات المنطلقة */}
                {[...Array(reaction.products.neutrons)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-6 h-6 rounded-full bg-blue-400"
                    style={{ boxShadow: '0 0 15px #60a5fa' }}
                    initial={{ x: 0, y: 0, scale: 0 }}
                    animate={{
                      x: Math.cos(i * 120) * 150,
                      y: Math.sin(i * 120) * 150,
                      scale: 1
                    }}
                    transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* عداد الطاقة */}
        <AnimatePresence>
          {energyReleased > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{energyReleased} MeV</div>
                  <div className="text-xs text-muted-foreground">طاقة منطلقة</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* عداد النيوترونات */}
        <AnimatePresence>
          {neutronsReleased > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 right-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <div>
                  <div className="text-2xl font-bold text-blue-400">{neutronsReleased}</div>
                  <div className="text-xs text-muted-foreground">نيوترونات منطلقة</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* أزرار التحكم */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={startFission}
          disabled={stage !== 'initial'}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          size="lg"
        >
          <Play className="w-5 h-5 mr-2" />
          ابدأ الانشطار
        </Button>
        
        <Button
          onClick={reset}
          variant="outline"
          size="lg"
          className="border-green-500/30"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          إعادة تعيين
        </Button>
      </div>

      {/* المعلومات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
          <div className="text-sm font-medium text-green-400 mb-2">الوقود النووي</div>
          <div className="text-xs text-muted-foreground">
            يورانيوم-235 (U-235)
          </div>
        </div>
        
        <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
          <div className="text-sm font-medium text-pink-400 mb-2">نواتج الانشطار</div>
          <div className="text-xs text-muted-foreground">
            باريوم-141 + كريبتون-92
          </div>
        </div>
        
        <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
          <div className="text-sm font-medium text-yellow-400 mb-2">التطبيقات</div>
          <div className="text-xs text-muted-foreground">
            مفاعلات نووية • طاقة كهربائية
          </div>
        </div>
      </div>
    </div>
  );
};
