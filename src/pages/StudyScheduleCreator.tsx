import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, BookOpen, Plus, Trash2, Download, GraduationCap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StarField from '@/components/StarField';
import { useToast } from '@/components/ui/use-toast';

interface Subject {
  id: string;
  name: string;
  hoursPerWeek: number;
  priority: 'high' | 'medium' | 'low';
  preferredTimes: string[];
}

interface ScheduleSlot {
  day: string;
  time: string;
  subject: string;
  duration: number;
  type: 'study' | 'review' | 'break';
}

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

const SUBJECTS_LIST = [
  'الرياضيات', 'الفيزياء', 'الكيمياء', 'الأحياء', 'اللغة العربية', 
  'اللغة الإنجليزية', 'التاريخ', 'الجغرافيا', 'التربية الإسلامية',
  'علوم الأرض والبيئة', 'الثقافة المالية', 'الحاسوب'
];

const StudyScheduleCreator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availableHours, setAvailableHours] = useState<number>(20);
  const [studyGoal, setStudyGoal] = useState<string>('');
  const [excludedDays, setExcludedDays] = useState<string[]>([]);
  const [preferredStartTime, setPreferredStartTime] = useState<string>('09:00');
  const [preferredEndTime, setPreferredEndTime] = useState<string>('20:00');
  const [breakDuration, setBreakDuration] = useState<number>(15);
  const [generatedSchedule, setGeneratedSchedule] = useState<ScheduleSlot[]>([]);
  const [showSchedule, setShowSchedule] = useState(false);

  const addSubject = () => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: '',
      hoursPerWeek: 2,
      priority: 'medium',
      preferredTimes: []
    };
    setSubjects([...subjects, newSubject]);
  };

  const updateSubject = (id: string, field: keyof Subject, value: any) => {
    setSubjects(subjects.map(subject => 
      subject.id === id ? { ...subject, [field]: value } : subject
    ));
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(subject => subject.id !== id));
  };

  const toggleExcludedDay = (day: string) => {
    setExcludedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const generateSchedule = () => {
    if (subjects.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة مادة واحدة على الأقل",
        variant: "destructive",
      });
      return;
    }

    const totalHoursNeeded = subjects.reduce((sum, subject) => sum + subject.hoursPerWeek, 0);
    
    if (totalHoursNeeded > availableHours) {
      toast({
        title: "تحذير",
        description: `إجمالي الساعات المطلوبة (${totalHoursNeeded}) أكبر من الساعات المتاحة (${availableHours})`,
        variant: "destructive",
      });
      return;
    }

    const schedule: ScheduleSlot[] = [];
    const availableDays = DAYS.filter(day => !excludedDays.includes(day));
    
    // Sort subjects by priority
    const sortedSubjects = [...subjects].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    let currentDay = 0;
    let currentTime = preferredStartTime;

    for (const subject of sortedSubjects) {
      let hoursLeft = subject.hoursPerWeek;
      
      while (hoursLeft > 0 && availableDays.length > 0) {
        const day = availableDays[currentDay % availableDays.length];
        const sessionDuration = Math.min(hoursLeft, 2); // Maximum 2 hours per session
        
        schedule.push({
          day,
          time: currentTime,
          subject: subject.name,
          duration: sessionDuration,
          type: 'study'
        });

        hoursLeft -= sessionDuration;
        
        // Add break after study session
        if (sessionDuration >= 1) {
          const breakTime = addMinutesToTime(currentTime, sessionDuration * 60);
          schedule.push({
            day,
            time: breakTime,
            subject: 'استراحة',
            duration: breakDuration / 60,
            type: 'break'
          });
        }

        // Move to next time slot or day
        currentTime = addMinutesToTime(currentTime, (sessionDuration * 60) + (sessionDuration >= 1 ? breakDuration : 0));
        
        if (timeToMinutes(currentTime) > timeToMinutes(preferredEndTime)) {
          currentDay++;
          currentTime = preferredStartTime;
        }
      }
    }

    // Add review sessions
    const reviewSchedule = generateReviewSessions(sortedSubjects, availableDays);
    schedule.push(...reviewSchedule);

    setGeneratedSchedule(schedule.sort((a, b) => {
      const dayOrder = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
      if (dayOrder !== 0) return dayOrder;
      return timeToMinutes(a.time) - timeToMinutes(b.time);
    }));
    
    setShowSchedule(true);
    
    toast({
      title: "تم إنشاء الجدول",
      description: "تم إنشاء جدولك الدراسي بنجاح!",
    });
  };

  const generateReviewSessions = (subjects: Subject[], availableDays: string[]): ScheduleSlot[] => {
    const reviewSessions: ScheduleSlot[] = [];
    
    subjects.forEach((subject, index) => {
      const day = availableDays[(index + 2) % availableDays.length];
      const time = addMinutesToTime(preferredStartTime, (index * 2 + 4) * 60);
      
      if (timeToMinutes(time) <= timeToMinutes(preferredEndTime)) {
        reviewSessions.push({
          day,
          time,
          subject: `مراجعة ${subject.name}`,
          duration: 1,
          type: 'review'
        });
      }
    });
    
    return reviewSessions;
  };

  const addMinutesToTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  };

  const timeToMinutes = (time: string): number => {
    const [hours, mins] = time.split(':').map(Number);
    return hours * 60 + mins;
  };

  const exportSchedule = () => {
    const scheduleText = generateScheduleText();
    const blob = new Blob([scheduleText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `جدول-الدراسة-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateScheduleText = (): string => {
    let text = `📚 جدول الدراسة المخصص\n`;
    text += `🎯 الهدف: ${studyGoal || 'تحسين الأداء الأكاديمي'}\n`;
    text += `⏰ إجمالي الساعات الأسبوعية: ${availableHours} ساعة\n\n`;

    DAYS.forEach(day => {
      const daySchedule = generatedSchedule.filter(slot => slot.day === day);
      if (daySchedule.length > 0) {
        text += `📅 ${day}:\n`;
        daySchedule.forEach(slot => {
          const endTime = addMinutesToTime(slot.time, slot.duration * 60);
          text += `   ${slot.time} - ${endTime}: ${slot.subject} (${slot.duration} ساعة)\n`;
        });
        text += '\n';
      }
    });

    return text;
  };

  if (showSchedule) {
    return (
      <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-indigo-950 via-purple-900 to-black" dir="rtl">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <StarField starCount={200} />
        </div>
        
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-6 relative z-10 flex flex-col max-w-6xl">
          <Button
            onClick={() => setShowSchedule(false)}
            variant="ghost"
            className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30 mb-4 w-fit"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            تعديل الجدول
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-sm border border-green-400/30 mb-4">
              <Calendar className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-2">
              جدولك الدراسي
            </h1>
            <p className="text-white/80">جدول مخصص لتحقيق أهدافك الأكاديمية</p>
          </motion.div>

          <div className="mb-6 flex justify-between items-center">
            <div className="text-white/80">
              <p>🎯 الهدف: {studyGoal || 'تحسين الأداء الأكاديمي'}</p>
              <p>⏰ إجمالي الساعات: {availableHours} ساعة أسبوعياً</p>
            </div>
            <Button
              onClick={exportSchedule}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Download className="w-4 h-4 ml-2" />
              تحميل الجدول
            </Button>
          </div>

          <div className="grid gap-4">
            {DAYS.map(day => {
              const daySchedule = generatedSchedule.filter(slot => slot.day === day);
              
              if (daySchedule.length === 0) return null;
              
              return (
                <Card key={day} className="p-6 bg-black/20 backdrop-blur-sm border-indigo-500/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Calendar className="w-5 h-5 ml-2 text-indigo-400" />
                    {day}
                  </h3>
                  <div className="grid gap-3">
                    {daySchedule.map((slot, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          slot.type === 'study' 
                            ? 'bg-blue-900/30 border-blue-500/30' 
                            : slot.type === 'review'
                            ? 'bg-purple-900/30 border-purple-500/30'
                            : 'bg-gray-800/30 border-gray-600/30'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {slot.type === 'study' && <BookOpen className="w-4 h-4 ml-2 text-blue-400" />}
                            {slot.type === 'review' && <Target className="w-4 h-4 ml-2 text-purple-400" />}
                            {slot.type === 'break' && <Clock className="w-4 h-4 ml-2 text-gray-400" />}
                            <span className="font-medium text-white">{slot.subject}</span>
                          </div>
                          <div className="text-sm text-white/60">
                            {slot.time} - {addMinutesToTime(slot.time, slot.duration * 60)}
                            <span className="mr-2">({slot.duration} ساعة)</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-indigo-950 via-purple-900 to-black" dir="rtl">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <StarField starCount={200} />
      </div>
      
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6 relative z-10 flex flex-col max-w-4xl">
        <Button
          onClick={() => navigate('/falak-knowledge-ai')}
          variant="ghost"
          className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/30 mb-4 w-fit"
        >
          <ArrowRight className="w-4 h-4 ml-2" />
          العودة للمساعد الذكي
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm border border-indigo-400/30 mb-4">
            <GraduationCap className="w-10 h-10 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
            منشئ الجدول الدراسي
          </h1>
          <p className="text-white/80">أنشئ جدولاً دراسياً مخصصاً يناسب احتياجاتك</p>
        </motion.div>

        <div className="space-y-6">
          {/* Basic Settings */}
          <Card className="p-6 bg-black/20 backdrop-blur-sm border-indigo-500/20">
            <h3 className="text-xl font-bold text-white mb-4">الإعدادات الأساسية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studyGoal" className="text-white mb-2">هدف الدراسة</Label>
                <Input
                  id="studyGoal"
                  value={studyGoal}
                  onChange={(e) => setStudyGoal(e.target.value)}
                  placeholder="مثل: التحضير للثانوية العامة"
                  className="bg-gray-900/50 border-indigo-500/30 text-white"
                />
              </div>
              <div>
                <Label htmlFor="availableHours" className="text-white mb-2">إجمالي الساعات الأسبوعية المتاحة</Label>
                <Input
                  id="availableHours"
                  type="number"
                  value={availableHours}
                  onChange={(e) => setAvailableHours(Number(e.target.value))}
                  className="bg-gray-900/50 border-indigo-500/30 text-white"
                  min="1"
                  max="60"
                />
              </div>
              <div>
                <Label htmlFor="startTime" className="text-white mb-2">وقت البداية المفضل</Label>
                <Select value={preferredStartTime} onValueChange={setPreferredStartTime}>
                  <SelectTrigger className="bg-gray-900/50 border-indigo-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="endTime" className="text-white mb-2">وقت النهاية المفضل</Label>
                <Select value={preferredEndTime} onValueChange={setPreferredEndTime}>
                  <SelectTrigger className="bg-gray-900/50 border-indigo-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Excluded Days */}
          <Card className="p-6 bg-black/20 backdrop-blur-sm border-indigo-500/20">
            <h3 className="text-xl font-bold text-white mb-4">الأيام المستثناة</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {DAYS.map(day => (
                <div key={day} className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id={day}
                    checked={excludedDays.includes(day)}
                    onCheckedChange={() => toggleExcludedDay(day)}
                  />
                  <Label htmlFor={day} className="text-white cursor-pointer">{day}</Label>
                </div>
              ))}
            </div>
          </Card>

          {/* Subjects */}
          <Card className="p-6 bg-black/20 backdrop-blur-sm border-indigo-500/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">المواد الدراسية</h3>
              <Button onClick={addSubject} variant="outline" className="border-indigo-500/50 text-indigo-300">
                <Plus className="w-4 h-4 ml-2" />
                إضافة مادة
              </Button>
            </div>
            
            <div className="space-y-4">
              {subjects.map((subject) => (
                <div key={subject.id} className="p-4 bg-gray-800/30 rounded-lg border border-gray-600/30">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <Label className="text-white mb-2">اسم المادة</Label>
                      <Select 
                        value={subject.name} 
                        onValueChange={(value) => updateSubject(subject.id, 'name', value)}
                      >
                        <SelectTrigger className="bg-gray-900/50 border-gray-600/30 text-white">
                          <SelectValue placeholder="اختر المادة" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBJECTS_LIST.map(subjectName => (
                            <SelectItem key={subjectName} value={subjectName}>{subjectName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-white mb-2">ساعات أسبوعية</Label>
                      <Input
                        type="number"
                        value={subject.hoursPerWeek}
                        onChange={(e) => updateSubject(subject.id, 'hoursPerWeek', Number(e.target.value))}
                        className="bg-gray-900/50 border-gray-600/30 text-white"
                        min="1"
                        max="20"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-white mb-2">الأولوية</Label>
                      <Select 
                        value={subject.priority} 
                        onValueChange={(value: 'high' | 'medium' | 'low') => updateSubject(subject.id, 'priority', value)}
                      >
                        <SelectTrigger className="bg-gray-900/50 border-gray-600/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">عالية</SelectItem>
                          <SelectItem value="medium">متوسطة</SelectItem>
                          <SelectItem value="low">منخفضة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button
                      onClick={() => removeSubject(subject.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-500/50 text-red-300 hover:bg-red-900/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="text-center">
            <Button
              onClick={generateSchedule}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
            >
              <Calendar className="w-5 h-5 ml-2" />
              إنشاء الجدول الدراسي
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudyScheduleCreator;