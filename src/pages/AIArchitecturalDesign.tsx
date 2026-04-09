import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Loader2, Star, Zap, DollarSign, Leaf, Eye, ImageIcon, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const buildingTypes = ['سكني', 'تجاري', 'مكتبي', 'تعليمي', 'صحي', 'صناعي', 'رياضي', 'ثقافي'];
const styles = ['حديث', 'كلاسيكي', 'إسلامي', 'مستدام', 'بسيط (مينيمال)', 'عضوي', 'مستقبلي'];
const climates = ['حار جاف', 'حار رطب', 'معتدل', 'بارد', 'استوائي', 'صحراوي'];
const budgets = ['اقتصادي', 'متوسط', 'فاخر', 'بدون حدود'];

interface Suggestion {
  name: string;
  description: string;
  features: string[];
  materials: string[];
  ratings: { energy: number; efficiency: number; aesthetics: number; cost: number; sustainability: number };
  estimatedCost: string;
  constructionTime: string;
  imagePrompt: string;
}

const RatingStars = ({ value, label, icon: Icon }: { value: number; label: string; icon: any }) => (
  <div className="flex items-center gap-2">
    <Icon className="w-4 h-4 text-cyan-400" />
    <span className="text-white/70 text-sm w-20">{label}</span>
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= Math.round(value) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`} />
      ))}
    </div>
    <span className="text-white/50 text-xs">{value.toFixed(1)}</span>
  </div>
);

const AIArchitecturalDesign = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [generatingImage, setGeneratingImage] = useState<number | null>(null);
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [showImageModal, setShowImageModal] = useState<number | null>(null);
  const isGJUMode = sessionStorage.getItem('gju_mode') === 'true';
  const [form, setForm] = useState({
    buildingType: '',
    area: '',
    style: '',
    climate: '',
    budget: '',
    energyRequirements: '',
  });

  const handleSubmit = async () => {
    if (!form.buildingType || !form.area || !form.style || !form.climate || !form.budget) {
      toast({ title: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setSuggestions([]);
    try {
      const { data, error } = await supabase.functions.invoke('smart-city-ai', {
        body: { action: 'architectural_design', params: form },
      });
      if (error) throw error;
      const result = data?.result;
      if (result?.suggestions) {
        setSuggestions(result.suggestions);
      } else {
        toast({ title: 'لم يتم الحصول على اقتراحات، حاول مرة أخرى', variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'حدث خطأ في الاتصال بالذكاء الاصطناعي', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const generate3DImage = async (suggestion: Suggestion, index: number) => {
    setGeneratingImage(index);
    try {
      const prompt = `Create a stunning photorealistic 3D architectural rendering of: ${suggestion.name}. ${suggestion.description}. Style: modern 3D visualization, dramatic lighting, high detail, professional architectural render. Materials: ${suggestion.materials?.join(', ')}. The building should look impressive and futuristic.`;
      
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=AIzaSyCiB3CDvu2iUSTk29l3KXDEDyXdMajmkeA', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
        })
      });

      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      const imagePart = parts.find((p: any) => p.inlineData);
      
      if (imagePart?.inlineData?.data) {
        const imageUrl = `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
        setGeneratedImages(prev => ({ ...prev, [index]: imageUrl }));
        setShowImageModal(index);
        toast({ title: 'تم إنشاء الصورة ثلاثية الأبعاد بنجاح! ✨' });
      } else {
        toast({ title: 'لم يتم إنشاء الصورة، حاول مرة أخرى', variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'حدث خطأ في توليد الصورة', variant: 'destructive' });
    } finally {
      setGeneratingImage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-950 text-white" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => navigate(isGJUMode ? '/gju-competition' : '/smart-city')} className="flex items-center gap-2 text-white/70 hover:text-white mb-6">
          <ArrowRight className="w-5 h-5" />
          <span>{isGJUMode ? 'العودة لمستقبل التكنولوجيا' : 'العودة لقسم المدينة الذكية'}</span>
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-300 font-semibold text-sm">التصميم المعماري الذكي</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
            صمّم مبناك بالذكاء الاصطناعي
          </h1>
          <p className="text-white/50">أدخل متطلباتك واحصل على 3 اقتراحات تصميمية مع تقييم شامل</p>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-1.5">نوع المبنى *</label>
              <select value={form.buildingType} onChange={e => setForm({ ...form, buildingType: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none">
                <option value="" className="bg-slate-800">اختر نوع المبنى</option>
                {buildingTypes.map(t => <option key={t} value={t} className="bg-slate-800">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5">المساحة (م²) *</label>
              <input type="number" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })}
                placeholder="مثلاً: 500" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:border-cyan-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5">الأسلوب المعماري *</label>
              <select value={form.style} onChange={e => setForm({ ...form, style: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none">
                <option value="" className="bg-slate-800">اختر الأسلوب</option>
                {styles.map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5">المناخ *</label>
              <select value={form.climate} onChange={e => setForm({ ...form, climate: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none">
                <option value="" className="bg-slate-800">اختر المناخ</option>
                {climates.map(c => <option key={c} value={c} className="bg-slate-800">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5">الميزانية *</label>
              <select value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:border-cyan-500 focus:outline-none">
                <option value="" className="bg-slate-800">اختر الميزانية</option>
                {budgets.map(b => <option key={b} value={b} className="bg-slate-800">{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5">متطلبات الطاقة</label>
              <input type="text" value={form.energyRequirements} onChange={e => setForm({ ...form, energyRequirements: e.target.value })}
                placeholder="مثلاً: طاقة شمسية، عزل حراري عالي" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:border-cyan-500 focus:outline-none" />
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSubmit} disabled={loading}
            className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>جاري التحليل...</span></> : <><Building2 className="w-5 h-5" /><span>توليد الاقتراحات</span></>}
          </motion.button>
        </motion.div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {suggestions.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-sm font-bold">{i + 1}</span>
                  <h3 className="text-xl font-bold text-white">{s.name}</h3>
                </div>
                <p className="text-white/60 text-sm mb-4 leading-relaxed">{s.description}</p>

                <div className="space-y-1.5 mb-4">
                  <RatingStars value={s.ratings.energy} label="الطاقة" icon={Zap} />
                  <RatingStars value={s.ratings.efficiency} label="الكفاءة" icon={Building2} />
                  <RatingStars value={s.ratings.aesthetics} label="الجماليات" icon={Eye} />
                  <RatingStars value={s.ratings.cost} label="التكلفة" icon={DollarSign} />
                  <RatingStars value={s.ratings.sustainability} label="الاستدامة" icon={Leaf} />
                </div>

                <div className="mb-3">
                  <h4 className="text-white/80 text-sm font-semibold mb-1">المواد:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {s.materials?.map((m, j) => (
                      <span key={j} className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">{m}</span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between text-xs text-white/40 border-t border-white/10 pt-3">
                  <span>💰 {s.estimatedCost}</span>
                  <span>⏱ {s.constructionTime}</span>
                </div>

                {/* 3D Image Generation Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => generate3DImage(s, i)}
                  disabled={generatingImage === i}
                  className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {generatingImage === i ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>جاري التوليد...</span></>
                  ) : (
                    <><Eye className="w-4 h-4" /><span>إنشاء صورة ثلاثية الأبعاد</span></>
                  )}
                </motion.button>

                {generatedImages[i] && (
                  <button onClick={() => setShowImageModal(i)} className="mt-2 w-full text-center text-xs text-purple-300 hover:text-purple-200 underline">
                    عرض الصورة المولّدة
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Image Modal */}
        {showImageModal !== null && generatedImages[showImageModal] && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowImageModal(null)}>
            <div className="relative max-w-3xl w-full bg-slate-900 rounded-2xl border border-white/10 p-4" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowImageModal(null)} className="absolute top-3 left-3 text-white/70 hover:text-white">
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-lg font-bold text-white mb-3">صورة التصميم ثلاثية الأبعاد</h3>
              <img src={generatedImages[showImageModal]} alt="3D Design" className="w-full rounded-xl" />
              <a href={generatedImages[showImageModal]} download={`3d-design-${showImageModal}.png`}
                className="mt-3 inline-block px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm hover:bg-cyan-600">
                تحميل الصورة
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIArchitecturalDesign;
