import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight, FileText, StickyNote, MessageSquare, GraduationCap, School, BookOpen } from 'lucide-react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getStoredStudentProfile, StudentProfile } from './StudentRegistration';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
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
    } catch (error) {
      console.error('Error fetching student:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل بيانات الطالب',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const dashboardOptions = [
    {
      title: "الواجبات المدرسية",
      icon: <FileText className="w-12 h-12 mb-4" />,
      description: "عرض الواجبات والمهام المطلوبة من المعلمين لصفك وشعبتك",
      color: "from-blue-600/20 to-cyan-600/20",
      borderColor: "border-blue-500/30",
      hoverBorderColor: "hover:border-blue-500/50",
      link: "/student/assignments"
    },
    {
      title: "الملاحظات والتوجيهات",
      icon: <StickyNote className="w-12 h-12 mb-4" />,
      description: "عرض ملاحظات المعلمين والتوجيهات الدراسية الموجهة إليك",
      color: "from-yellow-600/20 to-orange-600/20",
      borderColor: "border-yellow-500/30",
      hoverBorderColor: "hover:border-yellow-500/50",
      link: "/student/notes"
    },
    {
      title: "دردشة الصف المباشرة",
      icon: <MessageSquare className="w-12 h-12 mb-4" />,
      description: "التواصل والمحادثة المباشرة مع المعلم وزملائك في الصف والمدرسة",
      color: "from-purple-600/20 to-indigo-600/20",
      borderColor: "border-purple-500/30",
      hoverBorderColor: "hover:border-purple-500/50",
      link: "/student/chat"
    }
  ];

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
        title="لوحة تحكم الطالب - جسر التواصل"
        description="لوحة تحكم الطالب لمتابعة الواجبات والملاحظات ودردشة الصف"
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold mb-3">
                <GraduationCap className="w-4 h-4" />
                <span>حساب الطالب الأكاديمي</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-white to-cyan-400">
                مرحباً {student?.studentName?.trim() || 'بالطالب المتميز'}
              </h1>
              <div className="w-16 h-1 bg-purple-500/50 mx-auto mb-4"></div>
              <div className="text-white/80 space-y-1.5 text-sm md:text-base font-medium">
                <p><span className="text-purple-300 font-bold">اسم الطالب:</span> {student?.studentName}</p>
                <p><span className="text-purple-300 font-bold">الصف والشعبة:</span> {student?.grade ? `الصف ${student.grade}` : ''} {student?.section ? `(شعبة ${student.section})` : ''}</p>
                <p><span className="text-purple-300 font-bold">المدرسة:</span> {student?.schoolName}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dashboardOptions.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                onClick={() => navigate(option.link)}
                className={`group relative p-8 rounded-2xl cursor-pointer ${option.borderColor} ${option.hoverBorderColor} border-2 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:scale-105 bg-background/10 backdrop-blur-md`}
              >
                <div className={`absolute inset-0 bg-gradient-radial ${option.color} opacity-40 rounded-2xl`}></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="text-purple-300 group-hover:text-purple-200 transition-colors">
                    {option.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {option.description}
                  </p>
                </div>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/0 via-purple-400/10 to-purple-500/0 rounded-2xl"></div>
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

export default StudentDashboard;
