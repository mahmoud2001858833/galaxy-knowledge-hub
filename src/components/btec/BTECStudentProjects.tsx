import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowRight, Heart, Upload, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SEO } from '@/components/SEO';

interface Project {
  id: string;
  student_name: string;
  project_name: string;
  project_idea: string;
  programming_languages: string[];
  project_description: string;
  likes_count: number;
  created_at: string;
  user_id: string;
}

const BTECStudentProjects = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    student_name: '',
    project_name: '',
    project_idea: '',
    programming_languages: '',
    project_description: ''
  });

  useEffect(() => {
    fetchProjects();
    checkUser();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = projects.filter(p => 
        p.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.programming_languages.some(lang => lang.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchQuery, projects]);

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
      setFilteredProjects(data || []);
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول أولاً", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('btec_student_projects')
        .insert({
          ...formData,
          programming_languages: formData.programming_languages.split(',').map(l => l.trim()),
          user_id: currentUser.id
        });

      if (error) throw error;

      toast({ title: "نجح!", description: "تم رفع المشروع بنجاح" });
      setIsDialogOpen(false);
      setFormData({
        student_name: '',
        project_name: '',
        project_idea: '',
        programming_languages: '',
        project_description: ''
      });
      fetchProjects();
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    }
  };

  const handleLike = async (projectId: string) => {
    if (!currentUser) {
      toast({ title: "خطأ", description: "يجب تسجيل الدخول للإعجاب", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('btec_project_likes')
        .insert({ project_id: projectId, user_id: currentUser.id });

      if (error) {
        if (error.code === '23505') {
          toast({ title: "تنبيه", description: "لقد أعجبت بهذا المشروع من قبل" });
        } else throw error;
      } else {
        await supabase
          .from('btec_student_projects')
          .update({ likes_count: projects.find(p => p.id === projectId)!.likes_count + 1 })
          .eq('id', projectId);
        
        fetchProjects();
        toast({ title: "رائع!", description: "تم الإعجاب بالمشروع" });
      }
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-right bg-gradient-to-b from-blue-900/40 to-blue-950" dir="rtl">
      <SEO 
        title="مشاريع الطلبة - بتك BTEC"
        description="عرض مشاريع طلبة بتك البرمجية مع إمكانية رفع مشروعك والإعجاب بمشاريع الآخرين"
        keywords="مشاريع طلبة, برمجة, BTEC, مشاريع برمجية, تطوير"
      />
      <StarField />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <button
            onClick={() => navigate('/btec/information-technology')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8"
          >
            <ArrowRight size={20} />
            العودة
          </button>

          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              مشاريع الطلبة
            </h1>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Upload className="w-4 h-4" />
                  رفع مشروع
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-slate-900 text-white">
                <DialogHeader>
                  <DialogTitle>رفع مشروع جديد</DialogTitle>
                  <DialogDescription>املأ المعلومات التالية لرفع مشروعك</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>اسم الطالب</Label>
                    <Input
                      value={formData.student_name}
                      onChange={(e) => setFormData({...formData, student_name: e.target.value})}
                      required
                      className="bg-white/10"
                    />
                  </div>
                  <div>
                    <Label>اسم المشروع</Label>
                    <Input
                      value={formData.project_name}
                      onChange={(e) => setFormData({...formData, project_name: e.target.value})}
                      required
                      className="bg-white/10"
                    />
                  </div>
                  <div>
                    <Label>فكرة المشروع</Label>
                    <Input
                      value={formData.project_idea}
                      onChange={(e) => setFormData({...formData, project_idea: e.target.value})}
                      required
                      className="bg-white/10"
                    />
                  </div>
                  <div>
                    <Label>لغات البرمجة المستخدمة (مفصولة بفواصل)</Label>
                    <Input
                      value={formData.programming_languages}
                      onChange={(e) => setFormData({...formData, programming_languages: e.target.value})}
                      placeholder="مثال: Python, JavaScript, HTML"
                      required
                      className="bg-white/10"
                    />
                  </div>
                  <div>
                    <Label>وصف المشروع</Label>
                    <Textarea
                      value={formData.project_description}
                      onChange={(e) => setFormData({...formData, project_description: e.target.value})}
                      required
                      className="bg-white/10 min-h-[120px]"
                    />
                  </div>
                  <Button type="submit" className="w-full">رفع المشروع</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50" />
              <Input
                placeholder="ابحث عن مشروع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-white/10 text-white"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-center text-white">جاري التحميل...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white/5 border-purple-500/30 hover:bg-white/10 transition-all h-full">
                    <CardHeader>
                      <CardTitle className="text-white">{project.project_name}</CardTitle>
                      <CardDescription className="text-white/70">
                        بواسطة: {project.student_name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-cyan-300">
                        <strong>الفكرة:</strong> {project.project_idea}
                      </p>
                      <p className="text-sm text-white/80">
                        {project.project_description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {project.programming_languages.map((lang, i) => (
                          <Badge key={i} variant="secondary">{lang}</Badge>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => handleLike(project.id)}
                      >
                        <Heart className="w-4 h-4" />
                        إعجاب ({project.likes_count})
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BTECStudentProjects;
