import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, TrendingUp, BookOpen, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ar } from 'date-fns/locale';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface MonthlyGoal {
  id: string;
  title: string;
  subject: string;
  targetHours: number;
  completedHours: number;
  month: string;
  user_id?: string | null;
}

interface DayEvent {
  date: string;
  count: number;
  totalHours: number;
}

const subjects = [
  { value: "physics", label: "الفيزياء", color: "bg-blue-500" },
  { value: "chemistry", label: "الكيمياء", color: "bg-purple-500" },
  { value: "biology", label: "الأحياء", color: "bg-green-500" },
  { value: "mathematics", label: "الرياضيات", color: "bg-orange-500" },
  { value: "other", label: "أخرى", color: "bg-gray-500" }
];

const LOCAL_STORAGE_KEY = 'monthlyGoals';

const MonthlySchedule = () => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [goals, setGoals] = useState<MonthlyGoal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    subject: '',
    targetHours: 10
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [dayEvents, setDayEvents] = useState<Record<string, DayEvent>>({});
  
  const { toast } = useToast();

  // التحقق من حالة تسجيل الدخول
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        setUserId(session.user.id);
      } else {
        setIsLoggedIn(false);
        setUserId(null);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // تحميل الأهداف
  useEffect(() => {
    loadGoals();
    loadDayEvents();
  }, [isLoggedIn, userId, currentMonth]);

  const loadGoals = () => {
    const monthKey = format(currentMonth, 'yyyy-MM');
    
    try {
      const savedGoals = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedGoals) {
        const allGoals: MonthlyGoal[] = JSON.parse(savedGoals);
        const monthlyGoals = allGoals.filter(g => g.month === monthKey);
        setGoals(monthlyGoals);
      }
    } catch (error) {
      console.error("خطأ في تحميل الأهداف:", error);
    }
  };

  const loadDayEvents = async () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    if (isLoggedIn && userId) {
      try {
        const { data, error } = await supabase
          .from('study_events')
          .select('*')
          .eq('user_id', userId)
          .gte('date', format(monthStart, 'yyyy-MM-dd'))
          .lte('date', format(monthEnd, 'yyyy-MM-dd'));
        
        if (error) throw error;
        
        if (data) {
          const events: Record<string, DayEvent> = {};
          data.forEach(event => {
            if (!events[event.date]) {
              events[event.date] = { date: event.date, count: 0, totalHours: 0 };
            }
            events[event.date].count++;
            // حساب الساعات من وقت البدء والانتهاء
            const start = event.start_time.split(':').map(Number);
            const end = event.end_time.split(':').map(Number);
            const hours = (end[0] + end[1]/60) - (start[0] + start[1]/60);
            events[event.date].totalHours += hours > 0 ? hours : 0;
          });
          setDayEvents(events);
        }
      } catch (error) {
        console.error("خطأ في تحميل أحداث الشهر:", error);
      }
    } else {
      // تحميل من التخزين المحلي
      try {
        const savedEvents = localStorage.getItem('studyEvents');
        if (savedEvents) {
          const allEvents = JSON.parse(savedEvents);
          const events: Record<string, DayEvent> = {};
          
          allEvents.forEach((event: any) => {
            const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
            if (eventDate >= format(monthStart, 'yyyy-MM-dd') && eventDate <= format(monthEnd, 'yyyy-MM-dd')) {
              if (!events[eventDate]) {
                events[eventDate] = { date: eventDate, count: 0, totalHours: 0 };
              }
              events[eventDate].count++;
              const start = event.startTime.split(':').map(Number);
              const end = event.endTime.split(':').map(Number);
              const hours = (end[0] + end[1]/60) - (start[0] + start[1]/60);
              events[eventDate].totalHours += hours > 0 ? hours : 0;
            }
          });
          setDayEvents(events);
        }
      } catch (error) {
        console.error("خطأ في تحميل أحداث الشهر من التخزين المحلي:", error);
      }
    }
  };

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.subject) {
      toast({
        title: "معلومات ناقصة",
        description: "يرجى إدخال جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const monthKey = format(currentMonth, 'yyyy-MM');
    const goal: MonthlyGoal = {
      id: `${Date.now()}`,
      title: newGoal.title,
      subject: newGoal.subject,
      targetHours: newGoal.targetHours,
      completedHours: 0,
      month: monthKey,
      user_id: userId
    };

    const savedGoals = localStorage.getItem(LOCAL_STORAGE_KEY);
    const allGoals = savedGoals ? JSON.parse(savedGoals) : [];
    allGoals.push(goal);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allGoals));

    setGoals([...goals, goal]);
    setNewGoal({ title: '', subject: '', targetHours: 10 });
    setIsDialogOpen(false);

    toast({
      title: "تمت الإضافة بنجاح",
      description: "تمت إضافة الهدف الشهري",
    });
  };

  const updateGoalProgress = (goalId: string, hours: number) => {
    const updatedGoals = goals.map(g => 
      g.id === goalId ? { ...g, completedHours: Math.min(g.completedHours + hours, g.targetHours) } : g
    );
    setGoals(updatedGoals);

    const savedGoals = localStorage.getItem(LOCAL_STORAGE_KEY);
    const allGoals = savedGoals ? JSON.parse(savedGoals) : [];
    const newAllGoals = allGoals.map((g: MonthlyGoal) => 
      g.id === goalId ? { ...g, completedHours: Math.min(g.completedHours + hours, g.targetHours) } : g
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newAllGoals));
  };

  const deleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(g => g.id !== goalId);
    setGoals(updatedGoals);

    const savedGoals = localStorage.getItem(LOCAL_STORAGE_KEY);
    const allGoals = savedGoals ? JSON.parse(savedGoals) : [];
    const newAllGoals = allGoals.filter((g: MonthlyGoal) => g.id !== goalId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newAllGoals));

    toast({
      title: "تم الحذف",
      description: "تم حذف الهدف بنجاح",
    });
  };

  const getSubjectInfo = (value: string) => {
    return subjects.find(s => s.value === value) || subjects[4];
  };

  const totalStudyHours = Object.values(dayEvents).reduce((sum, day) => sum + day.totalHours, 0);
  const totalEvents = Object.values(dayEvents).reduce((sum, day) => sum + day.count, 0);
  const daysWithStudy = Object.keys(dayEvents).length;

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  return (
    <div className="space-y-6">
      {/* إحصائيات الشهر */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
            <CardContent className="pt-4 text-center">
              <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-300">{totalStudyHours.toFixed(1)}</div>
              <div className="text-sm text-blue-200/70">ساعات الدراسة</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30">
            <CardContent className="pt-4 text-center">
              <CalendarIcon className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-300">{daysWithStudy}</div>
              <div className="text-sm text-green-200/70">أيام الدراسة</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
            <CardContent className="pt-4 text-center">
              <BookOpen className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-300">{totalEvents}</div>
              <div className="text-sm text-purple-200/70">جلسات الدراسة</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border-orange-500/30">
            <CardContent className="pt-4 text-center">
              <Target className="h-8 w-8 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-300">{goals.length}</div>
              <div className="text-sm text-orange-200/70">أهداف الشهر</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* التقويم الشهري */}
        <Card className="lg:col-span-2 bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-300">
                {format(currentMonth, 'MMMM yyyy', { locale: ar })}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                  className="border-white/20 hover:bg-white/10"
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                  className="border-white/20 hover:bg-white/10"
                >
                  اليوم
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                  className="border-white/20 hover:bg-white/10"
                >
                  التالي
                </Button>
              </div>
            </div>

            {/* شبكة الأيام */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map(day => (
                <div key={day} className="text-xs text-white/50 py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {/* إضافة خلايا فارغة لبداية الشهر */}
              {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {days.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayEvent = dayEvents[dateStr];
                const hasEvents = !!dayEvent;
                
                return (
                  <motion.div
                    key={dateStr}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`aspect-square p-1 rounded-lg transition-all cursor-pointer
                      ${isToday(day) ? 'bg-green-600/30 ring-2 ring-green-400' : 'bg-white/5 hover:bg-white/10'}
                      ${hasEvents ? 'border-2 border-green-500/50' : 'border border-white/10'}
                    `}
                  >
                    <div className="text-xs text-center">{format(day, 'd')}</div>
                    {hasEvents && (
                      <div className="mt-1 space-y-0.5">
                        <div className="text-[10px] text-green-300 text-center">{dayEvent.count} جلسة</div>
                        <div className="h-1 bg-green-500/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500" 
                            style={{ width: `${Math.min(dayEvent.totalHours / 8 * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* الأهداف الشهرية */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-300">أهداف الشهر</h3>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 ml-1" />
                    إضافة
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-green-950 border-green-800 text-white" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>إضافة هدف شهري</DialogTitle>
                    <DialogDescription>
                      حدد هدفك الدراسي لهذا الشهر
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="goalTitle">عنوان الهدف</Label>
                      <Input
                        id="goalTitle"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                        placeholder="مثال: إنهاء فصل الديناميكا"
                        className="bg-green-900/50 border-green-700"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="goalSubject">المادة</Label>
                      <Select 
                        value={newGoal.subject} 
                        onValueChange={(value) => setNewGoal({ ...newGoal, subject: value })}
                      >
                        <SelectTrigger className="bg-green-900/50 border-green-700">
                          <SelectValue placeholder="اختر المادة" />
                        </SelectTrigger>
                        <SelectContent className="bg-green-900 border-green-700">
                          {subjects.map((subject) => (
                            <SelectItem key={subject.value} value={subject.value}>
                              {subject.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="targetHours">عدد الساعات المستهدفة</Label>
                      <Input
                        id="targetHours"
                        type="number"
                        value={newGoal.targetHours}
                        onChange={(e) => setNewGoal({ ...newGoal, targetHours: parseInt(e.target.value) || 0 })}
                        className="bg-green-900/50 border-green-700"
                        min={1}
                        max={100}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      className="bg-transparent border-green-600 text-green-400 hover:bg-green-900/30"
                    >
                      إلغاء
                    </Button>
                    <Button 
                      onClick={handleAddGoal}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      إضافة الهدف
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              <AnimatePresence>
                {goals.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-white/50"
                  >
                    <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>لا توجد أهداف لهذا الشهر</p>
                    <p className="text-sm">أضف هدفاً جديداً للبدء</p>
                  </motion.div>
                ) : (
                  goals.map((goal, index) => {
                    const subjectInfo = getSubjectInfo(goal.subject);
                    const progress = (goal.completedHours / goal.targetHours) * 100;
                    
                    return (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`${subjectInfo.color} text-white text-xs`}>
                                {subjectInfo.label}
                              </Badge>
                              {progress >= 100 && (
                                <CheckCircle className="h-4 w-4 text-green-400" />
                              )}
                            </div>
                            <h4 className="font-medium text-sm">{goal.title}</h4>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteGoal(goal.id)}
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            ×
                          </Button>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-white/70">
                            <span>{goal.completedHours} / {goal.targetHours} ساعة</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        
                        {progress < 100 && (
                          <div className="mt-2 flex gap-1">
                            {[0.5, 1, 2].map(hours => (
                              <Button
                                key={hours}
                                variant="outline"
                                size="sm"
                                onClick={() => updateGoalProgress(goal.id, hours)}
                                className="text-xs h-6 px-2 border-white/20 hover:bg-white/10"
                              >
                                +{hours}س
                              </Button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* رسالة للمستخدمين غير المسجلين */}
            {!isLoggedIn && (
              <div className="mt-4 p-3 bg-yellow-900/30 rounded-md border border-yellow-700/50">
                <p className="text-sm text-yellow-200">
                  لحفظ بياناتك بشكل دائم،{' '}
                  <Link to="/auth" className="text-yellow-400 underline">سجل الدخول</Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonthlySchedule;
