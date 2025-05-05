
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PuzzleFormValues } from './types/puzzleTypes';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddPuzzleFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

const AddPuzzleForm: React.FC<AddPuzzleFormProps> = ({ onSuccess, onClose }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PuzzleFormValues>();
  const { toast } = useToast();

  const onSubmitPuzzle = async (data: PuzzleFormValues) => {
    try {
      const { error } = await supabase.from('puzzles').insert([{
        title: data.title,
        question: data.description,
        correct_answer: data.correct_answer || data.answer, // Use whichever is available
        hint: data.hint,
        difficulty: data.difficulty,
        subject: 'biology',
        options: [], // Empty array as placeholder
        points: 10 // Default points
      }]);
      
      if (error) throw error;
      
      toast({
        title: "تم إضافة اللغز بنجاح",
        description: "تمت إضافة اللغز الجديد إلى قاعدة البيانات",
        variant: "default"
      });
      
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding puzzle:', error);
      toast({
        title: "خطأ في إضافة اللغز",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-right">إضافة لغز أحياء جديد</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmitPuzzle)} className="space-y-4 text-right">
        <div className="space-y-2">
          <label className="text-sm font-medium">عنوان اللغز</label>
          <Input
            {...register('title', { required: true })}
            className="bg-white/5 border-subject-biology-primary/30"
            placeholder="أدخل عنوان اللغز"
          />
          {errors.title && <p className="text-red-500 text-sm">هذا الحقل مطلوب</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">وصف اللغز</label>
          <Input
            {...register('description', { required: true })}
            className="bg-white/5 border-subject-biology-primary/30"
            placeholder="أدخل وصف اللغز"
          />
          {errors.description && <p className="text-red-500 text-sm">هذا الحقل مطلوب</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">تلميح (اختياري)</label>
          <Input
            {...register('hint')}
            className="bg-white/5 border-subject-biology-primary/30"
            placeholder="أدخل تلميحاً للمساعدة (اختياري)"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">الإجابة الصحيحة</label>
          <Input
            {...register('correct_answer', { required: true })}
            className="bg-white/5 border-subject-biology-primary/30"
            placeholder="أدخل الإجابة الصحيحة"
          />
          {errors.correct_answer && <p className="text-red-500 text-sm">هذا الحقل مطلوب</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">مستوى الصعوبة</label>
          <select
            {...register('difficulty', { required: true })}
            className="w-full bg-white/5 border border-subject-biology-primary/30 rounded-md px-3 py-2"
          >
            <option value="سهل">سهل</option>
            <option value="متوسط">متوسط</option>
            <option value="صعب">صعب</option>
          </select>
          {errors.difficulty && <p className="text-red-500 text-sm">هذا الحقل مطلوب</p>}
        </div>
        
        <div className="flex justify-start">
          <Button 
            type="submit"
            className="bg-subject-biology-primary hover:bg-subject-biology-secondary"
          >
            إضافة اللغز
          </Button>
        </div>
      </form>
    </>
  );
};

export default AddPuzzleForm;
