import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimulationControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  primaryColor?: string;
  children?: React.ReactNode;
}

const colorMap: Record<string, string> = {
  purple: 'bg-purple-600 hover:bg-purple-700',
  blue: 'bg-blue-600 hover:bg-blue-700',
  green: 'bg-green-600 hover:bg-green-700',
  yellow: 'bg-yellow-600 hover:bg-yellow-700',
  red: 'bg-red-600 hover:bg-red-700',
  indigo: 'bg-indigo-600 hover:bg-indigo-700',
  cyan: 'bg-cyan-600 hover:bg-cyan-700',
  pink: 'bg-pink-600 hover:bg-pink-700',
};

const borderMap: Record<string, string> = {
  purple: 'border-purple-500 text-purple-400 hover:bg-purple-500/20',
  blue: 'border-blue-500 text-blue-400 hover:bg-blue-500/20',
  green: 'border-green-500 text-green-400 hover:bg-green-500/20',
  yellow: 'border-yellow-500 text-yellow-400 hover:bg-yellow-500/20',
  red: 'border-red-500 text-red-400 hover:bg-red-500/20',
  indigo: 'border-indigo-500 text-indigo-400 hover:bg-indigo-500/20',
  cyan: 'border-cyan-500 text-cyan-400 hover:bg-cyan-500/20',
  pink: 'border-pink-500 text-pink-400 hover:bg-pink-500/20',
};

const SimulationControls: React.FC<SimulationControlsProps> = ({
  isPlaying,
  onTogglePlay,
  onReset,
  primaryColor = 'purple',
  children,
}) => {
  return (
    <motion.div 
      className="flex items-center justify-center gap-4 mt-4 flex-wrap"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={onTogglePlay}
          className={colorMap[primaryColor] || colorMap.purple}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
      </motion.div>
      
      {children}
      
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={onReset}
          variant="outline"
          className={borderMap[primaryColor] || borderMap.purple}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default SimulationControls;
