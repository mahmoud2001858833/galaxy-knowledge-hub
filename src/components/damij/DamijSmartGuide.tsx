import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Sparkles, Mic, MicOff, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  navigate?: string;
}

const DamijSmartGuide: React.FC = () => {
  const { t, lang, dir } = useDamijLang();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: t.assistant.welcome }]);
  const recogRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages((m) => (m.length === 1 && m[0].role === 'assistant' ? [{ role: 'assistant', content: t.assistant.welcome }] : m));
  }, [t.assistant.welcome]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('damij-guide-chat', {
        body: {
          lang,
          messages: next.map(({ role, content }) => ({ role, content })),
        },
      });
      if (error) throw error;
      setMessages((m) => [...m, { role: 'assistant', content: data?.reply ?? '...', navigate: data?.navigate || undefined }]);
    } catch (e) {
      console.error('Guide chat error:', e);
      setMessages((m) => [...m, { role: 'assistant', content: t.assistant.error }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    const W: any = window;
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SR) return;
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const r = new SR();
    r.lang = lang === 'ar' ? 'ar-SA' : lang === 'en' ? 'en-US' : `${lang}-${lang.toUpperCase()}`;
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (e: any) => { setInput(e.results[0][0].transcript); setListening(false); };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    r.start();
    recogRef.current = r;
    setListening(true);
  };

  const goTo = (path: string) => { navigate(path); setOpen(false); };

  return (
    <>
      <motion.button
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.25 }}
        whileHover={{ scale: 1.08, rotate: 6 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((o) => !o)}
        className="relative group pointer-events-auto"
        aria-label={t.assistant.open}
        data-damij-no-translate
        data-damij-no-speak
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 blur-xl opacity-60 group-hover:opacity-90 transition-opacity" />
        <span
          className="relative flex items-center justify-center w-14 h-14 rounded-full text-white shadow-xl ring-1 ring-white/50"
          style={{
            background: 'conic-gradient(from 140deg, #fde68a, #f59e0b, #b45309, #f59e0b, #fde68a)',
            boxShadow: '0 16px 40px -10px rgba(234,179,8,0.65), 0 0 0 4px rgba(255,255,255,0.55)',
          }}
        >
          <Sparkles className="w-6 h-6 drop-shadow-md" strokeWidth={2.2} />
          <motion.span
            className="absolute -top-1 -end-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            dir={dir}
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed bottom-40 end-4 z-[60] w-[min(96vw,400px)] h-[min(72vh,580px)] flex flex-col rounded-3xl bg-white shadow-2xl border border-[hsl(var(--damij-primary))]/15 overflow-hidden"
          >
            <div className="px-4 py-3 bg-gradient-to-l from-[hsl(var(--damij-primary))] to-[hsl(var(--damij-accent-2))] text-white flex items-center justify-between">
              <div>
                <div className="font-bold flex items-center gap-2"><Sparkles className="w-4 h-4" />{t.assistant.title}</div>
                <div className="text-[11px] opacity-90">{t.assistant.subtitle}</div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20" aria-label={t.assistant.close}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-slate-50/60">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-[hsl(var(--damij-primary))] text-white rounded-br-md'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md'
                  }`}>
                    {m.content}
                    {m.navigate && (
                      <button
                        onClick={() => goTo(m.navigate!)}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-l from-emerald-500 to-teal-500 text-white shadow"
                      >
                        <MapPin className="w-3 h-3" />{t.assistant.navigate}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-3 py-2 rounded-2xl bg-white border border-slate-200 text-sm text-slate-500 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />{t.assistant.thinking}
                  </div>
                </div>
              )}
              {messages.length <= 1 && !loading && (
                <div className="grid grid-cols-1 gap-1.5 pt-2">
                  {t.assistant.suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-start text-xs px-3 py-2 rounded-xl bg-white border border-[hsl(var(--damij-primary))]/15 hover:bg-[hsl(var(--damij-primary))]/5 text-slate-700 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-2 border-t border-slate-200 bg-white flex items-center gap-1.5">
              <button
                onClick={toggleMic}
                className={`p-2 rounded-xl border transition ${listening ? 'bg-red-500 text-white border-red-500' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                aria-label={t.assistant.listen}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={t.assistant.placeholder}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none text-sm"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl bg-gradient-to-l from-[hsl(var(--damij-primary))] to-[hsl(var(--damij-accent-2))] text-white disabled:opacity-50"
                aria-label={t.assistant.send}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DamijSmartGuide;
