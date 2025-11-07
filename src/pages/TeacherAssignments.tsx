import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowRight, Plus, Upload, Trash2 } from 'lucide-react';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Assignment {
  id: string;
  assignment_name: string;
  grade: string;
  section: string;
  description: string;
  image_url: string | null;
  created_at: string;
}

const TeacherAssignments = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [teacherId, setTeacherId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    assignmentName: '',
    grade: '',
    section: '',
    description: '',
    imageFile: null as File | null
  });

  useEffect(() => {
    fetchTeacherAndAssignments();
  }, []);

  const fetchTeacherAndAssignments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (teacherError || !teacherData) {
        navigate('/teacher-registration');
        return;
      }

      setTeacherId(teacherData.id);

      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('class_assignments')
        .select('*')
        .eq('teacher_id', teacherData.id)
        .order('created_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error('Error fetching:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل البيانات',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.assignmentName || !formData.grade || !formData.section || !formData.description) {
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

      if (formData.imageFile) {
        const fileExt = formData.imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-images')
          .upload(filePath, formData.imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('project-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('class_assignments')
        .insert({
          teacher_id: teacherId,
          assignment_name: formData.assignmentName,
          grade: formData.grade,
          section: formData.section,
          description: formData.description,
          image_url: imageUrl
        });

      if (error) throw error;

      toast({
        title: 'تم بنجاح',
        description: 'تم رفع الواجب بنجاح'
      });

      setIsDialogOpen(false);
      setFormData({
        assignmentName: '',
        grade: '',
        section: '',
        description: '',
        imageFile: null
      });
      fetchTeacherAndAssignments();
    } catch (error) {
      console.error('Error uploading assignment:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء رفع الواجب',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('class_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: 'تم الحذف',
        description: 'تم حذف الواجب بنجاح'
      });

      setAssignments(assignments.filter(a => a.id !== assignmentId));
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الحذف',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-blue-950">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900/40 to-blue-950" dir={dir}>
      <SEO 
        title="إدارة الواجبات - جسر التواصل"
        description="إدارة ورفع الواجبات المدرسية"
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
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-cyan-500">
                  {t.communicationBridge.assignments.title}
                </h1>
                <div className="w-16 h-1 bg-blue-500/50"></div>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Upload size={20} className="ml-2" />
                    {t.communicationBridge.assignments.uploadAssignment}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background border-blue-500/30" dir={dir}>
                  <DialogHeader>
                    <DialogTitle className="text-white text-right">
                      {t.communicationBridge.assignments.uploadAssignment}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">{t.communicationBridge.assignments.assignmentName}</Label>
                      <Input
                        value={formData.assignmentName}
                        onChange={(e) => setFormData({ ...formData, assignmentName: e.target.value })}
                        className="bg-background/50 border-blue-500/30 text-white"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">{t.communicationBridge.assignments.grade}</Label>
                        <Input
                          value={formData.grade}
                          onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                          className="bg-background/50 border-blue-500/30 text-white"
                          placeholder="8"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">{t.communicationBridge.assignments.section}</Label>
                        <Input
                          value={formData.section}
                          onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                          className="bg-background/50 border-blue-500/30 text-white"
                          placeholder="أ"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">{t.communicationBridge.assignments.description}</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-background/50 border-blue-500/30 text-white min-h-[100px]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-white">{t.communicationBridge.assignments.imageOptional}</Label>
                      <Input
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="bg-background/50 border-blue-500/30 text-white"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={uploading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {uploading ? 'جاري الرفع...' : t.communicationBridge.assignments.submit}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.length === 0 ? (
              <div className="col-span-full text-center text-white/60 py-12">
                {t.communicationBridge.assignments.noAssignments}
              </div>
            ) : (
              assignments.map((assignment, index) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-background/10 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/50 transition-all"
                >
                  {assignment.image_url && (
                    <img 
                      src={assignment.image_url} 
                      alt={assignment.assignment_name}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                    />
                  )}
                  <h3 className="text-xl font-bold text-white mb-2">{assignment.assignment_name}</h3>
                  <p className="text-blue-300 mb-2">الصف: {assignment.grade}{assignment.section}</p>
                  <p className="text-white/70 text-sm mb-4">{assignment.description}</p>
                  <p className="text-white/50 text-xs mb-4">
                    {new Date(assignment.created_at).toLocaleDateString('ar-SA')}
                  </p>
                  <Button
                    onClick={() => handleDelete(assignment.id)}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <Trash2 size={16} className="ml-2" />
                    حذف
                  </Button>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TeacherAssignments;