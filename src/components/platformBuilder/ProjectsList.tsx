import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, ExternalLink, Calendar, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTenant } from "@/hooks/useTenant";
import { TenantSwitcher } from "./TenantSwitcher";

interface Project {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  publish_slug: string | null;
  created_at: string;
  updated_at: string;
}

export const ProjectsList = () => {
  const navigate = useNavigate();
  const { currentTenant, isLoading: tenantLoading } = useTenant();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentTenant) {
      fetchProjects();
    }
  }, [currentTenant]);

  const fetchProjects = async () => {
    if (!currentTenant) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ai_builder_projects')
        .select('*')
        .eq('tenant_id', currentTenant.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error("فشل تحميل المشاريع");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المشروع؟")) return;

    try {
      const { error } = await supabase
        .from('ai_builder_projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      
      setProjects(projects.filter(p => p.id !== projectId));
      toast.success("تم حذف المشروع");
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error("فشل حذف المشروع");
    }
  };

  const createNewProject = async () => {
    if (!currentTenant) {
      toast.error("لا يوجد مساحة عمل نشطة");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      const { data, error } = await supabase
        .from('ai_builder_projects')
        .insert({
          user_id: user.id,
          tenant_id: currentTenant.id,
          title: `مشروع جديد ${new Date().toLocaleDateString('ar-SA')}`,
          description: '',
        })
        .select()
        .single();

      if (error) throw error;
      
      // إنشاء ملفات افتراضية
      const defaultFiles = [
        {
          project_id: data.id,
          file_name: 'index.html',
          file_path: '/index.html',
          file_type: 'html',
          content: '<!DOCTYPE html>\n<html dir="rtl" lang="ar">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>مشروع جديد</title>\n</head>\n<body>\n  <h1>مرحباً بك في مشروعك الجديد</h1>\n</body>\n</html>',
        },
        {
          project_id: data.id,
          file_name: 'style.css',
          file_path: '/style.css',
          file_type: 'css',
          content: '/* أضف تنسيقاتك هنا */\n',
        },
        {
          project_id: data.id,
          file_name: 'script.js',
          file_path: '/script.js',
          file_type: 'js',
          content: '// أضف السكربتات هنا\n',
        },
      ];

      await supabase.from('ai_builder_files').insert(defaultFiles);
      
      navigate(`/ai-platform-builder/${data.id}`);
      toast.success("تم إنشاء المشروع");
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error("فشل إنشاء المشروع");
    }
  };

  if (loading || tenantLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">مشاريعي</h1>
          <TenantSwitcher />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/tenant-settings')}
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button onClick={createNewProject} className="gap-2">
            <Plus className="w-4 h-4" />
            مشروع جديد
          </Button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">لا توجد مشاريع بعد</p>
          <Button onClick={createNewProject} className="gap-2">
            <Plus className="w-4 h-4" />
            إنشاء أول مشروع
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                <div onClick={() => navigate(`/ai-platform-builder/${project.id}`)}>
                  <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(project.updated_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                  {project.is_published && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs mb-4">
                      <ExternalLink className="w-3 h-3" />
                      <span>منشور</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/ai-platform-builder/${project.id}`);
                    }}
                    className="flex-1"
                  >
                    فتح
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(project.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
