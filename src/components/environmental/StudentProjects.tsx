import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon, ArrowLeft, Loader2, School, FileText, ImagePlus } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

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
  const { t, dir } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
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
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10485760) { // 10MB
        toast({
          title: 'خطأ',
          description: 'حجم الصورة يجب أن يكون أقل من 10 ميجابايت',
          variant: 'destructive'
        });
        return;
      }
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: 'يجب تسجيل الدخول',
        description: 'يرجى تسجيل الدخول لرفع مشروعك',
        variant: 'destructive'
      });
      navigate('/auth');
      return;
    }

    if (!formData.projectName || !formData.projectDescription || !formData.schoolName) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      let imageUrl = null;

      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(filePath, formData.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('student_projects')
        .insert({
          user_id: session.user.id,
          project_name: formData.projectName,
          project_description: formData.projectDescription,
          school_name: formData.schoolName,
          image_url: imageUrl
        });

      if (insertError) throw insertError;

      toast({
        title: 'تم بنجاح!',
        description: 'تم رفع مشروعك بنجاح'
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950 p-6" dir={dir}>
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/environmental')}
            className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة
          </Button>

          <Button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <Upload className="w-4 h-4" />
            {showForm ? 'إلغاء' : 'رفع مشروع جديد'}
          </Button>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-white to-emerald-400 mb-4">
            مشاريع الطلاب
          </h1>
          <p className="text-white/70 text-lg">
            شارك مشاريعك البيئية وتعرّف على مشاريع زملائك
          </p>
        </motion.div>

        {/* Upload Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-12"
          >
            <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-2xl flex items-center gap-2">
                  <Upload className="w-6 h-6" />
                  رفع مشروع جديد
                </CardTitle>
                <CardDescription className="text-white/70">
                  املأ المعلومات التالية لرفع مشروعك البيئي
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="projectName" className="text-white flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4" />
                      اسم المشروع
                    </Label>
                    <Input
                      id="projectName"
                      value={formData.projectName}
                      onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="أدخل اسم المشروع"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="schoolName" className="text-white flex items-center gap-2 mb-2">
                      <School className="w-4 h-4" />
                      اسم المدرسة
                    </Label>
                    <Input
                      id="schoolName"
                      value={formData.schoolName}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      placeholder="أدخل اسم المدرسة"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="projectDescription" className="text-white mb-2 block">
                      وصف المشروع
                    </Label>
                    <Textarea
                      id="projectDescription"
                      value={formData.projectDescription}
                      onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[120px]"
                      placeholder="اكتب وصفاً تفصيلياً عن مشروعك البيئي..."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="image" className="text-white flex items-center gap-2 mb-2">
                      <ImagePlus className="w-4 h-4" />
                      صورة المشروع (اختياري)
                    </Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="bg-white/10 border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-500 file:text-white hover:file:bg-green-600"
                    />
                    {formData.image && (
                      <p className="text-green-300 text-sm mt-2">
                        تم اختيار: {formData.image.name}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={uploading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        جاري الرفع...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        رفع المشروع
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
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-green-400" />
          </div>
        ) : projects.length === 0 ? (
          <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <p className="text-white/70 text-lg">لا توجد مشاريع حالياً</p>
              <p className="text-white/50 text-sm mt-2">كن أول من يشارك مشروعاً بيئياً!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group h-full bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30 hover:border-green-500/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/20">
                  {project.image_url && (
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={project.image_url}
                        alt={project.project_name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-white text-xl group-hover:text-green-300 transition-colors">
                      {project.project_name}
                    </CardTitle>
                    <CardDescription className="text-green-300 flex items-center gap-2">
                      <School className="w-4 h-4" />
                      {project.school_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 text-sm line-clamp-4">
                      {project.project_description}
                    </p>
                    <p className="text-white/50 text-xs mt-4">
                      {new Date(project.created_at).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProjects;