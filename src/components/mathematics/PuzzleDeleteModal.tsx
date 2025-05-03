
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PuzzleDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzleId: string | null;
  onDelete: () => void;
}

const PuzzleDeleteModal = ({ isOpen, onClose, puzzleId, onDelete }: PuzzleDeleteModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!puzzleId) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('puzzles')
        .delete()
        .eq('id', puzzleId);

      if (error) throw error;
      
      toast.success('تم حذف اللغز بنجاح');
      onDelete();
      onClose();
    } catch (error: any) {
      console.error('Error deleting puzzle:', error);
      toast.error(`فشل حذف اللغز: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-space-cosmic-black border-white/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-right">حذف اللغز</DialogTitle>
          <DialogDescription className="text-right text-white/70">
            هل أنت متأكد من رغبتك في حذف هذا اللغز؟ لا يمكن التراجع عن هذا الإجراء.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-white/20 text-white hover:bg-white/10"
          >
            إلغاء
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'جاري الحذف...' : 'حذف اللغز'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PuzzleDeleteModal;
