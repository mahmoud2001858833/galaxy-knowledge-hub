
import React, { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PuzzlePiece } from 'lucide-react';
import { motion } from 'framer-motion';

// Define form schema with Zod
const puzzleFormSchema = z.object({
  title: z.string().min(3, { message: 'العنوان يجب أن يكون 3 أحرف على الأقل' }),
  question: z.string().min(5, { message: 'السؤال يجب أن يكون 5 أحرف على الأقل' }),
  options: z.array(z.string()).min(2, { message: 'يجب إضافة خيارين على الأقل' }),
  correct_answer: z.string().min(1, { message: 'يرجى تحديد الإجابة الصحيحة' }),
  difficulty: z.string().min(1, { message: 'يرجى تحديد مستوى الصعوبة' }),
  points: z.number().min(1, { message: 'يجب أن تكون النقاط أكبر من 0' }),
  image: z.string().optional(),
});

type PuzzleFormValues = z.infer<typeof puzzleFormSchema>;

interface SubjectPuzzleFormProps {
  subject: string;
  onSuccess: () => void;
}

const SubjectPuzzleForm = ({ subject, onSuccess }: SubjectPuzzleFormProps) => {
  const [options, setOptions] = useState<string[]>(['', '']); // Initialize with two empty options
  const [currentOption, setCurrentOption] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<PuzzleFormValues>({
    resolver: zodResolver(puzzleFormSchema),
    defaultValues: {
      title: '',
      question: '',
      options: [],
      correct_answer: '',
      difficulty: '',
      points: 10,
      image: '',
    },
  });
  
  const addOption = () => {
    if (currentOption.trim() !== '') {
      const updatedOptions = [...options, currentOption];
      setOptions(updatedOptions);
      form.setValue('options', updatedOptions.filter(opt => opt.trim() !== ''));
      setCurrentOption('');
    }
  };

  const removeOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
    form.setValue('options', updatedOptions.filter(opt => opt.trim() !== ''));
    
    // If we're removing the currently selected correct answer, reset it
    const correctAnswer = form.getValues('correct_answer');
    if (correctAnswer === options[index]) {
      form.setValue('correct_answer', '');
    }
  };

  const handleImageUrlChange = (url: string) => {
    form.setValue('image', url);
    setImagePreview(url.trim() ? url : null);
  };

  const onSubmit = async (data: PuzzleFormValues) => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      // Prepare the complete puzzle data required by the database schema
      const puzzleData = {
        title: data.title,
        question: data.question,
        options: options.filter(opt => opt.trim() !== ''),
        correct_answer: data.correct_answer,
        difficulty: data.difficulty,
        points: data.points,
        image: data.image || null,
        subject: subject,
        admin_password: 'mahmoud', // Default admin password as required by the schema
        created_by: userId || null  // Set created_by explicitly
      };
        
      if (userId) {
        // Check if user profile exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        // If profile doesn't exist or there's an error, create it
        if (!profileData || profileError) {
          if (profileError && profileError.code !== 'PGRST116') {
            console.warn("Profile check error:", profileError);
          }
          
          // Create user profile if it doesn't exist
          await supabase.from('profiles').insert({
            id: userId,
            username: 'User',
            score: 0,
            solved_puzzles: 0
          });
        }
      }

      // Insert into subject_puzzles table
      const { error } = await supabase
        .from('subject_puzzles')
        .insert(puzzleData);

      if (error) throw error;

      toast.success('تم إضافة اللغز بنجاح');
      onSuccess();
      
      // Reset form
      form.reset();
      setOptions(['', '']);
      setImagePreview(null);
    } catch (error: any) {
      console.error('Error submitting puzzle:', error);
      toast.error(`فشل في إضافة اللغز: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-900/30 text-green-400 border-green-500/30';
      case 'medium':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30';
      case 'hard':
        return 'bg-red-900/30 text-red-400 border-red-500/30';
      default:
        return 'bg-white/10 text-white border-white/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className={`p-2 rounded-full bg-subject-${subject}-primary/20`}>
              <PuzzlePiece className={`h-5 w-5 text-subject-${subject}-primary`} />
            </div>
            <h2 className="text-xl font-bold text-white">إضافة لغز جديد</h2>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel className="text-white">عنوان اللغز</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="أدخل عنوان اللغز"
                            className="bg-white/10 border-white/20 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel className="text-white">السؤال</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="أدخل سؤال اللغز"
                            className="bg-white/10 border-white/20 text-white min-h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-white">مستوى الصعوبة</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className={`bg-white/10 border-white/20 text-white ${getDifficultyColor(field.value)}`}>
                                <SelectValue placeholder="اختر مستوى الصعوبة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-900 border-white/20 text-white">
                              <SelectItem value="easy" className="text-green-400">سهل</SelectItem>
                              <SelectItem value="medium" className="text-yellow-400">متوسط</SelectItem>
                              <SelectItem value="hard" className="text-red-400">صعب</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="points"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-white">النقاط</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="bg-white/10 border-white/20 text-white"
                              placeholder="أدخل عدد النقاط"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel className="text-white">رابط الصورة (اختياري)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="أدخل رابط الصورة (اختياري)"
                            className="bg-white/10 border-white/20 text-white"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleImageUrlChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        {imagePreview && (
                          <div className="mt-2 border border-white/20 rounded-md p-2">
                            <p className="text-xs text-white/60 mb-2">معاينة الصورة:</p>
                            <img 
                              src={imagePreview} 
                              alt="معاينة"
                              className="max-h-40 object-contain mx-auto rounded-md"
                              onError={() => setImagePreview(null)}
                            />
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-4 text-right">
                    <FormLabel className="text-white">الخيارات</FormLabel>
                    <div className="space-y-2">
                      {options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-500/10"
                            onClick={() => removeOption(index)}
                          >
                            ×
                          </Button>
                          <Input 
                            value={option}
                            onChange={(e) => {
                              const updatedOptions = [...options];
                              updatedOptions[index] = e.target.value;
                              setOptions(updatedOptions);
                              form.setValue('options', updatedOptions.filter(opt => opt.trim() !== ''));
                            }}
                            placeholder={`الخيار ${index + 1}`}
                            className="bg-white/10 border-white/20 text-white"
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Input
                        value={currentOption}
                        onChange={(e) => setCurrentOption(e.target.value)}
                        placeholder="أضف خيار جديد"
                        className="bg-white/10 border-white/20 text-white"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                      />
                      <Button 
                        type="button"
                        onClick={addOption}
                        className={`bg-subject-${subject}-primary hover:bg-subject-${subject}-primary/80`}
                      >
                        إضافة
                      </Button>
                    </div>
                    {form.formState.errors.options && (
                      <p className="text-red-500 text-sm">{form.formState.errors.options.message}</p>
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="correct_answer"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel className="text-white">الإجابة الصحيحة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="اختر الإجابة الصحيحة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-900 border-white/20 text-white">
                            {options.map((option, index) => (
                              option.trim() !== '' && (
                                <SelectItem key={index} value={option}>
                                  {option}
                                </SelectItem>
                              )
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      className={`w-full bg-subject-${subject}-primary hover:bg-subject-${subject}-primary/80`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'جاري الإضافة...' : 'إضافة اللغز'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SubjectPuzzleForm;
