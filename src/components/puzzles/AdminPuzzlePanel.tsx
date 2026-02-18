import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Upload, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import PuzzleImageUploader from '@/components/shared/PuzzleImageUploader';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Puzzle {
  id: string;
  title: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
  points: number;
  subject: string;
  image: string | null;
}

interface AdminPuzzlePanelProps {
  onPuzzleChange: () => void;
}

const AdminPuzzlePanel: React.FC<AdminPuzzlePanelProps> = ({ onPuzzleChange }) => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPuzzle, setEditingPuzzle] = useState<Puzzle | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    question: '',
    options: ['', '', '', ''],
    correct_answer: '',
    difficulty: 'سهل',
    points: 10,
    subject: 'الفيزياء',
    image: ''
  });

  useEffect(() => {
    fetchPuzzles();
  }, []);

  const fetchPuzzles = async () => {
    try {
      const { data, error } = await supabase
        .from('subject_puzzles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPuzzles(data || []);
    } catch (error) {
      console.error('Error fetching puzzles:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      question: '',
      options: ['', '', '', ''],
      correct_answer: '',
      difficulty: 'سهل',
      points: 10,
      subject: 'الفيزياء',
      image: ''
    });
    setEditingPuzzle(null);
  };

  const openEditForm = (puzzle: Puzzle) => {
    setFormData({
      title: puzzle.title,
      question: puzzle.question,
      options: [...puzzle.options, '', '', '', ''].slice(0, 4),
      correct_answer: puzzle.correct_answer,
      difficulty: puzzle.difficulty,
      points: puzzle.points,
      subject: puzzle.subject,
      image: puzzle.image || ''
    });
    setEditingPuzzle(puzzle);
    setIsFormOpen(true);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('يرجى إدخال عنوان اللغز');
      return;
    }
    if (!formData.question.trim()) {
      toast.error('يرجى إدخال السؤال');
      return;
    }
    
    const validOptions = formData.options.filter(o => o.trim());
    if (validOptions.length < 2) {
      toast.error('يرجى إدخال خيارين على الأقل');
      return;
    }
    if (!formData.correct_answer) {
      toast.error('يرجى تحديد الإجابة الصحيحة');
      return;
    }

    setSubmitting(true);
    try {
      const puzzleData = {
        title: formData.title.trim(),
        question: formData.question.trim(),
        options: validOptions,
        correct_answer: formData.correct_answer,
        difficulty: formData.difficulty,
        points: formData.points,
        subject: formData.subject,
        image: formData.image.trim() || null
      };

      if (editingPuzzle) {
        // Update existing puzzle
        const { error } = await supabase
          .from('subject_puzzles')
          .update(puzzleData)
          .eq('id', editingPuzzle.id);

        if (error) throw error;
        toast.success('تم تحديث اللغز بنجاح');
      } else {
        // Create new puzzle
        const { error } = await supabase
          .from('subject_puzzles')
          .insert(puzzleData);

        if (error) throw error;
        toast.success('تم إضافة اللغز بنجاح');
      }

      resetForm();
      setIsFormOpen(false);
      fetchPuzzles();
      onPuzzleChange();
    } catch (error: any) {
      console.error('Error saving puzzle:', error);
      toast.error(error.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subject_puzzles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('تم حذف اللغز بنجاح');
      setDeleteId(null);
      fetchPuzzles();
      onPuzzleChange();
    } catch (error: any) {
      console.error('Error deleting puzzle:', error);
      toast.error(error.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'سهل': return 'bg-emerald-500/20 text-emerald-400';
      case 'متوسط': return 'bg-amber-500/20 text-amber-400';
      case 'صعب': return 'bg-rose-500/20 text-rose-400';
      default: return 'bg-primary/20 text-primary';
    }
  };

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/20">
            <Upload className="h-5 w-5 text-primary" />
          </div>
          إدارة الألغاز
        </CardTitle>
        
        <Dialog open={isFormOpen} onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة لغز جديد
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPuzzle ? 'تعديل اللغز' : 'إضافة لغز جديد'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Title */}
              <div className="space-y-2">
                <Label>عنوان اللغز *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="أدخل عنوان اللغز"
                  dir="rtl"
                />
              </div>

              {/* Question */}
              <div className="space-y-2">
                <Label>السؤال *</Label>
                <Textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="أدخل نص السؤال"
                  dir="rtl"
                  rows={3}
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <Label>الخيارات (4 خيارات) *</Label>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-muted-foreground w-6">{index + 1}.</span>
                      <Input
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`الخيار ${index + 1}`}
                        dir="rtl"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Correct Answer */}
              <div className="space-y-2">
                <Label>الإجابة الصحيحة *</Label>
                <RadioGroup
                  value={formData.correct_answer}
                  onValueChange={(value) => setFormData({ ...formData, correct_answer: value })}
                  className="space-y-2"
                >
                  {formData.options.map((option, index) => (
                    option.trim() && (
                      <div key={index} className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                        {formData.correct_answer === option && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                    )
                  ))}
                </RadioGroup>
              </div>

              {/* Subject and Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>المادة</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="الفيزياء">⚛️ الفيزياء</SelectItem>
                      <SelectItem value="الكيمياء">🧪 الكيمياء</SelectItem>
                      <SelectItem value="الأحياء">🧬 الأحياء</SelectItem>
                      <SelectItem value="الرياضيات">📐 الرياضيات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>مستوى الصعوبة</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="سهل">🟢 سهل</SelectItem>
                      <SelectItem value="متوسط">🟡 متوسط</SelectItem>
                      <SelectItem value="صعب">🔴 صعب</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Points */}
              <div className="space-y-2">
                <Label>النقاط</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 10 })}
                />
              </div>

              {/* Image Upload */}
              <PuzzleImageUploader
                currentImageUrl={formData.image}
                onImageUrl={(url) => setFormData({ ...formData, image: url })}
              />

              {/* Submit Button */}
              <Button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  editingPuzzle ? 'حفظ التعديلات' : 'إضافة اللغز'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            جاري التحميل...
          </div>
        ) : puzzles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>لا توجد ألغاز بعد</p>
            <p className="text-sm">أضف لغزك الأول!</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {puzzles.map((puzzle) => (
                <motion.div
                  key={puzzle.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{puzzle.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={getDifficultyColor(puzzle.difficulty)}>
                        {puzzle.difficulty}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{puzzle.points} نقاط</span>
                      <span className="text-sm text-muted-foreground">{puzzle.subject}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditForm(puzzle)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    
                    <Dialog open={deleteId === puzzle.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(puzzle.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>تأكيد الحذف</DialogTitle>
                        </DialogHeader>
                        <p>هل أنت متأكد من حذف هذا اللغز؟</p>
                        <p className="font-semibold">{puzzle.title}</p>
                        <div className="flex gap-2 justify-end mt-4">
                          <Button variant="outline" onClick={() => setDeleteId(null)}>
                            إلغاء
                          </Button>
                          <Button variant="destructive" onClick={() => handleDelete(puzzle.id)}>
                            حذف
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminPuzzlePanel;
