
import React from 'react';
import PuzzleItem from './PuzzleItem';
import { Puzzle } from './types/puzzleTypes';
import { Loader2 } from 'lucide-react';

interface PuzzlesListProps {
  puzzles: Puzzle[];
  loading: boolean;
  selectedPuzzle: Puzzle | null;
  handlePuzzleSelect: (puzzle: Puzzle) => void;
  difficultyColor: (difficulty: string) => string;
}

const PuzzlesList: React.FC<PuzzlesListProps> = ({
  puzzles,
  loading,
  selectedPuzzle,
  handlePuzzleSelect,
  difficultyColor
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-subject-biology-primary" />
      </div>
    );
  }

  if (puzzles.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-white/70">لا توجد ألغاز متاحة حالياً</p>
      </div>
    );
  }

  return (
    <div className="md:col-span-4">
      <h3 className="mb-3 font-medium">الألغاز المتاحة:</h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {puzzles.map((puzzle) => (
          <PuzzleItem
            key={puzzle.id}
            puzzle={puzzle}
            isSelected={selectedPuzzle?.id === puzzle.id}
            onSelect={handlePuzzleSelect}
            difficultyColor={difficultyColor}
          />
        ))}
      </div>
    </div>
  );
};

export default PuzzlesList;
