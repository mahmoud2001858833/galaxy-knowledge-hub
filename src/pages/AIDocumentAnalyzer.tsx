import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileSearch, Upload, Loader2, BookOpen, Brain, List, HelpCircle, ArrowRight, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';

const AIDocumentAnalyzer = () => {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!text && !imagePreview) {
      toast({ title: 'أدخل نصاً أو ارفع صورة', variant: 'destructive' });
      return;
    }
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-document-analyzer', {
        body: { text, imageBase64: imagePreview, language: 'ar' }
      });
      if (error) throw error;
      setResult(data);
    } catch (err) {
      toast({ title: 'حدث خطأ في التحليل', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(222,84%,5%)] via-[hsl(230,60%,8%)] to-[hsl(222,84%,5%)]" dir="rtl">
      <StarField />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <button onClick={() => navigate('/gju-competition')} className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm mb-6">
          <ArrowRight className="w-4 h-4" />
          <span>العودة للمسابقة</span>
        </button>

        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Badge className="mb-4 bg-violet-500/20 text-violet-300 border-violet-500/30">🆕 أداة جديدة</Badge>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3">
            <FileSearch className="inline w-10 h-10 ml-3 text-violet-400" />
            محلل المستندات الذكي
          </h1>
          <p className="text-white/50 text-lg">حلّل مستنداتك وصورك واستخرج ملخصات وأسئلة مراجعة بالذكاء الاصطناعي</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Input */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6 space-y-4">
              <Textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="الصق النص أو محتوى المستند هنا..."
                className="min-h-[200px] bg-white/5 border-white/10 text-white placeholder:text-white/30"
                dir="rtl"
              />
              <div className="flex gap-3">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4 ml-2" /> رفع صورة
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <Button onClick={handleAnalyze} disabled={isAnalyzing} className="flex-1 bg-gradient-to-l from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500">
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Brain className="w-4 h-4 ml-2" />}
                  {isAnalyzing ? 'جاري التحليل...' : 'تحليل ذكي'}
                </Button>
              </div>
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="preview" className="rounded-lg max-h-48 mx-auto" />
                  <button onClick={() => setImagePreview(null)} className="absolute top-2 left-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs">✕</button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              {!result ? (
                <div className="flex flex-col items-center justify-center h-full text-white/30 py-16">
                  <FileSearch className="w-16 h-16 mb-4" />
                  <p>النتائج ستظهر هنا بعد التحليل</p>
                </div>
              ) : (
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid grid-cols-4 bg-white/5 border border-white/10">
                    <TabsTrigger value="summary" className="text-xs data-[state=active]:bg-violet-600 text-white"><BookOpen className="w-3 h-3 ml-1" />ملخص</TabsTrigger>
                    <TabsTrigger value="points" className="text-xs data-[state=active]:bg-violet-600 text-white"><List className="w-3 h-3 ml-1" />نقاط</TabsTrigger>
                    <TabsTrigger value="questions" className="text-xs data-[state=active]:bg-violet-600 text-white"><HelpCircle className="w-3 h-3 ml-1" />أسئلة</TabsTrigger>
                    <TabsTrigger value="concepts" className="text-xs data-[state=active]:bg-violet-600 text-white"><Brain className="w-3 h-3 ml-1" />مفاهيم</TabsTrigger>
                  </TabsList>
                  <div className="mt-4 max-h-[400px] overflow-y-auto space-y-3">
                    <TabsContent value="summary">
                      <div className="text-white/80 leading-relaxed text-sm whitespace-pre-wrap">{result.summary}</div>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.summary)} className="mt-2 text-white/50">
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </TabsContent>
                    <TabsContent value="points">
                      <ul className="space-y-2">
                        {result.keyPoints?.map((p: string, i: number) => (
                          <li key={i} className="flex gap-2 text-white/70 text-sm">
                            <span className="bg-violet-500/20 text-violet-300 rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0">{i + 1}</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="questions">
                      {result.reviewQuestions?.map((q: any, i: number) => (
                        <div key={i} className="bg-white/5 rounded-lg p-3 mb-2 border border-white/5">
                          <p className="text-white/80 text-sm font-semibold mb-1">{q.question}</p>
                          {q.options && <ul className="text-white/50 text-xs space-y-1 mb-1">{q.options.map((o: string, j: number) => <li key={j}>• {o}</li>)}</ul>}
                          <p className="text-emerald-400/70 text-xs">✓ {q.answer}</p>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="concepts">
                      {result.concepts?.map((c: any, i: number) => (
                        <div key={i} className="bg-white/5 rounded-lg p-3 mb-2 border border-white/5">
                          <span className="text-violet-300 font-semibold text-sm">{c.term}</span>
                          <p className="text-white/60 text-xs mt-1">{c.definition}</p>
                        </div>
                      ))}
                    </TabsContent>
                  </div>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIDocumentAnalyzer;
