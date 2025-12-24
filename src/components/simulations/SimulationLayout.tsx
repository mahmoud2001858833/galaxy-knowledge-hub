import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimulationLayoutProps {
  children: React.ReactNode;
  title: string;
  titleGradient?: string;
  backgroundGradient?: string;
}

// Animated particle background
const ParticleBackground = ({ color = 'purple' }: { color?: string }) => {
  const colorMap: Record<string, string> = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    indigo: 'bg-indigo-500',
    cyan: 'bg-cyan-500',
    pink: 'bg-pink-500',
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Stars */}
      {[...Array(80)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
      
      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className={`absolute w-2 h-2 ${colorMap[color] || colorMap.purple} rounded-full opacity-30`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Glow orbs */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className={`absolute w-64 h-64 ${colorMap[color] || colorMap.purple} rounded-full blur-[100px] opacity-10`}
          style={{
            left: `${20 + i * 30}%`,
            top: `${30 + (i % 2) * 40}%`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
};

const SimulationLayout: React.FC<SimulationLayoutProps> = ({
  children,
  title,
  titleGradient = 'from-purple-400 to-blue-400',
  backgroundGradient = 'from-slate-900 via-purple-900 to-slate-900',
}) => {
  const navigate = useNavigate();
  
  const colorFromGradient = titleGradient.includes('purple') ? 'purple' 
    : titleGradient.includes('blue') ? 'blue'
    : titleGradient.includes('green') ? 'green'
    : titleGradient.includes('yellow') ? 'yellow'
    : titleGradient.includes('red') ? 'red'
    : titleGradient.includes('indigo') ? 'indigo'
    : titleGradient.includes('cyan') ? 'cyan'
    : titleGradient.includes('pink') ? 'pink'
    : 'purple';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${backgroundGradient} text-white relative overflow-hidden`}>
      <ParticleBackground color={colorFromGradient} />
      
      <div className="relative z-10 p-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/scientific-simulations')}
            className="text-white hover:bg-white/10 backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            العودة
          </Button>
          <motion.h1 
            className={`text-2xl md:text-3xl font-bold bg-gradient-to-r ${titleGradient} bg-clip-text text-transparent`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {title}
          </motion.h1>
          <div className="w-24" />
        </motion.div>

        {/* Content with staggered animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default SimulationLayout;
