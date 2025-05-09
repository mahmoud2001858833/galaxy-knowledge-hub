
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubjectPuzzleDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzleId: string | null;
  onDelete?: () => void;
}

const SubjectPuzzleDeleteModal = ({ isOpen, onClose, puzzleId, onDelete }: SubjectPuzzleDeleteModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!puzzleId) return;
    
    setIsDeleting(true);
    try {
      // Use a raw SQL query instead of from() to avoid TypeScript errors
      // This is a workaround until the types are updated
      const { error } = await supabase
        .from('subject_puzzles' as any)
        .delete()
        .eq('id', puzzleId);

      if (error) throw error;
      
      toast.success('تم حذف اللغز بنجاح');
      onClose();
      if (onDelete) onDelete();
    } catch (error: any) {
      console.error('Error deleting puzzle:', error);
      toast.error('حدث خطأ أثناء حذف اللغز');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-space-cosmic-black border-white/20 text-white sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-white text-xl">تأكيد الحذف</DialogTitle>
          <DialogDescription className="text-white/70">
            هل أنت متأكد من حذف هذا اللغز؟ هذا الإجراء لا يمكن التراجع عنه.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row justify-center gap-2 sm:justify-center">
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
            className="bg-red-500 hover:bg-red-600"
          >
            {isDeleting ? 'جاري الحذف...' : 'حذف'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubjectPuzzleDeleteModal;
