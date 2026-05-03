import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  to: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: string;
  delay?: number;
}

const SystemCard: React.FC<Props> = ({ to, icon: Icon, title, description, accent = 'hsl(var(--damij-primary))', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Link
      to={to}
      className="group block h-full p-8 rounded-3xl bg-[hsl(var(--damij-surface))] border border-[hsl(var(--damij-primary))]/10 hover:border-[hsl(var(--damij-primary))]/40 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: `${accent}1A`, color: accent }}
      >
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-bold text-[hsl(var(--damij-primary))] mb-3">{title}</h3>
      <p className="text-[hsl(var(--damij-text))]/75 leading-relaxed mb-6">{description}</p>
      <div className="flex items-center gap-2 text-[hsl(var(--damij-accent-2))] font-semibold group-hover:gap-3 transition-all">
        <span>ادخل النظام</span>
        <ArrowLeft className="w-5 h-5" />
      </div>
    </Link>
  </motion.div>
);

export default SystemCard;
