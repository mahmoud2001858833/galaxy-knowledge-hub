import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon, ArrowLeft, Loader2, School, FileText, ImagePlus, X, Home, ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

interface Project {
  id: string;
  project_name: string;
  project_description: string;
  school_name: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
}

const StudentProjects = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { dir } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    projectName: '',
    projectDescription: '',
    schoolName: '',
    image: null as File | null
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('student_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل المشاريع',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'خطأ',
          description: 'حجم الصورة يجب أن لا يتجاوز 5 ميجابايت',
          variant: 'destructive'
        });
        return;
      }
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'تنبيه',
          description: 'يجب تسجيل الدخول لرفع مشروع',
          variant: 'destructive'
        });
        return;
      }

      let imageUrl = null;

      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('student-projects')
          .upload(fileName, formData.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('student-projects')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('student_projects')
        .insert({
          user_id: user.id,
          project_name: formData.projectName,
          project_description: formData.projectDescription,
          school_name: formData.schoolName,
          image_url: imageUrl
        });

      if (insertError) throw insertError;

      toast({
        title: 'نجاح',
        description: 'تم رفع المشروع بنجاح!'
      });

      setFormData({
        projectName: '',
        projectDescription: '',
        schoolName: '',
        image: null
      });
      setShowForm(false);
      fetchProjects();
    } catch (error) {
      console.error('Error uploading project:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في رفع المشروع',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-slate-100 transition-colors" dir={dir}>
      <SEO 
        title="معرض مشاريع الطلاب البيئية | منصة المعرفة"
        description="استعرض وشارك المبادرات والمشاريع البيئية الطلابية الملهمة المطبقة في المدارس والمجتمعات المحلية."
      />
      
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Breadcrumb Bar */}
        <div className="border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md sticky top-16 z-30">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Link to="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                <span>الرئيسية</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-slate-400" />
              <Link to="/environmental-sustainability" className="hover:text-emerald-600 transition-colors">
                الاستدامة البيئية
              </Link>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-slate-400" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">مشاريع الطلاب المبتكرة</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/environmental-sustainability')}
              className="h-8 gap-1.5 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>العودة للبوابة</span>
            </Button>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl px-4 pt-8">
          {/* Header Action */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2">
                <School className="w-3.5 h-3.5" />
                <span>معرض الابتكار والريادة الطلابية الخضراء</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                مشاريع وإنجازات الطلاب البيئية
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                شارك مشروعك مع آلاف الطلبة وتعرّف على أفكار بيئية قابلة للتطبيق.
              </p>
            </div>

            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 rounded-xl text-xs font-semibold shadow-xs"
            >
              <Upload className="w-4 h-4" />
              {showForm ? 'إلغاء النموذج' : 'رفع مشروع جديد +'}
            </Button>
          </motion.div>

          {/* Upload Form */}
          {showForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-10 max-w-2xl mx-auto"
            >
              <Card className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50/60 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    بيانات المشروع البيئي الجديد
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    املأ التفاصيل لنشر مشروعك في منصة الابتكار المدرسي
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="projectName" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        عنوان المشروع
                      </Label>
                      <Input
                        id="projectName"
                        value={formData.projectName}
                        onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                        placeholder="مثال: نظام ذكي للري بالتنقيط باستخدام الأردوينو"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="schoolName" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                        <School className="w-3.5 h-3.5 text-slate-500" />
                        اسم المدرسة / الفريق
                      </Label>
                      <Input
                        id="schoolName"
                        value={formData.schoolName}
                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                        placeholder="اسم المدرسة أو النادي البيئي"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="projectDescription" className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                        وصف المشروع وأهدافه والنتائج المتحققة
                      </Label>
                      <Textarea
                        id="projectDescription"
                        value={formData.projectDescription}
                        onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                        className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-sm min-h-[100px]"
                        placeholder="اكتب شرحاً للمشروع، المواد المستخدمة، والأثر البيئي..."
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="image" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                        <ImagePlus className="w-3.5 h-3.5 text-slate-500" />
                        صورة المشروع (اختياري - أقصى حد 5MB)
                      </Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                      />
                      {formData.image && (
                        <p className="text-emerald-600 text-xs mt-1">
                          تم اختيار: {formData.image.name}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={uploading}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-5 rounded-xl shadow-xs mt-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          جارٍ الرفع والنشر...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 ml-2" />
                          نشر المشروع في المعرض
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Projects Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
          ) : projects.length === 0 ? (
            <Card className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs rounded-2xl max-w-md mx-auto text-center p-8">
              <ImageIcon className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">لا توجد مشاريع مرفوعة بعد</h3>
              <p className="text-xs text-slate-500 mb-4">كن أول من يشارك مشروعاً بيئياً مدرسياً ملهماً!</p>
              <Button onClick={() => setShowForm(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                رفع أول مشروع
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group h-full bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden flex flex-col justify-between">
                    <div>
                      {project.image_url && (
                        <div 
                          className="relative h-44 overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-800"
                          onClick={() => setSelectedImage(project.image_url)}
                        >
                          <img
                            src={project.image_url}
                            alt={project.project_name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors" />
                        </div>
                      )}
                      
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                          {project.project_name}
                        </CardTitle>
                        <CardDescription className="text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-1.5 font-medium">
                          <School className="w-3.5 h-3.5" />
                          {project.school_name}
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">
                          {project.project_description}
                        </p>
                      </CardContent>
                    </div>

                    <div className="px-6 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        {new Date(project.created_at).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        مشروع معتمد
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Image Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl p-2 bg-slate-900/90 border border-slate-700 text-white rounded-2xl overflow-hidden">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 left-2 z-10 bg-black/60 hover:bg-black text-white rounded-full"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-5 h-5" />
              </Button>
              {selectedImage && (
                <img
                  src={selectedImage}
                  alt="Project"
                  className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
};

export default StudentProjects;