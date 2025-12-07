import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Database, 
  Link2, 
  Unlink, 
  Loader2, 
  CheckCircle2, 
  XCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  Code,
  BookOpen,
  Key,
  Server,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SupabaseIntegrationPanelProps {
  projectId: string;
  onConnectionChange?: (connected: boolean, config?: { url: string; anonKey: string }) => void;
}

export const SupabaseIntegrationPanel = ({ 
  projectId, 
  onConnectionChange 
}: SupabaseIntegrationPanelProps) => {
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [serviceRoleKey, setServiceRoleKey] = useState("");
  const [schema, setSchema] = useState("public");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [showServiceKey, setShowServiceKey] = useState(false);
  const [lastVerified, setLastVerified] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Check existing connection on mount
  useEffect(() => {
    checkConnection();
  }, [projectId]);

  const checkConnection = async () => {
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('supabase-integration', {
        body: { action: 'verify', projectId }
      });

      if (error) throw error;

      if (data?.connected) {
        setIsConnected(true);
        setSupabaseUrl(data.url || "");
        setLastVerified(data.lastVerified);
        onConnectionChange?.(true, { url: data.url, anonKey: '' });
      } else {
        setIsConnected(false);
        onConnectionChange?.(false);
      }
    } catch (err) {
      console.error('Error checking connection:', err);
      setIsConnected(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConnect = async () => {
    if (!supabaseUrl || !anonKey) {
      toast.error("الرجاء إدخال رابط Supabase ومفتاح Anon Key");
      return;
    }

    setIsConnecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('supabase-integration', {
        body: {
          action: 'connect',
          projectId,
          supabaseUrl,
          anonKey,
          serviceRoleKey: serviceRoleKey || null,
          schema
        }
      });

      if (error) throw error;

      if (data?.success) {
        setIsConnected(true);
        setLastVerified(new Date().toISOString());
        toast.success("تم الربط بـ Supabase بنجاح!");
        onConnectionChange?.(true, { url: supabaseUrl, anonKey });
      } else {
        toast.error(data?.error || "فشل الربط");
      }
    } catch (err) {
      console.error('Connection error:', err);
      toast.error("حدث خطأ أثناء الربط");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('supabase-integration', {
        body: { action: 'disconnect', projectId }
      });

      if (error) throw error;

      setIsConnected(false);
      setSupabaseUrl("");
      setAnonKey("");
      setServiceRoleKey("");
      setLastVerified(null);
      toast.success("تم إلغاء الربط");
      onConnectionChange?.(false);
    } catch (err) {
      toast.error("حدث خطأ أثناء إلغاء الربط");
    }
  };

  if (isVerifying) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <Tabs defaultValue={isConnected ? "status" : "connect"} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="connect" className="gap-1.5">
            <Link2 className="w-3.5 h-3.5" />
            الربط
          </TabsTrigger>
          <TabsTrigger value="status" className="gap-1.5">
            <Database className="w-3.5 h-3.5" />
            الحالة
          </TabsTrigger>
          <TabsTrigger value="docs" className="gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            الأوامر
          </TabsTrigger>
        </TabsList>

        {/* Connect Tab */}
        <TabsContent value="connect" className="space-y-4">
          <AnimatePresence mode="wait">
            {isConnected ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <div className="flex-1">
                    <p className="font-medium text-green-500">متصل بـ Supabase</p>
                    <p className="text-xs text-muted-foreground truncate">{supabaseUrl}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDisconnect}
                    className="gap-1.5"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    إلغاء الربط
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Info Box */}
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    اربط مشروعك بـ Supabase لتفعيل المصادقة وقاعدة البيانات والتخزين
                  </p>
                </div>

                {/* Supabase URL */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    رابط Supabase URL
                  </Label>
                  <Input
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xxxx.supabase.co"
                    dir="ltr"
                    className="font-mono text-sm"
                  />
                </div>

                {/* Anon Key */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Anon Key (مطلوب)
                  </Label>
                  <div className="relative">
                    <Input
                      type={showAnonKey ? "text" : "password"}
                      value={anonKey}
                      onChange={(e) => setAnonKey(e.target.value)}
                      placeholder="eyJhbG..."
                      dir="ltr"
                      className="font-mono text-sm pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowAnonKey(!showAnonKey)}
                    >
                      {showAnonKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Service Role Key */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Service Role Key (اختياري)
                  </Label>
                  <div className="relative">
                    <Input
                      type={showServiceKey ? "text" : "password"}
                      value={serviceRoleKey}
                      onChange={(e) => setServiceRoleKey(e.target.value)}
                      placeholder="للعمليات المتقدمة..."
                      dir="ltr"
                      className="font-mono text-sm pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowServiceKey(!showServiceKey)}
                    >
                      {showServiceKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    يُستخدم لجلب قائمة الجداول وإنشاء جداول جديدة
                  </p>
                </div>

                {/* Connect Button */}
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting || !supabaseUrl || !anonKey}
                  className="w-full gap-2"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الربط...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      ربط Supabase
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-4">
          <div className={`p-4 rounded-lg border ${isConnected ? 'bg-green-500/10 border-green-500/30' : 'bg-destructive/10 border-destructive/30'}`}>
            <div className="flex items-center gap-3 mb-3">
              {isConnected ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <XCircle className="w-6 h-6 text-destructive" />
              )}
              <div>
                <p className={`font-semibold ${isConnected ? 'text-green-500' : 'text-destructive'}`}>
                  {isConnected ? 'متصل' : 'غير متصل'}
                </p>
                {lastVerified && (
                  <p className="text-xs text-muted-foreground">
                    آخر تحقق: {new Date(lastVerified).toLocaleString('ar-SA')}
                  </p>
                )}
              </div>
            </div>
            
            {isConnected && supabaseUrl && (
              <div className="space-y-2">
                <div className="p-2 bg-background/50 rounded border">
                  <p className="text-xs text-muted-foreground mb-1">Supabase URL</p>
                  <p className="font-mono text-sm truncate">{supabaseUrl}</p>
                </div>
              </div>
            )}
          </div>

          {!isConnected && (
            <div className="text-center py-6">
              <Database className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">لم يتم ربط Supabase بعد</p>
              <p className="text-sm text-muted-foreground">اذهب لتبويب "الربط" لإضافة اتصال</p>
            </div>
          )}
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="space-y-4">
          <CRUDDocumentation />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// CRUD Documentation Component
const CRUDDocumentation = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    toast.success("تم نسخ الكود");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const crudCommands = [
    {
      title: "إنشاء Client",
      category: "setup",
      code: `// supabase-client.js
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);`
    },
    {
      title: "قراءة جميع البيانات",
      category: "read",
      code: `// قراءة جميع الصفوف من جدول
const { data, error } = await supabase
  .from('table_name')
  .select('*');`
    },
    {
      title: "قراءة مع شرط",
      category: "read",
      code: `// قراءة مع شرط معين
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('status', 'active');`
    },
    {
      title: "قراءة مع limit",
      category: "read",
      code: `// قراءة عدد محدود
const { data, error } = await supabase
  .from('posts')
  .select('*')
  .limit(10)
  .order('created_at', { ascending: false });`
    },
    {
      title: "إدخال صف واحد",
      category: "insert",
      code: `// إدخال صف واحد
const { data, error } = await supabase
  .from('posts')
  .insert([{ title: 'عنوان جديد', content: 'المحتوى' }])
  .select()
  .single();`
    },
    {
      title: "إدخال صفوف متعددة",
      category: "insert",
      code: `// إدخال صفوف متعددة
const { data, error } = await supabase
  .from('items')
  .insert([
    { name: 'عنصر 1', value: 100 },
    { name: 'عنصر 2', value: 200 },
    { name: 'عنصر 3', value: 300 }
  ])
  .select();`
    },
    {
      title: "تحديث صف",
      category: "update",
      code: `// تحديث صف بناءً على id
const { data, error } = await supabase
  .from('posts')
  .update({ title: 'عنوان محدث', updated_at: new Date() })
  .eq('id', 'POST_ID')
  .select()
  .single();`
    },
    {
      title: "حذف صف",
      category: "delete",
      code: `// حذف صف بناءً على شرط
const { error } = await supabase
  .from('posts')
  .delete()
  .eq('id', 'POST_ID');`
    },
    {
      title: "تسجيل مستخدم جديد",
      category: "auth",
      code: `// تسجيل مستخدم جديد
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});`
    },
    {
      title: "تسجيل الدخول",
      category: "auth",
      code: `// تسجيل الدخول
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});`
    },
    {
      title: "تسجيل الخروج",
      category: "auth",
      code: `// تسجيل الخروج
const { error } = await supabase.auth.signOut();`
    },
    {
      title: "جلب المستخدم الحالي",
      category: "auth",
      code: `// جلب المستخدم الحالي
const { data: { user }, error } = await supabase.auth.getUser();`
    },
    {
      title: "إنشاء جدول",
      category: "sql",
      code: `-- إنشاء جدول جديد
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  user_id UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;`
    },
    {
      title: "إضافة عمود",
      category: "sql",
      code: `-- إضافة عمود جديد
ALTER TABLE posts
ADD COLUMN category TEXT DEFAULT 'general';`
    },
    {
      title: "حذف جدول",
      category: "sql",
      code: `-- حذف جدول
DROP TABLE IF EXISTS posts CASCADE;`
    }
  ];

  const categories = [
    { id: 'setup', name: 'الإعداد', icon: '⚙️' },
    { id: 'read', name: 'القراءة', icon: '📖' },
    { id: 'insert', name: 'الإدخال', icon: '➕' },
    { id: 'update', name: 'التحديث', icon: '✏️' },
    { id: 'delete', name: 'الحذف', icon: '🗑️' },
    { id: 'auth', name: 'المصادقة', icon: '🔐' },
    { id: 'sql', name: 'SQL', icon: '🗄️' }
  ];

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {categories.map((category) => {
          const commands = crudCommands.filter(c => c.category === category.id);
          if (commands.length === 0) return null;
          
          return (
            <div key={category.id} className="space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2 sticky top-0 bg-background py-1">
                <span>{category.icon}</span>
                {category.name}
              </h4>
              {commands.map((cmd, index) => {
                const globalIndex = crudCommands.indexOf(cmd);
                return (
                  <div key={index} className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700">
                      <span className="text-sm font-medium text-slate-300">{cmd.title}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyCode(cmd.code, globalIndex)}
                        className="h-7 px-2 text-slate-400 hover:text-white"
                      >
                        {copiedIndex === globalIndex ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>
                    <pre className="p-3 text-xs font-mono text-slate-300 overflow-x-auto">
                      <code>{cmd.code}</code>
                    </pre>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default SupabaseIntegrationPanel;