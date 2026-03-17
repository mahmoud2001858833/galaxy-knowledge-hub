import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Languages, ArrowRight, Loader2, Volume2, ArrowLeftRight, BookOpen, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import StarField from '@/components/StarField';

const langs = [
  { code: 'ar', name: 'العربية' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'tr', name: 'Türkçe' },
];

const AISmartTranslator = () => {
  const [text, setText] = useState('');
  const [sourceLang, setSourceLang] = useState('ar');
  const [targetLang, setTargetLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleTranslate = async () => {
    if (!text.trim()) { toast({ title: 'أدخل نصاً للترجمة', variant: 'destructive' }); return; }
    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-smart-translator', {
        body: { text, sourceLang, targetLang, mode: 'translate', uiLanguage: 'ar' }
      });
      if (error) throw error;
      setResult(data);
    } catch { toast({ title: 'حدث خطأ', variant: 'destructive' }); }
    finally { setIsTranslating(false); }
  };

  const speak = (t: string, lang: string) => {
    const u = new SpeechSynthesisUtterance(t);
    u.lang = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : lang === 'de' ? 'de-DE' : lang === 'tr' ? 'tr-TR' : 'en-US';
    speechSynthesis.speak(u);
  };

  const swapLangs = () => { setSourceLang(targetLang); setTargetLang(sourceLang); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(222,84%,5%)] via-[hsl(230,60%,8%)] to-[hsl(222,84%,5%)]" dir="rtl">
      <StarField />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <button onClick={() => navigate('/gju-competition')} className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm mb-6">
          <ArrowRight className="w-4 h-4" /><span>العودة للمسابقة</span>
        </button>

        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Badge className="mb-4 bg-cyan-500/20 text-cyan-300 border-cyan-500/30">🆕 أداة جديدة</Badge>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3">
            <Languages className="inline w-10 h-10 ml-3 text-cyan-400" />
            المترجم الفوري الذكي
          </h1>
          <p className="text-white/50 text-lg">ترجمة فورية متعددة اللغات مع تحليل لغوي ونطق صوتي</p>
        </motion.div>

        <div className="max-w-5xl mx-auto space-y-6">
          {/* Language Selector */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 flex items-center gap-4 justify-center flex-wrap">
              <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>{langs.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={swapLangs} className="text-white/50 hover:text-white">
                <ArrowLeftRight className="w-5 h-5" />
              </Button>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>{langs.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}</SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-sm">{langs.find(l => l.code === sourceLang)?.name}</span>
                  <Button variant="ghost" size="sm" onClick={() => speak(text, sourceLang)} className="text-white/40"><Volume2 className="w-4 h-4" /></Button>
                </div>
                <Textarea value={text} onChange={e => setText(e.target.value)} placeholder="اكتب النص هنا..." className="min-h-[180px] bg-transparent border-0 text-white placeholder:text-white/20 resize-none text-lg" dir={sourceLang === 'ar' ? 'rtl' : 'ltr'} />
                <Button onClick={handleTranslate} disabled={isTranslating} className="w-full bg-gradient-to-l from-cyan-600 to-blue-600">
                  {isTranslating ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Languages className="w-4 h-4 ml-2" />}
                  {isTranslating ? 'جاري الترجمة...' : 'ترجم الآن'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-sm">{langs.find(l => l.code === targetLang)?.name}</span>
                  {result?.translation && <Button variant="ghost" size="sm" onClick={() => speak(result.translation, targetLang)} className="text-white/40"><Volume2 className="w-4 h-4" /></Button>}
                </div>
                <div className="min-h-[180px] text-white/80 text-lg leading-relaxed" dir={targetLang === 'ar' ? 'rtl' : 'ltr'}>
                  {result?.translation || <span className="text-white/20">الترجمة ستظهر هنا...</span>}
                </div>
                {result?.alternativeTranslation && (
                  <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <span className="text-white/40 text-xs">ترجمة بديلة: </span>
                    <span className="text-white/60 text-sm">{result.alternativeTranslation}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Analysis */}
          {result && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.grammarAnalysis && (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4 text-cyan-400" />تحليل نحوي</h3>
                    <p className="text-white/60 text-xs leading-relaxed">{result.grammarAnalysis}</p>
                  </CardContent>
                </Card>
              )}
              {result.keyVocabulary?.length > 0 && (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-2 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-emerald-400" />مفردات</h3>
                    {result.keyVocabulary.slice(0, 4).map((v: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-white/5 last:border-0">
                        <span className="text-white/70">{v.word}</span>
                        <span className="text-white/40">{v.pronunciation}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              {result.tips?.length > 0 && (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <h3 className="text-white font-semibold text-sm mb-2">💡 نصائح</h3>
                    {result.tips.map((t: string, i: number) => (
                      <p key={i} className="text-white/60 text-xs mb-1">• {t}</p>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISmartTranslator;
