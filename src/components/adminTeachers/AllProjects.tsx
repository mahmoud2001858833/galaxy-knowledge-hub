import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, Send, MessageSquare, ChevronDown, ChevronUp, Trash2, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  messages?: ProjectMessage[];
}

interface ProjectMessage {
  id: string;
  message: string;
  created_at: string;
  admin: {
    username: string;
  };
}

const AllProjects = ({ adminId, isSuperAdmin }: AllProjectsProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showMessages, setShowMessages] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
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

      const projectsWithDetails = await Promise.all(
        (data || []).map(async (project) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', project.member_id)
            .single();

          const { data: accessData } = await supabase
            .from('admin_teacher_access')
            .select('email')
            .eq('user_id', project.member_id)
            .single();

          const { data: messagesData } = await supabase
            .from('teacher_project_messages')
            .select('*')
            .eq('project_id', project.id)
            .order('created_at', { ascending: false });

          const messagesWithAdmin = await Promise.all(
            (messagesData || []).map(async (msg) => {
              const { data: adminProfile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', msg.admin_id)
                .single();
              
              return {
                id: msg.id,
                message: msg.message,
                created_at: msg.created_at,
                admin: {
                  username: adminProfile?.username || 'المشرف'
                }
              };
            })
          );
          
          return {
            ...project,
            member: {
              username: profile?.username || 'مستخدم',
              email: accessData?.email || ''
            },
            messages: messagesWithAdmin
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

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      const { error } = await supabase
        .from('teacher_projects')
        .delete()
        .eq('id', projectToDelete);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف المشروع بنجاح"
      });

      setProjectToDelete(null);
      fetchProjects();
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المشروع",
        variant: "destructive"
      });
    }
  };

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base">{project.teacher_name}</CardTitle>
              <Badge variant={project.status === 'submitted' ? 'default' : 'secondary'} className="text-xs">
                {project.status === 'submitted' ? 'جديد' : project.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <Calendar className="w-3 h-3" />
              {format(new Date(project.created_at), 'PPP', { locale: ar })}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs">
              <span className="font-semibold">العضو:</span> {project.member.username}
              <br />
              <span className="text-muted-foreground">{project.member.email}</span>
            </div>

            {project.images && project.images.length > 0 && (
              <div className="relative">
                <div className="flex items-center gap-1 mb-2">
                  <ImageIcon className="w-3 h-3" />
                  <span className="text-xs font-semibold">{project.images.length} صور</span>
                </div>
              </div>
            )}

            {project.messages && project.messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMessages(showMessages === project.id ? null : project.id)}
                className="w-full justify-start text-xs h-8"
              >
                <MessageSquare className="w-3 h-3 ml-2" />
                {project.messages.length} رد
                {showMessages === project.id ? (
                  <ChevronUp className="w-3 h-3 mr-auto" />
                ) : (
                  <ChevronDown className="w-3 h-3 mr-auto" />
                )}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
              className="w-full text-xs h-8"
            >
              {expandedProject === project.id ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
              {expandedProject === project.id ? (
                <ChevronUp className="w-3 h-3 mr-2" />
              ) : (
                <ChevronDown className="w-3 h-3 mr-2" />
              )}
            </Button>

            {expandedProject === project.id && (
              <div className="space-y-3 pt-3 border-t">
                <div>
                  <h4 className="text-xs font-semibold mb-1">الوصف:</h4>
                  <p className="text-xs text-foreground whitespace-pre-wrap">{project.description}</p>
                </div>
                
                {project.images && project.images.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold mb-2">الصور:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {project.images.map((image, idx) => (
                        <img
                          key={idx}
                          src={image}
                          alt={`Project ${idx + 1}`}
                          className="w-full h-auto rounded object-contain"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {replyingTo === project.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="اكتب ردك هنا..."
                      rows={3}
                      className="text-xs"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReply(project.id)}
                        disabled={submitting}
                        size="sm"
                        className="text-xs h-7"
                      >
                        {submitting ? (
                          <Loader2 className="w-3 h-3 ml-2 animate-spin" />
                        ) : (
                          <Send className="w-3 h-3 ml-2" />
                        )}
                        إرسال
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyMessage("");
                        }}
                        size="sm"
                        className="text-xs h-7"
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
                    className="w-full text-xs h-7"
                  >
                    <MessageSquare className="w-3 h-3 ml-2" />
                    الرد على المشروع
                  </Button>
                )}

                {isSuperAdmin && (
                  <Button
                    onClick={() => setProjectToDelete(project.id)}
                    variant="destructive"
                    size="sm"
                    className="w-full text-xs h-7"
                  >
                    <Trash2 className="w-3 h-3 ml-2" />
                    حذف المشروع
                  </Button>
                )}
              </div>
            )}

            {showMessages === project.id && project.messages && project.messages.length > 0 && (
              <div className="space-y-2 pt-3 border-t">
                <h4 className="text-xs font-semibold">الردود:</h4>
                {project.messages.map((message) => {
                  const isExpanded = expandedMessages.has(message.id);
                  const isLong = message.message.length > 100;
                  const displayMessage = isExpanded || !isLong 
                    ? message.message 
                    : message.message.substring(0, 100) + '...';

                  return (
                    <div key={message.id} className="p-2 bg-secondary/30 rounded text-xs">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold">{message.admin.username}</span>
                        <span className="text-muted-foreground text-[10px]">
                          {format(new Date(message.created_at), 'PPP', { locale: ar })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{displayMessage}</p>
                      {isLong && (
                        <button
                          onClick={() => toggleMessageExpansion(message.id)}
                          className="text-primary hover:underline mt-1 text-[10px]"
                        >
                          {isExpanded ? 'عرض أقل' : 'عرض المزيد'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المشروع؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AllProjects;