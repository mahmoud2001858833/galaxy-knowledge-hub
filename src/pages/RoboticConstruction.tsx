import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bot, Send, Loader2, Printer, Cpu, Wrench, Clock, DollarSign, Shield, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const comparisonData = [
  { aspect: 'السرعة', traditional: 'بطيئة - أشهر إلى سنوات', robotic: 'سريعة - أيام إلى أسابيع', icon: Clock },
  { aspect: 'التكلفة', traditional: 'مرتفعة - عمالة كثيفة', robotic: 'أقل بـ 30-60%', icon: DollarSign },
  { aspect: 'الدقة', traditional: 'تعتمد على المهارة البشرية', robotic: 'دقة ميليمترية', icon: Cpu },
  { aspect: 'الهدر', traditional: 'هدر مواد 15-25%', robotic: 'هدر أقل من 5%', icon: Wrench },
  { aspect: 'السلامة', traditional: 'مخاطر عالية', robotic: 'مخاطر منخفضة جداً', icon: Shield },
  { aspect: 'الأشكال', traditional: 'محدودة بالتقنيات التقليدية', robotic: 'أشكال غير محدودة', icon: Lightbulb },
];

const techSections = [
  {
    title: 'الطباعة ثلاثية الأبعاد في البناء',
    icon: Printer,
    description: 'تقنية تستخدم طابعات عملاقة لبناء هياكل كاملة طبقة بطبقة باستخدام الخرسانة أو مواد مركبة.',
    points: ['بناء منزل كامل في 24 ساعة', 'تقليل الهدر بنسبة 95%', 'أشكال عضوية مستحيلة يدوياً', 'تكلفة أقل بـ 50%'],
  },
  {
    title: 'تقنيات CAD/CAM',
    icon: Cpu,
    description: 'أنظمة التصميم والتصنيع بمساعدة الحاسوب التي تربط بين التصميم الرقمي والتنفيذ الآلي.',
    points: ['تصميم ثلاثي الأبعاد تفاعلي', 'محاكاة هيكلية قبل البناء', 'تحويل التصاميم لأوامر روبوتية', 'كشف الأخطاء مبكراً'],
  },
  {
    title: 'روبوتات التركيب والتجميع',
    icon: Bot,
    description: 'روبوتات متخصصة في تركيب العناصر الإنشائية بدقة عالية وسرعة فائقة.',
    points: ['تركيب الطوب بدقة ميليمترية', 'لحام الهياكل المعدنية', 'تثبيت الألواح الشمسية', 'عمل مستمر 24/7'],
  },
];

const RoboticConstruction = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer('');
    try {
      const { data, error } = await supabase.functions.invoke('smart-city-ai', {
        body: { action: 'robotic_info', params: { question: question.trim() } },
      });
      if (error) throw error;
      setAnswer(typeof data?.result === 'string' ? data.result : JSON.stringify(data?.result));
    } catch {
      toast({ title: 'حدث خطأ، حاول مرة أخرى', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => {
          const isGJU = sessionStorage.getItem('gju_mode') === 'true';
          navigate(isGJU ? '/gju-competition' : '/smart-city');
        }} className="flex items-center gap-2 text-white/70 hover:text-white mb-6">
          <ArrowRight className="w-5 h-5" /><span>{sessionStorage.getItem('gju_mode') === 'true' ? 'العودة لمستقبل التكنولوجيا' : 'العودة لقسم المدينة الذكية'}</span>
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30">
            <Bot className="w-5 h-5 text-blue-400" />
            <span className="text-blue-300 font-semibold text-sm">روبوت البناء التفاعلي</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
            مستقبل البناء الروبوتي
          </h1>
        </motion.div>

        {/* Tech Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {techSections.map((sec, i) => {
            const Icon = sec.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-blue-500/20"><Icon className="w-6 h-6 text-blue-400" /></div>
                  <h3 className="text-lg font-bold">{sec.title}</h3>
                </div>
                <p className="text-white/60 text-sm mb-3">{sec.description}</p>
                <ul className="space-y-1.5">
                  {sec.points.map((p, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-white/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />{p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">مقارنة: البناء التقليدي vs الروبوتي</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-3 px-4 text-right text-white/50">المعيار</th>
                  <th className="py-3 px-4 text-center text-orange-400">التقليدي</th>
                  <th className="py-3 px-4 text-center text-cyan-400">الروبوتي</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, i) => {
                  const Icon = row.icon;
                  return (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-3 px-4 flex items-center gap-2"><Icon className="w-4 h-4 text-blue-400" />{row.aspect}</td>
                      <td className="py-3 px-4 text-center text-white/60">{row.traditional}</td>
                      <td className="py-3 px-4 text-center text-cyan-300">{row.robotic}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* AI Assistant */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-400" />المساعد الذكي للبناء الروبوتي
          </h2>
          <p className="text-white/50 text-sm mb-4">اسأل أي سؤال عن تقنيات البناء الروبوتي والطباعة ثلاثية الأبعاد</p>
          <div className="flex gap-3">
            <input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && askQuestion()}
              placeholder="مثلاً: كيف تعمل الطباعة ثلاثية الأبعاد في البناء؟"
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-blue-500 focus:outline-none" />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={askQuestion} disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold flex items-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </motion.button>
          </div>
          {answer && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-white/80 leading-relaxed whitespace-pre-wrap text-sm">
              {answer}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RoboticConstruction;
