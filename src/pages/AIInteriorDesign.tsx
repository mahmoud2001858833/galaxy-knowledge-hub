import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Palette, Loader2, Sun, Moon, Sofa, Lightbulb, Droplets, Eye, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const roomTypes = ['غرفة معيشة', 'غرفة نوم', 'مطبخ', 'حمام', 'مكتب', 'غرفة طعام', 'مدخل', 'شرفة'];
const designStyles = ['حديث', 'كلاسيكي', 'إسكندنافي', 'بوهيمي', 'صناعي', 'ياباني', 'عربي تقليدي', 'آرت ديكو'];
const budgetOptions = ['اقتصادي', 'متوسط', 'فاخر'];
const activities = ['استرخاء', 'عمل', 'ترفيه', 'دراسة', 'عائلي', 'رومانسي'];

interface DesignResult {
  colorPalette: { primary: string; secondary: string; accent: string; neutral: string; description: string };
  furniture: { name: string; description: string; material: string; estimatedPrice: string }[];
  lighting: { type: string; description: string; tips: string[] };
  spaceOptimization: string[];
  moodDescription: string;
}

const AIInteriorDesign = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [design, setDesign] = useState<DesignResult | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'night'>('day');
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const isGJUMode = sessionStorage.getItem('gju_mode') === 'true';
  const [form, setForm] = useState({
    roomType: '', area: '', style: '', budget: '', activity: '',
  });

  const handleSubmit = async () => {
    if (!form.roomType || !form.area || !form.style || !form.budget) {
      toast({ title: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setDesign(null);
    try {
      const { data, error } = await supabase.functions.invoke('smart-city-ai', {
        body: {
          action: 'interior_design',
          params: { ...form, timeOfDay: timeOfDay === 'day' ? 'نهاري' : 'ليلي', activity: form.activity || 'عام' },
        },
      });
      if (error) throw error;
      const result = data?.result?.design || data?.result;
      if (result?.colorPalette) {
        setDesign(result);
      } else {
        toast({ title: 'لم يتم الحصول على نتائج، حاول مرة أخرى', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'حدث خطأ في الاتصال بالذكاء الاصطناعي', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen text-white transition-colors duration-700 ${timeOfDay === 'day' ? 'bg-gradient-to-br from-blue-950 via-slate-900 to-purple-950' : 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900'}`} dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => navigate(isGJUMode ? '/gju-competition' : '/smart-city')} className="flex items-center gap-2 text-white/70 hover:text-white mb-6">
          <ArrowRight className="w-5 h-5" /><span>{isGJUMode ? 'العودة لمستقبل التكنولوجيا' : 'العودة لقسم المدينة الذكية'}</span>
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30">
            <Palette className="w-5 h-5 text-purple-400" />
            <span className="text-purple-300 font-semibold text-sm">التصميم الداخلي التفاعلي</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
            صمّم مساحتك بالذكاء الاصطناعي
          </h1>
        </motion.div>

        {/* Day/Night Toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white/10 rounded-full p-1 border border-white/10">
            <button onClick={() => setTimeOfDay('day')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all ${timeOfDay === 'day' ? 'bg-yellow-500/30 text-yellow-300' : 'text-white/50'}`}>
              <Sun className="w-4 h-4" /><span className="text-sm">نهاري</span>
            </button>
            <button onClick={() => setTimeOfDay('night')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all ${timeOfDay === 'night' ? 'bg-indigo-500/30 text-indigo-300' : 'text-white/50'}`}>
              <Moon className="w-4 h-4" /><span className="text-sm">ليلي</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/70 text-sm mb-1.5">نوع الغرفة *</label>
              <select value={form.roomType} onChange={e => setForm({ ...form, roomType: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none">
                <option value="" className="bg-slate-800">اختر نوع الغرفة</option>
                {roomTypes.map(r => <option key={r} value={r} className="bg-slate-800">{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5">المساحة (م²) *</label>
              <input type="number" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })}
                placeholder="مثلاً: 25" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:border-purple-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5">الأسلوب *</label>
              <select value={form.style} onChange={e => setForm({ ...form, style: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none">
                <option value="" className="bg-slate-800">اختر الأسلوب</option>
                {designStyles.map(s => <option key={s} value={s} className="bg-slate-800">{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5">الميزانية *</label>
              <select value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none">
                <option value="" className="bg-slate-800">اختر الميزانية</option>
                {budgetOptions.map(b => <option key={b} value={b} className="bg-slate-800">{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-white/70 text-sm mb-1.5">النشاط</label>
              <select value={form.activity} onChange={e => setForm({ ...form, activity: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none">
                <option value="" className="bg-slate-800">اختر النشاط</option>
                {activities.map(a => <option key={a} value={a} className="bg-slate-800">{a}</option>)}
              </select>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSubmit} disabled={loading}
            className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>جاري التصميم...</span></> : <><Palette className="w-5 h-5" /><span>توليد التصميم</span></>}
          </motion.button>
        </motion.div>

        {/* Design Results */}
        {design && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Color Palette */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Droplets className="w-5 h-5 text-purple-400" />لوحة الألوان</h2>
              <div className="flex flex-wrap gap-4 mb-3">
                {[
                  { label: 'أساسي', color: design.colorPalette.primary },
                  { label: 'ثانوي', color: design.colorPalette.secondary },
                  { label: 'مميز', color: design.colorPalette.accent },
                  { label: 'محايد', color: design.colorPalette.neutral },
                ].map((c, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-16 h-16 rounded-xl border-2 border-white/20 shadow-lg" style={{ backgroundColor: c.color }} />
                    <span className="text-xs text-white/60">{c.label}</span>
                    <span className="text-xs text-white/40">{c.color}</span>
                  </div>
                ))}
              </div>
              <p className="text-white/60 text-sm">{design.colorPalette.description}</p>
            </div>

            {/* Furniture */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Sofa className="w-5 h-5 text-purple-400" />الأثاث المقترح</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {design.furniture?.map((f, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <h4 className="font-semibold text-white mb-1">{f.name}</h4>
                    <p className="text-white/50 text-sm mb-1">{f.description}</p>
                    <div className="flex justify-between text-xs text-white/40">
                      <span>المادة: {f.material}</span>
                      <span>💰 {f.estimatedPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lighting */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-yellow-400" />الإضاءة</h2>
              <p className="text-white/70 text-sm mb-2"><strong>النوع:</strong> {design.lighting?.type}</p>
              <p className="text-white/60 text-sm mb-3">{design.lighting?.description}</p>
              <ul className="space-y-1">
                {design.lighting?.tips?.map((t, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />{t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mood */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-3">🎨 الأجواء العامة</h2>
              <p className="text-white/70 leading-relaxed">{design.moodDescription}</p>
            </div>

            {/* 3D Image Generation */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Eye className="w-5 h-5 text-pink-400" />صورة ثلاثية الأبعاد للتصميم</h2>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={async () => {
                  setGeneratingImage(true);
                  try {
                    const prompt = `Create a stunning photorealistic 3D interior design rendering of a ${form.roomType} room. Style: ${form.style}. The room should have ${design.colorPalette.description}. Include furniture: ${design.furniture?.map(f => f.name).join(', ')}. Lighting: ${design.lighting?.type}. Mood: ${design.moodDescription}. Professional architectural visualization, dramatic lighting, ultra detailed, cinematic quality.`;
                    
                    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        model: 'google/gemini-2.5-flash-image',
                        messages: [{ role: 'user', content: prompt }],
                        modalities: ['image', 'text']
                      })
                    });

                    const data = await response.json();
                    const imageUrl = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
                    
                    if (imageUrl) {
                      setGeneratedImage(imageUrl);
                      setShowImageModal(true);
                      toast({ title: 'تم إنشاء الصورة ثلاثية الأبعاد بنجاح! ✨' });
                    } else {
                      toast({ title: 'لم يتم إنشاء الصورة، حاول مرة أخرى', variant: 'destructive' });
                    }
                  } catch (err) {
                    console.error(err);
                    toast({ title: 'حدث خطأ في توليد الصورة', variant: 'destructive' });
                  } finally {
                    setGeneratingImage(false);
                  }
                }}
                disabled={generatingImage}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generatingImage ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /><span>جاري التوليد...</span></>
                ) : (
                  <><Eye className="w-5 h-5" /><span>إنشاء صورة ثلاثية الأبعاد للتصميم</span></>
                )}
              </motion.button>

              {generatedImage && (
                <button onClick={() => setShowImageModal(true)} className="mt-2 w-full text-center text-sm text-purple-300 hover:text-purple-200 underline">
                  عرض الصورة المولّدة
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Image Modal */}
        {showImageModal && generatedImage && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowImageModal(false)}>
            <div className="relative max-w-3xl w-full bg-slate-900 rounded-2xl border border-white/10 p-4" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowImageModal(false)} className="absolute top-3 left-3 text-white/70 hover:text-white">
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-lg font-bold text-white mb-3">صورة التصميم الداخلي ثلاثية الأبعاد</h3>
              <img src={generatedImage} alt="3D Interior Design" className="w-full rounded-xl" />
              <a href={generatedImage} download="3d-interior-design.png"
                className="mt-3 inline-block px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600">
                تحميل الصورة
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInteriorDesign;
