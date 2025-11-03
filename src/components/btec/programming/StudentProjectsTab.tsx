import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Heart, ExternalLink, Search, Plus, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  student_name: string;
  project_name: string;
  project_idea: string;
  project_description: string;
  programming_languages: string[];
  project_link?: string;
  project_images?: string[];
  likes_count: number;
  created_at: string;
}

const StudentProjectsTab = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    student_name: '',
    project_name: '',
    project_idea: '',
    project_description: '',
    programming_languages: '',
    project_link: '',
  });

  useEffect(() => {
    fetchProjects();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('btec_student_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", variant: "destructive" });
      return;
    }

    if (!formData.student_name || !formData.project_name || !formData.project_description) {
      toast({ title: "تنبيه", description: "الرجاء ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('btec_student_projects')
        .insert([{
          user_id: currentUser.id,
          student_name: formData.student_name,
          project_name: formData.project_name,
          project_idea: formData.project_idea,
          project_description: formData.project_description,
          programming_languages: formData.programming_languages.split(',').map(l => l.trim()),
          project_link: formData.project_link || null,
        }]);

      if (error) throw error;

      toast({ title: "✅ نجح", description: "تم إضافة المشروع بنجاح" });
      setIsDialogOpen(false);
      setFormData({
        student_name: '',
        project_name: '',
        project_idea: '',
        project_description: '',
        programming_languages: '',
        project_link: '',
      });
      fetchProjects();
    } catch (error: any) {
      console.error('Error adding project:', error);
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (projectId: string) => {
    if (!currentUser) {
      toast({ title: "تنبيه", description: "يجب تسجيل الدخول للإعجاب", variant: "destructive" });
      return;
    }

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('btec_project_likes')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', currentUser.id)
        .single();

      if (existingLike) {
        toast({ title: "تنبيه", description: "لقد أعجبت بهذا المشروع من قبل" });
        return;
      }

      // Add like
      const { error } = await supabase
        .from('btec_project_likes')
        .insert([{ project_id: projectId, user_id: currentUser.id }]);

      if (error) throw error;

      // Update likes count
      const project = projects.find(p => p.id === projectId);
      if (project) {
        await supabase
          .from('btec_student_projects')
          .update({ likes_count: project.likes_count + 1 })
          .eq('id', projectId);
      }

      toast({ title: "✅ شكراً", description: "تم تسجيل إعجابك" });
      fetchProjects();
    } catch (error: any) {
      console.error('Error liking project:', error);
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    }
  };

  const filteredProjects = projects.filter(project =>
    project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.programming_languages.some(lang => lang.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن مشروع، طالب، أو لغة برمجة..."
            className="pr-10 bg-white/5 border-white/10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 whitespace-nowrap">
              <Plus className="w-5 h-5 mr-2" />
              إضافة مشروع
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 to-green-900">
            <DialogHeader>
              <DialogTitle className="text-2xl">إضافة مشروع جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="اسم الطالب *"
                value={formData.student_name}
                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                className="bg-white/5 border-white/10"
              />
              <Input
                placeholder="اسم المشروع *"
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                className="bg-white/5 border-white/10"
              />
              <Textarea
                placeholder="فكرة المشروع"
                value={formData.project_idea}
                onChange={(e) => setFormData({ ...formData, project_idea: e.target.value })}
                className="bg-white/5 border-white/10"
              />
              <Textarea
                placeholder="وصف المشروع *"
                value={formData.project_description}
                onChange={(e) => setFormData({ ...formData, project_description: e.target.value })}
                className="bg-white/5 border-white/10 min-h-[100px]"
              />
              <Input
                placeholder="لغات البرمجة (افصل بفاصلة مثل: Python, JavaScript)"
                value={formData.programming_languages}
                onChange={(e) => setFormData({ ...formData, programming_languages: e.target.value })}
                className="bg-white/5 border-white/10"
              />
              <Input
                placeholder="رابط المشروع (اختياري)"
                value={formData.project_link}
                onChange={(e) => setFormData({ ...formData, project_link: e.target.value })}
                className="bg-white/5 border-white/10"
              />
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500"
              >
                {isLoading ? 'جاري الإضافة...' : 'إضافة المشروع'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border-green-500/20 hover:border-green-500/50 transition-all">
              <CardHeader>
                <CardTitle className="text-xl">{project.project_name}</CardTitle>
                <CardDescription className="text-gray-300">بواسطة: {project.student_name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.project_idea && (
                  <div>
                    <p className="text-sm font-semibold text-green-400 mb-1">الفكرة:</p>
                    <p className="text-sm text-gray-300">{project.project_idea}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-green-400 mb-1">الوصف:</p>
                  <p className="text-sm text-gray-300 line-clamp-3">{project.project_description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.programming_languages?.map((lang, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{lang}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="gap-2 hover:bg-red-500/20"
                    onClick={() => handleLike(project.id)}
                  >
                    <Heart className="w-6 h-6 text-red-400" />
                    <span className="text-lg font-bold">{project.likes_count || 0}</span>
                  </Button>
                  {project.project_link && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-2"
                    >
                      <a href={project.project_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                        رابط المشروع
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <Upload className="w-20 h-20 mx-auto mb-4 opacity-50" />
          <p className="text-lg">لا توجد مشاريع حالياً. كن أول من يضيف مشروعاً!</p>
        </div>
      )}
    </motion.div>
  );
};

export default StudentProjectsTab;
