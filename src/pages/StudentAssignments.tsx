import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight, FileText, Calendar, BookOpen } from 'lucide-react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getStoredStudentProfile, StudentProfile } from './StudentRegistration';

interface Assignment {
  id: string;
  assignment_name: string;
  grade: string;
  section: string;
  description: string;
  image_url: string | null;
  created_at: string;
}

const StudentAssignments = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
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

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('class_assignments')
        .select('*')
        .eq('grade', profile.grade)
        .eq('section', profile.section)
        .order('created_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل الواجبات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-blue-950">
        <div className="animate-spin h-10 w-10 border-4 border-purple-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900/40 via-purple-950/20 to-blue-950 text-white" dir={dir}>
      <SEO 
        title="واجباتي المدرسية - جسر التواصل"
        description="عرض واجبات الطالب المدرسية وإرشادات المعلمين"
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
              <h1 className="text-3xl md:text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-white to-cyan-400">
                واجباتي المدرسية
              </h1>
              <div className="w-16 h-1 bg-purple-500/50 mx-auto mb-3"></div>
              {student && (
                <p className="text-white/70 text-sm">
                  عرض واجبات الصف {student.grade} - شعبة ({student.section}) • {student.schoolName}
                </p>
              )}
            </div>
          </motion.div>

          {/* Assignments List */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="space-y-4"
          >
            {assignments.length === 0 ? (
              <div className="text-center py-16 bg-background/10 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8">
                <FileText className="w-16 h-16 text-purple-400/40 mx-auto mb-4" />
                <p className="text-white/70 text-lg font-medium">
                  رائع! لا توجد واجبات مدرسية معلقة لصفك حالياً.
                </p>
                <p className="text-white/40 text-xs mt-2">
                  عندما يرفع معلمك واجباً جديداً لشعبتك سيظهر هنا مباشرة
                </p>
              </div>
            ) : (
              assignments.map((assignment) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-background/10 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/50 transition-all shadow-lg"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {assignment.assignment_name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-purple-300">
                        <span className="bg-purple-500/20 px-2.5 py-1 rounded-md">
                          الصف {assignment.grade} ({assignment.section})
                        </span>
                        <span className="flex items-center gap-1 text-white/50">
                          <Calendar size={13} />
                          {new Date(assignment.created_at).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-white/80 whitespace-pre-wrap leading-relaxed mb-4 text-sm">
                    {assignment.description}
                  </p>

                  {assignment.image_url && (
                    <div className="mt-4">
                      <img 
                        src={assignment.image_url} 
                        alt={assignment.assignment_name}
                        className="rounded-lg max-h-96 w-full object-contain bg-black/30 border border-purple-500/20"
                      />
                    </div>
                  )}
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

export default StudentAssignments;
