import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  School, 
  FileText, 
  ImagePlus, 
  X,
  Users,
  Sparkles,
  Calendar
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PageShell, PageHeader } from '@/components/layout/PageShell';
import { SEO } from '@/components/SEO';
import { Badge } from '@/components/ui/badge';

interface Project {
  id: string;
  project_name: string;
  project_description: string;
  school_name: string;
  image_url: string | null;
  created_at: string;
  user_id: string;
}

const StudentProjects: React.FC = () => {
  const { toast } = useToast();
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
      return;
    }

    setUploading(true);

    try {
      let imageUrl = null;

      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `project-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('student-projects')
          .upload(filePath, formData.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('student-projects')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('student_projects')
        .insert({
          project_name: formData.projectName,
          project_description: formData.projectDescription,
          school_name: formData.schoolName,
          image_url: imageUrl,
          user_id: session.user.id
        });

      if (insertError) throw insertError;

      toast({
        title: 'نجاح!',
        description: 'تم رفع مشروعك بنجاح وسيظهر لجميع الطلاب',
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
    <PageShell>
      <SEO 
        title="مشاريع الطلاب البيئية | ذروة العلم"
        description="شارك مشاريعك البيئية وتعرّف على مبادرات وإبداعات زملائك في المدارس."
      />

      <PageHeader
        title="مشاريع الطلاب البيئية"
        description="معرض تفاعلي لمشاركة ابتكارات الطلبة البيئية، وتوثيق إنجازاتهم الميدانية لإلهام زملائهم."
        icon={Users}
        crumbs={[
          { label: 'الرئيسية', to: '/' },
          { label: 'المجتمع المدرسي', to: '/school' },
          { label: 'الاستدامة البيئية', to: '/environmental-sustainability' },
          { label: 'مشاريع الطلاب' },
        ]}
        actions={
          <Button
            onClick={() => setShowForm(!showForm)}
            className="rounded-2xl font-bold flex items-center gap-2"
          >
            <Upload className="w-4 h-4 ml-1" />
            {showForm ? 'إلغاء' : 'رفع مشروع جديد'}
          </Button>
        }
      />

      {/* Upload Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-10 max-w-2xl mx-auto"
        >
          <Card className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <CardHeader className="p-0 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">رفع مشروع بيئي جديد</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    املأ تفاصيل مشروعك أو مبادرتك المدرسية لنشرها في المعرض
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName" className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    اسم المشروع
                  </Label>
                  <Input
                    id="projectName"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    className="rounded-2xl border-border bg-background"
                    placeholder="مثال: نظام ذكي لري حديقة المدرسة"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolName" className="text-sm font-semibold flex items-center gap-2">
                    <School className="w-4 h-4 text-primary" />
                    اسم المدرسة
                  </Label>
                  <Input
                    id="schoolName"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="rounded-2xl border-border bg-background"
                    placeholder="مثال: مدرسة الملك عبد الله الثاني للتميز"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectDescription" className="text-sm font-semibold">
                    وصف المشروع وأهدافه
                  </Label>
                  <Textarea
                    id="projectDescription"
                    value={formData.projectDescription}
                    onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                    className="rounded-2xl border-border bg-background min-h-[120px]"
                    placeholder="اكتب وصفاً مختصراً عن فكرة المشروع والنتائج المحققة..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-sm font-semibold flex items-center gap-2">
                    <ImagePlus className="w-4 h-4 text-primary" />
                    صورة توضيحية للمشروع (اختياري)
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="rounded-2xl border-border bg-background file:mr-4 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground"
                  />
                  {formData.image && (
                    <p className="text-primary text-xs font-medium">
                      تم اختيار الملف: {formData.image.name}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={uploading}
                  className="w-full h-12 rounded-2xl font-bold mt-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري حفظ ورفع المشروع...
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
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card/50 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold text-card-foreground">لا توجد مشاريع منشورة بعد</h3>
          <p className="text-sm text-muted-foreground">
            كن أول من يشارك مشروعاً بيئياً ويلهم طلبة المدارس في المملكة!
          </p>
          <Button onClick={() => setShowForm(true)} className="rounded-2xl font-bold">
            <Upload className="w-4 h-4 ml-2" />
            رفع أول مشروع
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="group h-full rounded-3xl border border-border bg-card overflow-hidden shadow-sm hover:border-primary/40 hover:-translate-y-1 transition-all flex flex-col justify-between">
                <div>
                  {project.image_url ? (
                    <div 
                      className="relative h-48 overflow-hidden cursor-pointer bg-muted"
                      onClick={() => setSelectedImage(project.image_url)}
                    >
                      <img
                        src={project.image_url}
                        alt={project.project_name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-xs">
                        <Badge variant="secondary" className="gap-1.5 py-1 px-3">
                          <ImageIcon className="w-3.5 h-3.5" />
                          تكبير الصورة
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="h-28 bg-accent/40 border-b border-border flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-primary/40" />
                    </div>
                  )}

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="text-xs flex items-center gap-1.5 py-1 px-2.5">
                        <School className="w-3 h-3 text-primary" />
                        <span className="line-clamp-1">{project.school_name}</span>
                      </Badge>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3" />
                        {new Date(project.created_at).toLocaleDateString('ar-JO')}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors leading-tight">
                      {project.project_name}
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {project.project_description}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-5 pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <span>مشروع طلابي معتمد</span>
                  <span className="text-primary font-semibold">ذروة العلم</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-2 bg-card border-border rounded-3xl overflow-hidden">
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="absolute top-3 left-3 z-10 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="معاينة صورة المشروع"
                className="w-full h-auto max-h-[80vh] object-contain rounded-2xl"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

export default StudentProjects;
