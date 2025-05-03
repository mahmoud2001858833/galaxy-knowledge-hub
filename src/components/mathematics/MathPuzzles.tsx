
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from 'sonner';

// Puzzle data structure
interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Puzzle {
  id: string;
  title: string;
  question: string;
  options: Option[];
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
}

// Sample puzzles
const samplePuzzles: Puzzle[] = [
  {
    id: '1',
    title: 'معادلة تربيعية',
    question: 'ما هي جذور المعادلة x² - 5x + 6 = 0؟',
    options: [
      { id: '1a', text: 'x = 2, x = 3', isCorrect: true },
      { id: '1b', text: 'x = -2, x = -3', isCorrect: false },
      { id: '1c', text: 'x = 1, x = 6', isCorrect: false },
      { id: '1d', text: 'x = -1, x = -6', isCorrect: false },
    ],
    difficulty: 'easy',
  },
  {
    id: '2',
    title: 'مجموع متتالية',
    question: 'ما هو مجموع المتتالية الحسابية 2, 5, 8, 11, ... حتى الحد العاشر؟',
    options: [
      { id: '2a', text: '155', isCorrect: false },
      { id: '2b', text: '137', isCorrect: true },
      { id: '2c', text: '145', isCorrect: false },
      { id: '2d', text: '125', isCorrect: false },
    ],
    difficulty: 'medium',
  },
  {
    id: '3',
    title: 'احتمالات متقدمة',
    question: 'في كيس يحتوي على 3 كرات حمراء و4 كرات زرقاء، إذا سحبت كرتين بالتتابع دون إرجاع، ما هو احتمال أن تكون الكرتان من نفس اللون؟',
    options: [
      { id: '3a', text: '4/7', isCorrect: false },
      { id: '3b', text: '1/2', isCorrect: false },
      { id: '3c', text: '2/7', isCorrect: false },
      { id: '3d', text: '3/7', isCorrect: true },
    ],
    difficulty: 'hard',
    imageUrl: 'https://images.unsplash.com/photo-166152608126-afe0a0b2fc96?q=80&w=600',
  },
];

