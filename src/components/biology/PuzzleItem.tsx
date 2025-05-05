
import React from 'react';
import { Puzzle } from './types/puzzleTypes';

interface PuzzleItemProps {
  puzzle: Puzzle;
  isSelected: boolean;
  onSelect: (puzzle: Puzzle) => void;
  difficultyColor: (difficulty: string) => string;
}

const PuzzleItem: React.FC<PuzzleItemProps> = ({ 
  puzzle, 
  isSelected, 
  onSelect, 
  difficultyColor 
}) => {
  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-subject-biology-primary/20 border-r-4 border-subject-biology-primary'
          : 'bg-white/5 hover:bg-white/10'
      }`}
      onClick={() => onSelect(puzzle)}
    >
      <h4 className="font-medium">{puzzle.title}</h4>
      <div className="flex items-center mt-2">
        <span
          className={`${difficultyColor(
            puzzle.difficulty
          )} text-xs rounded-full px-2 py-1 text-white`}
        >
          {puzzle.difficulty}
        </span>
      </div>
    </div>
  );
};

export default PuzzleItem;
