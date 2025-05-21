
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzleId: string | null;
  onDelete: () => void;
}

const SubjectPuzzleDeleteModal = ({ isOpen, onClose, puzzleId, onDelete }: DeleteModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { t, dir } = useLanguage();
  
  const handleDelete = async () => {
    if (!puzzleId) return;
    
    try {
      setIsDeleting(true);
      
      // Delete the puzzle
      const { error } = await supabase
        .from('subject_puzzles')
        .delete()
        .eq('id', puzzleId);
        
      if (error) throw error;
      
      // Also delete any user solved puzzles records for this puzzle
      const { error: solvedError } = await supabase
        .from('user_solved_puzzles')
        .delete()
        .eq('puzzle_id', puzzleId);
        
      if (solvedError) console.error('Error deleting solved puzzles records:', solvedError);
      
      toast.success(t.admin.deleted);
      onDelete();
      onClose();
    } catch (error: any) {
      console.error('Error deleting puzzle:', error);
      toast.error(`${t.admin.error}: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-white/20 text-white" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white text-center">
            {t.puzzles.deletePuzzle}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 flex items-center gap-3 text-center">
          <AlertTriangle className="text-yellow-500 h-6 w-6" />
          <p>{t.puzzles.confirmDelete}</p>
        </div>
        
        <DialogFooter className="flex flex-row justify-between sm:justify-between gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            {t.common.cancel}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? `${t.common.loading}...` : t.puzzles.deletePuzzle}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectPuzzleDeleteModal;
