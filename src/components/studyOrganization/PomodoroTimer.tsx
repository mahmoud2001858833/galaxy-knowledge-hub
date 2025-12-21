import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, PauseCircle, RotateCcw, Bell, Volume2, Settings } from "lucide-react";
import { usePomodoroAlarm } from '@/hooks/usePomodoroAlarm';

type TimerPhase = 'work' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  work: number;
  shortBreak: number;
  longBreak: number;
  cycles: number;
}

const PomodoroTimer = () => {
  const [settings, setSettings] = useState<TimerSettings>({
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    cycles: 4
  });
  
  const [phase, setPhase] = useState<TimerPhase>('work');
  const [timeLeft, setTimeLeft] = useState(settings.work * 60);
  const [isActive, setIsActive] = useState(false);
  const [cycle, setCycle] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  
  const { toast } = useToast();
  const { playLoudAlarm, playShortBeep } = usePomodoroAlarm();

  // تحديث الوقت المتبقي عند تغيير الإعدادات
  useEffect(() => {
    if (!isActive) {
      if (phase === 'work') setTimeLeft(settings.work * 60);
      if (phase === 'shortBreak') setTimeLeft(settings.shortBreak * 60);
      if (phase === 'longBreak') setTimeLeft(settings.longBreak * 60);
    }
  }, [settings, phase, isActive]);

  // تشغيل المؤقت
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      completePhase();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  // تنبيه عند اقتراب انتهاء الوقت
  useEffect(() => {
    if (isActive && timeLeft === 10) {
      playShortBeep();
    }
  }, [timeLeft, isActive, playShortBeep]);

  const completePhase = useCallback(() => {
    // تشغيل صوت التنبيه العالي
    setIsAlarmPlaying(true);
    playLoudAlarm();
    
    setTimeout(() => setIsAlarmPlaying(false), 4000);
    
    // تحديد المرحلة التالية
    if (phase === 'work') {
      setCompletedSessions(prev => prev + 1);
      
      if (cycle % settings.cycles === 0) {
        toast({
          title: "🎉 استراحة طويلة!",
          description: "لقد أكملت الجلسة! خذ استراحة طويلة الآن.",
          variant: "default",
        });
        setPhase('longBreak');
        setTimeLeft(settings.longBreak * 60);
      } else {
        toast({
          title: "☕ استراحة قصيرة!",
          description: "أحسنت! خذ استراحة قصيرة الآن.",
          variant: "default",
        });
        setPhase('shortBreak');
        setTimeLeft(settings.shortBreak * 60);
      }
    } else {
      if (phase === 'longBreak') {
        setCycle(prev => prev + 1);
      }
      
      toast({
        title: "💪 وقت العمل!",
        description: "انتهت فترة الاستراحة. حان وقت العمل!",
        variant: "default",
      });
      setPhase('work');
      setTimeLeft(settings.work * 60);
    }
    
    setIsActive(true);
  }, [phase, cycle, settings, toast, playLoudAlarm]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    if (!isActive) {
      playShortBeep();
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setPhase('work');
    setTimeLeft(settings.work * 60);
    setCycle(1);
    setCompletedSessions(0);
    setIsAlarmPlaying(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseLabel = (phase: TimerPhase): string => {
    switch (phase) {
      case 'work': return 'وقت العمل';
      case 'shortBreak': return 'استراحة قصيرة';
      case 'longBreak': return 'استراحة طويلة';
    }
  };
  
  const getProgressPercentage = (): number => {
    let totalTime = 0;
    
    switch (phase) {
      case 'work': totalTime = settings.work * 60; break;
      case 'shortBreak': totalTime = settings.shortBreak * 60; break;
      case 'longBreak': totalTime = settings.longBreak * 60; break;
    }
    
    return 100 - Math.round((timeLeft / totalTime) * 100);
  };

  const getPhaseColor = (): string => {
    switch (phase) {
      case 'work': return 'from-green-600 to-green-400';
      case 'shortBreak': return 'from-blue-600 to-blue-400';
      case 'longBreak': return 'from-purple-600 to-purple-400';
    }
  };

  const getPhaseGlow = (): string => {
    switch (phase) {
      case 'work': return 'shadow-green-500/50';
      case 'shortBreak': return 'shadow-blue-500/50';
      case 'longBreak': return 'shadow-purple-500/50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* مؤقت بومودورو */}
        <Card className={`bg-white/5 backdrop-blur-sm border-white/10 transition-all duration-300 ${isAlarmPlaying ? 'animate-pulse ring-4 ring-red-500' : ''}`}>
          <CardContent className="pt-6 flex flex-col items-center justify-center space-y-6">
            {/* حالة المؤقت */}
            <motion.div 
              className="text-center"
              animate={isAlarmPlaying ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: isAlarmPlaying ? Infinity : 0, duration: 0.5 }}
            >
              <span className={`inline-flex items-center gap-2 px-4 py-1 rounded-full text-sm font-medium
                ${phase === 'work' ? 'bg-green-900/50 text-green-300' : 
                 phase === 'shortBreak' ? 'bg-blue-900/50 text-blue-300' : 
                 'bg-purple-900/50 text-purple-300'}`}
              >
                {isAlarmPlaying && <Volume2 className="h-4 w-4 animate-bounce" />}
                {getPhaseLabel(phase)} - دورة {cycle}/{settings.cycles}
              </span>
            </motion.div>
            
            {/* عرض الوقت */}
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${phase}-${cycle}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: isAlarmPlaying ? [1, 1.05, 1] : 1, 
                    opacity: 1,
                    rotate: isAlarmPlaying ? [0, -2, 2, 0] : 0
                  }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ 
                    duration: isAlarmPlaying ? 0.3 : 0.5,
                    repeat: isAlarmPlaying ? Infinity : 0
                  }}
                  className={`w-56 h-56 rounded-full flex items-center justify-center bg-gradient-to-br ${getPhaseColor()} p-1 shadow-2xl ${getPhaseGlow()}`}
                >
                  <div className="w-full h-full rounded-full bg-green-950 flex items-center justify-center">
                    <motion.div 
                      className="text-5xl font-bold"
                      animate={isAlarmPlaying ? { 
                        color: ['#ffffff', '#ef4444', '#ffffff'],
                        scale: [1, 1.1, 1]
                      } : {}}
                      transition={{ repeat: isAlarmPlaying ? Infinity : 0, duration: 0.5 }}
                    >
                      {formatTime(timeLeft)}
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              <Progress 
                value={getProgressPercentage()} 
                className={`w-56 h-3 absolute -bottom-2 left-0 right-0 mx-auto rounded-full
                  ${phase === 'work' ? 'bg-green-900/50' : 
                   phase === 'shortBreak' ? 'bg-blue-900/50' : 
                   'bg-purple-900/50'}`}
              />
            </div>
            
            {/* أزرار التحكم */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse mt-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={resetTimer}
                className="text-white/70 hover:text-white hover:bg-white/10 h-12 w-12"
              >
                <RotateCcw className="h-6 w-6" />
              </Button>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTimer}
                  className={`w-16 h-16 rounded-full transition-all duration-300
                    ${isActive 
                      ? 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border-red-500/50' 
                      : 'bg-green-600/20 hover:bg-green-600/30 text-green-300 border-green-500/50'}`}
                >
                  {isActive ? (
                    <PauseCircle className="h-10 w-10" />
                  ) : (
                    <PlayCircle className="h-10 w-10" />
                  )}
                </Button>
              </motion.div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className={`text-white/70 hover:text-white hover:bg-white/10 h-12 w-12 ${showSettings ? 'bg-white/10' : ''}`}
              >
                <Settings className="h-6 w-6" />
              </Button>
            </div>
            
            {/* الإحصائيات */}
            <div className="flex justify-center gap-6 text-center pt-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-lg px-4 py-2"
              >
                <div className="text-2xl font-bold text-green-300">{completedSessions}</div>
                <div className="text-sm text-white/70">جلسات مكتملة</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 rounded-lg px-4 py-2"
              >
                <div className="text-2xl font-bold text-green-300">
                  {Math.round(completedSessions * settings.work / 60 * 10) / 10}
                </div>
                <div className="text-sm text-white/70">ساعات العمل</div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
        
        {/* الإعدادات أو المعلومات */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="pt-6">
            <AnimatePresence mode="wait">
              {showSettings ? (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    إعدادات المؤقت
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <div className="text-sm text-white/70">{settings.work} دقيقة</div>
                        <Label htmlFor="work" className="text-green-300">وقت العمل</Label>
                      </div>
                      <Slider
                        id="work"
                        min={5}
                        max={60}
                        step={5}
                        value={[settings.work]}
                        onValueChange={(value) => setSettings({ ...settings, work: value[0] })}
                        className="[&_[role=slider]]:bg-green-500"
                        dir="ltr"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <div className="text-sm text-white/70">{settings.shortBreak} دقائق</div>
                        <Label htmlFor="shortBreak" className="text-blue-300">استراحة قصيرة</Label>
                      </div>
                      <Slider
                        id="shortBreak"
                        min={1}
                        max={15}
                        step={1}
                        value={[settings.shortBreak]}
                        onValueChange={(value) => setSettings({ ...settings, shortBreak: value[0] })}
                        className="[&_[role=slider]]:bg-blue-500"
                        dir="ltr"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <div className="text-sm text-white/70">{settings.longBreak} دقيقة</div>
                        <Label htmlFor="longBreak" className="text-purple-300">استراحة طويلة</Label>
                      </div>
                      <Slider
                        id="longBreak"
                        min={5}
                        max={30}
                        step={5}
                        value={[settings.longBreak]}
                        onValueChange={(value) => setSettings({ ...settings, longBreak: value[0] })}
                        className="[&_[role=slider]]:bg-purple-500"
                        dir="ltr"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <div className="text-sm text-white/70">{settings.cycles} دورات</div>
                        <Label htmlFor="cycles" className="text-orange-300">عدد الدورات</Label>
                      </div>
                      <Slider
                        id="cycles"
                        min={1}
                        max={10}
                        step={1}
                        value={[settings.cycles]}
                        onValueChange={(value) => setSettings({ ...settings, cycles: value[0] })}
                        className="[&_[role=slider]]:bg-orange-500"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* زر اختبار الصوت */}
                  <Button
                    variant="outline"
                    onClick={() => playLoudAlarm()}
                    className="w-full border-yellow-600 text-yellow-400 hover:bg-yellow-900/20"
                  >
                    <Volume2 className="h-4 w-4 ml-2" />
                    اختبار صوت التنبيه
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h3 className="text-lg font-medium mb-4">تقنية بومودورو</h3>
                  
                  <ul className="space-y-4">
                    <li className="flex items-start space-x-3 rtl:space-x-reverse">
                      <span className="bg-green-900/30 text-green-300 p-1 rounded-full mt-1 flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span>اعمل لمدة <strong className="text-green-300">{settings.work} دقيقة</strong> بتركيز كامل.</span>
                    </li>
                    
                    <li className="flex items-start space-x-3 rtl:space-x-reverse">
                      <span className="bg-blue-900/30 text-blue-300 p-1 rounded-full mt-1 flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span>خذ استراحة قصيرة لمدة <strong className="text-blue-300">{settings.shortBreak} دقائق</strong>.</span>
                    </li>
                    
                    <li className="flex items-start space-x-3 rtl:space-x-reverse">
                      <span className="bg-green-900/30 text-green-300 p-1 rounded-full mt-1 flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span>كرر العمل والراحة <strong className="text-orange-300">{settings.cycles} مرات</strong>.</span>
                    </li>
                    
                    <li className="flex items-start space-x-3 rtl:space-x-reverse">
                      <span className="bg-purple-900/30 text-purple-300 p-1 rounded-full mt-1 flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span>بعد {settings.cycles} دورات، خذ استراحة طويلة لمدة <strong className="text-purple-300">{settings.longBreak} دقيقة</strong>.</span>
                    </li>
                  </ul>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 p-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg border border-yellow-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-500/20 p-2 rounded-full">
                        <Volume2 className="h-6 w-6 text-yellow-300" />
                      </div>
                      <div>
                        <p className="font-medium text-yellow-200">صوت تنبيه عالي</p>
                        <p className="text-sm text-yellow-200/70">
                          سيصدر صوت تنبيه عالي وواضح عند انتهاء كل مرحلة
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PomodoroTimer;
