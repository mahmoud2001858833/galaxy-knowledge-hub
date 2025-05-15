
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

interface PuzzleDifficultyLevelProps {
  subject: string;
  difficulty: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
}

const PuzzleDifficultyLevel = ({
  subject,
  difficulty,
  icon,
  isSelected,
  onSelect
}: PuzzleDifficultyLevelProps) => {
  
  const getSubjectColor = () => {
    switch (subject) {
      case 'physics':
        return {
          primary: 'bg-physics-600',
          secondary: 'bg-physics-700',
          border: 'border-physics-500/50',
          text: 'text-physics-400',
          glow: 'shadow-neon-purple'
        };
      case 'chemistry':
        return {
          primary: 'bg-chemistry-600',
          secondary: 'bg-chemistry-700',
          border: 'border-chemistry-500/50',
          text: 'text-chemistry-400',
          glow: 'shadow-neon-green'
        };
      case 'biology':
        return {
          primary: 'bg-biology-600',
          secondary: 'bg-biology-700',
          border: 'border-biology-500/50',
          text: 'text-biology-400',
          glow: 'shadow-neon-green'
        };
      case 'mathematics':
        return {
          primary: 'bg-mathematics-600',
          secondary: 'bg-mathematics-700',
          border: 'border-mathematics-500/50',
          text: 'text-mathematics-400',
          glow: 'shadow-neon-amber'
        };
      default:
        return {
          primary: 'bg-blue-600',
          secondary: 'bg-blue-700',
          border: 'border-blue-500/50',
          text: 'text-blue-400',
          glow: 'shadow-neon-blue'
        };
    }
  };

  const colors = getSubjectColor();
  
  const getDifficultyColors = () => {
    switch (difficulty) {
      case 'سهل':
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-500/50',
          text: 'text-green-400',
          selectedBg: 'bg-green-500/40'
        };
      case 'متوسط':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/50',
          text: 'text-yellow-400',
          selectedBg: 'bg-yellow-500/40'
        };
      case 'صعب':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          text: 'text-red-400',
          selectedBg: 'bg-red-500/40'
        };
      default:
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/50',
          text: 'text-blue-400',
          selectedBg: 'bg-blue-500/40'
        };
    }
  };

  const difficultyColors = getDifficultyColors();

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className="h-full"
    >
      <Card 
        className={`cursor-pointer h-full transition-all duration-300 backdrop-blur-md ${difficultyColors.bg} ${
          isSelected 
            ? `${difficultyColors.selectedBg} border-2 ${difficultyColors.border} ${colors.glow}` 
            : 'border border-white/10 hover:border-white/30'
        }`}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 h-full">
          <div className={`p-6 rounded-full ${difficultyColors.bg} ${difficultyColors.text} mb-6 ${isSelected ? colors.glow : ''}`}>
            {icon}
          </div>
          <h3 className={`text-2xl font-bold mb-4 ${difficultyColors.text}`}>
            {difficulty}
          </h3>
          <div className={`w-full h-2 mt-4 rounded-full ${difficultyColors.bg}`}>
            <motion.div 
              className={`h-full rounded-full ${colors.primary}`} 
              initial={{ width: 0 }}
              animate={{ width: difficulty === 'سهل' ? '33%' : difficulty === 'متوسط' ? '66%' : '100%' }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PuzzleDifficultyLevel;
