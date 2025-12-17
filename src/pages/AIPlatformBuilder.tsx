import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Monitor, Code, ShieldAlert, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StarField from "@/components/StarField";
import { Button } from "@/components/ui/button";
import { BuilderDatabasePanel } from "@/components/platformBuilder/BuilderDatabasePanel";

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
  code_changes?: {
    filesCount?: number;
    files?: Array<{
      file_name: string;
      file_type: string;
      content: string;
    }>;
  };
  timestamp: Date;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  publish_slug: string | null;
  supabase_url: string | null;
  supabase_anon_key: string | null;
  supabase_connected: boolean;
  project_type: string;
  settings: any;
  tenant_id: string | null;
  user_id: string | null;
}

export default function AIPlatformBuilder() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [rightPanelTab, setRightPanelTab] = useState<'preview' | 'code' | 'database'>('preview');
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(true);

  // Check supervisor access
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAuthorized(false);
          setCheckingAccess(false);
          return;
        }

        // Check if user has admin/supervisor access
        const { data: accessLevel } = await supabase.rpc('get_admin_teacher_access_level', {
          user_uuid: user.id
        });

        const authorized = accessLevel === 'admin' || accessLevel === 'super_admin';
        setIsAuthorized(authorized);
        
        if (!authorized) {
          toast.error("هذه الصفحة متاحة للمشرفين فقط");
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setIsAuthorized(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, []);

  useEffect(() => {
    if (projectId && isAuthorized) {
      loadProject();
      loadFiles();
      loadConversations();
    }
  }, [projectId, isAuthorized]);

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
      
      setProject({
        ...data,
        supabase_connected: data.supabase_connected ?? false,
        project_type: data.project_type ?? 'web',
        settings: data.settings ?? {},
      });
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
      
      const formattedMessages = (data || []).map(msg => {
        const codeChanges = msg.code_changes as any;
        return {
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          code_changes: codeChanges ? {
            filesCount: codeChanges.filesCount,
            files: codeChanges.files,
          } : undefined,
          timestamp: new Date(msg.created_at || Date.now()),
        };
      });
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!projectId || !project) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Save user message
      await supabase.from('ai_builder_conversations').insert({
        project_id: projectId,
        role: 'user',
        content: message,
        tenant_id: project.tenant_id,
      });

      // Call AI with project ID for automatic database
      const { data, error } = await supabase.functions.invoke('ai-code-generator', {
        body: {
          message,
          currentFiles: files,
          conversationHistory: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content,
          })),
          projectId: projectId, // Project ID for automatic database
        },
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.explanation,
        code_changes: { 
          filesCount: data.files?.length || 0,
          files: data.files,
        },
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save AI response
      await supabase.from('ai_builder_conversations').insert({
        project_id: projectId,
        role: 'assistant',
        content: data.explanation,
        code_changes: { 
          filesCount: data.files?.length || 0,
          files: data.files,
        },
        tenant_id: project.tenant_id,
      });

      // Update project files
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
    if (!project) return;
    
    try {
      // Delete existing files
      await supabase
        .from('ai_builder_files')
        .delete()
        .eq('project_id', projectId);

      // Insert new files
      const filesToInsert = newFiles.map(file => ({
        project_id: projectId,
        file_name: file.file_name,
        file_path: `/${file.file_name}`,
        file_type: file.file_type,
        content: file.content,
        tenant_id: project.tenant_id,
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
    if (!projectId || !project) return;
    
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

  const handleSupabaseConnect = async (url: string, key: string, tables?: string[]) => {
    if (!projectId || !project) return;

    try {
      const isConnected = !!(url && key);
      
      const { error } = await supabase
        .from('ai_builder_projects')
        .update({
          supabase_url: url || null,
          supabase_anon_key: key || null,
          supabase_connected: isConnected,
          settings: {
            ...project.settings,
            supabaseTables: tables || [],
          },
        })
        .eq('id', projectId);

      if (error) throw error;
      
      setProject(prev => prev ? {
        ...prev,
        supabase_url: url || null,
        supabase_anon_key: key || null,
        supabase_connected: isConnected,
        settings: {
          ...prev.settings,
          supabaseTables: tables || [],
        },
      } : null);

      if (isConnected) {
        toast.success("تم ربط Supabase بنجاح! الكود المُنشأ سيستخدم قاعدة بياناتك");
      }
    } catch (error) {
      console.error('Error updating Supabase connection:', error);
      toast.error("فشل حفظ إعدادات Supabase");
    }
  };

  // Check access first
  if (checkingAccess) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // Unauthorized access
  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <StarField />
        <div className="flex flex-col items-center gap-6 text-center z-10 p-8 rounded-2xl bg-card/50 backdrop-blur-lg border border-border">
          <ShieldAlert className="w-20 h-20 text-destructive" />
          <h1 className="text-2xl font-bold text-white">غير مصرح بالدخول</h1>
          <p className="text-muted-foreground max-w-md">
            هذه الصفحة متاحة للمشرفين فقط. إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع المسؤول.
          </p>
          <Button onClick={() => navigate('/')} variant="default" className="mt-4">
            العودة للرئيسية
          </Button>
        </div>
      </div>
    );
  }

  if (!projectId) {
    return <ProjectsList />;
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">جاري تحميل المشروع...</p>
        </div>
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
        supabaseConnected={project.supabase_connected}
        supabaseUrl={project.supabase_url || ''}
        supabaseKey={project.supabase_anon_key || ''}
        onSupabaseConnect={handleSupabaseConnect}
      />

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Panel - Chat */}
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
            <BuilderChat
              projectId={projectId}
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              supabaseConnected={project.supabase_connected}
            />
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-border/50 hover:bg-primary/50 transition-colors" />

          {/* Right Panel - Preview & Code */}
          <ResizablePanel defaultSize={65} minSize={40}>
            <div className="h-full flex flex-col">
              <Tabs value={rightPanelTab} onValueChange={(v) => setRightPanelTab(v as any)} className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start border-b border-border rounded-none bg-card/50 backdrop-blur-sm px-2">
                  <TabsTrigger value="preview" className="gap-2 data-[state=active]:bg-primary/20">
                    <Monitor className="w-4 h-4" />
                    <span>المعاينة</span>
                  </TabsTrigger>
                  <TabsTrigger value="code" className="gap-2 data-[state=active]:bg-primary/20">
                    <Code className="w-4 h-4" />
                    <span>الكود</span>
                  </TabsTrigger>
                  <TabsTrigger value="database" className="gap-2 data-[state=active]:bg-primary/20">
                    <Database className="w-4 h-4" />
                    <span>قاعدة البيانات</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                  <BuilderPreview
                    files={files}
                    isPublished={project.is_published}
                    publishUrl={publishUrl}
                  />
                </TabsContent>

                <TabsContent value="database" className="flex-1 m-0 overflow-hidden">
                  <BuilderDatabasePanel projectId={projectId} />
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