import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight, Plus } from 'lucide-react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: string;
  teacher_name: string;
  school_name: string;
  class_section: string;
  student_name: string;
  parent_name: string;
  description: string;
  created_at: string;
}

const TeacherNotes = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherId, setTeacherId] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    teacherName: '',
    classSection: '',
    studentName: '',
    parentName: '',
    description: ''
  });

  useEffect(() => {
    fetchTeacherAndNotes();
  }, []);

  const fetchTeacherAndNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (teacherError || !teacherData) {
        navigate('/teacher-registration');
        return;
      }

      setTeacherId(teacherData.id);
      setSchoolName(teacherData.school_name);
      setFormData(prev => ({ ...prev, teacherName: teacherData.teacher_name }));

      const { data: notesData, error: notesError } = await supabase
        .from('class_notes')
        .select('*')
        .eq('teacher_id', teacherData.id)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;
      setNotes(notesData || []);
    } catch (error) {
      console.error('Error fetching:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل البيانات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.classSection || !formData.studentName || !formData.parentName || !formData.description) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('class_notes')
        .insert({
          teacher_id: teacherId,
          teacher_name: formData.teacherName,
          school_name: schoolName,
          class_section: formData.classSection,
          student_name: formData.studentName,
          parent_name: formData.parentName,
          description: formData.description
        });

      if (error) throw error;

      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة الملاحظة بنجاح'
      });

      setIsDialogOpen(false);
      setFormData(prev => ({
        teacherName: prev.teacherName,
        classSection: '',
        studentName: '',
        parentName: '',
        description: ''
      }));
      fetchTeacherAndNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إضافة الملاحظة',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-blue-950">
        <div className="animate-spin h-10 w-10 border-4 border-yellow-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900/40 to-blue-950" dir={dir}>
      <SEO 
        title="إدارة الملاحظات - جسر التواصل"
        description="إدارة وإضافة ملاحظات الطلاب"
      />
      <StarField />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="mb-10"
          >
            <button
              onClick={() => navigate('/teacher-dashboard')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
            >
              <ArrowRight size={20} className={dir === 'ltr' ? 'rotate-180' : ''} />
              {t.common.back}
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-white to-orange-500">
                  {t.communicationBridge.notes.title}
                </h1>
                <div className="w-16 h-1 bg-yellow-500/50"></div>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                    <Plus size={20} className="ml-2" />
                    {t.communicationBridge.notes.addNote}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background border-yellow-500/30" dir={dir}>
                  <DialogHeader>
                    <DialogTitle className="text-white text-right">
                      {t.communicationBridge.notes.addNote}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">{t.communicationBridge.notes.teacherName}</Label>
                      <Input
                        value={formData.teacherName}
                        disabled
                        className="bg-background/30 border-yellow-500/30 text-white/70"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">{t.communicationBridge.notes.classSection}</Label>
                      <Input
                        value={formData.classSection}
                        onChange={(e) => setFormData({ ...formData, classSection: e.target.value })}
                        className="bg-background/50 border-yellow-500/30 text-white"
                        placeholder="8أ"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">{t.communicationBridge.notes.studentName}</Label>
                      <Input
                        value={formData.studentName}
                        onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                        className="bg-background/50 border-yellow-500/30 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">{t.communicationBridge.notes.parentName}</Label>
                      <Input
                        value={formData.parentName}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                        className="bg-background/50 border-yellow-500/30 text-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">{t.communicationBridge.notes.description}</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-background/50 border-yellow-500/30 text-white min-h-[100px]"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                      {submitting ? 'جاري الإضافة...' : t.communicationBridge.notes.submit}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          <div className="space-y-4">
            {notes.length === 0 ? (
              <div className="text-center text-white/60 py-12">
                {t.communicationBridge.notes.noNotes}
              </div>
            ) : (
              notes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-background/10 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-500/50 transition-all"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-yellow-300 text-sm">الصف والشعبة</p>
                      <p className="text-white font-semibold">{note.class_section}</p>
                    </div>
                    <div>
                      <p className="text-yellow-300 text-sm">اسم الطالب</p>
                      <p className="text-white font-semibold">{note.student_name}</p>
                    </div>
                    <div>
                      <p className="text-yellow-300 text-sm">اسم ولي الأمر</p>
                      <p className="text-white font-semibold">{note.parent_name}</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-yellow-300 text-sm mb-2">وصف المشكلة</p>
                    <p className="text-white/80">{note.description}</p>
                  </div>
                  <p className="text-white/50 text-xs">
                    {new Date(note.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TeacherNotes;