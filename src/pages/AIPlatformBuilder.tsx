import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BuilderChat } from "@/components/platformBuilder/BuilderChat";
import { BuilderPreview } from "@/components/platformBuilder/BuilderPreview";
import { BuilderCodeView } from "@/components/platformBuilder/BuilderCodeView";
import { BuilderToolbar } from "@/components/platformBuilder/BuilderToolbar";
import { ProjectsList } from "@/components/platformBuilder/ProjectsList";
import { MessageSquare, Monitor, Code } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StarField from "@/components/StarField";

interface ProjectFile {
  id: string;
  file_name: string;
  content: string;
  file_type: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  code_changes?: any;
  timestamp: Date;
}

export default function AIPlatformBuilder() {
  const { projectId } = useParams();
  const [project, setProject] = useState<any>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'preview' | 'code'>('chat');

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadFiles();
      loadConversations();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_builder_projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error("فشل تحميل المشروع");
    }
  };

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_builder_files')
        .select('*')
        .eq('project_id', projectId)
        .order('file_name');

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_builder_conversations')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at');

      if (error) throw error;
      
      const formattedMessages = (data || []).map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        code_changes: msg.code_changes,
        timestamp: new Date(msg.created_at),
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!projectId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // حفظ رسالة المستخدم
      await supabase.from('ai_builder_conversations').insert({
        project_id: projectId,
        role: 'user',
        content: message,
      });

      // استدعاء الذكاء الاصطناعي
      const { data, error } = await supabase.functions.invoke('ai-code-generator', {
        body: {
          message,
          currentFiles: files,
          conversationHistory: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.explanation,
        code_changes: { filesCount: data.files?.length || 0 },
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // حفظ رسالة الذكاء الاصطناعي
      await supabase.from('ai_builder_conversations').insert({
        project_id: projectId,
        role: 'assistant',
        content: data.explanation,
        code_changes: data.files,
      });

      // تحديث الملفات
      if (data.files && data.files.length > 0) {
        await updateProjectFiles(data.files);
      }

      setActiveTab('preview');
      toast.success("تم تحديث المشروع");
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || "فشل إرسال الرسالة");
      
      // إزالة رسالة المستخدم عند الفشل
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const updateProjectFiles = async (newFiles: any[]) => {
    try {
      // حذف الملفات القديمة
      await supabase
        .from('ai_builder_files')
        .delete()
        .eq('project_id', projectId);

      // إضافة الملفات الجديدة
      const filesToInsert = newFiles.map(file => ({
        project_id: projectId,
        file_name: file.file_name,
        file_path: `/${file.file_name}`,
        file_type: file.file_type,
        content: file.content,
      }));

      const { error } = await supabase
        .from('ai_builder_files')
        .insert(filesToInsert);

      if (error) throw error;

      // إعادة تحميل الملفات
      await loadFiles();
    } catch (error) {
      console.error('Error updating files:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!projectId) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('ai_builder_projects')
        .update({
          title: project.title,
          description: project.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      if (error) throw error;
      toast.success("تم حفظ المشروع");
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error("فشل حفظ المشروع");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async (slug: string) => {
    if (!projectId) return;

    try {
      const { error } = await supabase
        .from('ai_builder_projects')
        .update({
          is_published: true,
          publish_slug: slug,
        })
        .eq('id', projectId);

      if (error) throw error;
      
      await loadProject();
      toast.success("تم نشر المشروع");
    } catch (error) {
      console.error('Error publishing project:', error);
      toast.error("فشل نشر المشروع");
    }
  };

  if (!projectId) {
    return <ProjectsList />;
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const publishUrl = project.is_published
    ? `${window.location.origin}/published/${project.publish_slug}`
    : undefined;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white relative overflow-hidden">
      <StarField />
      
      <BuilderToolbar
        projectId={projectId}
        projectTitle={project.title}
        onTitleChange={(title) => setProject({ ...project, title })}
        onSave={handleSave}
        onPublish={handlePublish}
        isSaving={isSaving}
        isPublished={project.is_published}
        publishUrl={publishUrl}
      />

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full">
          <TabsList className="w-full justify-start border-b border-border rounded-none bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span>الدردشة</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Monitor className="w-4 h-4" />
              <span>المعاينة</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="gap-2">
              <Code className="w-4 h-4" />
              <span>الكود</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="h-[calc(100%-3rem)] m-0">
            <BuilderChat
              projectId={projectId}
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="preview" className="h-[calc(100%-3rem)] m-0">
            <BuilderPreview
              files={files}
              isPublished={project.is_published}
              publishUrl={publishUrl}
            />
          </TabsContent>

          <TabsContent value="code" className="h-[calc(100%-3rem)] m-0">
            <BuilderCodeView files={files} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
