import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, BookOpen, Star, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SUBJECTS, DIFFICULTY_LEVELS, LessonFormData } from './types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface LessonInputFormProps {
  onSubmit: (data: LessonFormData) => Promise<boolean>;
}

const LessonInputForm: React.FC<LessonInputFormProps> = ({ onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LessonFormData>({
    subject_name: '',
    lesson_name: '',
    first_study_date: new Date(),
    study_duration: 30,
    difficulty: 'medium',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject_name || !formData.lesson_name) return;

    setLoading(true);
    const success = await onSubmit(formData);
    if (success) {
      setFormData({
        subject_name: formData.subject_name,
        lesson_name: '',
        first_study_date: new Date(),
        study_duration: 30,
        difficulty: 'medium',
      });
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-slate-900/90 to-indigo-950/90 border-indigo-500/30 backdrop-blur-xl overflow-hidden">
        <CardHeader className="border-b border-indigo-500/20 pb-4">
          <CardTitle className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              <Plus className="h-6 w-6 text-indigo-400" />
            </div>
            إضافة درس جديد
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject Selection */}
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                اسم المادة
              </Label>
              <Select
                value={formData.subject_name}
                onValueChange={(value) => setFormData(prev => ({ ...prev, subject_name: value }))}
              >
                <SelectTrigger className="bg-slate-800/50 border-indigo-500/30 text-white">
                  <SelectValue placeholder="اختر المادة" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-indigo-500/30">
                  {SUBJECTS.map((subject) => (
                    <SelectItem key={subject.value} value={subject.value} className="text-white hover:bg-indigo-500/20">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: subject.color }} />
                        {subject.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lesson Name */}
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                اسم الدرس
              </Label>
              <Input
                value={formData.lesson_name}
                onChange={(e) => setFormData(prev => ({ ...prev, lesson_name: e.target.value }))}
                placeholder="أدخل اسم الدرس..."
                className="bg-slate-800/50 border-indigo-500/30 text-white placeholder:text-slate-400"
              />
            </div>

            {/* Study Date */}
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-400" />
                تاريخ الدراسة الأولى
              </Label>
              <Input
                type="date"
                value={format(formData.first_study_date, 'yyyy-MM-dd')}
                onChange={(e) => setFormData(prev => ({ ...prev, first_study_date: new Date(e.target.value) }))}
                className="bg-slate-800/50 border-indigo-500/30 text-white"
              />
            </div>

            {/* Study Duration */}
            <div className="space-y-3">
              <Label className="text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-400" />
                مدة الدراسة: {formData.study_duration} دقيقة
              </Label>
              <Slider
                value={[formData.study_duration]}
                onValueChange={(value) => setFormData(prev => ({ ...prev, study_duration: value[0] }))}
                min={15}
                max={180}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>15 دقيقة</span>
                <span>180 دقيقة</span>
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-3">
              <Label className="text-white flex items-center gap-2">
                <Star className="h-4 w-4 text-indigo-400" />
                مستوى الصعوبة
              </Label>
              <RadioGroup
                value={formData.difficulty}
                onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                  setFormData(prev => ({ ...prev, difficulty: value }))
                }
                className="flex gap-4"
              >
                {DIFFICULTY_LEVELS.map((level) => (
                  <div key={level.value} className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem
                      value={level.value}
                      id={level.value}
                      className="border-indigo-500/50 text-indigo-400"
                    />
                    <Label
                      htmlFor={level.value}
                      className="text-white cursor-pointer flex items-center gap-1"
                    >
                      {level.label}
                      <span className="text-yellow-400">
                        {'⭐'.repeat(level.stars)}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !formData.subject_name || !formData.lesson_name}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-6 text-lg font-bold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin ml-2" />
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 ml-2" />
                  إضافة الدرس وإنشاء جدول المراجعة
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LessonInputForm;
