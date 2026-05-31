import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, X, Sparkles, Mic, MicOff, MapPin, Loader2,
  Volume2, VolumeX, Copy, RotateCcw, Maximize2, Minimize2, Trash2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';
import { useDamijSpeech } from '@/features/damij/i18n/useDamijSpeech';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  navigate?: string;
}

const DamijSmartGuide: React.FC = () => {
  const { t, lang, dir } = useDamijLang();
  const { speak, stop, isSpeaking } = useDamijSpeech();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() =>
    typeof window !== 'undefined' && localStorage.getItem('damij_guide_autospeak') === '1',
  );
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: t.assistant.welcome }]);
  const recogRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastUserPrompt = useRef<string>('');

  useEffect(() => {
    setMessages((m) => (m.length === 1 && m[0].role === 'assistant' ? [{ role: 'assistant', content: t.assistant.welcome }] : m));
  }, [t.assistant.welcome]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('damij_guide_autospeak', autoSpeak ? '1' : '0');
  }, [autoSpeak]);

  // Cleanup speech on close
  useEffect(() => { if (!open) stop(); }, [open, stop]);

  const send = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    lastUserPrompt.current = content;
    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('damij-guide-chat', {
        body: { lang, messages: next.map(({ role, content }) => ({ role, content })) },
      });
      if (error) throw error;
      const reply: Msg = { role: 'assistant', content: data?.reply ?? '...', navigate: data?.navigate || undefined };
      setMessages((m) => [...m, reply]);
      if (autoSpeak && reply.content) speak(reply.content);
    } catch (e) {
      console.error('Guide chat error:', e);
      setMessages((m) => [...m, { role: 'assistant', content: t.assistant.error }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, lang, autoSpeak, speak, t.assistant.error]);

  const regenerate = () => {
    if (!lastUserPrompt.current) return;
    // strip last assistant message if any
    setMessages((m) => {
      const copy = [...m];
      while (copy.length && copy[copy.length - 1].role === 'assistant') copy.pop();
      while (copy.length && copy[copy.length - 1].role === 'user') copy.pop();
      return copy;
    });
    setTimeout(() => send(lastUserPrompt.current), 50);
  };

  const clearChat = () => {
    stop();
    setMessages([{ role: 'assistant', content: t.assistant.welcome }]);
    lastUserPrompt.current = '';
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
    r.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setListening(false);
      // auto-send when voice captured
      send(transcript);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    r.start();
    recogRef.current = r;
    setListening(true);
  };

  const goTo = (path: string) => { navigate(path); setOpen(false); };

  const panelSize = expanded
    ? 'w-[min(96vw,640px)] h-[min(86vh,760px)]'
    : 'w-[min(96vw,420px)] h-[min(74vh,620px)]';

  return (
    <>
      <motion.button
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.25 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((o) => !o)}
        className="relative pointer-events-auto"
        aria-label={t.assistant.open}
        data-damij-no-translate
        data-damij-no-speak
      >
        <span
          className="relative flex items-center justify-center w-14 h-14 rounded-full text-white shadow-xl ring-1 ring-white/50"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--damij-primary)) 0%, hsl(var(--damij-accent-2)) 100%)',
            boxShadow: '0 14px 36px -10px hsl(var(--damij-primary) / 0.6), 0 0 0 4px rgba(255,255,255,0.55)',
          }}
        >
          <Sparkles className="w-6 h-6 drop-shadow-md" strokeWidth={2.2} />
          <motion.span
            className="absolute top-0.5 end-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white"
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
            className={`fixed bottom-40 end-4 z-[60] ${panelSize} flex flex-col rounded-3xl bg-white shadow-2xl border border-[hsl(var(--damij-primary))]/15 overflow-hidden`}
            data-damij-no-speak
          >
            {/* Header */}
            <div
              className="relative px-4 py-3 text-white flex items-center justify-between overflow-hidden"
              style={{ background: 'linear-gradient(135deg, hsl(var(--damij-primary)) 0%, hsl(var(--damij-accent-2)) 100%)' }}
            >
              <div className="absolute -top-8 -end-6 w-24 h-24 rounded-full bg-white/15 blur-2xl" />
              <div className="relative flex items-center gap-2.5 min-w-0">
                <div className="relative w-9 h-9 rounded-xl bg-white/20 ring-1 ring-white/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                  {(isSpeaking || loading) && (
                    <span className="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold truncate text-sm">{t.assistant.title}</div>
                  <div className="text-[10px] opacity-90 truncate">{t.assistant.subtitle}</div>
                </div>
              </div>
              <div className="relative flex items-center gap-1">
                <IconBtn title={autoSpeak ? 'إيقاف الردّ الصوتي' : 'تشغيل الردّ الصوتي'} onClick={() => setAutoSpeak((v) => !v)} active={autoSpeak}>
                  {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </IconBtn>
                <IconBtn title="مسح المحادثة" onClick={clearChat}>
                  <Trash2 className="w-4 h-4" />
                </IconBtn>
                <IconBtn title={expanded ? 'تصغير' : 'تكبير'} onClick={() => setExpanded((v) => !v)}>
                  {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </IconBtn>
                <IconBtn title={t.assistant.close} onClick={() => setOpen(false)}>
                  <X className="w-4 h-4" />
                </IconBtn>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-gradient-to-b from-slate-50/70 to-white">
              {messages.map((m, i) => {
                const isUser = m.role === 'user';
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className={`group flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--damij-primary))] to-[hsl(var(--damij-accent-2))] flex items-center justify-center text-white shadow-sm shrink-0">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div className={`max-w-[82%] ${isUser ? 'order-1' : ''}`}>
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                        isUser
                          ? 'bg-gradient-to-l from-[hsl(var(--damij-primary))] to-[hsl(var(--damij-accent-2))] text-white rounded-br-md'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md'
                      }`}>
                        {m.content}
                        {m.navigate && (
                          <button
                            onClick={() => goTo(m.navigate!)}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-l from-emerald-500 to-teal-500 text-white shadow hover:shadow-md transition"
                          >
                            <MapPin className="w-3 h-3" />{t.assistant.navigate}
                          </button>
                        )}
                      </div>
                      {!isUser && (
                        <div className="flex items-center gap-1 mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MiniBtn title="نطق الرد" onClick={() => isSpeaking ? stop() : speak(m.content)}>
                            {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                          </MiniBtn>
                          <MiniBtn title="نسخ" onClick={() => navigator.clipboard?.writeText(m.content)}>
                            <Copy className="w-3 h-3" />
                          </MiniBtn>
                          {i === messages.length - 1 && lastUserPrompt.current && (
                            <MiniBtn title="إعادة توليد" onClick={regenerate}>
                              <RotateCcw className="w-3 h-3" />
                            </MiniBtn>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {loading && (
                <div className="flex justify-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(var(--damij-primary))] to-[hsl(var(--damij-accent-2))] flex items-center justify-center text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-500 flex items-center gap-2">
                    <span className="flex gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--damij-primary))] animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--damij-primary))] animate-bounce" style={{ animationDelay: '0.15s' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--damij-primary))] animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </span>
                    {t.assistant.thinking}
                  </div>
                </div>
              )}
              {messages.length <= 1 && !loading && (
                <div className="grid grid-cols-1 gap-1.5 pt-3">
                  <div className="text-[11px] text-slate-500 font-bold px-1">جرّب البدء بـ:</div>
                  {t.assistant.suggestions.map((s) => (
                    <motion.button
                      key={s}
                      whileHover={{ x: -3 }}
                      onClick={() => send(s)}
                      className="text-start text-xs px-3 py-2.5 rounded-xl bg-white border border-[hsl(var(--damij-primary))]/15 hover:bg-[hsl(var(--damij-primary))]/5 hover:border-[hsl(var(--damij-primary))]/35 text-slate-700 transition shadow-sm"
                    >
                      💡 {s}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="p-2.5 border-t border-slate-200 bg-white flex items-center gap-1.5">
              <button
                onClick={toggleMic}
                className={`p-2.5 rounded-xl border transition ${
                  listening
                    ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                aria-label={t.assistant.listen}
                title={t.assistant.listen}
              >
                {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={t.assistant.placeholder}
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-[hsl(var(--damij-primary))]/50 outline-none text-sm transition"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-gradient-to-l from-[hsl(var(--damij-primary))] to-[hsl(var(--damij-accent-2))] text-white disabled:opacity-50 hover:shadow-md transition"
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

const IconBtn: React.FC<{ title: string; onClick: () => void; active?: boolean; children: React.ReactNode }> = ({ title, onClick, active, children }) => (
  <button
    title={title} onClick={onClick}
    className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-white/30' : 'hover:bg-white/20'}`}
  >
    {children}
  </button>
);

const MiniBtn: React.FC<{ title: string; onClick: () => void; children: React.ReactNode }> = ({ title, onClick, children }) => (
  <button
    title={title} onClick={onClick}
    className="p-1 rounded text-slate-400 hover:text-[hsl(var(--damij-primary))] hover:bg-slate-100 transition"
  >
    {children}
  </button>
);

export default DamijSmartGuide;
