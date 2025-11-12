import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight, Plus, X } from 'lucide-react';
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

const TeacherRegistration = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  const [formData, setFormData] = useState({
    schoolName: '',
    teacherName: '',
    homeroomClass: '',
    subjectTaught: '',
  });

  const [gradesSections, setGradesSections] = useState<Array<{ grade: string; section: string }>>([
    { grade: '', section: '' }
  ]);

  useEffect(() => {
    checkExistingTeacher();
  }, []);

  const checkExistingTeacher = async () => {
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

      if (data) {
        // Teacher already registered
        navigate('/teacher-dashboard');
      }
    } catch (error) {
      console.error('Error checking teacher:', error);
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleAddGradeSection = () => {
    setGradesSections([...gradesSections, { grade: '', section: '' }]);
  };

  const handleRemoveGradeSection = (index: number) => {
    if (gradesSections.length > 1) {
      setGradesSections(gradesSections.filter((_, i) => i !== index));
    }
  };

  const handleGradeSectionChange = (index: number, field: 'grade' | 'section', value: string) => {
    const updated = [...gradesSections];
    updated[index][field] = value;
    setGradesSections(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.schoolName || !formData.teacherName || !formData.homeroomClass || !formData.subjectTaught) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive'
      });
      return;
    }

    const validGradesSections = gradesSections.filter(gs => gs.grade && gs.section);
    if (validGradesSections.length === 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى إضافة صف وشعبة واحدة على الأقل',
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

      const gradesSectionsArray = validGradesSections.map(gs => `${gs.grade}${gs.section}`);

      const { error } = await supabase
        .from('teachers')
        .insert({
          user_id: user.id,
          school_name: formData.schoolName,
          teacher_name: formData.teacherName,
          homeroom_class: formData.homeroomClass,
          subject_taught: formData.subjectTaught,
          grades_sections: gradesSectionsArray
        });

      if (error) throw error;

      toast({
        title: 'تم التسجيل بنجاح',
        description: 'تم تسجيل بياناتك كمعلم بنجاح'
      });

      navigate('/teacher-dashboard');
    } catch (error) {
      console.error('Error registering teacher:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء التسجيل',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-blue-950">
        <div className="animate-spin h-10 w-10 border-4 border-teal-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900/40 to-blue-950" dir={dir}>
      <SEO 
        title="تسجيل معلم - جسر التواصل"
        description="تسجيل معلم جديد في منصة جسر التواصل"
      />
      <StarField />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div 
          className="max-w-3xl mx-auto"
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
            
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-white to-cyan-500">
                {t.communicationBridge.teacherForm.title}
              </h1>
              <div className="w-16 h-1 bg-teal-500/50 mx-auto"></div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="bg-background/10 backdrop-blur-sm border border-teal-500/30 rounded-xl p-6 md:p-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <AutocompleteInput
                label={t.communicationBridge.teacherForm.schoolName}
                value={formData.schoolName}
                onChange={(value) => setFormData({ ...formData, schoolName: value })}
                suggestions={SCHOOLS}
                required
              />

              <div className="space-y-2">
                <Label className="text-white">{t.communicationBridge.teacherForm.teacherName}</Label>
                <Input
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  className="bg-background/50 border-teal-500/30 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">{t.communicationBridge.teacherForm.homeroomClass}</Label>
                <Input
                  value={formData.homeroomClass}
                  onChange={(e) => setFormData({ ...formData, homeroomClass: e.target.value })}
                  className="bg-background/50 border-teal-500/30 text-white"
                  placeholder="مثال: 8أ"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">{t.communicationBridge.teacherForm.subjectTaught}</Label>
                <Input
                  value={formData.subjectTaught}
                  onChange={(e) => setFormData({ ...formData, subjectTaught: e.target.value })}
                  className="bg-background/50 border-teal-500/30 text-white"
                  placeholder="مثال: الرياضيات"
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white">{t.communicationBridge.teacherForm.gradesSections}</Label>
                  <Button
                    type="button"
                    onClick={handleAddGradeSection}
                    className="bg-teal-600/30 border border-teal-500/50 text-teal-300 hover:bg-teal-600/50"
                    size="sm"
                  >
                    <Plus size={16} className="ml-2" />
                    {t.communicationBridge.teacherForm.addGradeSection}
                  </Button>
                </div>

                {gradesSections.map((gs, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-2">
                      <Label className="text-white text-sm">{t.communicationBridge.teacherForm.grade}</Label>
                      <Select
                        value={gs.grade}
                        onValueChange={(value) => handleGradeSectionChange(index, 'grade', value)}
                      >
                        <SelectTrigger className="bg-background/50 border-teal-500/30 text-white">
                          <SelectValue placeholder="اختر الصف" />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADES.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-white text-sm">{t.communicationBridge.teacherForm.section}</Label>
                      <Select
                        value={gs.section}
                        onValueChange={(value) => handleGradeSectionChange(index, 'section', value)}
                      >
                        <SelectTrigger className="bg-background/50 border-teal-500/30 text-white">
                          <SelectValue placeholder="اختر الشعبة" />
                        </SelectTrigger>
                        <SelectContent>
                          {SECTIONS.map((section) => (
                            <SelectItem key={section} value={section}>
                              {section}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {gradesSections.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => handleRemoveGradeSection(index)}
                        variant="destructive"
                        size="icon"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              >
                {loading ? 'جاري التسجيل...' : t.communicationBridge.teacherForm.submit}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TeacherRegistration;