import React, { useState, useMemo } from 'react';
import { Globe, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDamijLang } from '@/features/damij/i18n/DamijLanguageContext';

const DamijLanguageSwitcher: React.FC = () => {
  const { lang, setLang, langs, t } = useDamijLang();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const current = langs.find((l) => l.code === lang)!;

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return langs;
    return langs.filter(
      (l) => l.name.toLowerCase().includes(k) || l.english.toLowerCase().includes(k) || l.code.includes(k),
    );
  }, [q, langs]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/95 hover:bg-white border border-[hsl(var(--damij-primary))]/15 shadow-md text-sm font-semibold text-[hsl(var(--damij-primary))] backdrop-blur-md transition"
        aria-label={t.langSwitch.label}
      >
        <Globe className="w-4 h-4" />
        <span className="text-base">{current.flag}</span>
        <span className="hidden sm:inline">{current.name}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute end-0 mt-2 w-72 max-h-[420px] overflow-hidden rounded-2xl bg-white shadow-2xl border border-[hsl(var(--damij-primary))]/15 z-50"
            >
              <div className="p-2 border-b border-[hsl(var(--damij-primary))]/10">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-50">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder={t.langSwitch.search}
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
              </div>
              <div className="max-h-[350px] overflow-y-auto py-1">
                {filtered.map((l) => {
                  const active = l.code === lang;
                  return (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setOpen(false); setQ(''); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition ${
                        active ? 'bg-[hsl(var(--damij-primary))]/10 text-[hsl(var(--damij-primary))] font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-xl">{l.flag}</span>
                      <span className="flex-1 text-start">
                        <span className="block leading-tight">{l.name}</span>
                        <span className="block text-[11px] text-slate-400">{l.english}</span>
                      </span>
                      {active && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DamijLanguageSwitcher;
