
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus } from 'lucide-react';
import { Puzzle } from './types/puzzleTypes';
import PuzzlesList from './PuzzlesList';
import PuzzleDetails from './PuzzleDetails';
import PuzzleAdminPanel from './PuzzleAdminPanel';
import AddPuzzleForm from './AddPuzzleForm';

const BiologyPuzzles = () => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchPuzzles();
  }, []);
  
  const fetchPuzzles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('puzzles')
        .select('*')
        .eq('subject', 'biology')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const biologyPuzzles: Puzzle[] = [];
      
      if (data) {
        // Use type assertion to simplify handling
        const puzzlesData = data as unknown as Array<{
          id: string;
          title: string;
          question: string;
          correct_answer: string;
          difficulty: string;
          hint?: string;
          created_at: string;
        }>;
        
        puzzlesData.forEach(item => {
          biologyPuzzles.push({
            id: item.id,
            title: item.title,
            description: item.question,
            answer: item.correct_answer,
            difficulty: item.difficulty,
            hint: item.hint,
            created_at: item.created_at
          });
        });
      }
      
      setPuzzles(biologyPuzzles);
      if (biologyPuzzles.length > 0) {
        setSelectedPuzzle(biologyPuzzles[0]);
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
          <h2 className="text-2xl font-bold text-glow-green mb-2">ألغاز الأحياء</h2>
          <p className="text-white/70">اختبر معرفتك بالأحياء من خلال مجموعة من الألغاز المتنوعة</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            className="border-subject-biology-primary text-subject-biology-primary hover:bg-subject-biology-primary/20"
          >
            {showAdminPanel ? 'إخفاء لوحة المشرف' : 'لوحة المشرف'}
          </Button>
          
          {showAdminPanel && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-subject-biology-primary hover:bg-subject-biology-secondary">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة لغز جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <AddPuzzleForm 
                  onSuccess={fetchPuzzles} 
                  onClose={() => setIsDialogOpen(false)} 
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="puzzles">
        <TabsList className="bg-white/5 border-b border-white/10">
          <TabsTrigger 
            value="puzzles"
            className="text-white data-[state=active]:text-subject-biology-primary"
          >
            قائمة الألغاز
          </TabsTrigger>
          
          {showAdminPanel && (
            <TabsTrigger 
              value="management"
              className="text-white data-[state=active]:text-subject-biology-primary"
            >
              إدارة الألغاز
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="puzzles">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-subject-biology-primary" />
            </div>
          ) : puzzles.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-white/70">لا توجد ألغاز متاحة حالياً</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-12 gap-6">
              <PuzzlesList 
                puzzles={puzzles}
                loading={loading}
                selectedPuzzle={selectedPuzzle}
                handlePuzzleSelect={handlePuzzleSelect}
                difficultyColor={difficultyColor}
              />
              
              <div className="md:col-span-8">
                <PuzzleDetails selectedPuzzle={selectedPuzzle} />
              </div>
            </div>
          )}
        </TabsContent>
        
        {showAdminPanel && (
          <TabsContent value="management">
            <PuzzleAdminPanel 
              puzzles={puzzles}
              fetchPuzzles={fetchPuzzles}
              difficultyColor={difficultyColor}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default BiologyPuzzles;
