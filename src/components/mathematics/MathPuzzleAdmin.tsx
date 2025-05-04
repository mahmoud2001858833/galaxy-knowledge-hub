
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { PlusCircle, Circle, ArrowRight, Minus, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PuzzlesList from './PuzzlesList';

interface PuzzleFormData {
  title: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  points: number;
  imageUrl: string;
}

const MathPuzzleAdmin = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("add");
  
  // New puzzle form
  const [newPuzzle, setNewPuzzle] = useState<PuzzleFormData>({
    title: '',
    question: '',
    difficulty: 'medium',
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    points: 5,
    imageUrl: '',
  });
  
  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    setNewPuzzle(prev => {
      const updatedOptions = [...prev.options];
      
      if (field === 'isCorrect') {
        // First, set all options to false
        updatedOptions.forEach(option => option.isCorrect = false);
        // Then set the selected one to true
        updatedOptions[index].isCorrect = true;
      } else if (field === 'text') {
        // For text field, ensure we're using string
        updatedOptions[index] = {
          ...updatedOptions[index],
          text: String(value)
        };
      }
      
      return { ...prev, options: updatedOptions };
    });
  };
  
  const addOption = () => {
    if (newPuzzle.options.length >= 6) {
      toast.error('الحد الأقصى للخيارات هو 6 خيارات');
      return;
    }
    
    setNewPuzzle(prev => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }]
    }));
  };
  
  const removeOption = (index: number) => {
    if (newPuzzle.options.length <= 2) {
      toast.error('يجب أن يكون هناك خياران على الأقل');
      return;
    }
    
    // Check if we're removing the correct answer
    const isRemovingCorrect = newPuzzle.options[index].isCorrect;
    
    setNewPuzzle(prev => {
      const updatedOptions = prev.options.filter((_, i) => i !== index);
      
      // If we removed the correct answer, set the first option as correct
      if (isRemovingCorrect && updatedOptions.length > 0) {
        updatedOptions[0].isCorrect = true;
      }
      
      return { ...prev, options: updatedOptions };
    });
  };
  
  const handleAddPuzzle = async () => {
    // Simple validation
    if (!newPuzzle.title || !newPuzzle.question) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    if (newPuzzle.options.some(option => !option.text)) {
      toast.error('يرجى ملء جميع خيارات الإجابة');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Find the correct answer text
      const correctOption = newPuzzle.options.find(opt => opt.isCorrect);
      
      if (!correctOption) {
        toast.error('يرجى تحديد الإجابة الصحيحة');
        setIsSubmitting(false);
        return;
      }
      
      // Format options for database
      const formattedOptions = newPuzzle.options.map(opt => opt.text);
      
      // Insert into database - don't use user_id here to fix the permission issue
      const { data, error } = await supabase
        .from('puzzles')
        .insert([
          {
            title: newPuzzle.title,
            question: newPuzzle.question,
            options: formattedOptions,
            correct_answer: correctOption.text,
            difficulty: newPuzzle.difficulty,
            points: newPuzzle.points,
            image: newPuzzle.imageUrl || null,
            // Don't include created_by field that references users
          }
        ]);
      
      if (error) throw error;
      
      toast.success('تم إضافة اللغز بنجاح');
      
      // Reset form
      setNewPuzzle({
        title: '',
        question: '',
        difficulty: 'medium',
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
        points: 5,
        imageUrl: '',
      });
      
      // Switch to the manage tab after adding
      setActiveTab("manage");
    } catch (error: any) {
      console.error('Error adding puzzle:', error);
      toast.error('حدث خطأ أثناء إضافة اللغز: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="glass-card rounded-2xl p-8 space-y-6 animate-in fade-in duration-500 slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <div className="bg-space-deep-purple/30 p-2 rounded-full">
          <PlusCircle className="text-space-neon-blue h-6 w-6" />
        </div>
        <h3 className="text-2xl font-bold text-white text-right">لوحة إدارة الألغاز</h3>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="add" className="text-white data-[state=active]:bg-space-deep-purple">
            إضافة لغز جديد
          </TabsTrigger>
          <TabsTrigger value="manage" className="text-white data-[state=active]:bg-space-deep-purple">
            إدارة الألغاز
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="add" className="mt-0">
          <div className="grid gap-4 py-4 text-right">
            <div>
              <label className="block mb-1 text-white">عنوان اللغز</label>
              <Input 
                value={newPuzzle.title} 
                onChange={(e) => setNewPuzzle(prev => ({ ...prev, title: e.target.value }))}
                className="bg-white/10 border-white/20 text-white"
                placeholder="مثال: معادلة تربيعية"
              />
            </div>
            
            <div>
              <label className="block mb-1 text-white">نص اللغز</label>
              <Textarea 
                value={newPuzzle.question} 
                onChange={(e) => setNewPuzzle(prev => ({ ...prev, question: e.target.value }))}
                className="bg-white/10 border-white/20 text-white"
                rows={4}
                placeholder="مثال: ما هي جذور المعادلة x² - 5x + 6 = 0؟"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-white">مستوى الصعوبة</label>
                <Select 
                  value={newPuzzle.difficulty} 
                  onValueChange={(val: 'easy' | 'medium' | 'hard') => 
                    setNewPuzzle(prev => ({ ...prev, difficulty: val }))
                  }
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent className="bg-space-cosmic-black border-white/20">
                    <SelectItem value="easy">سهل</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="hard">صعب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block mb-1 text-white">النقاط</label>
                <Input 
                  type="number" 
                  value={newPuzzle.points} 
                  onChange={(e) => setNewPuzzle(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                  className="bg-white/10 border-white/20 text-white"
                  min={1}
                  max={20}
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-1 text-white">رابط الصورة (اختياري)</label>
              <Input 
                value={newPuzzle.imageUrl} 
                onChange={(e) => setNewPuzzle(prev => ({ ...prev, imageUrl: e.target.value }))}
                className="bg-white/10 border-white/20 text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <Button 
                  type="button" 
                  variant="outline"
                  size="sm"
                  className="text-space-neon-blue border-space-neon-blue/30 hover:bg-space-neon-blue/10"
                  onClick={addOption}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  إضافة خيار
                </Button>
                <label className="text-white">خيارات الإجابة</label>
              </div>
              <div className="space-y-3">
                {newPuzzle.options.map((option, index) => (
                  <div key={index} className="flex gap-2 items-center bg-white/5 p-3 rounded-lg border border-white/10">
                    <Button 
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-600/10"
                      onClick={() => removeOption(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex-1">
                      <Input
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder={`الخيار ${index + 1}`}
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleOptionChange(index, 'isCorrect', true)}
                      className="flex items-center justify-center h-10 w-10 rounded-full"
                    >
                      {option.isCorrect ? (
                        <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                          <Circle className="h-2 w-2 text-white fill-white" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-white/50 hover:border-green-500" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full bg-space-deep-purple hover:bg-space-neon-blue flex items-center justify-center gap-2 mt-6"
            onClick={handleAddPuzzle}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'جاري الإضافة...' : 'إضافة اللغز'}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </TabsContent>
        
        <TabsContent value="manage" className="mt-0">
          <PuzzlesList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MathPuzzleAdmin;
