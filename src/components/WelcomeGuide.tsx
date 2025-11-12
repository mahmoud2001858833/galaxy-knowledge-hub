import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Computer, Sparkles, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const WelcomeGuide = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [hasSeenGuide, setHasSeenGuide] = useState(true);

  useEffect(() => {
    checkIfNewUser();
  }, []);

  const checkIfNewUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, has_seen_welcome_guide')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name || 'مستخدم');
        
        // Show guide if user hasn't seen it
        if (!profile.has_seen_welcome_guide) {
          setHasSeenGuide(false);
          setTimeout(() => setIsOpen(true), 1000);
        }
      }
    }
  };

  const handleComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Mark guide as seen
      await supabase
        .from('profiles')
        .update({ has_seen_welcome_guide: true })
        .eq('id', user.id);
    }
    
    setIsOpen(false);
  };

  const steps = [
    {
      title: `أهلاً ${userName}`,
      subtitle: 'منصة ذروة العلم',
      description: 'استمتع بجولتك! لكن هذه بعض النصائح',
      icon: Sparkles,
      iconColor: 'text-yellow-400',
      bgGradient: 'from-blue-600/20 via-purple-600/20 to-pink-600/20'
    },
    {
      title: 'لأفضل تجربة استخدام',
      subtitle: 'استخدم الكمبيوتر',
      description: 'المنصة مصممة للعمل بشكل مثالي على أجهزة الكمبيوتر للحصول على تجربة كاملة',
      icon: Computer,
      iconColor: 'text-blue-400',
      bgGradient: 'from-cyan-600/20 via-blue-600/20 to-indigo-600/20'
    },
    {
      title: 'إذا لم تعرف كيف تستخدم المنصة',
      subtitle: 'استخدم مرشدك الذكي',
      description: 'المرشد الذكي موجود دائماً في الزاوية السفلية لمساعدتك في التنقل واستخدام جميع الأقسام',
      icon: Sparkles,
      iconColor: 'text-purple-400',
      bgGradient: 'from-purple-600/20 via-pink-600/20 to-rose-600/20',
      showGuidePointer: true
    }
  ];

  if (hasSeenGuide) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Top Banner */}
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="fixed top-0 left-0 right-0 z-50 mx-auto max-w-4xl mt-4 px-4"
          >
            <div className="relative overflow-hidden rounded-xl border border-white/20 bg-gradient-to-r from-blue-950/95 via-purple-950/95 to-blue-950/95 backdrop-blur-xl shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className={`absolute inset-0 bg-gradient-to-r ${steps[currentStep].bgGradient}`} />
              </div>

              {/* Content */}
              <div className="relative px-6 py-3 flex items-center justify-between gap-4" dir="rtl">
                {/* Icon & Text */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <motion.div
                    key={currentStep}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    <div className={`p-2 rounded-full bg-gradient-to-br ${steps[currentStep].bgGradient} border border-white/20`}>
                      {React.createElement(steps[currentStep].icon, {
                        className: `w-5 h-5 ${steps[currentStep].iconColor}`,
                      })}
                    </div>
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <motion.div
                      key={`content-${currentStep}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex flex-col"
                    >
                      <h3 className="text-sm font-bold text-white truncate">
                        {steps[currentStep].title} - {steps[currentStep].subtitle}
                      </h3>
                      <p className="text-xs text-white/70 truncate">
                        {steps[currentStep].description}
                      </p>
                    </motion.div>
                  </div>
                </div>

                {/* Progress & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Progress Dots */}
                  <div className="hidden sm:flex gap-1.5">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          index === currentStep 
                            ? 'w-6 bg-gradient-to-r from-blue-400 to-purple-400' 
                            : 'w-1.5 bg-white/30'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    {currentStep < steps.length - 1 ? (
                      <Button
                        onClick={() => setCurrentStep(prev => prev + 1)}
                        size="sm"
                        className="h-7 px-3 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        التالي
                      </Button>
                    ) : (
                      <Button
                        onClick={handleComplete}
                        size="sm"
                        className="h-7 px-3 text-xs bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white gap-1"
                      >
                        ابدأ
                        <Sparkles className="w-3 h-3" />
                      </Button>
                    )}
                    
                    <button
                      onClick={handleComplete}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Guide Pointer - only on last step */}
          {currentStep === steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="fixed bottom-20 md:bottom-24 right-4 md:right-24 z-50"
            >
              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <div className="absolute -inset-2 bg-purple-500/50 rounded-full blur-xl animate-pulse" />
                <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg">
                  مرشدك الذكي هنا! 👇
                </div>
              </motion.div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default WelcomeGuide;
