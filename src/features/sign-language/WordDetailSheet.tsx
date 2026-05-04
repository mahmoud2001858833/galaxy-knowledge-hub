import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Copy, Loader2, Hand, Languages, BookOpen, Sparkles, Star } from 'lucide-react';
import { toast } from 'sonner';
import { fetchDetail, loadDetail, type WordDetail, getFavorites, toggleFavorite } from './dictionaryCache';
import type { DictWord } from './dictionary';

interface Props {
  word: DictWord | null;
  langCode: string;
  langName: string;
  langFlag: string;
  signSystem: string;
  onClose: () => void;
}

const QUICK_LANGS: { code: string; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

const speak = (text: string, lang: string) => {
  if (!text.trim()) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(x => x.lang === lang) || voices.find(x => x.lang.startsWith(lang.split('-')[0]));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  } catch {}
};

const WordDetailSheet: React.FC<Props> = ({ word, langCode, langName, langFlag, signSystem, onClose }) => {
  const [detail, setDetail] = useState<WordDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [favs, setFavs] = useState<string[]>(getFavorites());

  useEffect(() => {
    if (!word) { setDetail(null); return; }
    const cached = loadDetail(langCode, signSystem, word.ar);
    if (cached) { setDetail(cached); return; }
    setLoading(true);
    setDetail(null);
    fetchDetail(word.ar, langCode, langName, signSystem)
      .then(setDetail)
      .catch((e) => toast.error(e?.message || 'فشل تحميل التفاصيل'))
      .finally(() => setLoading(false));
  }, [word, langCode, langName, signSystem]);

  if (!word) return null;
  const isFav = favs.includes(word.id);

  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success('تم النسخ'); };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-[hsl(var(--damij-primary))] to-[hsl(var(--damij-primary))]/70 p-6 text-white rounded-t-3xl">
            <button onClick={onClose} className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => setFavs(toggleFavorite(word.id))}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
              title="مفضلة"
            >
              <Star className={`w-5 h-5 ${isFav ? 'fill-yellow-300 text-yellow-300' : ''}`} />
            </button>
            <div className="text-center">
              <div className="text-7xl mb-3">{word.emoji}</div>
              <div className="text-3xl font-extrabold mb-1">{word.ar}</div>
              {!langCode.startsWith('ar') && detail?.primary && (
                <div className="text-2xl opacity-90 mt-1" dir="auto">
                  {langFlag} {detail.primary}
                </div>
              )}
              <div className="text-xs opacity-75 mt-2">نظام {signSystem}</div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {loading && (
              <div className="flex items-center justify-center py-8 text-[hsl(var(--damij-primary))]">
                <Loader2 className="w-6 h-6 animate-spin ml-2" /> جاري تحميل التفاصيل من الذكاء الاصطناعي…
              </div>
            )}

            {/* Local motion description always shown */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                <Hand className="w-3.5 h-3.5" /> وصف الحركة (سريع)
              </h4>
              <p className="text-base text-slate-800">{word.motion_ar}</p>
            </div>

            {detail && (
              <>
                {/* AI motion description */}
                <div className="bg-gradient-to-br from-[hsl(var(--damij-primary))]/5 to-emerald-50 rounded-2xl p-4 border border-[hsl(var(--damij-primary))]/15">
                  <h4 className="text-xs font-bold text-[hsl(var(--damij-primary))] mb-2 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> شرح أداء الإشارة بـ {langName}
                  </h4>
                  <p className="text-base leading-relaxed" dir="auto">{detail.description}</p>
                </div>

                {/* Pronunciation + TTS */}
                {(detail.primary || detail.phonetic) && (
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-3">
                    <button
                      onClick={() => speak(detail.primary, langCode)}
                      className="px-3 py-2 rounded-xl bg-[hsl(var(--damij-primary))] text-white font-bold flex items-center gap-2"
                    >
                      <Volume2 className="w-4 h-4" /> نطق
                    </button>
                    {detail.phonetic && (
                      <span className="text-sm text-slate-600 font-mono" dir="ltr">/{detail.phonetic}/</span>
                    )}
                    <button onClick={() => copy(detail.primary)} className="ms-auto p-2 rounded-lg hover:bg-slate-100">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Fingerspelling */}
                {detail.fingerspelling?.length > 0 && (
                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                    <h4 className="text-xs font-bold text-amber-800 mb-2">تهجئة بالأحرف</h4>
                    <div className="flex flex-wrap gap-2" dir="auto">
                      {detail.fingerspelling.map((f, i) => (
                        <div key={i} className="bg-white px-3 py-2 rounded-xl border border-amber-200 text-center">
                          <div className="text-lg font-bold text-amber-900">{f.letter}</div>
                          <div className="text-[10px] text-slate-500">{f.sign}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Synonyms */}
                {detail.synonyms?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 mb-2">مرادفات</h4>
                    <div className="flex flex-wrap gap-2" dir="auto">
                      {detail.synonyms.map((s, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-slate-100 text-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Example */}
                {detail.example_sentence && (
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
                    <h4 className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> مثال
                    </h4>
                    <p className="text-base mb-2" dir="auto">{detail.example_sentence}</p>
                    {detail.example_translation_ar && !langCode.startsWith('ar') && (
                      <p className="text-sm text-emerald-700 border-t border-emerald-200 pt-2">
                        {detail.example_translation_ar}
                      </p>
                    )}
                  </div>
                )}

                {/* Quick translations */}
                {detail.translations && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
                      <Languages className="w-3.5 h-3.5" /> ترجمات سريعة
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {QUICK_LANGS.map(l => detail.translations[l.code] && (
                        <button
                          key={l.code}
                          onClick={() => speak(detail.translations[l.code], l.code)}
                          className="bg-white border border-slate-200 rounded-xl p-2 text-right hover:border-[hsl(var(--damij-primary))]/40 hover:shadow-md transition-all"
                          dir="auto"
                        >
                          <div className="text-xs text-slate-500">{l.flag} {l.name}</div>
                          <div className="text-sm font-bold">{detail.translations[l.code]}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {detail.tips && (
                  <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200 text-sm text-blue-900" dir="auto">
                    💡 {detail.tips}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WordDetailSheet;
