import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { NucleusVisualization } from './NucleusVisualization';
import { NUCLEAR_ELEMENTS, FUSION_REACTIONS } from '@/data/nuclear-data';
import { Flame, Play, RotateCcw, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

export const FusionSimulation = () => {
  const [stage, setStage] = useState<'initial' | 'heating' | 'approaching' | 'fusion' | 'product'>('initial');
  const [temperature, setTemperature] = useState(0);
  const [energyReleased, setEnergyReleased] = useState(0);
  const [currentReactionIndex, setCurrentReactionIndex] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const reaction = FUSION_REACTIONS[currentReactionIndex];
  const requiredTemp = 100000000; // 100 مليون كلفن

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playFusionSound = (frequency: number = 400) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 2, ctx.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  };

  const startFusion = () => {
    setStage('heating');
    playFusionSound(200);
    
    // رفع الحرارة تدريجياً
    const interval = setInterval(() => {
      setTemperature(prev => {
        const newTemp = prev + 10000000;
        if (newTemp >= requiredTemp) {
          clearInterval(interval);
          playFusionSound(400);
          setTimeout(() => {
            setStage('approaching');
            playFusionSound(600);
          }, 500);
          setTimeout(() => {
            setStage('fusion');
            playFusionSound(800);
          }, 2000);
          setTimeout(() => {
            setStage('product');
            setEnergyReleased(reaction.product.energyMeV);
          }, 3500);
          return requiredTemp;
        }
        return newTemp;
      });
    }, 100);
  };

  const reset = () => {
    setStage('initial');
    setTemperature(0);
    setEnergyReleased(0);
  };

  const nextReaction = () => {
    if (stage === 'initial') {
      setCurrentReactionIndex((prev) => (prev + 1) % FUSION_REACTIONS.length);
    }
  };

  const prevReaction = () => {
    if (stage === 'initial') {
      setCurrentReactionIndex((prev) => (prev - 1 + FUSION_REACTIONS.length) % FUSION_REACTIONS.length);
    }
  };

  return (
    <div className="space-y-6">
      {/* منطقة المحاكاة */}
      <div className="relative h-[500px] bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950 rounded-2xl border border-purple-500/20 overflow-hidden">
        {/* خلفية البلازما */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.2), transparent)',
              'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.3), transparent)',
              'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.2), transparent)'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* جزيئات البلازما المتطايرة */}
        {stage !== 'initial' && [...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-purple-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}

        <div className="relative h-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            {/* المرحلة الأولية */}
            {stage === 'initial' && (
              <motion.div
                key="initial"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-16"
              >
                <div className="flex flex-col items-center gap-4">
                  <NucleusVisualization nucleus={reaction.reactants[0]} size={100} />
                </div>
                
                <div className="text-4xl text-purple-400">+</div>
                
                <div className="flex flex-col items-center gap-4">
                  <NucleusVisualization nucleus={reaction.reactants[1]} size={100} />
                </div>
              </motion.div>
            )}

            {/* مرحلة التسخين */}
            {stage === 'heating' && (
              <motion.div
                key="heating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-16"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity
                  }}
                >
                  <NucleusVisualization nucleus={reaction.reactants[0]} size={100} />
                </motion.div>
                
                <motion.div
                  className="text-4xl"
                  animate={{
                    color: ['#a78bfa', '#f59e0b', '#ef4444', '#f59e0b', '#a78bfa']
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity
                  }}
                >
                  🔥
                </motion.div>
                
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity
                  }}
                >
                  <NucleusVisualization nucleus={reaction.reactants[1]} size={100} />
                </motion.div>
              </motion.div>
            )}

            {/* مرحلة الاقتراب */}
            {stage === 'approaching' && (
              <motion.div
                key="approaching"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
              >
                <motion.div
                  initial={{ x: -100 }}
                  animate={{ x: -30 }}
                  transition={{ duration: 1.5 }}
                >
                  <NucleusVisualization nucleus={reaction.reactants[0]} size={100} />
                </motion.div>
                
                <motion.div
                  initial={{ x: 100 }}
                  animate={{ x: 30 }}
                  transition={{ duration: 1.5 }}
                  className="absolute top-0 right-0"
                >
                  <NucleusVisualization nucleus={reaction.reactants[1]} size={100} />
                </motion.div>

                {/* موجات الصدمة */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 border-2 border-purple-400 rounded-full"
                    initial={{ scale: 0.5, opacity: 0.6 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                  />
                ))}
              </motion.div>
            )}

            {/* مرحلة الاندماج */}
            {stage === 'fusion' && (
              <motion.div
                key="fusion"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative"
              >
                {/* انفجار الضوء */}
                <motion.div
                  className="absolute inset-[-100px] rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(251,191,36,0.8) 20%, rgba(139,92,246,0) 60%)'
                  }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{ duration: 0.8 }}
                />

                {/* خطوط الطاقة النجمية */}
                {[...Array(16)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-40 bg-gradient-to-t from-yellow-300 via-purple-400 to-transparent"
                    style={{
                      left: '50%',
                      top: '50%',
                      transformOrigin: 'bottom center',
                      rotate: `${i * 22.5}deg`
                    }}
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, delay: i * 0.03 }}
                  />
                ))}

                {/* كرة الاندماج */}
                <motion.div
                  className="absolute inset-[40%] rounded-full"
                  style={{
                    background: 'radial-gradient(circle, #fbbf24, #f59e0b, #ef4444)',
                    boxShadow: '0 0 60px #fbbf24'
                  }}
                  animate={{
                    scale: [1, 1.5, 1.2],
                    rotate: 360
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: 3
                  }}
                />
              </motion.div>
            )}

            {/* مرحلة الناتج */}
            {stage === 'product' && (
              <motion.div
                key="product"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative flex flex-col items-center gap-4"
              >
                <NucleusVisualization 
                  nucleus={reaction.product.resultNucleus} 
                  size={130}
                />
                
                {/* الجسيمات المنطلقة */}
                {reaction.product.particles.map((particle, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-12 h-12 rounded-full"
                    style={{ 
                      background: 'radial-gradient(circle, #60a5fa, #3b82f6)',
                      boxShadow: '0 0 30px #60a5fa, 0 0 60px #3b82f6',
                      top: '50%',
                      left: '50%'
                    }}
                    animate={{
                      x: 150 * Math.cos(i * 120),
                      y: 150 * Math.sin(i * 120)
                    }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                ))}

                <div className="text-center mt-4">
                  <div className="text-xl font-bold text-orange-400">{reaction.name}</div>
                  <div className="text-sm text-muted-foreground">⭐</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* مؤشر درجة الحرارة */}
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-sm font-medium">درجة الحرارة</span>
              </div>
              <div className="text-2xl font-bold text-orange-400">
                {(temperature / 1000000).toFixed(1)} مليون °K
              </div>
            </div>
            
            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 rounded-full"
                style={{ width: `${(temperature / requiredTemp) * 100}%` }}
                animate={{
                  boxShadow: temperature >= requiredTemp 
                    ? ['0 0 10px #f59e0b', '0 0 20px #f59e0b', '0 0 10px #f59e0b']
                    : 'none'
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0°K</span>
              <span>100 مليون °K (الحد الأدنى)</span>
            </div>
          </div>
        </div>

        {/* عداد الطاقة */}
        <AnimatePresence>
          {energyReleased > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 right-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 rounded-lg p-4"
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
      </div>

      {/* أزرار التحكم */}
      <div className="flex justify-center items-center gap-4">
        <Button
          onClick={prevReaction}
          disabled={stage !== 'initial'}
          variant="outline"
          size="lg"
          className="border-purple-500/30"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>

        <Button
          onClick={startFusion}
          disabled={stage !== 'initial'}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          size="lg"
        >
          <Play className="w-5 h-5 mr-2" />
          ابدأ الاندماج
        </Button>
        
        <Button
          onClick={reset}
          variant="outline"
          size="lg"
          className="border-purple-500/30"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          إعادة تعيين
        </Button>

        <Button
          onClick={nextReaction}
          disabled={stage !== 'initial'}
          variant="outline"
          size="lg"
          className="border-purple-500/30"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* عرض التفاعل الحالي */}
      <div className="text-center">
        <div className="text-sm text-muted-foreground">التفاعل {currentReactionIndex + 1} من {FUSION_REACTIONS.length}</div>
        <div className="text-lg font-bold text-purple-400 mt-1">{reaction.name}</div>
        <div className="text-sm text-muted-foreground mt-1">{reaction.description}</div>
      </div>

      {/* المعلومات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
          <div className="text-sm font-medium text-purple-400 mb-2">الوقود</div>
          <div className="text-xs text-muted-foreground">
            {reaction.reactants.map(r => r.element).join(' + ')}
          </div>
        </div>
        
        <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
          <div className="text-sm font-medium text-orange-400 mb-2">الناتج</div>
          <div className="text-xs text-muted-foreground">
            {reaction.product.resultNucleus.element} + {reaction.product.particles.join(' + ')}
          </div>
        </div>
        
        <div className="bg-card/50 backdrop-blur border border-border rounded-lg p-4">
          <div className="text-sm font-medium text-blue-400 mb-2">التطبيقات</div>
          <div className="text-xs text-muted-foreground">
            طاقة الشمس • مفاعلات المستقبل
          </div>
        </div>
      </div>
    </div>
  );
};
