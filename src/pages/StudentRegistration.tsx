import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight, GraduationCap } from 'lucide-react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AutocompleteInput } from '@/components/shared/AutocompleteInput';
import { SCHOOLS, GRADES, SECTIONS } from '@/data/schoolsAndGrades';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface StudentProfile {
  studentName: string;
  grade: string;
  section: string;
  schoolName: string;
  userId?: string;
}

export const getStoredStudentProfile = async (): Promise<StudentProfile | null> => {
  try {
    const local = localStorage.getItem('student_profile');
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed?.studentName && parsed?.grade && parsed?.schoolName) {
        return parsed;
      }
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.student_profile) {
      const profile = user.user_metadata.student_profile;
      localStorage.setItem('student_profile', JSON.stringify(profile));
      return profile;
    }
  } catch (e) {
    console.error('Error fetching student profile:', e);
  }
  return null;
};

const StudentRegistration = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  const [formData, setFormData] = useState<StudentProfile>({
    studentName: '',
    grade: '',
    section: '',
    schoolName: ''
  });

  useEffect(() => {
    checkExistingStudent();
  }, []);

  const checkExistingStudent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const existing = await getStoredStudentProfile();
      if (existing) {
        navigate('/student-dashboard');
      }
    } catch (error) {
      console.error('Error checking student:', error);
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentName.trim() || !formData.grade || !formData.section || !formData.schoolName.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const profile: StudentProfile = {
        studentName: formData.studentName.trim(),
        grade: formData.grade,
        section: formData.section,
        schoolName: formData.schoolName.trim(),
        userId: user.id
      };

      // Save locally
      localStorage.setItem('student_profile', JSON.stringify(profile));

      // Attempt to save to user metadata
      try {
        await supabase.auth.updateUser({
          data: { student_profile: profile }
        });
      } catch (metaErr) {
        console.warn('Could not update user metadata:', metaErr);
      }

      // Also ensure profile username reflects student name if not set
      try {
        await supabase.from('profiles').update({
          username: profile.studentName
        }).eq('id', user.id);
      } catch (profErr) {
        console.warn('Could not update profile username:', profErr);
      }

      toast({
        title: 'تم التسجيل بنجاح',
        description: 'أهلاً بك يا بطل! تم حفظ بياناتك كطالب بنجاح.'
      });

      navigate('/student-dashboard');
    } catch (error: any) {
      console.error('Error registering student:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-blue-950">
        <div className="animate-spin h-10 w-10 border-4 border-purple-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900/40 via-purple-950/30 to-blue-950 text-white" dir={dir}>
      <SEO 
        title="تسجيل طالب - جسر التواصل"
        description="تسجيل طالب جديد في منصة جسر التواصل للواجبات والملاحظات ودردشة الصف"
      />
      <StarField />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div 
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/communication-bridge')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
            >
              <ArrowRight size={20} className={dir === 'ltr' ? 'rotate-180' : ''} />
              {t.common.back}
            </button>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-white to-cyan-300">
                تسجيل بيانات الطالب
              </h1>
              <div className="w-16 h-1 bg-purple-500/50 mx-auto mb-3"></div>
              <p className="text-white/70 text-sm md:text-base">
                سجّل معلوماتك المدرسية لتتمكن من متابعة واجباتك والتواصل مع معلميك وزملائك
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="bg-background/20 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 md:p-8 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-white font-bold">اسم الطالب الكامل *</Label>
                <Input
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  placeholder="مثال: أحمد محمود الخوالدة"
                  className="bg-background/50 border-purple-500/30 text-white placeholder:text-white/40 h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <AutocompleteInput
                  label="اسم المدرسة *"
                  value={formData.schoolName}
                  onChange={(value) => setFormData({ ...formData, schoolName: value })}
                  suggestions={SCHOOLS}
                  placeholder="اختر أو ابحث عن اسم مدرستك"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white font-bold">الصف الدراسي *</Label>
                  <Select
                    value={formData.grade}
                    onValueChange={(value) => setFormData({ ...formData, grade: value })}
                    required
                  >
                    <SelectTrigger className="bg-background/50 border-purple-500/30 text-white h-11">
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-purple-500/30 text-white max-h-60">
                      {GRADES.map((grade) => (
                        <SelectItem key={grade} value={grade} className="hover:bg-purple-900/40">
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white font-bold">الشعبة *</Label>
                  <Select
                    value={formData.section}
                    onValueChange={(value) => setFormData({ ...formData, section: value })}
                    required
                  >
                    <SelectTrigger className="bg-background/50 border-purple-500/30 text-white h-11">
                      <SelectValue placeholder="اختر الشعبة" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-purple-500/30 text-white max-h-60">
                      {SECTIONS.map((section) => (
                        <SelectItem key={section} value={section} className="hover:bg-purple-900/40">
                          {section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold text-base shadow-lg shadow-purple-600/30 transition-all"
              >
                {loading ? 'جاري التسجيل...' : 'تسجيل الدخول ومتابعة لوحة الطالب'}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudentRegistration;
