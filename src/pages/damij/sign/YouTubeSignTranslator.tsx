import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Youtube, Loader2, Languages, Hand, Volume2, VolumeX, Play, AlertCircle,
  Sparkles, ListVideo, Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SIGN_SYSTEMS, SIGN_SYSTEM_PRIMARY_LANG } from '@/features/sign-language/signSystems';
import HandSignCard from '@/features/sign-language/HandSignCard';
import type { Movement } from '@/features/sign-language/handshapes';

declare global {
  interface Window { YT: any; onYouTubeIframeAPIReady: () => void; }
}

interface Segment { start: number; dur: number; text: string }
interface SignWord { word: string; handshape_id?: string; movement?: string; two_handed?: boolean; desc?: string; known?: boolean }
interface SignsPayload { lines: { i: number; signs: SignWord[] }[] }

const loadYTApi = () => new Promise<void>((resolve) => {
  if (window.YT?.Player) return resolve();
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.body.appendChild(tag);
  window.onYouTubeIframeAPIReady = () => resolve();
});

const fmt = (s: number) => {
  const m = Math.floor(s / 60); const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
};

const YouTubeSignTranslator: React.FC = () => {
  const [url, setUrl] = useState('');
  const [targetLang, setTargetLang] = useState('ar-SA');
  const [signSystem, setSignSystem] = useState('ArSL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [signs, setSigns] = useState<SignsPayload | null>(null);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [muteVideo, setMuteVideo] = useState(true);
  const [speakSigns, setSpeakSigns] = useState(true);
  const [now, setNow] = useState(0);

  const playerRef = useRef<any>(null);
  const tickRef = useRef<number | null>(null);
  const lastSpokenRef = useRef<number>(-1);
  const captionsListRef = useRef<HTMLDivElement>(null);

  // Build active index from current time
  useEffect(() => {
    if (!segments.length) return;
    let lo = 0, hi = segments.length - 1, found = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const s = segments[mid];
      if (now < s.start) hi = mid - 1;
      else if (now >= s.start + s.dur + 0.2) lo = mid + 1;
      else { found = mid; break; }
    }
    if (found === -1) {
      // pick the most recent past segment
      for (let i = segments.length - 1; i >= 0; i--) if (segments[i].start <= now) { found = i; break; }
    }
    if (found !== activeIdx) setActiveIdx(found);
  }, [now, segments, activeIdx]);

  // Speak sign translation when active changes
  useEffect(() => {
    if (activeIdx < 0 || !speakSigns) return;
    if (lastSpokenRef.current === activeIdx) return;
    lastSpokenRef.current = activeIdx;
    const text = segments[activeIdx]?.text;
    if (!text || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = targetLang === 'ar' ? 'ar-SA' : targetLang;
      u.rate = 1.0;
      window.speechSynthesis.speak(u);
    } catch {}
    // auto scroll caption
    const el = captionsListRef.current?.querySelector(`[data-i="${activeIdx}"]`) as HTMLElement | null;
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeIdx, segments, speakSigns, targetLang]);

  // Mount YouTube player when videoId set
  useEffect(() => {
    if (!videoId) return;
    let destroyed = false;
    (async () => {
      await loadYTApi();
      if (destroyed) return;
      playerRef.current?.destroy?.();
      playerRef.current = new window.YT.Player('yt-player', {
        videoId,
        playerVars: { autoplay: 1, mute: muteVideo ? 1 : 0, rel: 0, modestbranding: 1, cc_load_policy: 0 },
        events: {
          onReady: (e: any) => {
            if (muteVideo) e.target.mute(); else e.target.unMute();
            tickRef.current = window.setInterval(() => {
              try { setNow(playerRef.current.getCurrentTime() || 0); } catch {}
            }, 200);
          },
        },
      });
    })();
    return () => {
      destroyed = true;
      if (tickRef.current) window.clearInterval(tickRef.current);
      playerRef.current?.destroy?.();
      window.speechSynthesis?.cancel?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // Toggle mute live
  useEffect(() => {
    try { muteVideo ? playerRef.current?.mute?.() : playerRef.current?.unMute?.(); } catch {}
  }, [muteVideo]);

  const submit = async () => {
    if (!url.trim()) { toast.error('أدخل رابط فيديو يوتيوب'); return; }
    setLoading(true); setError(null); setSegments([]); setSigns(null); setActiveIdx(-1);
    setVideoId(null); lastSpokenRef.current = -1;
    try {
      const { data, error } = await supabase.functions.invoke('damij-youtube-sign', {
        body: { url, targetLang, signSystem, buildSigns: true, preferredLang: targetLang },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setSegments(data.segments || []);
      setSigns(data.signs || null);
      setVideoId(data.videoId);
      toast.success(`تم تحميل ${data.segments?.length || 0} مقطع ترجمة`);
    } catch (e: any) {
      const msg = e?.message || 'فشل تحميل الترجمة';
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  const activeSigns = useMemo(() => {
    if (!signs || activeIdx < 0) return [];
    return signs.lines.find(l => l.i === activeIdx)?.signs || [];
  }, [signs, activeIdx]);

  const seek = (t: number) => { try { playerRef.current?.seekTo?.(t, true); playerRef.current?.playVideo?.(); } catch {} };

  return (
    <div className="px-4 md:px-6 pt-8 pb-16 max-w-7xl mx-auto" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[hsl(var(--damij-primary))] flex items-center gap-3">
          <Youtube className="w-9 h-9 text-red-600" /> مترجم يوتيوب إلى لغة الإشارة
        </h1>
        <p className="text-[hsl(var(--damij-text))]/70 mt-2 max-w-3xl">
          ألصق رابط فيديو يوتيوب، اختر اللغة ونظام الإشارة، وسنشغّل الفيديو مع ترجمة فورية إلى نص ولغة إشارة متزامنة لحظة بلحظة.
        </p>
      </div>

      {/* Controls */}
      <div className="rounded-3xl bg-white border border-[hsl(var(--damij-primary))]/15 shadow-sm p-4 md:p-5 mb-6">
        <div className="grid md:grid-cols-12 gap-3">
          <div className="md:col-span-6">
            <label className="text-xs font-bold text-[hsl(var(--damij-text))]/70 mb-1 block">رابط يوتيوب</label>
            <input
              dir="ltr"
              value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full h-11 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:border-[hsl(var(--damij-primary))]"
            />
          </div>
          <div className="md:col-span-3">
            <label className="text-xs font-bold text-[hsl(var(--damij-text))]/70 mb-1 block flex items-center gap-1"><Languages className="w-3.5 h-3.5" /> لغة الترجمة</label>
            <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 px-2 text-sm bg-white">
              {SPOKEN_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.flag} {l.nativeName}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="text-xs font-bold text-[hsl(var(--damij-text))]/70 mb-1 block flex items-center gap-1"><Hand className="w-3.5 h-3.5" /> نظام الإشارة</label>
            <select value={signSystem} onChange={(e) => setSignSystem(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 px-2 text-sm bg-white">
              {SIGN_SYSTEMS.map((s) => (
                <option key={s.code} value={s.code}>{s.nativeName} ({s.code})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button
            onClick={submit} disabled={loading}
            className="h-11 px-5 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'جاري التحليل...' : 'ابدأ الترجمة'}
          </button>
          <label className="inline-flex items-center gap-2 text-sm text-[hsl(var(--damij-text))]/80 cursor-pointer">
            <input type="checkbox" checked={muteVideo} onChange={(e) => setMuteVideo(e.target.checked)} />
            كتم صوت الفيديو الأصلي
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-[hsl(var(--damij-text))]/80 cursor-pointer">
            <input type="checkbox" checked={speakSigns} onChange={(e) => setSpeakSigns(e.target.checked)} />
            نطق الترجمة بصوت عالٍ
          </label>
        </div>
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5" /> {error}
          </div>
        )}
      </div>

      {/* Player + Live sign panel */}
      {videoId && (
        <div className="grid lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7">
            <div className="rounded-3xl overflow-hidden bg-black aspect-video shadow-xl border border-black/10">
              <div id="yt-player" className="w-full h-full" />
            </div>
            {/* Live caption bar */}
            <AnimatePresence mode="wait">
              {activeIdx >= 0 && (
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="mt-3 p-4 rounded-2xl bg-gradient-to-l from-[hsl(var(--damij-primary))]/10 to-emerald-50 border border-[hsl(var(--damij-primary))]/20"
                >
                  <div className="text-xs text-[hsl(var(--damij-text))]/60 mb-1 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" /> {fmt(segments[activeIdx].start)}
                  </div>
                  <p className="text-lg md:text-xl font-bold text-[hsl(var(--damij-text))] leading-relaxed">
                    {segments[activeIdx].text}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sign sequence panel */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-white border border-[hsl(var(--damij-primary))]/15 shadow-sm p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-[hsl(var(--damij-primary))] flex items-center gap-2">
                  <Hand className="w-5 h-5" /> ترجمة لغة الإشارة المتزامنة
                </h3>
                <span className="text-xs text-[hsl(var(--damij-text))]/60">{signSystem}</span>
              </div>
              <div className="min-h-[280px] flex-1 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-4">
                {activeSigns.length ? (
                  <motion.div className="flex flex-wrap gap-3 justify-center items-center" layout>
                    {activeSigns.map((s, i) => (
                      <motion.div
                        key={`${activeIdx}-${i}`}
                        initial={{ scale: 0.6, opacity: 0, y: 12 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, type: 'spring', stiffness: 220, damping: 18 }}
                        className="flex flex-col items-center bg-white rounded-2xl shadow-md border border-emerald-100 px-3 py-3 min-w-[96px]"
                      >
                        <div className="text-5xl mb-1 leading-none">{s.emoji || '🤟'}</div>
                        <div className="text-sm font-bold text-[hsl(var(--damij-text))] text-center">{s.word}</div>
                        {s.desc && <div className="text-[10px] text-[hsl(var(--damij-text))]/60 text-center mt-1 leading-tight">{s.desc}</div>}
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[hsl(var(--damij-text))]/55">
                    <Hand className="w-10 h-10 mb-2" />
                    <p className="text-sm">{loading ? 'جاري إعداد الإشارات...' : 'سيتم عرض الإشارات هنا أثناء التشغيل'}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-[hsl(var(--damij-text))]/65">
                <button
                  onClick={() => setSpeakSigns(s => !s)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  {speakSigns ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  {speakSigns ? 'النطق مفعل' : 'النطق متوقف'}
                </button>
                <span>كل إشارة تتحرك بالتزامن مع لحظة قولها في الفيديو.</span>
              </div>
            </div>
          </div>

          {/* Full transcript list */}
          <div className="lg:col-span-12">
            <div className="rounded-3xl bg-white border border-[hsl(var(--damij-primary))]/15 shadow-sm p-4">
              <h3 className="font-extrabold text-[hsl(var(--damij-primary))] flex items-center gap-2 mb-3">
                <ListVideo className="w-5 h-5" /> النص الكامل ({segments.length} سطر)
              </h3>
              <div ref={captionsListRef} className="max-h-[320px] overflow-y-auto pr-2 space-y-1">
                {segments.map((s, i) => (
                  <button
                    key={i} data-i={i}
                    onClick={() => seek(s.start)}
                    className={`w-full text-right p-2.5 rounded-xl transition-colors flex gap-3 items-start ${
                      i === activeIdx
                        ? 'bg-[hsl(var(--damij-primary))]/10 border border-[hsl(var(--damij-primary))]/30'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <span className="text-[11px] text-[hsl(var(--damij-text))]/50 font-mono shrink-0 mt-0.5 w-12">{fmt(s.start)}</span>
                    <span className="text-sm text-[hsl(var(--damij-text))] leading-relaxed">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeSignTranslator;
