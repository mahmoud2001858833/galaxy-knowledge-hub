
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Brain } from 'lucide-react';
import PuzzleDifficultyLevel from './PuzzleDifficultyLevel';
import { useLanguage } from '@/i18n/LanguageContext';

interface PuzzleDifficultySelectorProps {
  subject: string;
  selectedDifficulty: string;
  onSelectDifficulty: (difficulty: string) => void;
}

const PuzzleDifficultySelector: React.FC<PuzzleDifficultySelectorProps> = ({ 
  subject, 
  selectedDifficulty, 
  onSelectDifficulty 
}) => {
  const { t, dir } = useLanguage();
  
  const difficulties = [
    { key: 'easy', name: 'سهل', icon: <Trophy className="h-5 w-5" /> },
    { key: 'medium', name: 'متوسط', icon: <Zap className="h-5 w-5" /> },
    { key: 'hard', name: 'صعب', icon: <Brain className="h-5 w-5" /> }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full"
      dir={dir}
    >
      <h3 className="text-xl font-bold text-white text-right mb-4">
        {t.puzzles.difficulty}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {difficulties.map((difficulty) => (
          <PuzzleDifficultyLevel
            key={difficulty.key}
            subject={subject}
            difficulty={difficulty.name}
            icon={difficulty.icon}
            isSelected={selectedDifficulty === difficulty.key}
            onSelect={() => onSelectDifficulty(difficulty.key)}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default PuzzleDifficultySelector;
