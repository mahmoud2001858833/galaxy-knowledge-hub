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

interface Teacher {
  id: string;
  school_name: string;
  teacher_name: string;
  homeroom_class: string;
  subject_taught: string;
  grades_sections: string[];
}

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No teacher record found
          navigate('/teacher-registration');
          return;
        }
        throw error;
      }

      setTeacher({
        ...data,
        grades_sections: (Array.isArray(data.grades_sections) 
          ? data.grades_sections 
          : []).map(item => String(item))
      });
    } catch (error) {
      console.error('Error fetching teacher:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل البيانات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const dashboardOptions = [
    {
      title: t.communicationBridge.dashboard.assignments,
      icon: <FileText className="w-12 h-12 mb-4" />,
      description: "إدارة ورفع الواجبات للصفوف",
      color: "from-blue-600/20 to-cyan-600/20",
      borderColor: "border-blue-500/30",
      hoverBorderColor: "hover:border-blue-500/50",
      link: "/teacher/assignments"
    },
    {
      title: t.communicationBridge.dashboard.notes,
      icon: <StickyNote className="w-12 h-12 mb-4" />,
      description: "إضافة وعرض ملاحظات الطلاب",
      color: "from-yellow-600/20 to-orange-600/20",
      borderColor: "border-yellow-500/30",
      hoverBorderColor: "hover:border-yellow-500/50",
      link: "/teacher/notes"
    },
    {
      title: t.communicationBridge.dashboard.chat,
      icon: <MessageSquare className="w-12 h-12 mb-4" />,
      description: "الدردشة مع الطلاب وأولياء الأمور",
      color: "from-teal-600/20 to-emerald-600/20",
      borderColor: "border-teal-500/30",
      hoverBorderColor: "hover:border-teal-500/50",
      link: "/teacher/chat"
    },
    {
      title: "الإحصائيات",
      icon: <TrendingUp className="w-12 h-12 mb-4" />,
      description: "عرض إحصائيات الواجبات والملاحظات والرسائل",
      color: "from-purple-600/20 to-pink-600/20",
      borderColor: "border-purple-500/30",
      hoverBorderColor: "hover:border-purple-500/50",
      link: "/teacher/statistics"
    }
  ];

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
        title="لوحة تحكم المعلم - جسر التواصل"
        description="لوحة تحكم المعلم لإدارة الواجبات والملاحظات والتواصل"
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
              onClick={() => navigate('/communication-bridge')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
            >
              <ArrowRight size={20} className={dir === 'ltr' ? 'rotate-180' : ''} />
              {t.common.back}
            </button>
            
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-white to-cyan-500">
                مرحباً {teacher?.teacher_name}
              </h1>
              <div className="w-16 h-1 bg-teal-500/50 mx-auto mb-4"></div>
              <div className="text-white/70 space-y-1">
                <p>المدرسة: {teacher?.school_name}</p>
                <p>المادة: {teacher?.subject_taught}</p>
                <p>مربي صف: {teacher?.homeroom_class}</p>
                <p>الصفوف المُدرسة: {teacher?.grades_sections.join(', ')}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardOptions.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                onClick={() => navigate(option.link)}
                className={`group relative p-8 rounded-xl cursor-pointer ${option.borderColor} ${option.hoverBorderColor} border-2 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/20 hover:scale-105 bg-background/5 backdrop-blur-sm`}
              >
                <div className={`absolute inset-0 bg-gradient-radial ${option.color} opacity-50 rounded-xl`}></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="text-teal-400 group-hover:text-teal-300 transition-colors">
                    {option.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-teal-300 transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {option.description}
                  </p>
                </div>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl">
                  <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/0 via-teal-400/10 to-teal-500/0 rounded-xl"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TeacherDashboard;