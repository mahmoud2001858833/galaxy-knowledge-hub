import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BuilderChat } from "@/components/platformBuilder/BuilderChat";
import { BuilderPreview } from "@/components/platformBuilder/BuilderPreview";
import { BuilderCodeView } from "@/components/platformBuilder/BuilderCodeView";
import { BuilderToolbar } from "@/components/platformBuilder/BuilderToolbar";
import { BuilderFileTree } from "@/components/platformBuilder/BuilderFileTree";
import { ProjectsList } from "@/components/platformBuilder/ProjectsList";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Code, FolderTree } from "lucide-react";
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
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [rightPanelTab, setRightPanelTab] = useState<'preview' | 'code'>('preview');

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadFiles();
      loadConversations();
    }
  }, [projectId]);

  useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      setSelectedFile(files[0].file_name);
    }
  }, [files]);

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
      await supabase.from('ai_builder_conversations').insert({
        project_id: projectId,
        role: 'user',
        content: message,
      });

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
        code_changes: { 
          filesCount: data.files?.length || 0,
          files: data.files // Save complete files array
        },
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      await supabase.from('ai_builder_conversations').insert({
        project_id: projectId,
        role: 'assistant',
        content: data.explanation,
        code_changes: { 
          filesCount: data.files?.length || 0,
          files: data.files, // Save complete files
          raw_response: data.raw_response // Save raw AI response
        },
      });

      if (data.files && data.files.length > 0) {
        await updateProjectFiles(data.files);
      }

      setRightPanelTab('preview');
      toast.success("تم تحديث المشروع");
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || "فشل إرسال الرسالة");
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const updateProjectFiles = async (newFiles: any[]) => {
    try {
      await supabase
        .from('ai_builder_files')
        .delete()
        .eq('project_id', projectId);

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
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Chat */}
          <ResizablePanel defaultSize={35} minSize={25}>
            <BuilderChat
              projectId={projectId}
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-border/50" />

          {/* Right Panel - Preview & Code */}
          <ResizablePanel defaultSize={65} minSize={40}>
            <div className="h-full flex flex-col">
              <Tabs value={rightPanelTab} onValueChange={(v) => setRightPanelTab(v as any)} className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start border-b border-border rounded-none bg-card/50 backdrop-blur-sm">
                  <TabsTrigger value="preview" className="gap-2">
                    <Monitor className="w-4 h-4" />
                    <span>المعاينة</span>
                  </TabsTrigger>
                  <TabsTrigger value="code" className="gap-2">
                    <Code className="w-4 h-4" />
                    <span>الكود</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                  <BuilderPreview
                    files={files}
                    isPublished={project.is_published}
                    publishUrl={publishUrl}
                  />
                </TabsContent>

                <TabsContent value="code" className="flex-1 m-0 overflow-hidden">
                  <ResizablePanelGroup direction="horizontal" className="h-full">
                    <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                      <BuilderFileTree
                        files={files}
                        selectedFile={selectedFile}
                        onSelectFile={setSelectedFile}
                      />
                    </ResizablePanel>
                    
                    <ResizableHandle className="bg-border/50" />
                    
                    <ResizablePanel defaultSize={80}>
                      <BuilderCodeView files={files} />
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}