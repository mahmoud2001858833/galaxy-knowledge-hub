import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight, FileText, MessageSquare, StickyNote, TrendingUp } from 'lucide-react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ClassStatistics {
  gradeSection: string;
  assignmentsCount: number;
  notesCount: number;
  messagesCount: number;
}

interface Teacher {
  id: string;
  school_name: string;
  teacher_name: string;
  grades_sections: string[];
}

const TeacherStatistics = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [statistics, setStatistics] = useState<ClassStatistics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherAndStatistics();
  }, []);

  const fetchTeacherAndStatistics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Fetch teacher data
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (teacherError) {
        if (teacherError.code === 'PGRST116') {
          navigate('/teacher-registration');
          return;
        }
        throw teacherError;
      }

      const teacherInfo: Teacher = {
        ...teacherData,
        grades_sections: (Array.isArray(teacherData.grades_sections) 
          ? teacherData.grades_sections 
          : []).map(item => String(item))
      };
      setTeacher(teacherInfo);

      // Fetch statistics for each class
      const stats: ClassStatistics[] = [];

      for (const gradeSection of teacherInfo.grades_sections) {
        // Parse grade and section (format: "10A" -> grade: "10", section: "A")
        const grade = gradeSection.replace(/[^0-9]/g, '');
        const section = gradeSection.replace(/[0-9]/g, '');

        // Count assignments
        const { count: assignmentsCount } = await supabase
          .from('class_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', teacherInfo.id)
          .eq('grade', grade)
          .eq('section', section);

        // Count notes
        const { count: notesCount } = await supabase
          .from('class_notes')
          .select('*', { count: 'exact', head: true })
          .eq('teacher_id', teacherInfo.id)
          .ilike('class_section', `%${grade}%${section}%`);

        // Count messages
        const { count: messagesCount } = await supabase
          .from('class_chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('school_name', teacherInfo.school_name)
          .eq('grade', grade)
          .eq('section', section);

        stats.push({
          gradeSection,
          assignmentsCount: assignmentsCount || 0,
          notesCount: notesCount || 0,
          messagesCount: messagesCount || 0
        });
      }

      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل الإحصائيات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalCount = (type: 'assignments' | 'notes' | 'messages') => {
    return statistics.reduce((sum, stat) => {
      if (type === 'assignments') return sum + stat.assignmentsCount;
      if (type === 'notes') return sum + stat.notesCount;
      return sum + stat.messagesCount;
    }, 0);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-blue-950">
        <div className="animate-spin h-10 w-10 border-4 border-teal-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900/40 to-blue-950" dir={dir}>
      <SEO 
        title="إحصائيات المعلم - جسر التواصل"
        description="إحصائيات شاملة عن الواجبات والملاحظات والرسائل"
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
            
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <TrendingUp className="w-10 h-10 text-teal-400" />
                <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-white to-cyan-500">
                  إحصائيات المعلم
                </h1>
              </div>
              <div className="w-16 h-1 bg-teal-500/50 mx-auto mb-4"></div>
              <p className="text-white/70 text-lg">
                {teacher?.teacher_name} - {teacher?.school_name}
              </p>
            </div>
          </motion.div>

          {/* Overall Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
          >
            <Card className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border-blue-500/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/80">
                  إجمالي الواجبات
                </CardTitle>
                <FileText className="h-5 w-5 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{getTotalCount('assignments')}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-600/10 to-orange-600/10 border-yellow-500/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/80">
                  إجمالي الملاحظات
                </CardTitle>
                <StickyNote className="h-5 w-5 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{getTotalCount('notes')}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-600/10 to-emerald-600/10 border-teal-500/30 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white/80">
                  إجمالي الرسائل
                </CardTitle>
                <MessageSquare className="h-5 w-5 text-teal-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{getTotalCount('messages')}</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Per-Class Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              إحصائيات كل صف
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statistics.map((stat, index) => (
                <motion.div
                  key={stat.gradeSection}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-purple-600/10 to-pink-600/10 border-purple-500/30 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-white text-center">
                        الصف {stat.gradeSection}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-400" />
                          <span className="text-white/80">الواجبات</span>
                        </div>
                        <span className="text-xl font-bold text-white">{stat.assignmentsCount}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10">
                        <div className="flex items-center gap-2">
                          <StickyNote className="h-5 w-5 text-yellow-400" />
                          <span className="text-white/80">الملاحظات</span>
                        </div>
                        <span className="text-xl font-bold text-white">{stat.notesCount}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-teal-500/10">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-teal-400" />
                          <span className="text-white/80">الرسائل</span>
                        </div>
                        <span className="text-xl font-bold text-white">{stat.messagesCount}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {statistics.length === 0 && (
              <div className="text-center text-white/60 py-10">
                لا توجد إحصائيات متاحة حالياً
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TeacherStatistics;
