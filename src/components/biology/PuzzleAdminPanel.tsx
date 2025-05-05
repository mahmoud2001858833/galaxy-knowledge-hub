
import React from 'react';
import { Button } from '@/components/ui/button';
import { Puzzle } from './types/puzzleTypes';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PuzzleAdminPanelProps {
  puzzles: Puzzle[];
  fetchPuzzles: () => Promise<void>;
  difficultyColor: (difficulty: string) => string;
}

const PuzzleAdminPanel: React.FC<PuzzleAdminPanelProps> = ({ puzzles, fetchPuzzles, difficultyColor }) => {
  const { toast } = useToast();

  const deletePuzzle = async (id: string) => {
    try {
      const { error } = await supabase.from('puzzles').delete().eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "تم حذف اللغز بنجاح",
        variant: "default"
      });
      
      fetchPuzzles();
    } catch (error: any) {
      console.error('Error deleting puzzle:', error);
      toast({
        title: "خطأ في حذف اللغز",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-white/5 text-right">
            <th className="p-3 border-b border-white/10">العنوان</th>
            <th className="p-3 border-b border-white/10">مستوى الصعوبة</th>
            <th className="p-3 border-b border-white/10">الإجابة</th>
            <th className="p-3 border-b border-white/10">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {puzzles.map((puzzle) => (
            <tr key={puzzle.id} className="border-b border-white/10 hover:bg-white/5">
              <td className="p-3">{puzzle.title}</td>
              <td className="p-3">
                <span
                  className={`${difficultyColor(
                    puzzle.difficulty
                  )} text-xs rounded-full px-2 py-1 text-white`}
                >
                  {puzzle.difficulty}
                </span>
              </td>
              <td className="p-3">{puzzle.answer}</td>
              <td className="p-3">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deletePuzzle(puzzle.id)}
                >
                  حذف
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PuzzleAdminPanel;
