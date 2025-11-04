import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface PreviousProjectsProps {
  userId: string;
}

interface Project {
  id: string;
  teacher_name: string;
  description: string;
  images: string[];
  status: string;
  created_at: string;
  message_count?: number;
}

const PreviousProjects = ({ userId }: PreviousProjectsProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, [userId]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('teacher_projects')
        .select(`
          *,
          teacher_project_messages(count)
        `)
        .eq('member_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectsWithCount = data?.map(project => ({
        ...project,
        message_count: project.teacher_project_messages?.[0]?.count || 0
      }));

      setProjects(projectsWithCount || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          لم تقم بإرسال أي مشاريع بعد
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{project.teacher_name}</CardTitle>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(project.created_at), 'PPP', { locale: ar })}
                </div>
              </div>
              <Badge variant={project.status === 'submitted' ? 'default' : 'secondary'}>
                {project.status === 'submitted' ? 'تم الإرسال' : project.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground whitespace-pre-wrap">{project.description}</p>
            
            {project.images && project.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {project.images.map((image, idx) => (
                  <img
                    key={idx}
                    src={image}
                    alt={`Project ${idx + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                ))}
              </div>
            )}

            {project.message_count > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="w-4 h-4" />
                {project.message_count} رسالة من المشرف
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PreviousProjects;
