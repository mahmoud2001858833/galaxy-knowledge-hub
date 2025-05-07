
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, PauseCircle, RotateCcw, Bell } from "lucide-react";

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
  
  const { toast } = useToast();

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
      // إنهاء المرحلة الحالية
      completePhase();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const completePhase = () => {
    // تشغيل صوت تنبيه
    const audio = new Audio('/notification.mp3');
    audio.play();
    
    // تحديد المرحلة التالية
    if (phase === 'work') {
      setCompletedSessions(prev => prev + 1);
      
      if (cycle % settings.cycles === 0) {
        // استراحة طويلة بعد إنهاء عدد الدورات المحددة
        toast({
          title: "استراحة طويلة",
          description: "لقد أكملت الجلسة! خذ استراحة طويلة الآن.",
          variant: "default",
        });
        setPhase('longBreak');
        setTimeLeft(settings.longBreak * 60);
      } else {
        // استراحة قصيرة بعد جلسة عمل
        toast({
          title: "استراحة قصيرة",
          description: "أحسنت! خذ استراحة قصيرة الآن.",
          variant: "default",
        });
        setPhase('shortBreak');
        setTimeLeft(settings.shortBreak * 60);
      }
    } else {
      // العودة للعمل بعد الاستراحة
      if (phase === 'longBreak') {
        // زيادة دورة بعد الاستراحة الطويلة
        setCycle(prev => prev + 1);
      }
      
      toast({
        title: "وقت العمل",
        description: "انتهت فترة الاستراحة. حان وقت العمل!",
        variant: "default",
      });
      setPhase('work');
      setTimeLeft(settings.work * 60);
    }
    
    // عدم توقف المؤقت عند تغيير المرحلة
    setIsActive(true);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setPhase('work');
    setTimeLeft(settings.work * 60);
    setCycle(1);
    setCompletedSessions(0);
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
  
  // الحصول على النسبة المئوية للتقدم
  const getProgressPercentage = (): number => {
    let totalTime = 0;
    
    switch (phase) {
      case 'work': totalTime = settings.work * 60; break;
      case 'shortBreak': totalTime = settings.shortBreak * 60; break;
      case 'longBreak': totalTime = settings.longBreak * 60; break;
    }
    
    return 100 - Math.round((timeLeft / totalTime) * 100);
  };

  // الحصول على لون المرحلة
  const getPhaseColor = (): string => {
    switch (phase) {
      case 'work': return 'from-green-600 to-green-400';
      case 'shortBreak': return 'from-blue-600 to-blue-400';
      case 'longBreak': return 'from-purple-600 to-purple-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* مؤقت بومودورو */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="pt-6 flex flex-col items-center justify-center space-y-6">
            {/* حالة المؤقت */}
            <div className="text-center">
              <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium
                ${phase === 'work' ? 'bg-green-900/50 text-green-300' : 
                 phase === 'shortBreak' ? 'bg-blue-900/50 text-blue-300' : 
                 'bg-purple-900/50 text-purple-300'}`}
              >
                {getPhaseLabel(phase)} - دورة {cycle}/{settings.cycles}
              </span>
            </div>
            
            {/* عرض الوقت */}
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${phase}-${cycle}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`w-52 h-52 rounded-full flex items-center justify-center bg-gradient-to-br ${getPhaseColor()} p-1`}
                >
                  <div className="w-full h-full rounded-full bg-green-950 flex items-center justify-center">
                    <div className="text-5xl font-bold">{formatTime(timeLeft)}</div>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              <Progress 
                value={getProgressPercentage()} 
                className={`w-52 h-2 absolute bottom-0 left-0 right-0 mx-auto 
                  ${phase === 'work' ? 'bg-green-900/50' : 
                   phase === 'shortBreak' ? 'bg-blue-900/50' : 
                   'bg-purple-900/50'}`}
              />
            </div>
            
            {/* أزرار التحكم */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Button
                variant="ghost"
                size="icon"
                onClick={resetTimer}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <RotateCcw className="h-6 w-6" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTimer}
                className={`w-14 h-14 rounded-full
                  ${isActive ? 'bg-red-600/20 hover:bg-red-600/30 text-red-300' : 'bg-green-600/20 hover:bg-green-600/30 text-green-300'}`}
              >
                {isActive ? (
                  <PauseCircle className="h-10 w-10" />
                ) : (
                  <PlayCircle className="h-10 w-10" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="h-6 w-6"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </Button>
            </div>
            
            {/* الإحصائيات */}
            <div className="flex justify-center gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-300">{completedSessions}</div>
                <div className="text-sm text-white/70">جلسات مكتملة</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-300">{Math.round(completedSessions * settings.work / 60 * 10) / 10}</div>
                <div className="text-sm text-white/70">ساعات العمل</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* الإعدادات أو المعلومات */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="pt-6">
            {showSettings ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium mb-4">إعدادات المؤقت</h3>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="text-sm text-white/70">{settings.work} دقيقة</div>
                      <Label htmlFor="work">وقت العمل</Label>
                    </div>
                    <Slider
                      id="work"
                      min={5}
                      max={60}
                      step={1}
                      value={[settings.work]}
                      onValueChange={(value) => setSettings({ ...settings, work: value[0] })}
                      className="[&_[role=slider]]:bg-green-500"
                      dir="ltr"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="text-sm text-white/70">{settings.shortBreak} دقائق</div>
                      <Label htmlFor="shortBreak">استراحة قصيرة</Label>
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
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="text-sm text-white/70">{settings.longBreak} دقيقة</div>
                      <Label htmlFor="longBreak">استراحة طويلة</Label>
                    </div>
                    <Slider
                      id="longBreak"
                      min={5}
                      max={30}
                      step={1}
                      value={[settings.longBreak]}
                      onValueChange={(value) => setSettings({ ...settings, longBreak: value[0] })}
                      className="[&_[role=slider]]:bg-purple-500"
                      dir="ltr"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="text-sm text-white/70">{settings.cycles} دورات</div>
                      <Label htmlFor="cycles">عدد الدورات</Label>
                    </div>
                    <Slider
                      id="cycles"
                      min={1}
                      max={10}
                      step={1}
                      value={[settings.cycles]}
                      onValueChange={(value) => setSettings({ ...settings, cycles: value[0] })}
                      className="[&_[role=slider]]:bg-green-500"
                      dir="ltr"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h3 className="text-lg font-medium mb-4">تقنية بومودورو</h3>
                
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3 rtl:space-x-reverse">
                    <span className="bg-green-900/30 text-green-300 p-1 rounded-full mt-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span>اعمل لمدة {settings.work} دقيقة بتركيز كامل.</span>
                  </li>
                  
                  <li className="flex items-start space-x-3 rtl:space-x-reverse">
                    <span className="bg-blue-900/30 text-blue-300 p-1 rounded-full mt-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span>خذ استراحة قصيرة لمدة {settings.shortBreak} دقائق.</span>
                  </li>
                  
                  <li className="flex items-start space-x-3 rtl:space-x-reverse">
                    <span className="bg-green-900/30 text-green-300 p-1 rounded-full mt-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span>كرر العمل والراحة {settings.cycles} مرات.</span>
                  </li>
                  
                  <li className="flex items-start space-x-3 rtl:space-x-reverse">
                    <span className="bg-purple-900/30 text-purple-300 p-1 rounded-full mt-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span>بعد {settings.cycles} دورات، خذ استراحة طويلة لمدة {settings.longBreak} دقيقة.</span>
                  </li>
                </ul>
                
                <div className="mt-6 p-3 bg-yellow-900/30 rounded-md border border-yellow-700/50 flex items-center">
                  <Bell className="h-5 w-5 text-yellow-300 ml-3 flex-shrink-0" />
                  <p className="text-sm text-yellow-200">
                    ستظهر إشعارات عند انتهاء كل مرحلة، وسيتم تشغيل صوت تنبيه.
                  </p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PomodoroTimer;
