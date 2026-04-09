import React, { useState, useEffect } from 'react';
import { Calendar, Loader2, Trash2, Power, PowerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ScheduledJob {
  id: string;
  subject: string;
  difficulty: string;
  puzzles_per_day: number;
  topic_description: string;
  schedule_days: string[];
  is_active: boolean;
  last_run_at: string | null;
  created_at: string;
}

const DAYS = [
  { key: 'sunday', label: 'الأحد' },
  { key: 'monday', label: 'الاثنين' },
  { key: 'tuesday', label: 'الثلاثاء' },
  { key: 'wednesday', label: 'الأربعاء' },
  { key: 'thursday', label: 'الخميس' },
  { key: 'friday', label: 'الجمعة' },
  { key: 'saturday', label: 'السبت' },
];

const AIPuzzleScheduler: React.FC = () => {
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [subject, setSubject] = useState('الفيزياء');
  const [difficulty, setDifficulty] = useState('متوسط');
  const [puzzlesPerDay, setPuzzlesPerDay] = useState(3);
  const [topicDescription, setTopicDescription] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('scheduled_puzzle_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs((data as ScheduledJob[]) || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSaveSchedule = async () => {
    if (selectedDays.length === 0) {
      toast.error('يرجى اختيار يوم واحد على الأقل');
      return;
    }
    if (!topicDescription.trim()) {
      toast.error('يرجى وصف المحتوى المطلوب');
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('scheduled_puzzle_jobs')
        .insert({
          subject,
          difficulty,
          puzzles_per_day: puzzlesPerDay,
          topic_description: topicDescription,
          schedule_days: selectedDays,
          is_active: true,
          created_by: user?.id,
        });

      if (error) throw error;

      toast.success('تم حفظ الجدولة بنجاح!');
      setTopicDescription('');
      setSelectedDays([]);
      fetchJobs();
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      toast.error(error.message || 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const toggleJobActive = async (jobId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('scheduled_puzzle_jobs')
        .update({ is_active: !currentActive })
        .eq('id', jobId);

      if (error) throw error;
      toast.success(currentActive ? 'تم إيقاف الجدولة' : 'تم تفعيل الجدولة');
      fetchJobs();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ');
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_puzzle_jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      toast.success('تم حذف الجدولة');
      fetchJobs();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ');
    }
  };

  const getDayLabel = (key: string) => DAYS.find(d => d.key === key)?.label || key;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-full bg-blue-500/20">
          <Calendar className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">جدولة الألغاز التلقائية</h3>
          <p className="text-sm text-white/60">حدد الأيام والعدد والنوع وسينزل الذكاء الاصطناعي الألغاز تلقائياً</p>
        </div>
      </div>

      {/* Schedule Form */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-white">المادة</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الفيزياء">⚛️ الفيزياء</SelectItem>
                  <SelectItem value="الكيمياء">🧪 الكيمياء</SelectItem>
                  <SelectItem value="الأحياء">🧬 الأحياء</SelectItem>
                  <SelectItem value="الرياضيات">📐 الرياضيات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">الصعوبة</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="سهل">🟢 سهل</SelectItem>
                  <SelectItem value="متوسط">🟡 متوسط</SelectItem>
                  <SelectItem value="صعب">🔴 صعب</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">عدد الألغاز يومياً</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={puzzlesPerDay}
                onChange={(e) => setPuzzlesPerDay(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">أيام النشر</Label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day.key}
                  onClick={() => toggleDay(day.key)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedDays.includes(day.key)
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">وصف المحتوى المطلوب *</Label>
            <Textarea
              value={topicDescription}
              onChange={(e) => setTopicDescription(e.target.value)}
              placeholder="مثال: ألغاز متنوعة عن الفيزياء الحديثة والكلاسيكية..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              rows={2}
            />
          </div>

          <Button
            onClick={handleSaveSchedule}
            disabled={saving}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Calendar className="h-4 w-4 ml-2" />}
            حفظ الجدولة
          </Button>
        </CardContent>
      </Card>

      {/* Active Schedules */}
      <div className="space-y-3">
        <h4 className="text-white font-semibold">الجداول النشطة ({jobs.length})</h4>
        
        {loading ? (
          <div className="text-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-white/40" />
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-white/40 text-center py-4">لا توجد جداول بعد</p>
        ) : (
          jobs.map(job => (
            <Card key={job.id} className={`border ${job.is_active ? 'bg-white/5 border-blue-500/30' : 'bg-white/5 border-white/10 opacity-60'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-white border-white/20">{job.subject}</Badge>
                      <Badge variant="outline" className="text-white border-white/20">{job.difficulty}</Badge>
                      <span className="text-sm text-white/60">{job.puzzles_per_day} ألغاز/يوم</span>
                    </div>
                    <p className="text-sm text-white/80">{job.topic_description}</p>
                    <div className="flex flex-wrap gap-1">
                      {job.schedule_days.map(day => (
                        <span key={day} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                          {getDayLabel(day)}
                        </span>
                      ))}
                    </div>
                    {job.last_run_at && (
                      <p className="text-xs text-white/40">
                        آخر تشغيل: {new Date(job.last_run_at).toLocaleDateString('ar')}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleJobActive(job.id, job.is_active)}
                      className="border-white/20"
                    >
                      {job.is_active ? <PowerOff className="h-4 w-4 text-amber-400" /> : <Power className="h-4 w-4 text-emerald-400" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => deleteJob(job.id)}
                      className="border-white/20 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AIPuzzleScheduler;
