import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface SimulationCardProps {
  children: React.ReactNode;
  title?: string;
  icon?: LucideIcon;
  color?: 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'indigo' | 'cyan' | 'pink';
  className?: string;
  delay?: number;
}

const colorStyles = {
  purple: {
    border: 'border-purple-500/30',
    title: 'text-purple-400',
    icon: 'text-purple-400',
    glow: 'hover:shadow-purple-500/20',
  },
  blue: {
    border: 'border-blue-500/30',
    title: 'text-blue-400',
    icon: 'text-blue-400',
    glow: 'hover:shadow-blue-500/20',
  },
  green: {
    border: 'border-green-500/30',
    title: 'text-green-400',
    icon: 'text-green-400',
    glow: 'hover:shadow-green-500/20',
  },
  yellow: {
    border: 'border-yellow-500/30',
    title: 'text-yellow-400',
    icon: 'text-yellow-400',
    glow: 'hover:shadow-yellow-500/20',
  },
  red: {
    border: 'border-red-500/30',
    title: 'text-red-400',
    icon: 'text-red-400',
    glow: 'hover:shadow-red-500/20',
  },
  indigo: {
    border: 'border-indigo-500/30',
    title: 'text-indigo-400',
    icon: 'text-indigo-400',
    glow: 'hover:shadow-indigo-500/20',
  },
  cyan: {
    border: 'border-cyan-500/30',
    title: 'text-cyan-400',
    icon: 'text-cyan-400',
    glow: 'hover:shadow-cyan-500/20',
  },
  pink: {
    border: 'border-pink-500/30',
    title: 'text-pink-400',
    icon: 'text-pink-400',
    glow: 'hover:shadow-pink-500/20',
  },
};

const SimulationCard: React.FC<SimulationCardProps> = ({
  children,
  title,
  icon: Icon,
  color = 'purple',
  className = '',
  delay = 0,
}) => {
  const styles = colorStyles[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card 
        className={`bg-slate-800/50 backdrop-blur-sm ${styles.border} ${styles.glow} hover:shadow-lg transition-all duration-300 p-4 ${className}`}
      >
        {(title || Icon) && (
          <h3 className={`text-lg font-bold ${styles.title} mb-4 flex items-center gap-2`}>
            {Icon && <Icon className={`w-5 h-5 ${styles.icon}`} />}
            {title}
          </h3>
        )}
        {children}
      </Card>
    </motion.div>
  );
};

export default SimulationCard;
