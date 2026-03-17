import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, ArrowRight, Loader2, Bug, Shield, Zap, CheckCircle, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';

const languages = ['javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 'php', 'go', 'rust', 'swift'];

const AICodeReviewer = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isReviewing, setIsReviewing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleReview = async () => {
    if (!code.trim()) { toast({ title: 'الصق الكود أولاً', variant: 'destructive' }); return; }
    setIsReviewing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-code-reviewer', {
        body: { code, language, reviewType: 'full', uiLanguage: 'ar' }
      });
      if (error) throw error;
      setResult(data);
    } catch { toast({ title: 'حدث خطأ', variant: 'destructive' }); }
    finally { setIsReviewing(false); }
  };

  const copyCode = (c: string) => { navigator.clipboard.writeText(c); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const scoreColor = (s: number) => s >= 80 ? 'text-emerald-400' : s >= 50 ? 'text-amber-400' : 'text-red-400';
  const severityColor = (s: string) => s === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' : s === 'medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(222,84%,5%)] via-[hsl(230,60%,8%)] to-[hsl(222,84%,5%)]" dir="rtl">
      <StarField />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <button onClick={() => navigate('/gju-competition')} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-6">
          <ArrowRight className="w-4 h-4" /><span>العودة للمسابقة</span>
        </button>

        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Badge className="mb-4 bg-amber-500/20 text-amber-300 border-amber-500/30">🆕 أداة جديدة</Badge>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3">
            <Code2 className="inline w-10 h-10 ml-3 text-amber-400" />
            مراجع الأكواد الذكي
          </h1>
          <p className="text-white/50 text-lg">تحليل شامل للأكواد: أخطاء، أمان، أداء، وأفضل الممارسات</p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-5 space-y-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>{languages.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
              <Textarea value={code} onChange={e => setCode(e.target.value)} placeholder="الصق الكود هنا..." className="min-h-[350px] bg-black/30 border-white/10 text-emerald-300 font-mono text-sm placeholder:text-white/20" dir="ltr" />
              <Button onClick={handleReview} disabled={isReviewing} className="w-full bg-gradient-to-l from-amber-600 to-orange-600 h-12">
                {isReviewing ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : <Code2 className="w-5 h-5 ml-2" />}
                {isReviewing ? 'جاري المراجعة...' : 'مراجعة الكود'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-5">
              {!result ? (
                <div className="flex flex-col items-center justify-center h-full text-white/30 py-20">
                  <Code2 className="w-16 h-16 mb-4" />
                  <p>نتائج المراجعة ستظهر هنا</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Score */}
                  <div className="text-center bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className={`text-5xl font-black ${scoreColor(result.overallScore)}`}>{result.overallScore}<span className="text-lg">/100</span></div>
                    <p className="text-white/50 text-sm mt-1">{result.overallAssessment}</p>
                  </div>

                  <Tabs defaultValue="bugs" className="w-full">
                    <TabsList className="grid grid-cols-4 bg-white/5 border border-white/10">
                      <TabsTrigger value="bugs" className="text-xs data-[state=active]:bg-amber-600 text-white"><Bug className="w-3 h-3 ml-1" />أخطاء</TabsTrigger>
                      <TabsTrigger value="security" className="text-xs data-[state=active]:bg-amber-600 text-white"><Shield className="w-3 h-3 ml-1" />أمان</TabsTrigger>
                      <TabsTrigger value="performance" className="text-xs data-[state=active]:bg-amber-600 text-white"><Zap className="w-3 h-3 ml-1" />أداء</TabsTrigger>
                      <TabsTrigger value="improved" className="text-xs data-[state=active]:bg-amber-600 text-white"><CheckCircle className="w-3 h-3 ml-1" />محسّن</TabsTrigger>
                    </TabsList>
                    <div className="mt-4 max-h-[300px] overflow-y-auto">
                      <TabsContent value="bugs" className="space-y-2">
                        {result.bugs?.length === 0 && <p className="text-emerald-400 text-sm text-center py-4">✓ لا توجد أخطاء</p>}
                        {result.bugs?.map((b: any, i: number) => (
                          <div key={i} className={`rounded-lg p-3 border ${severityColor(b.severity)}`}>
                            <div className="flex justify-between text-xs mb-1"><span>سطر {b.line}</span><Badge variant="outline" className="text-[10px]">{b.severity}</Badge></div>
                            <p className="text-sm">{b.description}</p>
                            <p className="text-xs mt-1 opacity-70">🔧 {b.fix}</p>
                          </div>
                        ))}
                      </TabsContent>
                      <TabsContent value="security" className="space-y-2">
                        {result.security?.length === 0 && <p className="text-emerald-400 text-sm text-center py-4">✓ لا توجد ثغرات</p>}
                        {result.security?.map((s: any, i: number) => (
                          <div key={i} className={`rounded-lg p-3 border ${severityColor(s.risk)}`}>
                            <p className="text-sm font-semibold">{s.vulnerability}</p>
                            <p className="text-xs mt-1 opacity-70">🔧 {s.fix}</p>
                          </div>
                        ))}
                      </TabsContent>
                      <TabsContent value="performance" className="space-y-2">
                        {result.performance?.map((p: any, i: number) => (
                          <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/5">
                            <p className="text-white/70 text-sm">{p.issue}</p>
                            <p className="text-emerald-400/70 text-xs mt-1">💡 {p.suggestion}</p>
                          </div>
                        ))}
                      </TabsContent>
                      <TabsContent value="improved">
                        {result.improvedCode && (
                          <div className="relative">
                            <pre className="bg-black/40 rounded-lg p-4 text-emerald-300 text-xs font-mono overflow-x-auto whitespace-pre-wrap" dir="ltr">{result.improvedCode}</pre>
                            <Button variant="ghost" size="sm" onClick={() => copyCode(result.improvedCode)} className="absolute top-2 left-2 text-white/40">
                              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                        )}
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AICodeReviewer;
