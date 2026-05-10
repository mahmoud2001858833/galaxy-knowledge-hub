import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Youtube, Loader2, Languages, Hand, Volume2, VolumeX, Play, AlertCircle,
  Sparkles, ListVideo, Globe, Search, Grid3x3, BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SIGN_SYSTEMS, SIGN_SYSTEM_PRIMARY_LANG } from '@/features/sign-language/signSystems';
import HandSignCard from '@/features/sign-language/HandSignCard';
import type { Movement } from '@/features/sign-language/handshapes';
import { lookupSign, getDictionarySize, searchSigns, getCategories, getSignsByCategory } from '@/features/sign-language/dictionary';
import { useSignTranslations, type SignLangCode } from '@/features/sign-language/dictionary/translations';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';

declare global {
  interface Window { YT: any; onYouTubeIframeAPIReady: () => void; }
}

interface Segment { start: number; dur: number; text: string }
interface SignWord { word: string; handshape_id?: string; movement?: string; two_handed?: boolean; desc?: string; known?: boolean; t?: number; d?: number }
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
  const [signSystem, setSignSystem] = useState('ArSL');
  // Spoken language is locked to the chosen sign system (ArSL→ar, ASL→en, …).
  const targetLang = SIGN_SYSTEM_PRIMARY_LANG[signSystem]?.code || 'ar-SA';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [signs, setSigns] = useState<SignsPayload | null>(null);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [muteVideo, setMuteVideo] = useState(true);
  const [speakSigns, setSpeakSigns] = useState(true);
  const [now, setNow] = useState(0);
  const [signCursor, setSignCursor] = useState(0); // index of current sign within active line
  const [progress, setProgress] = useState(0); // 0..1 sign-build progress estimate

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

  // Enrich AI signs with the local 3000+ dictionary (fills handshape/movement when AI says unknown).
  const enrichedSigns: SignsPayload | null = useMemo(() => {
    if (!signs) return null;
    return {
      lines: signs.lines.map(l => ({
        ...l,
        signs: l.signs.map(s => {
          if (s.known === false || !s.handshape_id) {
            // Try exact lookup first (with prefix/suffix tolerance built-in).
            let local = lookupSign(s.word, signSystem);
            // Fallback: substring search (first hit).
            if (!local) {
              const hits = searchSigns(s.word, signSystem, 1);
              if (hits.length) local = hits[0];
            }
            if (local) return { ...s, handshape_id: local.handshape_id, movement: local.movement, two_handed: local.two_handed, desc: s.desc || local.desc, known: true };
          }
          return s;
        }),
      })),
    };
  }, [signs, signSystem]);

  const activeSigns = useMemo(() => {
    if (!enrichedSigns || activeIdx < 0) return [];
    return enrichedSigns.lines.find(l => l.i === activeIdx)?.signs || [];
  }, [enrichedSigns, activeIdx]);

  // Sequential sign cursor with per-sign timing when available; fallback to even split.
  useEffect(() => {
    if (activeIdx < 0 || !segments[activeIdx] || !activeSigns.length) { setSignCursor(0); return; }
    const seg = segments[activeIdx];
    const within = Math.max(0, Math.min(seg.dur, now - seg.start));
    const frac = within / Math.max(0.25, seg.dur);
    let idx = 0;
    if (activeSigns.some(s => typeof s.t === 'number')) {
      // Pick the last sign whose t <= frac
      for (let i = 0; i < activeSigns.length; i++) {
        const t = typeof activeSigns[i].t === 'number' ? Math.max(0, Math.min(1, activeSigns[i].t!)) : i / activeSigns.length;
        if (t <= frac) idx = i; else break;
      }
    } else {
      const per = 1 / activeSigns.length;
      idx = Math.min(activeSigns.length - 1, Math.floor(frac / Math.max(0.001, per)));
    }
    setSignCursor(idx);
  }, [now, activeIdx, segments, activeSigns]);

  const seek = (t: number) => { try { playerRef.current?.seekTo?.(t, true); playerRef.current?.playVideo?.(); } catch {} };

  // Build the full unique-signs gallery (deduped by word) with first-occurrence timing & count.
  const [gallerySearch, setGallerySearch] = useState('');
  const { lang: uiLang } = useDamijLang();
  const { translate: tSign, ready: tReady } = useSignTranslations(uiLang as SignLangCode);
  const gallery = useMemo(() => {
    if (!enrichedSigns) return [];
    const map = new Map<string, { sign: SignWord; firstStart: number; count: number }>();
    enrichedSigns.lines.forEach(line => {
      const seg = segments[line.i];
      line.signs.forEach((s, k) => {
        const key = (s.word || '').trim();
        if (!key) return;
        const at = seg ? seg.start + (typeof s.t === 'number' ? s.t * seg.dur : (k / Math.max(1, line.signs.length)) * seg.dur) : 0;
        const ex = map.get(key);
        if (!ex) map.set(key, { sign: s, firstStart: at, count: 1 });
        else { ex.count += 1; if (at < ex.firstStart) ex.firstStart = at; }
      });
    });
    const arr = Array.from(map.values());
    const q = gallerySearch.trim();
    return q ? arr.filter(x => x.sign.word.includes(q)) : arr;
  }, [enrichedSigns, segments, gallerySearch]);

  // === Full ArSL dictionary browser ===
  const [dictSearch, setDictSearch] = useState('');
  const [dictCategory, setDictCategory] = useState<string>('');
  const [dictPage, setDictPage] = useState(0);
  const PAGE_SIZE = 60;
  const allCategories = useMemo(() => getCategories(signSystem), [signSystem]);
  const dictResults = useMemo(() => {
    let base = dictCategory ? getSignsByCategory(dictCategory, signSystem) : null;
    if (dictSearch.trim()) {
      const fromSearch = new Set(searchSigns(dictSearch, signSystem, 5000));
      base = base ? base.filter(e => fromSearch.has(e)) : Array.from(fromSearch);
    }
    if (!base) base = searchSigns('', signSystem, 5000);
    return base;
  }, [dictSearch, dictCategory, signSystem]);
  useEffect(() => { setDictPage(0); }, [dictSearch, dictCategory, signSystem]);
  const dictPageItems = dictResults.slice(dictPage * PAGE_SIZE, (dictPage + 1) * PAGE_SIZE);
  const dictPages = Math.max(1, Math.ceil(dictResults.length / PAGE_SIZE));


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
          <div className="md:col-span-6">
            <label className="text-xs font-bold text-[hsl(var(--damij-text))]/70 mb-1 block flex items-center gap-1">
              <Hand className="w-3.5 h-3.5" /> نظام الإشارة (يُحدد لغة الترجمة تلقائياً)
            </label>
            <select value={signSystem} onChange={(e) => setSignSystem(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 px-2 text-sm bg-white">
              {SIGN_SYSTEMS.map((s) => {
                const lang = SIGN_SYSTEM_PRIMARY_LANG[s.code];
                return (
                  <option key={s.code} value={s.code}>
                    {s.nativeName} ({s.code}){lang ? ` · ${lang.flag} ${lang.nativeName}` : ''}
                  </option>
                );
              })}
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
              <div className="min-h-[300px] flex-1 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-4 flex flex-col">
                {activeSigns.length ? (
                  <>
                    {/* Focused current sign */}
                    <div className="flex-1 flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        {(() => {
                          const s = activeSigns[signCursor];
                          if (!s) return null;
                          return (
                            <motion.div
                              key={`${activeIdx}-${signCursor}`}
                              initial={{ scale: 0.5, opacity: 0, rotateY: -30 }}
                              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                              exit={{ scale: 0.7, opacity: 0, rotateY: 30 }}
                              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                              className="flex flex-col items-center bg-white rounded-3xl shadow-xl border-2 border-[hsl(var(--damij-primary))]/30 px-6 py-5"
                            >
                              {s.known === false ? (
                                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
                                  إشارة موثوقة غير متاحة
                                </div>
                              ) : (
                                <HandSignCard
                                  word={s.word}
                                  handshapeId={s.handshape_id}
                                  movement={(s.movement as Movement) || 'none'}
                                  twoHanded={s.two_handed}
                                  active
                                  size={140}
                                />
                              )}
                              <div className="text-xl font-extrabold text-[hsl(var(--damij-primary))] text-center mt-2">{s.word}</div>
                              {uiLang !== 'ar' && tReady && tSign(s.word) !== s.word && (
                                <div className="text-sm font-semibold text-emerald-700/80 text-center mt-0.5" dir="auto">{tSign(s.word)}</div>
                              )}
                              {s.desc && <div className="text-xs text-[hsl(var(--damij-text))]/65 text-center mt-1 leading-snug max-w-[220px]">{s.desc}</div>}
                            </motion.div>
                          );
                        })()}
                      </AnimatePresence>
                    </div>
                    {/* Strip: previous → current → upcoming */}
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1 justify-center">
                      {activeSigns.map((s, i) => (
                        <motion.button
                          key={`thumb-${activeIdx}-${i}`}
                          onClick={() => setSignCursor(i)}
                          animate={{
                            scale: i === signCursor ? 1.08 : 0.9,
                            opacity: i === signCursor ? 1 : 0.55,
                          }}
                          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                          className={`shrink-0 flex flex-col items-center rounded-xl px-2 py-1.5 border ${
                            i === signCursor
                              ? 'bg-white border-[hsl(var(--damij-primary))]/40 shadow'
                              : 'bg-white/60 border-gray-200'
                          }`}
                        >
                          {s.known !== false && (
                            <HandSignCard
                              word={s.word}
                              handshapeId={s.handshape_id}
                              movement={(s.movement as Movement) || 'none'}
                              twoHanded={s.two_handed}
                              active={i === signCursor}
                              size={36}
                            />
                          )}
                          <span className="text-[10px] font-bold text-[hsl(var(--damij-text))] mt-0.5 max-w-[60px] truncate">{s.word}</span>
                        </motion.button>
                      ))}
                    </div>
                    {/* Progress bar within line */}
                    <div className="mt-2 h-1 w-full bg-emerald-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[hsl(var(--damij-primary))]"
                        animate={{ width: `${((signCursor + 1) / activeSigns.length) * 100}%` }}
                        transition={{ type: 'tween', duration: 0.3 }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-[hsl(var(--damij-text))]/55">
                    <Hand className="w-10 h-10 mb-2" />
                    <p className="text-sm">
                      {loading
                        ? 'جاري إعداد الإشارات لكامل الفيديو...'
                        : activeIdx >= 0
                          ? 'لا توجد إشارات لهذا السطر بعد — يتم التحضير'
                          : 'سيتم عرض الإشارات هنا أثناء التشغيل'}
                    </p>
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

          {/* All translated signs gallery */}
          <div className="lg:col-span-12">
            <div className="rounded-3xl bg-white border border-[hsl(var(--damij-primary))]/15 shadow-sm p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <h3 className="font-extrabold text-[hsl(var(--damij-primary))] flex items-center gap-2">
                  <Grid3x3 className="w-5 h-5" /> معرض كل الإشارات المترجمة ({gallery.length})
                </h3>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-[hsl(var(--damij-text))]/60 inline-flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> القاموس المحلي: {getDictionarySize(signSystem)} إشارة
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={gallerySearch}
                      onChange={(e) => setGallerySearch(e.target.value)}
                      placeholder="ابحث عن إشارة..."
                      className="h-9 pr-7 pl-2 rounded-lg border border-gray-200 text-xs w-44 focus:outline-none focus:border-[hsl(var(--damij-primary))]"
                    />
                  </div>
                </div>
              </div>
              {gallery.length === 0 ? (
                <p className="text-sm text-[hsl(var(--damij-text))]/55 text-center py-8">لا توجد إشارات بعد</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 max-h-[480px] overflow-y-auto pr-1">
                  {gallery.map((g, i) => (
                    <button
                      key={`${g.sign.word}-${i}`}
                      onClick={() => seek(g.firstStart)}
                      className="group flex flex-col items-center bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl p-2.5 hover:border-[hsl(var(--damij-primary))]/40 hover:shadow-md transition-all"
                      title={`اضغط للذهاب إلى ${fmt(g.firstStart)}`}
                    >
                      {g.sign.known !== false && (
                        <HandSignCard
                          word={g.sign.word}
                          handshapeId={g.sign.handshape_id}
                          movement={(g.sign.movement as Movement) || 'none'}
                          twoHanded={g.sign.two_handed}
                          size={58}
                        />
                      )}
                      <span className="text-xs font-bold text-[hsl(var(--damij-text))] mt-1 text-center line-clamp-1 max-w-full">{g.sign.word}</span>
                      {uiLang !== 'ar' && tReady && tSign(g.sign.word) !== g.sign.word && (
                        <span className="text-[10px] font-medium text-emerald-700/75 text-center line-clamp-1 max-w-full" dir="auto">{tSign(g.sign.word)}</span>
                      )}
                      <span className="text-[10px] text-[hsl(var(--damij-text))]/50 mt-0.5">{fmt(g.firstStart)} · ×{g.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full ArSL dictionary browser - always visible */}
      <div className="mt-8 rounded-3xl bg-white border border-[hsl(var(--damij-primary))]/15 shadow-sm p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="font-extrabold text-[hsl(var(--damij-primary))] flex items-center gap-2 text-lg">
            <BookOpen className="w-5 h-5" /> قاموس لغة الإشارة الكامل ({getDictionarySize(signSystem).toLocaleString('ar')} إشارة)
          </h3>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={dictSearch}
              onChange={(e) => setDictSearch(e.target.value)}
              placeholder="ابحث في كل القاموس..."
              className="h-9 pr-7 pl-2 rounded-lg border border-gray-200 text-sm w-56 focus:outline-none focus:border-[hsl(var(--damij-primary))]"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3 max-h-24 overflow-y-auto">
          <button
            onClick={() => setDictCategory('')}
            className={`text-[11px] px-2.5 py-1 rounded-full border transition ${dictCategory === '' ? 'bg-[hsl(var(--damij-primary))] text-white border-[hsl(var(--damij-primary))]' : 'bg-gray-50 border-gray-200 hover:border-[hsl(var(--damij-primary))]/40'}`}
          >الكل</button>
          {allCategories.map(c => (
            <button
              key={c}
              onClick={() => setDictCategory(c === dictCategory ? '' : c)}
              className={`text-[11px] px-2.5 py-1 rounded-full border transition ${c === dictCategory ? 'bg-[hsl(var(--damij-primary))] text-white border-[hsl(var(--damij-primary))]' : 'bg-gray-50 border-gray-200 hover:border-[hsl(var(--damij-primary))]/40'}`}
            >{c}</button>
          ))}
        </div>
        {dictResults.length === 0 ? (
          <p className="text-sm text-[hsl(var(--damij-text))]/55 text-center py-8">لا توجد نتائج</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {dictPageItems.map((e, i) => (
                <div
                  key={`${e.word}-${i}`}
                  className="flex flex-col items-center bg-gradient-to-br from-sky-50 to-white border border-sky-100 rounded-2xl p-2.5"
                  title={e.desc}
                >
                  <HandSignCard
                    word={e.word}
                    handshapeId={e.handshape_id}
                    movement={(e.movement as Movement) || 'none'}
                    twoHanded={e.two_handed}
                    size={58}
                  />
                  <span className="text-xs font-bold text-[hsl(var(--damij-text))] mt-1 text-center line-clamp-1 max-w-full">{e.word}</span>
                  <span className="text-[10px] text-[hsl(var(--damij-text))]/50">{e.category}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 text-xs">
              <button
                onClick={() => setDictPage(p => Math.max(0, p - 1))}
                disabled={dictPage === 0}
                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-[hsl(var(--damij-primary))]/40"
              >السابق</button>
              <span className="text-[hsl(var(--damij-text))]/60">صفحة {dictPage + 1} من {dictPages} · {dictResults.length.toLocaleString('ar')} نتيجة</span>
              <button
                onClick={() => setDictPage(p => Math.min(dictPages - 1, p + 1))}
                disabled={dictPage >= dictPages - 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:border-[hsl(var(--damij-primary))]/40"
              >التالي</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default YouTubeSignTranslator;
