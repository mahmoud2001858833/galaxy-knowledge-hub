
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import SubjectPuzzleDeleteModal from './SubjectPuzzleDeleteModal';
import { motion } from 'framer-motion';
import { Puzzle } from '@/components/shared/types/puzzleTypes';

interface SubjectPuzzlesListProps {
  subject: string;
  onRefresh?: () => void;
  refreshTrigger?: number;
}

const SubjectPuzzlesList = ({ subject, onRefresh, refreshTrigger }: SubjectPuzzlesListProps) => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchPuzzles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('subject_puzzles')
        .select('id, title, question, difficulty, points, created_at, subject')
        .eq('subject', subject)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPuzzles(data as Puzzle[] || []);
    } catch (error: any) {
      console.error('Error fetching puzzles:', error);
      toast.error('فشل في تحميل الألغاز');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPuzzles();
  }, [subject, refreshTrigger]);

  useEffect(() => {
    // Set up realtime subscription for new puzzles
    const channel = supabase
      .channel('subject_puzzles_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'subject_puzzles',
          filter: `subject=eq.${subject}`
        }, 
        () => {
          console.log('New puzzle detected, refreshing list');
          fetchPuzzles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [subject]);

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleCloseModal = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleDeleteSuccess = () => {
    fetchPuzzles();
    if (onRefresh) {
      onRefresh();
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'سهل';
      case 'medium': return 'متوسط';
      case 'hard': return 'صعب';
      default: return difficulty;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-900/50 text-green-300';
      case 'medium': return 'bg-yellow-900/50 text-yellow-300';
      case 'hard': return 'bg-red-900/50 text-red-300';
      default: return 'bg-blue-900/50 text-blue-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">الألغاز المضافة</h3>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className={`h-8 w-8 border-2 border-t-subject-${subject}-primary border-subject-${subject}-primary/20 rounded-full animate-spin`}></div>
        </div>
      ) : puzzles.length === 0 ? (
        <Card className="bg-white/5 border-white/10 text-white">
          <CardContent className="pt-6 text-center py-10">
            لا توجد ألغاز مضافة بعد.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {puzzles.map((puzzle, index) => (
            <motion.div
              key={puzzle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1 text-right flex-1">
                    <CardTitle className="text-lg">{puzzle.title}</CardTitle>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded-full ${getDifficultyColor(puzzle.difficulty)}`}>
                        {getDifficultyText(puzzle.difficulty)}
                      </span>
                      <span className={`text-subject-${subject}-primary bg-subject-${subject}-primary/10 px-2 py-1 rounded-full`}>
                        {puzzle.points} نقطة
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-600 hover:bg-red-600/10"
                    onClick={() => handleDeleteClick(puzzle.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </CardHeader>
                <CardContent className="text-right">
                  <p className="text-white/70 text-sm line-clamp-2">{puzzle.question}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      
      <SubjectPuzzleDeleteModal 
        isOpen={showDeleteModal} 
        onClose={handleCloseModal} 
        puzzleId={deleteId} 
        onDelete={handleDeleteSuccess}
      />
    </div>
  );
};

export default SubjectPuzzlesList;
