
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzleId: string | null;
  onDelete: () => void;
}

const SubjectPuzzleDeleteModal = ({ isOpen, onClose, puzzleId, onDelete }: DeleteModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
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
      
      toast.success('تم حذف اللغز بنجاح');
      onDelete();
      onClose();
    } catch (error: any) {
      console.error('Error deleting puzzle:', error);
      toast.error(`فشل في حذف اللغز: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white text-center">تأكيد حذف اللغز</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 flex items-center gap-3 text-center">
          <AlertTriangle className="text-yellow-500 h-6 w-6" />
          <p>هل أنت متأكد من رغبتك في حذف هذا اللغز؟ هذه العملية لا يمكن التراجع عنها.</p>
        </div>
        
        <DialogFooter className="flex flex-row justify-between sm:justify-between gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1"
          >
            إلغاء
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? 'جاري الحذف...' : 'حذف اللغز'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectPuzzleDeleteModal;
