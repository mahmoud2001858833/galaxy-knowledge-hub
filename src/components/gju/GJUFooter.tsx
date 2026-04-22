import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Globe, Mail, Github, Sparkles, Brain, Bot, Leaf, Accessibility } from 'lucide-react';

const tracks = [
  { id: 'ai', label: 'الذكاء الاصطناعي', icon: Brain },
  { id: 'robotics', label: 'الروبوتات', icon: Bot },
  { id: 'sustainability', label: 'الاستدامة', icon: Leaf },
  { id: 'inclusive', label: 'التعلّم الدامج', icon: Accessibility },
];

const GJUFooter: React.FC = () => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#04040e] border-t border-white/[0.06] overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-violet-900/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 md:px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand block */}
          <div className="md:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-5"
            >
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-violet-500/30">
                <Trophy className="w-6 h-6 text-white" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 blur-lg opacity-50 -z-10" />
              </div>
              <div>
                <div className="text-white font-black text-xl leading-tight">Future of Technology</div>
                <div className="text-white/40 text-xs font-mono tracking-widest">GJU 3030</div>
              </div>
            </motion.div>

            <p className="text-white/40 text-sm leading-relaxed max-w-md mb-6">
              منصة عرض رسمية لمسابقة التقدّم التكنولوجي GJU 3030 — استكشف مستقبل الذكاء الاصطناعي
              والروبوتات والتقنيات المستدامة والتعلّم الدامج.
            </p>

            <div className="flex items-center gap-2 text-white/30 text-xs">
              <Globe className="w-3.5 h-3.5" />
              <span>الجامعة الألمانية الأردنية</span>
              <span className="text-white/15">•</span>
              <span>German Jordanian University</span>
            </div>
          </div>

          {/* Quick navigation */}
          <div className="md:col-span-4">
            <h4 className="text-white/80 font-bold text-sm mb-5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              المسارات الأربعة
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {tracks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => scrollTo(t.id)}
                  className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 text-right"
                >
                  <t.icon className="w-4 h-4 text-white/40 group-hover:text-cyan-400 transition-colors" />
                  <span className="text-white/60 group-hover:text-white text-xs font-medium transition-colors">
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact / meta */}
          <div className="md:col-span-3">
            <h4 className="text-white/80 font-bold text-sm mb-5 flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-400" />
              المسابقة
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-1 h-1 rounded-full bg-violet-400 mt-2" />
                <div>
                  <div className="text-white/30 text-[10px] font-mono uppercase tracking-wider">EVENT</div>
                  <div className="text-white/70 text-sm font-semibold">GJU 3030 Innovation Challenge</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-1 h-1 rounded-full bg-cyan-400 mt-2" />
                <div>
                  <div className="text-white/30 text-[10px] font-mono uppercase tracking-wider">FOCUS</div>
                  <div className="text-white/70 text-sm font-semibold">AI · Robotics · Sustainability</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-1 h-1 rounded-full bg-emerald-400 mt-2" />
                <div>
                  <div className="text-white/30 text-[10px] font-mono uppercase tracking-wider">YEAR</div>
                  <div className="text-white/70 text-sm font-semibold">2025 — 2030 Vision</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white/25 text-xs font-mono tracking-wider">
            © {new Date().getFullYear()} GJU 3030 · Future of Technology Showcase
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/50 text-[10px] font-mono uppercase tracking-wider">Live Showcase</span>
            </div>
            <div className="text-white/20 text-[10px] font-mono">v3.0 · Innovation Edition</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default GJUFooter;
