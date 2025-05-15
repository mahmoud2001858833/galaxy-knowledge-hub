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
import { Puzzle } from 'lucide-react';
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
      case "easy":
        return 'bg-gradient-to-r from-green-900/30 to-green-700/30 text-green-400 border-green-500/30';
      case "medium":
        return 'bg-gradient-to-r from-yellow-900/30 to-yellow-700/30 text-yellow-400 border-yellow-500/30';
      case "hard":
        return 'bg-gradient-to-r from-red-900/30 to-red-700/30 text-red-400 border-red-500/30';
      default:
        return 'bg-gradient-to-r from-white/10 to-white/5 text-white border-white/20';
    }
  };

  const getSubjectStyles = () => {
    switch (subject) {
      case "physics":
        return {
          bg: "bg-gradient-to-r from-subject-physics-primary/20 to-subject-physics-secondary/10",
          border: "border-subject-physics-primary/30",
          text: "text-subject-physics-primary",
          hoverBg: "hover:bg-subject-physics-primary/20"
        };
      case "chemistry":
        return {
          bg: "bg-gradient-to-r from-subject-chemistry-primary/20 to-subject-chemistry-secondary/10",
          border: "border-subject-chemistry-primary/30",
          text: "text-subject-chemistry-primary",
          hoverBg: "hover:bg-subject-chemistry-primary/20"
        };
      case "biology":
        return {
          bg: "bg-gradient-to-r from-subject-biology-primary/20 to-subject-biology-secondary/10",
          border: "border-subject-biology-primary/30",
          text: "text-subject-biology-primary",
          hoverBg: "hover:bg-subject-biology-primary/20"
        };
      case "mathematics":
        return {
          bg: "bg-gradient-to-r from-subject-mathematics-primary/20 to-subject-mathematics-secondary/10",
          border: "border-subject-mathematics-primary/30",
          text: "text-subject-mathematics-primary",
          hoverBg: "hover:bg-subject-mathematics-primary/20"
        };
      default:
        return {
          bg: "bg-gradient-to-r from-blue-900/20 to-purple-900/10",
          border: "border-blue-500/30",
          text: "text-blue-400",
          hoverBg: "hover:bg-blue-500/20"
        };
    }
  };

  const subjectStyles = getSubjectStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative z-10"
    >
      <Card className={`backdrop-blur-lg border-2 ${subjectStyles.border} shadow-lg shadow-black/30 overflow-hidden`}>
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <div className={`h-full w-full ${subjectStyles.bg}`}></div>
        </div>
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className={`p-3 rounded-full ${subjectStyles.bg} border border-white/10 shadow-inner`}>
              <Puzzle className={`h-7 w-7 ${subjectStyles.text}`} />
            </div>
            <h2 className="text-2xl font-bold text-white bg-clip-text bg-gradient-to-r from-white to-white/70">إضافة لغز جديد</h2>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel className="text-white text-lg mb-2">عنوان اللغز</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="أدخل عنوان اللغز"
                            className="bg-white/10 backdrop-blur-md border-white/20 text-white focus:border-white/40 hover:border-white/30 transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel className="text-white text-lg mb-2">السؤال</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="أدخل سؤال اللغز"
                            className="bg-white/10 backdrop-blur-md border-white/20 text-white min-h-32 focus:border-white/40 hover:border-white/30 transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-white text-lg mb-2">مستوى الصعوبة</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className={`bg-white/10 backdrop-blur-md border-white/20 text-white transition-all ${getDifficultyColor(field.value)}`}>
                                <SelectValue placeholder="اختر مستوى الصعوبة" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/20 text-white">
                              <SelectItem value="easy" className="text-green-400 hover:bg-green-900/20 focus:bg-green-900/30">سهل</SelectItem>
                              <SelectItem value="medium" className="text-yellow-400 hover:bg-yellow-900/20 focus:bg-yellow-900/30">متوسط</SelectItem>
                              <SelectItem value="hard" className="text-red-400 hover:bg-red-900/20 focus:bg-red-900/30">صعب</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="points"
                      render={({ field }) => (
                        <FormItem className="text-right">
                          <FormLabel className="text-white text-lg mb-2">النقاط</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              className="bg-white/10 backdrop-blur-md border-white/20 text-white focus:border-white/40 hover:border-white/30 transition-colors"
                              placeholder="أدخل عدد النقاط"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel className="text-white text-lg mb-2">رابط الصورة (اختياري)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="أدخل رابط الصورة (اختياري)"
                            className="bg-white/10 backdrop-blur-md border-white/20 text-white focus:border-white/40 hover:border-white/30 transition-colors"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleImageUrlChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                        {imagePreview && (
                          <div className="mt-3 border border-white/20 rounded-md p-2 bg-black/30 backdrop-blur-sm">
                            <p className="text-xs text-white/60 mb-2">معاينة الصورة:</p>
                            <img 
                              src={imagePreview} 
                              alt="معاينة"
                              className="max-h-48 object-contain mx-auto rounded-md"
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
                    <FormLabel className="text-white text-lg mb-2">الخيارات</FormLabel>
                    <div className="space-y-3">
                      {options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2 backdrop-blur-sm rounded-md bg-white/5 p-1 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-full h-8 w-8"
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
                            className="bg-white/10 backdrop-blur-md border-white/20 text-white focus:border-white/40 hover:border-white/30 transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <Input
                        value={currentOption}
                        onChange={(e) => setCurrentOption(e.target.value)}
                        placeholder="أضف خيار جديد"
                        className="bg-white/10 backdrop-blur-md border-white/20 text-white focus:border-white/40 hover:border-white/30 transition-colors"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                      />
                      <Button 
                        type="button"
                        onClick={addOption}
                        className={`${subjectStyles.bg} ${subjectStyles.text} ${subjectStyles.border} ${subjectStyles.hoverBg}`}
                      >
                        إضافة
                      </Button>
                    </div>
                    {form.formState.errors.options && (
                      <p className="text-red-400 text-sm">{form.formState.errors.options.message}</p>
                    )}
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="correct_answer"
                    render={({ field }) => (
                      <FormItem className="text-right">
                        <FormLabel className="text-white text-lg mb-2">الإجابة الصحيحة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-green-900/10 focus:bg-green-900/20 hover:border-green-500/30 transition-all">
                              <SelectValue placeholder="اختر الإجابة الصحيحة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/20 text-white">
                            {options.map((option, index) => (
                              option.trim() !== '' && (
                                <SelectItem key={index} value={option} className="hover:bg-green-900/20 focus:bg-green-900/30">
                                  {option}
                                </SelectItem>
                              )
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-8">
                    <Button 
                      type="submit" 
                      className={`w-full text-lg py-6 font-bold ${subjectStyles.bg} ${subjectStyles.text} ${subjectStyles.border} ${subjectStyles.hoverBg} shadow-lg transition-all`}
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
