import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Check, 
  Loader2, 
  AlertCircle, 
  Table2, 
  Shield, 
  Zap,
  Link,
  ExternalLink,
  Key,
  Plus,
  Play,
  Copy
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface SupabaseConnectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (url: string, anonKey: string, serviceKey?: string, tables?: string[]) => void;
  currentUrl?: string;
  currentKey?: string;
  currentServiceKey?: string;
  isConnected?: boolean;
}

interface TableInfo {
  name: string;
  rowCount?: number;
}

export const SupabaseConnector = ({
  open,
  onOpenChange,
  onConnect,
  currentUrl = "",
  currentKey = "",
  currentServiceKey = "",
  isConnected = false,
}: SupabaseConnectorProps) => {
  const [url, setUrl] = useState(currentUrl);
  const [anonKey, setAnonKey] = useState(currentKey);
  const [serviceKey, setServiceKey] = useState(currentServiceKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [step, setStep] = useState<'input' | 'testing' | 'success'>('input');
  const [activeTab, setActiveTab] = useState<'connect' | 'tables'>('connect');
  const [sqlToExecute, setSqlToExecute] = useState('');
  const [executingSql, setExecutingSql] = useState(false);

  useEffect(() => {
    if (open) {
      setUrl(currentUrl);
      setAnonKey(currentKey);
      setServiceKey(currentServiceKey);
      setStep(isConnected ? 'success' : 'input');
      setTestResult(isConnected ? 'success' : null);
    }
  }, [open, currentUrl, currentKey, currentServiceKey, isConnected]);

  const testConnection = async () => {
    if (!url || !anonKey) {
      toast.error("يرجى إدخال الرابط والمفتاح العام");
      return;
    }

    if (!url.includes('supabase.co')) {
      toast.error("يرجى إدخال رابط Supabase صحيح");
      return;
    }

    setTesting(true);
    setStep('testing');
    setTestResult(null);

    try {
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      });

      if (response.ok) {
        // Try to get table list
        const schemaResponse = await fetch(`${url}/rest/v1/`, {
          method: 'OPTIONS',
          headers: { 'apikey': anonKey },
        });

        let tableList: TableInfo[] = [];
        
        try {
          const schemaData = await schemaResponse.json();
          if (schemaData.paths) {
            tableList = Object.keys(schemaData.paths)
              .filter(path => path.startsWith('/') && !path.includes('{'))
              .map(path => ({ name: path.replace('/', '') }));
          }
        } catch {
          tableList = [];
        }

        setTables(tableList);
        setTestResult('success');
        setStep('success');
        toast.success("تم الاتصال بنجاح!");
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResult('error');
      setStep('input');
      toast.error("فشل الاتصال. تأكد من صحة البيانات");
    } finally {
      setTesting(false);
    }
  };

  const handleConnect = () => {
    onConnect(url, anonKey, serviceKey, tables.map(t => t.name));
    toast.success("تم ربط Supabase! الآن يمكن للذكاء الاصطناعي إنشاء جداول وكود حقيقي");
    onOpenChange(false);
  };

  const handleDisconnect = () => {
    onConnect('', '', '', []);
    setStep('input');
    setTestResult(null);
    setTables([]);
    setUrl('');
    setAnonKey('');
    setServiceKey('');
    toast.info("تم إلغاء ربط Supabase");
  };

  const executeSql = async () => {
    if (!sqlToExecute.trim()) {
      toast.error("يرجى إدخال كود SQL");
      return;
    }

    if (!serviceKey) {
      toast.error("يجب إدخال Service Key لتنفيذ SQL");
      return;
    }

    setExecutingSql(true);
    try {
      const { data, error } = await supabase.functions.invoke('supabase-manager', {
        body: {
          action: 'execute_sql',
          supabaseUrl: url,
          serviceKey: serviceKey,
          sql: sqlToExecute,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast.success("تم تنفيذ SQL بنجاح!");
        setSqlToExecute('');
        // Refresh tables
        testConnection();
      } else {
        toast.error(`فشل التنفيذ: ${data.error || 'خطأ غير معروف'}`);
      }
    } catch (error) {
      console.error('SQL execution error:', error);
      toast.error("فشل تنفيذ SQL. تأكد من Service Key");
    } finally {
      setExecutingSql(false);
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlToExecute);
    toast.success("تم نسخ SQL!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            ربط Supabase - قاعدة بيانات حقيقية
          </DialogTitle>
          <DialogDescription className="text-base">
            اربط مشروعك بـ Supabase لتفعيل تسجيل الدخول، حفظ البيانات، وإنشاء الجداول تلقائياً
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-4">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="connect" className="gap-2">
              <Link className="w-4 h-4" />
              الاتصال
            </TabsTrigger>
            <TabsTrigger value="tables" className="gap-2" disabled={!isConnected}>
              <Table2 className="w-4 h-4" />
              الجداول
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-4">
            <AnimatePresence mode="wait">
              {step === 'input' && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="supabase-url" className="flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      Project URL
                    </Label>
                    <Input
                      id="supabase-url"
                      placeholder="https://xxxxx.supabase.co"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      dir="ltr"
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supabase-anon-key" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Anon/Public Key
                    </Label>
                    <Input
                      id="supabase-anon-key"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={anonKey}
                      onChange={(e) => setAnonKey(e.target.value)}
                      dir="ltr"
                      type="password"
                      className="font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supabase-service-key" className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-500" />
                      Service Role Key (اختياري - للعمليات المتقدمة)
                    </Label>
                    <Input
                      id="supabase-service-key"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={serviceKey}
                      onChange={(e) => setServiceKey(e.target.value)}
                      dir="ltr"
                      type="password"
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      يسمح للذكاء الاصطناعي بإنشاء الجداول تلقائياً. يمكنك تجاهله وإنشاء الجداول يدوياً.
                    </p>
                  </div>

                  {testResult === 'error' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-destructive" />
                      <span className="text-sm text-destructive">فشل الاتصال. تأكد من البيانات</span>
                    </motion.div>
                  )}

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      كيف تحصل على البيانات؟
                    </h4>
                    <ol className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-bold">1</span>
                        <span>افتح <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">لوحة Supabase <ExternalLink className="w-3 h-3" /></a></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-bold">2</span>
                        <span>Project Settings → API</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-bold">3</span>
                        <span>انسخ Project URL و anon key و service_role key</span>
                      </li>
                    </ol>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                      إلغاء
                    </Button>
                    <Button 
                      onClick={testConnection} 
                      className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      disabled={testing || !url || !anonKey}
                    >
                      {testing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          جاري الاختبار...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          اختبار الاتصال
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 'testing' && (
                <motion.div
                  key="testing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-12 space-y-4"
                >
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                  <p className="text-lg font-medium">جاري اختبار الاتصال...</p>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-full">
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-500">متصل بنجاح!</p>
                      <p className="text-sm text-muted-foreground truncate" dir="ltr">{url}</p>
                    </div>
                    {serviceKey && (
                      <Badge variant="secondary" className="bg-amber-500/20 text-amber-500">
                        <Key className="w-3 h-3 mr-1" />
                        Service Key
                      </Badge>
                    )}
                  </div>

                  {tables.length > 0 && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Table2 className="w-4 h-4" />
                        الجداول المتاحة ({tables.length})
                      </Label>
                      <ScrollArea className="h-[120px] border rounded-lg p-3">
                        <div className="flex flex-wrap gap-2">
                          {tables.map((table) => (
                            <Badge key={table.name} variant="secondary" className="text-xs">
                              {table.name}
                            </Badge>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2">🎉 ماذا يعني هذا؟</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✅ الذكاء الاصطناعي سيُنشئ جداول حقيقية</li>
                      <li>✅ الكود المُنشأ سيتصل مباشرة بـ Supabase</li>
                      <li>✅ تسجيل الدخول وحفظ البيانات سيعمل فعلياً</li>
                      {serviceKey && <li>✅ يمكن إنشاء الجداول تلقائياً</li>}
                    </ul>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleDisconnect}
                      className="flex-1 text-destructive border-destructive/50 hover:bg-destructive/10"
                    >
                      إلغاء الربط
                    </Button>
                    <Button 
                      onClick={handleConnect} 
                      className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-emerald-600"
                    >
                      <Check className="w-4 h-4" />
                      تأكيد الربط
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="tables" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-500" />
                  إنشاء جداول جديدة
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  عندما يُنشئ الذكاء الاصطناعي Schema SQL، يمكنك تنفيذه هنا أو نسخه للوحة Supabase
                </p>
                
                <textarea
                  value={sqlToExecute}
                  onChange={(e) => setSqlToExecute(e.target.value)}
                  placeholder={`CREATE TABLE IF NOT EXISTS public.my_table (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  name TEXT NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT now()\n);`}
                  className="w-full h-32 p-3 text-sm font-mono bg-background border rounded-lg resize-none"
                  dir="ltr"
                />

                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copySqlToClipboard}
                    disabled={!sqlToExecute}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    نسخ
                  </Button>
                  <Button
                    size="sm"
                    onClick={executeSql}
                    disabled={!sqlToExecute || !serviceKey || executingSql}
                    className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600"
                  >
                    {executingSql ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    تنفيذ SQL
                  </Button>
                </div>

                {!serviceKey && (
                  <p className="text-xs text-amber-500 mt-2">
                    ⚠️ أدخل Service Key في تبويب الاتصال لتتمكن من تنفيذ SQL
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Table2 className="w-4 h-4" />
                  الجداول الحالية ({tables.length})
                </Label>
                <ScrollArea className="h-[200px] border rounded-lg p-3">
                  {tables.length > 0 ? (
                    <div className="space-y-2">
                      {tables.map((table) => (
                        <div key={table.name} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <span className="font-mono text-sm">{table.name}</span>
                          <Badge variant="outline" className="text-xs">جدول</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      لا توجد جداول. اطلب من الذكاء الاصطناعي إنشاء مشروع!
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
