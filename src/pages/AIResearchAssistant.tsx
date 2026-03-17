import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Loader2, BookOpen, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';

const AIResearchAssistant = () => {
  const [topic, setTopic] = useState('');
  const [researchType, setResearchType] = useState('comprehensive');
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [expandedChapter, setExpandedChapter] = useState<number | null>(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!topic.trim()) { toast({ title: 'أدخل موضوع البحث', variant: 'destructive' }); return; }
    setIsGenerating(true); setReport(null);
    try {
      const { data, error } = await supabase.functions.invoke('ai-research-assistant', {
        body: { topic, researchType, depth: 'detailed', language: 'ar' }
      });
      if (error) throw error;
      setReport(data);
    } catch { toast({ title: 'حدث خطأ', variant: 'destructive' }); }
    finally { setIsGenerating(false); }
  };

  const exportAsText = () => {
    if (!report) return;
    let text = `${report.title}\n${'='.repeat(50)}\n\n`;
    text += `الملخص:\n${report.abstract}\n\n`;
    text += `المقدمة:\n${report.introduction}\n\n`;
    report.chapters?.forEach((ch: any, i: number) => {
      text += `الفصل ${i + 1}: ${ch.title}\n${'-'.repeat(30)}\n${ch.content}\n\n`;
      ch.subSections?.forEach((s: any) => { text += `  ${s.title}\n  ${s.content}\n\n`; });
    });
    text += `الخاتمة:\n${report.conclusion}\n\n`;
    text += `التوصيات:\n${report.recommendations?.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}\n\n`;
    text += `المراجع:\n${report.references?.map((r: any) => `- ${r.title} (${r.author}, ${r.year})`).join('\n')}`;
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${report.title || 'research'}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(222,84%,5%)] via-[hsl(230,60%,8%)] to-[hsl(222,84%,5%)]" dir="rtl">
      <StarField />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <button onClick={() => navigate('/gju-competition')} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-6">
          <ArrowRight className="w-4 h-4" /><span>العودة للمسابقة</span>
        </button>

        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Badge className="mb-4 bg-rose-500/20 text-rose-300 border-rose-500/30">🆕 أداة جديدة</Badge>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3">
            <Search className="inline w-10 h-10 ml-3 text-rose-400" />
            الباحث الذكي المتقدم
          </h1>
          <p className="text-white/50 text-lg">أدخل موضوعاً بحثياً واحصل على تقرير أكاديمي شامل</p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {!report ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6 space-y-4">
                <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="أدخل موضوع البحث (مثال: تأثير الذكاء الاصطناعي على التعليم)" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-lg h-14" />
                <Select value={researchType} onValueChange={setResearchType}>
                  <SelectTrigger className="w-60 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprehensive">بحث شامل</SelectItem>
                    <SelectItem value="analytical">بحث تحليلي</SelectItem>
                    <SelectItem value="comparative">بحث مقارن</SelectItem>
                    <SelectItem value="descriptive">بحث وصفي</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-gradient-to-l from-rose-600 to-pink-600 h-12 text-lg">
                  {isGenerating ? <Loader2 className="w-5 h-5 animate-spin ml-2" /> : <Search className="w-5 h-5 ml-2" />}
                  {isGenerating ? 'جاري إنشاء البحث...' : 'أنشئ البحث'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Report Header */}
              <Card className="bg-gradient-to-l from-rose-900/20 to-pink-900/20 border-rose-500/20">
                <CardContent className="p-6 text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">{report.title}</h2>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {report.keywords?.map((kw: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-rose-300 border-rose-500/30 text-xs">{kw}</Badge>
                    ))}
                  </div>
                  <Button onClick={exportAsText} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Download className="w-4 h-4 ml-2" />تحميل كملف نصي
                  </Button>
                </CardContent>
              </Card>

              {/* Abstract */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-5">
                  <h3 className="text-white font-bold mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-rose-400" />الملخص</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{report.abstract}</p>
                </CardContent>
              </Card>

              {/* Introduction */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-5">
                  <h3 className="text-white font-bold mb-2">المقدمة</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{report.introduction}</p>
                </CardContent>
              </Card>

              {/* Chapters */}
              {report.chapters?.map((ch: any, i: number) => (
                <Card key={i} className="bg-white/5 border-white/10">
                  <CardContent className="p-5">
                    <button onClick={() => setExpandedChapter(expandedChapter === i ? null : i)} className="w-full flex items-center justify-between text-right">
                      <h3 className="text-white font-bold">الفصل {i + 1}: {ch.title}</h3>
                      {expandedChapter === i ? <ChevronUp className="w-5 h-5 text-white/40" /> : <ChevronDown className="w-5 h-5 text-white/40" />}
                    </button>
                    {expandedChapter === i && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 space-y-3">
                        <p className="text-white/70 text-sm leading-relaxed">{ch.content}</p>
                        {ch.subSections?.map((s: any, j: number) => (
                          <div key={j} className="bg-white/5 rounded-lg p-3 border-r-2 border-rose-500/30">
                            <h4 className="text-white/80 font-semibold text-sm mb-1">{s.title}</h4>
                            <p className="text-white/60 text-xs leading-relaxed">{s.content}</p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Conclusion */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-5">
                  <h3 className="text-white font-bold mb-2">الخاتمة</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{report.conclusion}</p>
                </CardContent>
              </Card>

              {/* References */}
              {report.references?.length > 0 && (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-5">
                    <h3 className="text-white font-bold mb-3">المراجع</h3>
                    {report.references.map((r: any, i: number) => (
                      <p key={i} className="text-white/60 text-xs mb-1">{i + 1}. {r.author} ({r.year}). <em>{r.title}</em></p>
                    ))}
                  </CardContent>
                </Card>
              )}

              <Button onClick={() => { setReport(null); setTopic(''); }} variant="outline" className="border-white/20 text-white hover:bg-white/10">بحث جديد</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIResearchAssistant;
