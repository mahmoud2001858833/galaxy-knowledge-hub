import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight, StickyNote, Calendar, User, School } from 'lucide-react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getStoredStudentProfile, StudentProfile } from './StudentRegistration';

interface Note {
  id: string;
  teacher_name: string;
  class_section: string;
  student_name: string;
  parent_name: string;
  description: string;
  created_at: string;
}

const StudentNotes = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const profile = await getStoredStudentProfile();
      if (!profile) {
        navigate('/student-registration');
        return;
      }
      setStudent(profile);

      // Fetch notes for this student name or class
      const { data: notesData, error: notesError } = await supabase
        .from('student_notes')
        .select('*')
        .ilike('student_name', `%${profile.studentName.trim()}%`)
        .order('created_at', { ascending: false });

      if (notesError) throw notesError;
      setNotes(notesData || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل الملاحظات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900/40 via-purple-950/20 to-blue-950 text-white" dir={dir}>
      <SEO 
        title="ملاحظاتي المدرسية - جسر التواصل"
        description="عرض ملاحظات وتوجيهات المعلمين للطالب"
      />
      <StarField />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/student-dashboard')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
            >
              <ArrowRight size={20} className={dir === 'ltr' ? 'rotate-180' : ''} />
              العودة للوحة تحكم الطالب
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-white to-orange-400">
                ملاحظات وتوجيهات المعلمين
              </h1>
              <div className="w-16 h-1 bg-yellow-500/50 mx-auto mb-3"></div>
              {student && (
                <p className="text-white/70 text-sm">
                  ملاحظات مخصصة للطالب: {student.studentName} • الصف {student.grade} ({student.section})
                </p>
              )}
            </div>
          </motion.div>

          {/* Notes List */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="space-y-4"
          >
            {notes.length === 0 ? (
              <div className="text-center py-16 bg-background/10 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-8">
                <StickyNote className="w-16 h-16 text-yellow-400/40 mx-auto mb-4" />
                <p className="text-white/70 text-lg font-medium">
                  لا توجد ملاحظات أو تنبيهات مسجلة بحقك حالياً.
                </p>
                <p className="text-emerald-400 text-sm mt-2 font-semibold">
                  سجلك الأكاديمي ممتاز، تابع تألقك الدراسي! ✨
                </p>
              </div>
            ) : (
              notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-background/10 backdrop-blur-sm border border-yellow-500/30 rounded-xl p-6 hover:border-yellow-500/50 transition-all shadow-lg"
                >
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-300 font-bold">
                        <User size={18} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          المعلم: {note.teacher_name}
                        </h3>
                        <p className="text-xs text-yellow-300/80">
                          {note.class_section}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-white/50 bg-white/5 px-2.5 py-1 rounded-md">
                      <Calendar size={13} />
                      {new Date(note.created_at).toLocaleDateString('ar-SA')}
                    </div>
                  </div>

                  <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
                    <p className="text-white/90 whitespace-pre-wrap leading-relaxed text-sm">
                      {note.description}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudentNotes;
