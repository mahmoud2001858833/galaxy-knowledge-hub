
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
          primary: 'bg-subject-physics-primary',
          secondary: 'bg-subject-physics-secondary',
          border: 'border-subject-physics-primary',
          text: 'text-subject-physics-primary',
          glow: 'shadow-glow-purple'
        };
      case 'chemistry':
        return {
          primary: 'bg-subject-chemistry-primary',
          secondary: 'bg-subject-chemistry-secondary',
          border: 'border-subject-chemistry-primary',
          text: 'text-subject-chemistry-primary',
          glow: 'shadow-glow-blue'
        };
      case 'biology':
        return {
          primary: 'bg-subject-biology-primary',
          secondary: 'bg-subject-biology-secondary',
          border: 'border-subject-biology-primary',
          text: 'text-subject-biology-primary',
          glow: 'shadow-glow-green'
        };
      case 'mathematics':
        return {
          primary: 'bg-subject-mathematics-primary',
          secondary: 'bg-subject-mathematics-secondary',
          border: 'border-subject-mathematics-primary',
          text: 'text-subject-mathematics-primary',
          glow: 'shadow-glow-orange'
        };
      default:
        return {
          primary: 'bg-blue-600',
          secondary: 'bg-blue-700',
          border: 'border-blue-500',
          text: 'text-blue-500',
          glow: 'shadow-glow-blue'
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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
    >
      <Card 
        className={`cursor-pointer h-full transition-all duration-300 ${difficultyColors.bg} ${
          isSelected 
            ? `${difficultyColors.selectedBg} ${difficultyColors.border} ${colors.glow}` 
            : 'border-white/10 hover:border-white/30'
        }`}
      >
        <CardContent className="flex flex-col items-center justify-center p-6 h-full">
          <div className={`p-3 rounded-full ${difficultyColors.bg} ${difficultyColors.text} mb-4`}>
            {icon}
          </div>
          <h3 className={`text-xl font-bold mb-2 ${difficultyColors.text}`}>
            {difficulty}
          </h3>
          <div className={`w-full h-1 mt-2 rounded-full ${difficultyColors.bg}`}>
            <div 
              className={`h-full rounded-full ${colors.primary}`} 
              style={{ width: difficulty === 'سهل' ? '33%' : difficulty === 'متوسط' ? '66%' : '100%' }} 
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PuzzleDifficultyLevel;
