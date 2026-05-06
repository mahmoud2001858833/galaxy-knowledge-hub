import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Image as ImageIcon, Video, Volume2, Loader2, Eye, Ear, Hand, Sparkles, Play, Pause, Vibrate, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PROFILE_KEY, type SensoryProfile } from './SensoryProfileSetup';

interface Result {
  summary?: string;
  simplifiedText?: string;
  narration?: string;
  visualDescription?: string;
  keyPoints?: string[];
  signKeywords?: string[];
  pecsCards?: { label: string; emoji: string }[];
  rhythm?: string;
  braille?: string;
  vibration?: number[];
}

const VISION_LABELS: Record<string, string> = {
  normal: 'بصر طبيعي', total_blind: 'كفيف كلي', partial_blind: 'كفيف جزئي',
  low_vision: 'ضعف نظر', color_blind: 'عمى ألوان', photosensitive: 'حساسية للضوء',
};
const HEARING_LABELS: Record<string, string> = {
  normal: 'سمع طبيعي', deaf: 'أصم', hard_of_hearing: 'ضعف سمع', cochlear: 'زراعة قوقعة',
};
const MOTOR_LABELS: Record<string, string> = {
  mouse: 'فأرة/لمس', eye_tracking: 'تتبّع العين', voice: 'أوامر صوتية', switch: 'مفتاح واحد',
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result as string;
      resolve(s.split(',')[1] ?? s);
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const SensoryUpload: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<SensoryProfile | null>(null);
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) { navigate('/damij/sensory/profile', { replace: true }); return; }
      setProfile(JSON.parse(raw));
    } catch {
      navigate('/damij/sensory/profile', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async () => {
    if (!text && !file) {
      toast.error('أدخل نصاً أو ارفع ملفاً');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const payload: any = { profile };
      if (text.trim()) payload.text = text.trim();
      if (file) {
        if (file.size > 15 * 1024 * 1024) {
          toast.error('حجم الملف كبير جداً (الحد 15MB)');
          setLoading(false);
          return;
        }
        payload.fileBase64 = await fileToBase64(file);
        payload.mimeType = file.type;
      }
      const { data, error } = await supabase.functions.invoke('sensory-bridge-transform', { body: payload });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast.success('تم التحويل الحسّي بنجاح');
    } catch (e: any) {
      toast.error(e.message || 'فشل التحويل');
    } finally {
      setLoading(false);
    }
  };

  const speak = (txt: string) => {
    if (!txt) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = 'ar-SA';
    u.rate = profile.cognitive === 'autism' ? 0.85 : 1;
    u.onend = () => setSpeaking(false);
    setSpeaking(true);
    speechSynthesis.speak(u);
  };

  const stopSpeak = () => { speechSynthesis.cancel(); setSpeaking(false); };

  const vibrate = () => {
    if (!result?.vibration) return;
    if ('vibrate' in navigator) {
      (navigator as any).vibrate(result.vibration);
      toast.success('بدأ الاهتزاز الإيقاعي');
    } else {
      toast.error('الاهتزاز غير مدعوم على هذا الجهاز');
    }
  };

  if (!profile) return null;

  return (
    <div className="px-6 pt-12 pb-16 max-w-6xl mx-auto" dir="rtl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--damij-accent))]/20 text-[hsl(var(--damij-primary))] mb-3">
          <Sparkles className="w-4 h-4" /><span className="text-sm font-bold">الجسر الحسّي العكسي الذكي</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[hsl(var(--damij-primary))]">حوّل أي محتوى إلى تجربة متعددة الحواس</h1>
        <p className="text-[hsl(var(--damij-text))]/70 mt-2">نص، صورة، صوت، أو فيديو → نطق + بريل + إشارة + اهتزاز + بطاقات بصرية</p>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-lg border border-[hsl(var(--damij-primary))]/10 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg text-[hsl(var(--damij-primary))]">ملفك الحسّي</h2>
          <button onClick={() => navigate('/damij/sensory/profile')} className="inline-flex items-center gap-1 text-sm text-[hsl(var(--damij-primary))] hover:underline">
            <Settings className="w-4 h-4" /> تعديل
          </button>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-[hsl(var(--damij-surface))] flex items-center gap-2">
            <Eye className="w-5 h-5 text-[hsl(var(--damij-accent-2))]" />
            <div><div className="text-xs text-[hsl(var(--damij-text))]/60">البصر</div><div className="font-bold text-[hsl(var(--damij-primary))]">{VISION_LABELS[profile.vision]}</div></div>
          </div>
          <div className="p-3 rounded-xl bg-[hsl(var(--damij-surface))] flex items-center gap-2">
            <Ear className="w-5 h-5 text-[hsl(var(--damij-accent-2))]" />
            <div><div className="text-xs text-[hsl(var(--damij-text))]/60">السمع</div><div className="font-bold text-[hsl(var(--damij-primary))]">{HEARING_LABELS[profile.hearing]}</div></div>
          </div>
          <div className="p-3 rounded-xl bg-[hsl(var(--damij-surface))] flex items-center gap-2">
            <Hand className="w-5 h-5 text-[hsl(var(--damij-accent-2))]" />
            <div><div className="text-xs text-[hsl(var(--damij-text))]/60">التحكّم</div><div className="font-bold text-[hsl(var(--damij-primary))]">{MOTOR_LABELS[profile.motor]}</div></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-lg border border-[hsl(var(--damij-primary))]/10 mb-6">
        <h2 className="font-bold text-lg text-[hsl(var(--damij-primary))] mb-4">2) أدخل المحتوى التعليمي</h2>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder="ألصق نصاً تعليمياً هنا..."
          className="w-full p-4 rounded-2xl border-2 border-[hsl(var(--damij-primary))]/20 focus:border-[hsl(var(--damij-primary))] outline-none mb-4 resize-none" />
        <label className="block w-full p-8 rounded-3xl border-2 border-dashed border-[hsl(var(--damij-primary))]/40 bg-[hsl(var(--damij-surface))]/40 text-center cursor-pointer hover:bg-[hsl(var(--damij-primary))]/5">
          <Upload className="w-10 h-10 mx-auto mb-2 text-[hsl(var(--damij-primary))]" />
          <span className="font-bold text-[hsl(var(--damij-primary))]">{file ? file.name : 'أو ارفع ملفاً (صورة / صوت / فيديو)'}</span>
          <div className="flex justify-center gap-5 mt-3 text-xs text-[hsl(var(--damij-text))]/60">
            <span><FileText className="inline w-4 h-4" /> نص</span>
            <span><ImageIcon className="inline w-4 h-4" /> صورة</span>
            <span><Volume2 className="inline w-4 h-4" /> صوت</span>
            <span><Video className="inline w-4 h-4" /> فيديو</span>
          </div>
          <input ref={inputRef} type="file" accept="image/*,audio/*,video/*,application/pdf,text/*" className="hidden"
            onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>

      <div className="text-center mb-8">
        <button onClick={handleSubmit} disabled={loading}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[hsl(var(--damij-primary))] text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 disabled:opacity-60">
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
          {loading ? 'جارٍ التحويل الحسّي...' : 'حوّل عبر الجسر الحسّي'}
        </button>
      </div>

      {result && (
        <div className="space-y-5">
          {result.summary && (
            <section className="bg-white rounded-2xl p-5 shadow border border-[hsl(var(--damij-primary))]/10">
              <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-2 flex items-center gap-2"><Sparkles className="w-5 h-5" /> الملخّص</h3>
              <p className="text-[hsl(var(--damij-text))] leading-relaxed">{result.summary}</p>
            </section>
          )}

          {result.simplifiedText && (
            <section className="bg-white rounded-2xl p-5 shadow border border-[hsl(var(--damij-primary))]/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[hsl(var(--damij-primary))] flex items-center gap-2"><FileText className="w-5 h-5" /> النصّ المبسّط (للقراءة الصوتية)</h3>
                <button onClick={() => speaking ? stopSpeak() : speak(result.narration || result.simplifiedText || '')}
                  className="px-4 py-2 rounded-xl bg-[hsl(var(--damij-accent-2))] text-white font-semibold flex items-center gap-2">
                  {speaking ? <><Pause className="w-4 h-4" /> إيقاف</> : <><Play className="w-4 h-4" /> استمع</>}
                </button>
              </div>
              <p className="text-[hsl(var(--damij-text))] leading-loose whitespace-pre-wrap">{result.simplifiedText}</p>
            </section>
          )}

          {result.keyPoints && result.keyPoints.length > 0 && (
            <section className="bg-white rounded-2xl p-5 shadow border border-[hsl(var(--damij-primary))]/10">
              <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-3">النقاط الرئيسية</h3>
              <ul className="space-y-2">
                {result.keyPoints.map((p, i) => (
                  <li key={i} className="flex gap-3 p-3 rounded-xl bg-[hsl(var(--damij-surface))]">
                    <span className="font-bold text-[hsl(var(--damij-primary))]">{i + 1}.</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {result.visualDescription && (
            <section className="bg-white rounded-2xl p-5 shadow border border-[hsl(var(--damij-primary))]/10">
              <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-2 flex items-center gap-2"><Eye className="w-5 h-5" /> الوصف البصري (للكفيف)</h3>
              <p className="text-[hsl(var(--damij-text))] leading-relaxed">{result.visualDescription}</p>
              <button onClick={() => speak(result.visualDescription!)} className="mt-3 px-4 py-2 rounded-xl bg-[hsl(var(--damij-primary))] text-white text-sm font-semibold">استمع للوصف</button>
            </section>
          )}

          {result.braille && (
            <section className="bg-white rounded-2xl p-5 shadow border border-[hsl(var(--damij-primary))]/10">
              <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-2 flex items-center gap-2"><Hand className="w-5 h-5" /> النصّ بالبريل</h3>
              <div className="text-3xl leading-loose p-4 rounded-xl bg-[hsl(var(--damij-surface))] break-words" dir="ltr">{result.braille}</div>
            </section>
          )}

          {result.signKeywords && result.signKeywords.length > 0 && (
            <section className="bg-white rounded-2xl p-5 shadow border border-[hsl(var(--damij-primary))]/10">
              <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-3 flex items-center gap-2"><Ear className="w-5 h-5" /> كلمات مفتاحية بالإشارة (للأصم)</h3>
              <div className="flex flex-wrap gap-2">
                {result.signKeywords.map((k, i) => (
                  <span key={i} className="px-4 py-2 rounded-full bg-[hsl(var(--damij-accent))]/30 text-[hsl(var(--damij-primary))] font-semibold">{k}</span>
                ))}
              </div>
            </section>
          )}

          {result.pecsCards && result.pecsCards.length > 0 && (
            <section className="bg-white rounded-2xl p-5 shadow border border-[hsl(var(--damij-primary))]/10">
              <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-3">بطاقات PECS البصرية</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {result.pecsCards.map((c, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-gradient-to-br from-[hsl(var(--damij-accent))]/30 to-[hsl(var(--damij-primary))]/10 text-center">
                    <div className="text-5xl mb-2">{c.emoji}</div>
                    <div className="font-semibold text-sm text-[hsl(var(--damij-primary))]">{c.label}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {result.vibration && (
            <section className="bg-white rounded-2xl p-5 shadow border border-[hsl(var(--damij-primary))]/10 text-center">
              <h3 className="font-bold text-[hsl(var(--damij-primary))] mb-2 flex items-center justify-center gap-2"><Vibrate className="w-5 h-5" /> الاهتزاز الإيقاعي</h3>
              {result.rhythm && <p className="text-sm text-[hsl(var(--damij-text))]/70 mb-3">النمط: {result.rhythm}</p>}
              <button onClick={vibrate} className="px-6 py-3 rounded-xl bg-[hsl(var(--damij-accent-2))] text-white font-bold">شغّل الاهتزاز</button>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default SensoryUpload;
