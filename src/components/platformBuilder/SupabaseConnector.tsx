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
import { 
  Database, 
  Check, 
  Loader2, 
  AlertCircle, 
  Table2, 
  Shield, 
  Zap,
  Link,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface SupabaseConnectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (url: string, anonKey: string, tables?: string[]) => void;
  currentUrl?: string;
  currentKey?: string;
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
  isConnected = false,
}: SupabaseConnectorProps) => {
  const [url, setUrl] = useState(currentUrl);
  const [anonKey, setAnonKey] = useState(currentKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [step, setStep] = useState<'input' | 'testing' | 'success'>('input');

  useEffect(() => {
    if (open) {
      setUrl(currentUrl);
      setAnonKey(currentKey);
      setStep(isConnected ? 'success' : 'input');
      setTestResult(isConnected ? 'success' : null);
    }
  }, [open, currentUrl, currentKey, isConnected]);

  const testConnection = async () => {
    if (!url || !anonKey) {
      toast.error("يرجى إدخال جميع البيانات");
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
      // Test connection by fetching tables using REST API
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
        },
      });

      if (response.ok) {
        // Try to get table list from the OpenAPI schema
        const schemaResponse = await fetch(`${url}/rest/v1/`, {
          method: 'OPTIONS',
          headers: {
            'apikey': anonKey,
          },
        });

        let tableList: TableInfo[] = [];
        
        // Parse tables from response if possible
        try {
          const schemaData = await schemaResponse.json();
          if (schemaData.paths) {
            tableList = Object.keys(schemaData.paths)
              .filter(path => path.startsWith('/') && !path.includes('{'))
              .map(path => ({ name: path.replace('/', '') }));
          }
        } catch {
          // If we can't get table list, that's okay
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
    onConnect(url, anonKey, tables.map(t => t.name));
    toast.success("تم ربط Supabase بنجاح! الذكاء الاصطناعي سيستخدم قاعدة البيانات الخاصة بك");
    onOpenChange(false);
  };

  const handleDisconnect = () => {
    onConnect('', '', []);
    setStep('input');
    setTestResult(null);
    setTables([]);
    setUrl('');
    setAnonKey('');
    toast.info("تم إلغاء ربط Supabase");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-background via-background to-primary/5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            ربط Supabase - قاعدة بيانات حقيقية
          </DialogTitle>
          <DialogDescription className="text-base">
            اربط مشروعك بقاعدة بيانات Supabase الخاصة بك لتفعيل تسجيل الدخول وحفظ البيانات
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
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
                    Supabase Project URL
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
                  <Label htmlFor="supabase-key" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Supabase Anon Key
                  </Label>
                  <Input
                    id="supabase-key"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    dir="ltr"
                    type="password"
                    className="font-mono"
                  />
                </div>

                {testResult === 'error' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <span className="text-sm text-destructive">
                      فشل الاتصال. تأكد من صحة الرابط والمفتاح
                    </span>
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
                      <span>افتح <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">لوحة تحكم Supabase <ExternalLink className="w-3 h-3" /></a></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-bold">2</span>
                      <span>اذهب إلى Project Settings → API</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full font-bold">3</span>
                      <span>انسخ Project URL و anon/public key</span>
                    </li>
                  </ol>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="flex-1"
                  >
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
                <p className="text-sm text-muted-foreground">يتم التحقق من صحة البيانات</p>
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
                  <div>
                    <p className="font-semibold text-green-500">متصل بنجاح!</p>
                    <p className="text-sm text-muted-foreground truncate max-w-[400px]" dir="ltr">
                      {url}
                    </p>
                  </div>
                </div>

                {tables.length > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Table2 className="w-4 h-4" />
                      الجداول المتاحة ({tables.length})
                    </Label>
                    <ScrollArea className="h-[150px] border rounded-lg p-3">
                      <div className="flex flex-wrap gap-2">
                        {tables.map((table) => (
                          <Badge 
                            key={table.name} 
                            variant="secondary"
                            className="text-xs"
                          >
                            {table.name}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    🎉 ماذا يعني هذا؟
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✅ الذكاء الاصطناعي سيستخدم قاعدة بياناتك الحقيقية</li>
                    <li>✅ أي كود يُنشأ سيتصل مباشرة بـ Supabase الخاص بك</li>
                    <li>✅ تسجيل الدخول وحفظ البيانات سيعمل فعلياً</li>
                    <li>✅ يمكنك رؤية البيانات في لوحة تحكم Supabase</li>
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
                    className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Check className="w-4 h-4" />
                    تأكيد الربط
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};