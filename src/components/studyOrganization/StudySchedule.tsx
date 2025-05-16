
import React, { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, CalendarDays, Clock, BookOpen, PenLine } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { ar } from 'date-fns/locale';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

interface StudyEvent {
  id: string;
  title: string;
  subject: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  notes: string;
  user_id?: string | null;
}

// Define the shape of the database study event
type DbStudyEvent = Database['public']['Tables']['study_events']['Row'];

const subjects = [
  { value: "physics", label: "الفيزياء" },
  { value: "chemistry", label: "الكيمياء" },
  { value: "biology", label: "الأحياء" },
  { value: "mathematics", label: "الرياضيات" },
  { value: "other", label: "أخرى" }
];

const LOCAL_STORAGE_KEY = 'studyEvents';

const StudySchedule = () => {
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDateEvents, setSelectedDateEvents] = useState<StudyEvent[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const { toast } = useToast();

  // تحقق من حالة تسجيل الدخول
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

  // تحميل الأحداث عند بدء التشغيل
  useEffect(() => {
    loadEvents();
  }, [isLoggedIn, userId]);

  // تحديث الأحداث المعروضة عند تغيير التاريخ المحدد
  useEffect(() => {
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      const filteredEvents = events.filter(event => {
        const eventDate = event.date instanceof Date 
          ? format(event.date, 'yyyy-MM-dd') 
          : format(new Date(event.date), 'yyyy-MM-dd');
        return eventDate === dateStr;
      });
      setSelectedDateEvents(filteredEvents);
    } else {
      setSelectedDateEvents([]);
    }
  }, [date, events]);

  const loadEvents = async () => {
    if (isLoggedIn && userId) {
      // إذا كان المستخدم مسجل الدخول، قم بتحميل الأحداث من Supabase
      try {
        const { data, error } = await supabase
          .from('study_events')
          .select('*')
          .eq('user_id', userId);
        
        if (error) throw error;
        
        if (data) {
          // تحويل البيانات من السيرفر إلى الهيكل المستخدم في التطبيق
          const eventsWithDates: StudyEvent[] = data.map(event => ({
            id: event.id,
            title: event.title,
            subject: event.subject,
            date: new Date(event.date),
            startTime: event.start_time,
            endTime: event.end_time,
            notes: event.notes || '',
            user_id: event.user_id
          }));
          setEvents(eventsWithDates);
        }
      } catch (error) {
        console.error("خطأ في تحميل جدول الدراسة من قاعدة البيانات:", error);
        toast({
          title: "خطأ",
          description: "لم نتمكن من تحميل جدول الدراسة الخاص بك",
          variant: "destructive",
        });
      }
    } else {
      // إذا لم يكن المستخدم مسجل الدخول، قم بتحميل الأحداث من التخزين المحلي
      try {
        const savedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedEvents) {
          const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
            ...event,
            date: new Date(event.date)
          }));
          setEvents(parsedEvents);
        }
      } catch (error) {
        console.error("خطأ في تحميل جدول الدراسة من التخزين المحلي:", error);
        toast({
          title: "خطأ",
          description: "لم نتمكن من تحميل جدول الدراسة المخزن",
          variant: "destructive",
        });
      }
    }
  };

  const saveEvents = async (updatedEvents: StudyEvent[]) => {
    if (isLoggedIn && userId) {
      // حفظ الأحداث في Supabase إذا كان المستخدم مسجل الدخول
      // لا نحتاج لفعل شيء هنا لأن كل عملية إضافة/حذف ستقوم بالتحديث المباشر
    } else {
      // حفظ الأحداث في التخزين المحلي إذا لم يكن المستخدم مسجل الدخول
      try {
        const eventsToStore = updatedEvents.map(event => ({
          ...event,
          date: event.date instanceof Date ? event.date.toISOString() : event.date
        }));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(eventsToStore));
      } catch (error) {
        console.error("خطأ في حفظ جدول الدراسة في التخزين المحلي:", error);
        toast({
          title: "خطأ",
          description: "لم نتمكن من حفظ جدول الدراسة",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddEvent = async () => {
    if (!date || !title || !subject || !startTime || !endTime) {
      toast({
        title: "معلومات ناقصة",
        description: "يرجى إدخال جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const newEvent: StudyEvent = {
      id: `${Date.now()}`,
      title,
      subject,
      date,
      startTime,
      endTime,
      notes,
      user_id: userId
    };

    if (isLoggedIn && userId) {
      // إضافة الحدث إلى Supabase
      try {
        const { data, error } = await supabase
          .from('study_events')
          .insert({
            title: newEvent.title,
            subject: newEvent.subject,
            date: newEvent.date instanceof Date ? newEvent.date.toISOString().split('T')[0] : newEvent.date,
            start_time: newEvent.startTime,
            end_time: newEvent.endTime,
            notes: newEvent.notes,
            user_id: userId
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          // تحديث الحدث الجديد بالمعرف من قاعدة البيانات
          newEvent.id = data.id;
        }
      } catch (error) {
        console.error("خطأ في إضافة حدث جديد إلى قاعدة البيانات:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حفظ الحدث. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
        return;
      }
    }

    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    
    // حفظ في التخزين المحلي إذا لم يكن المستخدم مسجل الدخول
    if (!isLoggedIn) {
      saveEvents(updatedEvents);
    }
    
    resetForm();
    setIsDialogOpen(false);

    toast({
      title: "تمت الإضافة بنجاح",
      description: "تمت إضافة الحدث إلى الجدول الدراسي",
    });
  };

  const handleDeleteEvent = async (id: string) => {
    if (isLoggedIn && userId) {
      // حذف الحدث من Supabase
      try {
        const { error } = await supabase
          .from('study_events')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;
      } catch (error) {
        console.error("خطأ في حذف الحدث من قاعدة البيانات:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حذف الحدث. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
        return;
      }
    }

    const updatedEvents = events.filter(event => event.id !== id);
    setEvents(updatedEvents);
    
    // حفظ في التخزين المحلي إذا لم يكن المستخدم مسجل الدخول
    if (!isLoggedIn) {
      saveEvents(updatedEvents);
    }
    
    toast({
      title: "تم الحذف",
      description: "تم حذف الحدث من الجدول الدراسي",
    });
  };

  const resetForm = () => {
    setTitle('');
    setSubject('');
    setStartTime('');
    setEndTime('');
    setNotes('');
  };

  const getSubjectLabel = (value: string) => {
    return subjects.find(s => s.value === value)?.label || value;
  };

  const getDaysWithEvents = () => {
    return events.reduce((acc, event) => {
      const eventDate = event.date instanceof Date 
        ? format(event.date, 'yyyy-MM-dd') 
        : format(new Date(event.date), 'yyyy-MM-dd');
      
      if (!acc[eventDate]) {
        acc[eventDate] = 1;
      } else {
        acc[eventDate]++;
      }
      return acc;
    }, {} as Record<string, number>);
  };

  const daysWithEvents = getDaysWithEvents();

  // تنسيق التاريخ باللغة العربية
  const formatDate = (date: Date) => {
    return format(date, 'EEEE، d MMMM yyyy', { locale: ar });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* عرض التقويم */}
        <Card className="md:col-span-1 bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="pt-6">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              locale={ar}
              className="rounded-md border border-white/10 bg-white/5"
              modifiers={{
                event: (date) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  return !!daysWithEvents[dateStr];
                }
              }}
              modifiersStyles={{
                event: { 
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  borderRadius: '50%'
                }
              }}
            />
            
            <div className="mt-4 flex justify-center">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    إضافة حدث جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-green-950 border-green-800 text-white max-h-[90vh] overflow-y-auto" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>إضافة حدث دراسي جديد</DialogTitle>
                    <DialogDescription>
                      أضف تفاصيل الحدث الدراسي الجديد إلى الجدول الدراسي
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">عنوان النشاط</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="مثال: مراجعة فصل القوانين"
                        className="bg-green-900/50 border-green-700"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="subject">المادة</Label>
                      <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger className="bg-green-900/50 border-green-700">
                          <SelectValue placeholder="اختر المادة" />
                        </SelectTrigger>
                        <SelectContent className="bg-green-900 border-green-700 max-h-60 overflow-y-auto">
                          {subjects.map((subject) => (
                            <SelectItem key={subject.value} value={subject.value}>
                              {subject.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="date">التاريخ</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`justify-start text-right bg-green-900/50 border-green-700 ${!date ? "text-muted-foreground" : ""}`}
                          >
                            <CalendarDays className="mr-2 h-4 w-4" />
                            {date ? formatDate(date) : "اختر تاريخاً"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-green-900 border-green-700 max-h-80 overflow-y-auto" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            locale={ar}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="startTime">وقت البدء</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="bg-green-900/50 border-green-700"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="endTime">وقت الانتهاء</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="bg-green-900/50 border-green-700"
                        />
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                      <Input
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="أي ملاحظات إضافية..."
                        className="bg-green-900/50 border-green-700"
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
                      onClick={handleAddEvent}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      إضافة الحدث
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
        
        {/* عرض الأحداث للتاريخ المحدد */}
        <Card className="md:col-span-2 bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-green-300 flex items-center">
                <CalendarDays className="ml-2 h-5 w-5" />
                {date ? formatDate(date) : "لا يوجد تاريخ محدد"}
              </h3>
            </div>
            
            {selectedDateEvents.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <BookOpen className="mx-auto h-12 w-12 opacity-50 mb-2" />
                <p>لا توجد أحداث دراسية لهذا اليوم</p>
                <p className="text-sm mt-2">انقر على "إضافة حدث جديد" لإنشاء حدث</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">النشاط</TableHead>
                      <TableHead className="text-right">المادة</TableHead>
                      <TableHead className="text-right">الوقت</TableHead>
                      <TableHead className="text-right">ملاحظات</TableHead>
                      <TableHead className="text-right">حذف</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedDateEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{getSubjectLabel(event.subject)}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="ml-1 h-4 w-4 text-green-300" />
                            <span>{event.startTime} - {event.endTime}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {event.notes || "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {!isLoggedIn && (
        <div className="mt-4 p-4 rounded-md bg-yellow-900/20 border border-yellow-800/30">
          <p className="text-yellow-300 text-sm text-center">
            سيتم حفظ جدول الدراسة محلياً على هذا الجهاز. قم بتسجيل الدخول لحفظ الجدول عبر جميع أجهزتك!
          </p>
        </div>
      )}
    </div>
  );
};

export default StudySchedule;
