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
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={handleComplete}
          />

          {/* Guide Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[85%] max-w-md"
          >
            <Card className="relative overflow-hidden border-2 border-white/20 bg-gradient-to-br from-blue-950/95 via-purple-950/95 to-blue-950/95 backdrop-blur-xl shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className={`absolute inset-0 bg-gradient-to-br ${steps[currentStep].bgGradient}`} />
                {Array.from({ length: 15 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      width: `${Math.random() * 3 + 1}px`,
                      height: `${Math.random() * 3 + 1}px`,
                    }}
                    animate={{
                      opacity: [0.2, 0.5, 0.2],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: Math.random() * 3 + 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="relative p-6 md:p-8 text-center" dir="rtl">
                {/* Icon */}
                <motion.div
                  key={currentStep}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                  className="mb-4 inline-block"
                >
                  <div className={`p-4 rounded-full bg-gradient-to-br ${steps[currentStep].bgGradient} backdrop-blur-sm border-2 border-white/20`}>
                    {React.createElement(steps[currentStep].icon, {
                      className: `w-10 h-10 md:w-12 md:h-12 ${steps[currentStep].iconColor}`,
                    })}
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  key={`title-${currentStep}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-3xl font-bold text-white mb-2"
                >
                  {steps[currentStep].title}
                </motion.h2>

                {/* Subtitle */}
                <motion.h3
                  key={`subtitle-${currentStep}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4"
                >
                  {steps[currentStep].subtitle}
                </motion.h3>

                {/* Description */}
                <motion.p
                  key={`desc-${currentStep}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm md:text-base text-white/80 leading-relaxed mx-auto mb-6"
                >
                  {steps[currentStep].description}
                </motion.p>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mb-6">
                  {steps.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentStep 
                          ? 'w-8 bg-gradient-to-r from-blue-400 to-purple-400' 
                          : 'w-1.5 bg-white/30'
                      }`}
                      whileHover={{ scale: 1.2 }}
                    />
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-2 md:gap-3 justify-center items-center flex-wrap">
                  {currentStep > 0 && (
                    <Button
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      variant="outline"
                      size="sm"
                      className="gap-1 bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs md:text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      السابق
                    </Button>
                  )}
                  
                  {currentStep < steps.length - 1 ? (
                    <Button
                      onClick={() => setCurrentStep(prev => prev + 1)}
                      size="sm"
                      className="gap-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 text-xs md:text-sm"
                    >
                      التالي
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleComplete}
                      size="sm"
                      className="gap-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 text-xs md:text-sm"
                    >
                      تم، لنبدأ!
                      <Sparkles className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Skip button */}
                <button
                  onClick={handleComplete}
                  className="mt-4 text-white/50 hover:text-white/80 transition-colors text-xs"
                >
                  تخطي
                </button>
              </div>

              {/* Close button */}
              <button
                onClick={handleComplete}
                className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </Card>
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
