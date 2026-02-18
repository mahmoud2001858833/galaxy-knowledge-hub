
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ChemistryPuzzleType } from '@/types/chemistry';
import { Loader2, FlaskConical, Award, Lock } from "lucide-react";
import PuzzleImageUploader from '@/components/shared/PuzzleImageUploader';

const ChemistryPuzzles = () => {
  const [puzzles, setPuzzles] = useState<ChemistryPuzzleType[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // New puzzle state
  const [newPuzzle, setNewPuzzle] = useState({
    title: "",
    question: "",
    options: ["", "", "", ""],
    correct_answer: "",
    difficulty: "سهل",
    points: 10,
    image: null as string | null
  });
  
  useEffect(() => {
    fetchPuzzles();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (data) setIsAdmin(true);
  };
  
  const fetchPuzzles = async () => {
    setIsLoading(true);
    try {
      // Fetch puzzles from 'chemistry_puzzles' table
      const { data, error } = await supabase
        .from('chemistry_puzzles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        setPuzzles(data as ChemistryPuzzleType[]);
      }
    } catch (error) {
      console.error('Error fetching puzzles:', error);
      toast.error('حدث خطأ أثناء تحميل الألغاز');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAnswerSelect = (puzzleId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [puzzleId]: answer
    }));
  };
  
  const checkAnswer = (puzzleId: string) => {
    const puzzle = puzzles.find(p => p.id === puzzleId);
    const selectedAnswer = selectedAnswers[puzzleId];
    
    if (!puzzle || !selectedAnswer) return;
    
    if (selectedAnswer === puzzle.correct_answer) {
      toast.success('إجابة صحيحة! أحسنت.');
    } else {
      toast.error('إجابة خاطئة. حاول مرة أخرى.');
    }
  };
  
  
  const handleNewPuzzleChange = (field: string, value: string | number) => {
    setNewPuzzle(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...newPuzzle.options];
    newOptions[index] = value;
    setNewPuzzle(prev => ({
      ...prev,
      options: newOptions
    }));
  };
  
  const addNewPuzzle = async () => {
    try {
      // Validate puzzle data
      if (!newPuzzle.title || !newPuzzle.question || !newPuzzle.correct_answer) {
        toast.error("يرجى ملء جميع الحقول المطلوبة");
        return;
      }
      
      // Check if we have at least 2 options
      if (newPuzzle.options.filter(opt => opt.trim() !== '').length < 2) {
        toast.error("يرجى إضافة خيارين على الأقل");
        return;
      }
      
      // Filter out empty options
      const validOptions = newPuzzle.options.filter(opt => opt.trim() !== '');
      
      // Check if correct answer is in the options
      if (!validOptions.includes(newPuzzle.correct_answer)) {
        toast.error("الإجابة الصحيحة يجب أن تكون ضمن الخيارات");
        return;
      }
      
      const { data, error } = await supabase
        .from('chemistry_puzzles')
        .insert([{
          title: newPuzzle.title,
          question: newPuzzle.question,
          options: validOptions,
          correct_answer: newPuzzle.correct_answer,
          difficulty: newPuzzle.difficulty,
          points: newPuzzle.points,
          image: newPuzzle.image
        }])
        .select();
      
      if (error) throw error;
      
      toast.success("تم إضافة اللغز بنجاح");
      
      // Reset form
      setNewPuzzle({
        title: "",
        question: "",
        options: ["", "", "", ""],
        correct_answer: "",
        difficulty: "سهل",
        points: 10,
        image: null
      });
      
      // Refresh puzzles
      fetchPuzzles();
      
    } catch (error) {
      console.error('Error adding puzzle:', error);
      toast.error('حدث خطأ أثناء إضافة اللغز');
    }
  };
  
  // Render difficulty badge
  const renderDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "سهل":
        return <Badge className="bg-green-600">سهل</Badge>;
      case "متوسط":
        return <Badge className="bg-yellow-600">متوسط</Badge>;
      case "صعب":
        return <Badge className="bg-red-600">صعب</Badge>;
      default:
        return <Badge className="bg-blue-600">{difficulty}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
      </div>
    );
  }
  
  return (
    <div>
      <motion.h2 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-cyan-400 mb-6 text-center"
      >
        ألغاز الكيمياء
      </motion.h2>
      
      <div className="mb-8">
        <p className="text-white/70">اختبر معلوماتك في الكيمياء من خلال هذه الألغاز المتنوعة</p>
      </div>
      
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-10"
        >
          <Card className="border-cyan-500/30 bg-blue-950/50">
            <CardHeader>
              <CardTitle className="text-cyan-400">إضافة لغز جديد</CardTitle>
              <CardDescription>أدخل تفاصيل اللغز الجديد</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="puzzle-title" className="text-white">عنوان اللغز</Label>
                <Input
                  id="puzzle-title"
                  className="bg-blue-950/50 border-cyan-900/30"
                  placeholder="أدخل عنوان اللغز"
                  value={newPuzzle.title}
                  onChange={(e) => handleNewPuzzleChange("title", e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="puzzle-question" className="text-white">السؤال</Label>
                <Textarea
                  id="puzzle-question"
                  className="bg-blue-950/50 border-cyan-900/30"
                  placeholder="أدخل نص السؤال"
                  value={newPuzzle.question}
                  onChange={(e) => handleNewPuzzleChange("question", e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="puzzle-difficulty" className="text-white">المستوى</Label>
                  <select
                    id="puzzle-difficulty"
                    className="w-full p-2 rounded-md bg-blue-950/50 border-cyan-900/30 text-white"
                    value={newPuzzle.difficulty}
                    onChange={(e) => handleNewPuzzleChange("difficulty", e.target.value)}
                  >
                    <option value="سهل">سهل</option>
                    <option value="متوسط">متوسط</option>
                    <option value="صعب">صعب</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="puzzle-points" className="text-white">النقاط</Label>
                  <Input
                    id="puzzle-points"
                    type="number"
                    min="1"
                    className="bg-blue-950/50 border-cyan-900/30"
                    value={newPuzzle.points}
                    onChange={(e) => handleNewPuzzleChange("points", parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">الخيارات</Label>
                <div className="space-y-2">
                  {newPuzzle.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 space-x-reverse">
                      <Input
                        className="bg-blue-950/50 border-cyan-900/30"
                        placeholder={`الخيار ${index + 1}`}
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                      />
                      <input 
                        type="radio"
                        name="correct-answer"
                        checked={newPuzzle.correct_answer === option}
                        onChange={() => handleNewPuzzleChange("correct_answer", option)}
                        className="form-radio h-4 w-4 text-cyan-600 transition duration-150 ease-in-out"
                      />
                      <Label className="text-white">إجابة صحيحة</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <PuzzleImageUploader
                currentImageUrl={newPuzzle.image || ''}
                onImageUrl={(url) => handleNewPuzzleChange("image", url)}
              />
            </CardContent>
            <CardFooter>
              <Button onClick={addNewPuzzle} className="bg-cyan-600 hover:bg-cyan-700">إضافة اللغز</Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
      
      {puzzles.length === 0 ? (
        <div className="text-center py-10">
          <FlaskConical className="w-12 h-12 text-cyan-400/50 mx-auto mb-4" />
          <p className="text-white/70">لا توجد ألغاز متاحة حالياً</p>
          {isAdmin && (
            <p className="text-white/50 text-sm mt-2">أضف بعض الألغاز باستخدام النموذج أعلاه</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {puzzles.map((puzzle) => (
            <motion.div
              key={puzzle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-cyan-800/20 bg-blue-950/30 overflow-hidden">
                <CardHeader className="pb-2 border-b border-cyan-900/20">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <FlaskConical className="w-5 h-5 text-cyan-400" />
                      <CardTitle className="text-cyan-400">{puzzle.title}</CardTitle>
                    </div>
                    <div className="flex space-x-2 space-x-reverse items-center">
                      {renderDifficultyBadge(puzzle.difficulty)}
                      <Badge variant="outline" className="border-cyan-700/50 text-cyan-300">
                        <Award className="w-3 h-3 ml-1" />
                        {puzzle.points} نقطة
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-4">
                    <p className="text-white text-lg">{puzzle.question}</p>
                  </div>
                  
                  {puzzle.image && (
                    <div className="mb-4">
                      <img 
                        src={puzzle.image} 
                        alt={puzzle.title} 
                        className="rounded-md max-h-60 mx-auto" 
                      />
                    </div>
                  )}
                  
                  <RadioGroup 
                    value={selectedAnswers[puzzle.id] || ""}
                    onValueChange={(value) => handleAnswerSelect(puzzle.id, value)}
                    className="space-y-2 mt-4"
                  >
                    {puzzle.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value={option} id={`${puzzle.id}-option-${optionIndex}`} />
                        <Label 
                          htmlFor={`${puzzle.id}-option-${optionIndex}`}
                          className="text-white cursor-pointer"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="bg-cyan-600 hover:bg-cyan-700"
                    disabled={!selectedAnswers[puzzle.id]}
                    onClick={() => checkAnswer(puzzle.id)}
                  >
                    تحقق من الإجابة
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChemistryPuzzles;
