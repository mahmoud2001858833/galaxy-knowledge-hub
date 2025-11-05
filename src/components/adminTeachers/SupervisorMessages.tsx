import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface SupervisorMessagesProps {
  userId: string;
}

interface Message {
  id: string;
  message: string;
  created_at: string;
  project: {
    teacher_name: string;
  };
  admin: {
    username: string;
  };
}

const SupervisorMessages = ({ userId }: SupervisorMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectIds, setProjectIds] = useState<string[]>([]);

  useEffect(() => {
    fetchMessages();
  }, [userId]);

  useEffect(() => {
    if (projectIds.length === 0) return;
    const channel = supabase
      .channel(`teacher-projects-messages-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'teacher_project_messages' },
        (payload) => {
          const pid = (payload.new as any).project_id;
          if (projectIds.includes(pid)) {
            fetchMessages();
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectIds, userId]);

  const fetchMessages = async () => {
    try {
      // First, get all projects for this user
      const { data: projects, error: projectsError } = await supabase
        .from('teacher_projects')
        .select('id, teacher_name')
        .eq('member_id', userId);

      if (projectsError) throw projectsError;

      const ids = projects?.map(p => p.id) || [];
      setProjectIds(ids);

      if (ids.length === 0) {
        setMessages([]);
        setLoading(false);
        return;
      }

      // Then get messages for these projects
      const { data: messagesData, error: messagesError } = await supabase
        .from('teacher_project_messages')
        .select('*')
        .in('project_id', ids)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      // Get admin usernames
      const formattedMessages = await Promise.all(
        (messagesData || []).map(async (msg) => {
          const project = projects?.find(p => p.id === msg.project_id);
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', msg.admin_id)
            .single();

          return {
            id: msg.id,
            message: msg.message,
            created_at: msg.created_at,
            project: {
              teacher_name: project?.teacher_name || ''
            },
            admin: {
              username: profile?.username || 'المشرف'
            }
          };
        })
      );

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
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

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          لا توجد رسائل من المشرف بعد
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Card key={message.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">رد على مشروع: {message.project.teacher_name}</CardTitle>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(message.created_at), 'PPP', { locale: ar })}
                </div>
              </div>
              <Badge>{message.admin.username}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-foreground whitespace-pre-wrap">{message.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SupervisorMessages;