const MathPuzzles: React.FC = () => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>(samplePuzzles);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  
  // New puzzle form
  const [newPuzzle, setNewPuzzle] = useState<{
    title: string;
    question: string;
    difficulty: 'easy' | 'medium' | 'hard';
    options: {
      text: string;
      isCorrect: boolean;
    }[];
    imageUrl: string;
  }>({
    title: '',
    question: '',
    difficulty: 'medium',
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    imageUrl: '',
  });
  
  const filteredPuzzles = selectedDifficulty === 'all'
    ? puzzles
    : puzzles.filter(puzzle => puzzle.difficulty === selectedDifficulty);
  
  const handlePuzzleSelect = (puzzle: Puzzle) => {
    setSelectedPuzzle(puzzle);
    setSelectedOption(null);
  };
  
  const handleSubmitAnswer = () => {
    if (!selectedPuzzle || !selectedOption) return;
    
    const selectedChoice = selectedPuzzle.options.find(option => option.id === selectedOption);
    
    if (selectedChoice?.isCorrect) {
      toast.success('إجابة صحيحة! تم إضافة 5 نقاط إلى حسابك.');
    } else {
      toast.error('إجابة خاطئة. حاول مرة أخرى.');
    }
    
    // Reset selection
    setTimeout(() => {
      setSelectedPuzzle(null);
      setSelectedOption(null);
    }, 2000);
  };
  
  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    setNewPuzzle(prev => {
      const updatedOptions = [...prev.options];
      
      if (field === 'isCorrect') {
        // First, set all options to false
        updatedOptions.forEach(option => option.isCorrect = false);
        // Then set the selected one to true
        updatedOptions[index].isCorrect = Boolean(value);
      } else {
        updatedOptions[index] = { 
          ...updatedOptions[index], 
          [field]: field === 'text' ? String(value) : Boolean(value) 
        };
      }
      
      return { ...prev, options: updatedOptions };
    });
  };
  
  const handleAddPuzzle = () => {
    // Simple validation
    if (!newPuzzle.title || !newPuzzle.question) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    if (newPuzzle.options.some(option => !option.text)) {
      toast.error('يرجى ملء جميع خيارات الإجابة');
      return;
    }
    
    // Create new puzzle
    const newPuzzleObj: Puzzle = {
      id: Date.now().toString(),
      title: newPuzzle.title,
      question: newPuzzle.question,
      options: newPuzzle.options.map((opt, index) => ({
        id: `new-${Date.now()}-${index}`,
        text: opt.text,
        isCorrect: opt.isCorrect,
      })),
      difficulty: newPuzzle.difficulty,
      imageUrl: newPuzzle.imageUrl || undefined,
    };
    
    // Add to puzzles
    setPuzzles(prev => [...prev, newPuzzleObj]);
    
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
      imageUrl: '',
    });
    
    setIsDialogOpen(false);
    toast.success('تم إضافة اللغز بنجاح');
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white text-right">ألغاز رياضية</h2>
        
        <div className="flex items-center gap-4">
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="الصعوبة" />
            </SelectTrigger>
            <SelectContent className="bg-space-cosmic-black border-white/20">
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="easy">سهل</SelectItem>
              <SelectItem value="medium">متوسط</SelectItem>
              <SelectItem value="hard">صعب</SelectItem>
            </SelectContent>
          </Select>
          
          {isAdmin ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-space-deep-purple hover:bg-space-deep-purple/80 text-white">
                  إضافة لغز
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-space-cosmic-black border-white/20 text-white sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة لغز جديد</DialogTitle>
                  <DialogDescription className="text-right text-white/70">
                    أدخل تفاصيل اللغز الجديد هنا
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4 text-right">
                  <div>
                    <label className="block mb-1">عنوان اللغز</label>
                    <Input 
                      value={newPuzzle.title} 
                      onChange={(e) => setNewPuzzle(prev => ({ ...prev, title: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1">نص اللغز</label>
                    <Textarea 
                      value={newPuzzle.question} 
                      onChange={(e) => setNewPuzzle(prev => ({ ...prev, question: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-1">مستوى الصعوبة</label>
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
                    <label className="block mb-1">خيارات الإجابة</label>
                    <div className="space-y-2">
                      {newPuzzle.options.map((option, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            value={option.text}
                            onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                            className="bg-white/10 border-white/20 text-white flex-1"
                            placeholder={`الخيار ${index + 1}`}
                          />
                          <div className="flex items-center">
                            <input
                              type="radio"
                              checked={option.isCorrect}
                              onChange={() => handleOptionChange(index, 'isCorrect', true)}
                              className="mr-2"
                            />
                            <span className="text-white/70">صحيح</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-1">رابط الصورة (اختياري)</label>
                    <Input 
                      value={newPuzzle.imageUrl} 
                      onChange={(e) => setNewPuzzle(prev => ({ ...prev, imageUrl: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    className="bg-space-deep-purple hover:bg-space-deep-purple/80 text-white"
                    onClick={handleAddPuzzle}
                  >
                    إضافة اللغز
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Button 
              className="bg-space-neon-blue/10 hover:bg-space-neon-blue/20 text-space-neon-blue border border-space-neon-blue/30"
              onClick={() => setIsAdmin(true)}
            >
              المشرف
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedPuzzle ? (
          // Puzzle solving screen
          <div className="col-span-full bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="mb-6">
              <button 
                onClick={() => setSelectedPuzzle(null)}
                className="text-space-neon-blue hover:text-space-bright-blue mb-4 text-right"
              >
                &larr; العودة إلى الألغاز
              </button>
              <h3 className="text-xl font-bold text-white mb-1 text-right">
                {selectedPuzzle.title}
              </h3>
              
              <div className={`text-white/80 mb-6 text-right ${selectedPuzzle.difficulty === 'easy' 
                ? 'text-green-300' 
                : selectedPuzzle.difficulty === 'medium' 
                  ? 'text-yellow-300' 
                  : 'text-red-300'}`}
              >
                {selectedPuzzle.difficulty === 'easy' && 'سهل'}
                {selectedPuzzle.difficulty === 'medium' && 'متوسط'}
                {selectedPuzzle.difficulty === 'hard' && 'صعب'}
              </div>
            </div>
            
            {selectedPuzzle.imageUrl && (
              <div className="mb-6 flex justify-center">
                <img 
                  src={selectedPuzzle.imageUrl} 
                  alt={selectedPuzzle.title}
                  className="rounded-lg max-h-60 object-contain"
                />
              </div>
            )}
            
            <div className="mb-8 text-white text-right">
              {selectedPuzzle.question}
            </div>
            
            <div className="space-y-3 mb-6">
              {selectedPuzzle.options.map((option) => (
                <div 
                  key={option.id} 
                  className={`p-4 rounded-lg border cursor-pointer transition-colors text-right ${
                    selectedOption === option.id
                      ? 'bg-space-deep-purple/40 border-space-deep-purple'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedOption(option.id)}
                >
                  {option.text}
                </div>
              ))}
            </div>
            
            <Button 
              className="bg-space-neon-blue hover:bg-space-bright-blue text-white w-full"
              disabled={!selectedOption}
              onClick={handleSubmitAnswer}
            >
              تأكيد الإجابة
            </Button>
          </div>
        ) : (
          // Puzzles list
          filteredPuzzles.map(puzzle => (
            <div 
              key={puzzle.id}
              className="bg-white/5 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors cursor-pointer border border-white/10 hover:border-white/30"
              onClick={() => handlePuzzleSelect(puzzle)}
            >
              {puzzle.imageUrl && (
                <div className="h-40 overflow-hidden">
                  <img 
                    src={puzzle.imageUrl} 
                    alt={puzzle.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <span 
                    className={`text-xs px-2 py-1 rounded-full ${
                      puzzle.difficulty === 'easy' 
                        ? 'bg-green-900/50 text-green-300' 
                        : puzzle.difficulty === 'medium' 
                          ? 'bg-yellow-900/50 text-yellow-300' 
                          : 'bg-red-900/50 text-red-300'
                    }`}
                  >
                    {puzzle.difficulty === 'easy' && 'سهل'}
                    {puzzle.difficulty === 'medium' && 'متوسط'}
                    {puzzle.difficulty === 'hard' && 'صعب'}
                  </span>
                  <h3 className="text-lg font-semibold text-white text-right">
                    {puzzle.title}
                  </h3>
                </div>
                
                <p className="text-white/70 text-sm line-clamp-2 text-right">
                  {puzzle.question}
                </p>
                
                <div className="mt-4 flex justify-end">
                  <span className="text-space-neon-blue text-sm">اضغط للحل &larr;</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {filteredPuzzles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/70">لا توجد ألغاز متاحة بهذا المستوى حالياً</p>
        </div>
      )}
    </div>
  );
};

export default MathPuzzles;
