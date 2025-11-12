import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight } from 'lucide-react';
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

const ParentRegistration = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  const [formData, setFormData] = useState({
    parentName: '',
    studentName: '',
    grade: '',
    section: '',
    schoolName: ''
  });

  useEffect(() => {
    checkExistingParent();
  }, []);

  const checkExistingParent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        navigate('/parent-dashboard');
      }
    } catch (error) {
      console.error('Error checking parent:', error);
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.parentName || !formData.studentName || !formData.grade || !formData.section || !formData.schoolName) {
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

      const { error } = await supabase
        .from('parents')
        .insert({
          user_id: user.id,
          parent_name: formData.parentName,
          student_name: formData.studentName,
          grade: formData.grade,
          section: formData.section,
          school_name: formData.schoolName
        });

      if (error) throw error;

      toast({
        title: 'تم التسجيل بنجاح',
        description: 'تم تسجيل بياناتك كولي أمر بنجاح'
      });

      navigate('/parent-dashboard');
    } catch (error) {
      console.error('Error registering parent:', error);
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
        title="تسجيل ولي أمر - جسر التواصل"
        description="تسجيل ولي أمر جديد في منصة جسر التواصل"
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
                {t.communicationBridge.parentForm.title}
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
              <div className="space-y-2">
                <Label className="text-white">{t.communicationBridge.parentForm.parentName}</Label>
                <Input
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="bg-background/50 border-teal-500/30 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">{t.communicationBridge.parentForm.studentName}</Label>
                <Input
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="bg-background/50 border-teal-500/30 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">{t.communicationBridge.parentForm.grade}</Label>
                  <Select
                    value={formData.grade}
                    onValueChange={(value) => setFormData({ ...formData, grade: value })}
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
                <div className="space-y-2">
                  <Label className="text-white">{t.communicationBridge.parentForm.section}</Label>
                  <Select
                    value={formData.section}
                    onValueChange={(value) => setFormData({ ...formData, section: value })}
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
              </div>

              <AutocompleteInput
                label={t.communicationBridge.parentForm.schoolName}
                value={formData.schoolName}
                onChange={(value) => setFormData({ ...formData, schoolName: value })}
                suggestions={SCHOOLS}
                required
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              >
                {loading ? 'جاري التسجيل...' : t.communicationBridge.parentForm.submit}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ParentRegistration;