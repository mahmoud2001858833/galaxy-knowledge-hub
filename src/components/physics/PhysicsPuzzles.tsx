
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Check, X } from 'lucide-react';

// Define interfaces outside of component
interface Puzzle {
  id: string;
  title: string;
  description: string;
  answer: string;
  difficulty: string;
  hint?: string;
  created_at: string;
}

interface PuzzleFormValues {
  title: string;
  description: string;
  hint?: string;
  answer: string;
  difficulty: string;
}

// Explicitly define the shape of the database items
interface DatabasePuzzle {
  id: string;
  title: string;
  question: string;
  correct_answer: string;
  difficulty: string;
  hint?: string;
  created_at: string;
  // Other fields that might be present
  admin_password?: string;
  image?: string | null;
  options?: string[];
  points?: number;
  created_by?: string | null;
  subject?: string;
}

const PhysicsPuzzles = () => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PuzzleFormValues>();
  
  useEffect(() => {
    fetchPuzzles();
  }, []);
  
  const fetchPuzzles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('puzzles')
        .select('*')
        .eq('subject', 'physics')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Explicitly type the mapping to avoid deep type instantiation
      const physicsPuzzles: Puzzle[] = [];
      
      if (data) {
        for (const item of data as DatabasePuzzle[]) {
          physicsPuzzles.push({
            id: item.id,
            title: item.title,
            description: item.question,
            answer: item.correct_answer,
            difficulty: item.difficulty,
            hint: item.hint,
            created_at: item.created_at
          });
        }
      }
      
      setPuzzles(physicsPuzzles);
      if (physicsPuzzles.length > 0) {
        setSelectedPuzzle(physicsPuzzles[0]);
      }
    } catch (error: any) {
      console.error('Error fetching puzzles:', error);
      toast({
        title: "خطأ في تحميل الألغاز",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handlePuzzleSelect = (puzzle: Puzzle) => {
    setSelectedPuzzle(puzzle);
    setUserAnswer('');
    setIsCorrect(null);
  };
  
  const checkAnswer = () => {
    if (!selectedPuzzle) return;
    
    const normalizedUserAnswer = userAnswer.trim().toLowerCase();
    const normalizedCorrectAnswer = selectedPuzzle.answer.trim().toLowerCase();
    
    const isAnswerCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
    setIsCorrect(isAnswerCorrect);
    
    if (isAnswerCorrect) {
      toast({
        title: "إجابة صحيحة! 🎉",
        description: "أحسنت! لقد أجبت بشكل صحيح على اللغز.",
        variant: "default"
      });
    } else {
      toast({
        title: "إجابة خاطئة",
        description: "حاول مرة أخرى أو استخدم التلميح للمساعدة.",
        variant: "destructive"
      });
    }
  };
  
  const onSubmitPuzzle = async (data: PuzzleFormValues) => {
    try {
      const { error } = await supabase.from('puzzles').insert([{
        title: data.title,
        question: data.description,
        correct_answer: data.answer,
        hint: data.hint,
        difficulty: data.difficulty,
        subject: 'physics',
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
      setIsDialogOpen(false);
      fetchPuzzles();
    } catch (error: any) {
      console.error('Error adding puzzle:', error);
      toast({
        title: "خطأ في إضافة اللغز",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
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
  
  const difficultyColor = (difficulty: string) => {
    switch(difficulty.toLowerCase()) {
      case 'سهل': return 'bg-green-600';
      case 'متوسط': return 'bg-yellow-600';
      case 'صعب': return 'bg-red-600';
      default: return 'bg-blue-600';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-glow-purple mb-2">ألغاز الفيزياء</h2>
          <p className="text-white/70">اختبر معرفتك بالفيزياء من خلال مجموعة من الألغاز المتنوعة</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            className="border-subject-physics-primary text-subject-physics-primary hover:bg-subject-physics-primary/20"
          >
            {showAdminPanel ? 'إخفاء لوحة المشرف' : 'لوحة المشرف'}
          </Button>
          
          {showAdminPanel && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-subject-physics-primary hover:bg-subject-physics-secondary">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة لغز جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة لغز فيزياء جديد</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitPuzzle)} className="space-y-4 text-right">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">عنوان اللغز</label>
                    <Input
                      {...register('title', { required: true })}
                      className="bg-white/5 border-subject-physics-primary/30"
                      placeholder="أدخل عنوان اللغز"
                    />
                    {errors.title && <p className="text-red-500 text-sm">هذا الحقل مطلوب</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">وصف اللغز</label>
                    <Input
                      {...register('description', { required: true })}
                      className="bg-white/5 border-subject-physics-primary/30"
                      placeholder="أدخل وصف اللغز"
                    />
                    {errors.description && <p className="text-red-500 text-sm">هذا الحقل مطلوب</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">تلميح (اختياري)</label>
                    <Input
                      {...register('hint')}
                      className="bg-white/5 border-subject-physics-primary/30"
                      placeholder="أدخل تلميحاً للمساعدة (اختياري)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الإجابة الصحيحة</label>
                    <Input
                      {...register('answer', { required: true })}
                      className="bg-white/5 border-subject-physics-primary/30"
                      placeholder="أدخل الإجابة الصحيحة"
                    />
                    {errors.answer && <p className="text-red-500 text-sm">هذا الحقل مطلوب</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">مستوى الصعوبة</label>
                    <select
                      {...register('difficulty', { required: true })}
                      className="w-full bg-white/5 border border-subject-physics-primary/30 rounded-md px-3 py-2"
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
                      className="bg-subject-physics-primary hover:bg-subject-physics-secondary"
                    >
                      إضافة اللغز
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="puzzles">
        <TabsList className="bg-white/5 border-b border-white/10">
          <TabsTrigger 
            value="puzzles"
            className="text-white data-[state=active]:text-subject-physics-primary"
          >
            قائمة الألغاز
          </TabsTrigger>
          
          {showAdminPanel && (
            <TabsTrigger 
              value="management"
              className="text-white data-[state=active]:text-subject-physics-primary"
            >
              إدارة الألغاز
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="puzzles">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-subject-physics-primary" />
            </div>
          ) : puzzles.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-white/70">لا توجد ألغاز متاحة حالياً</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-12 gap-6">
              <div className="md:col-span-4">
                <h3 className="mb-3 font-medium">الألغاز المتاحة:</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {puzzles.map((puzzle) => (
                    <div
                      key={puzzle.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedPuzzle?.id === puzzle.id
                          ? 'bg-subject-physics-primary/20 border-r-4 border-subject-physics-primary'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => handlePuzzleSelect(puzzle)}
                    >
                      <h4 className="font-medium">{puzzle.title}</h4>
                      <div className="flex items-center mt-2">
                        <span
                          className={`${difficultyColor(
                            puzzle.difficulty
                          )} text-xs rounded-full px-2 py-1 text-white`}
                        >
                          {puzzle.difficulty}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-8">
                {selectedPuzzle ? (
                  <Card className="bg-white/5 border-subject-physics-primary/30">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-subject-physics-primary">
                        {selectedPuzzle.title}
                      </h3>
                      
                      <p className="text-white/90 mb-6">{selectedPuzzle.description}</p>
                      
                      <div className="space-y-4">
                        {selectedPuzzle.hint && (
                          <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                            <h4 className="font-medium text-yellow-400 mb-1">تلميح:</h4>
                            <p className="text-white/80">{selectedPuzzle.hint}</p>
                          </div>
                        )}
                        
                        <div>
                          <div className="flex space-x-3 items-center">
                            <Input
                              value={userAnswer}
                              onChange={(e) => {
                                setUserAnswer(e.target.value);
                                setIsCorrect(null);
                              }}
                              placeholder="أدخل إجابتك هنا..."
                              className="bg-white/5 border-subject-physics-primary/30 focus:border-subject-physics-primary"
                            />
                            <Button 
                              onClick={checkAnswer}
                              className="bg-subject-physics-primary hover:bg-subject-physics-secondary"
                            >
                              تحقق
                            </Button>
                          </div>
                          
                          {isCorrect !== null && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`mt-3 p-2 rounded-md flex items-center ${
                                isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                              }`}
                            >
                              {isCorrect ? (
                                <>
                                  <Check className="w-5 h-5 text-green-400 ml-2" />
                                  <span>إجابة صحيحة! أحسنت!</span>
                                </>
                              ) : (
                                <>
                                  <X className="w-5 h-5 text-red-400 ml-2" />
                                  <span>إجابة خاطئة. حاول مرة أخرى!</span>
                                </>
                              )}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-white/70">الرجاء اختيار لغز من القائمة</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
        
        {showAdminPanel && (
          <TabsContent value="management">
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
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default PhysicsPuzzles;
