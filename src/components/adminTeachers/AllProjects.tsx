import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, Send, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface AllProjectsProps {
  adminId: string;
  isSuperAdmin: boolean;
}

interface Project {
  id: string;
  teacher_name: string;
  description: string;
  images: string[];
  status: string;
  created_at: string;
  member: {
    username: string;
    email: string;
  };
  message_count?: number;
}

const AllProjects = ({ adminId, isSuperAdmin }: AllProjectsProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      let data;
      let error;
      
      if (isSuperAdmin) {
        const response = await supabase
          .from('teacher_projects')
          .select('*')
          .order('created_at', { ascending: false });
        data = response.data;
        error = response.error;
      } else {
        const response = await supabase
          .from('teacher_projects')
          .select('*')
          .eq('admin_id', adminId)
          .order('created_at', { ascending: false });
        data = response.data;
        error = response.error;
      }

      if (error) throw error;

      // Fetch member details and message counts separately
      const projectsWithDetails = await Promise.all(
        (data || []).map(async (project) => {
          // Get member profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', project.member_id)
            .single();

          // Get message count
          const { count } = await supabase
            .from('teacher_project_messages')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', project.id);

          // Get member email from admin_teacher_access
          const { data: accessData } = await supabase
            .from('admin_teacher_access')
            .select('email')
            .eq('user_id', project.member_id)
            .single();
          
          return {
            ...project,
            member: {
              username: profile?.username || 'مستخدم',
              email: accessData?.email || ''
            },
            message_count: count || 0
          };
        })
      );

      setProjects(projectsWithDetails);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (projectId: string) => {
    if (!replyMessage.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى كتابة رسالة",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('teacher_project_messages')
        .insert([
          {
            project_id: projectId,
            admin_id: adminId,
            message: replyMessage
          }
        ]);

      if (error) throw error;

      toast({
        title: "تم الإرسال",
        description: "تم إرسال الرد بنجاح"
      });

      setReplyMessage("");
      setReplyingTo(null);
      fetchProjects();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الرد",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
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
          لا توجد مشاريع مرسلة بعد
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
                <div className="space-y-1 mt-2">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">العضو:</span> {project.member.username} ({project.member.email})
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(project.created_at), 'PPP', { locale: ar })}
                  </div>
                </div>
              </div>
              <Badge variant={project.status === 'submitted' ? 'default' : 'secondary'}>
                {project.status === 'submitted' ? 'تم الإرسال' : project.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">الوصف:</h4>
              <p className="text-foreground whitespace-pre-wrap">{project.description}</p>
            </div>
            
            {project.images && project.images.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">الصور:</h4>
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
              </div>
            )}

            {project.message_count > 0 && (
              <div className="flex items-center gap-2 text-sm text-primary">
                <MessageSquare className="w-4 h-4" />
                {project.message_count} رد مرسل
              </div>
            )}

            {replyingTo === project.id ? (
              <div className="space-y-2 border-t pt-4">
                <Textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="اكتب ردك هنا..."
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleReply(project.id)}
                    disabled={submitting}
                    size="sm"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 ml-2" />
                    )}
                    إرسال الرد
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyMessage("");
                    }}
                    size="sm"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setReplyingTo(project.id)}
                variant="outline"
                size="sm"
              >
                <MessageSquare className="w-4 h-4 ml-2" />
                الرد على المشروع
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AllProjects;
