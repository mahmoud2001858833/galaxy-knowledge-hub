import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface UserPreferences {
  age: string;
  grade: string;
  school: string;
  accuracy: string;
  explanationType: string;
}

interface PreferencesFormProps {
  onSave: (preferences: UserPreferences) => void;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({ onSave }) => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    age: '',
    grade: '',
    school: '',
    accuracy: '',
    explanationType: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (preferences.age && preferences.grade && preferences.accuracy && preferences.explanationType) {
      onSave(preferences);
    }
  };

  const grades = [
    'الصف الأول',
    'الصف الثاني', 
    'الصف الثالث',
    'الصف الرابع',
    'الصف الخامس',
    'الصف السادس',
    'الصف السابع',
    'الصف الثامن',
    'الصف التاسع',
    'الصف العاشر',
    'الصف الحادي عشر',
    'الصف الثاني عشر'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="age" className="text-white/90">العمر</Label>
          <Input
            id="age"
            type="number"
            placeholder="15"
            value={preferences.age}
            onChange={(e) => setPreferences(prev => ({...prev, age: e.target.value}))}
            className="bg-gray-900/50 border-indigo-500/30 text-white placeholder:text-gray-400"
            min="6"
            max="25"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade" className="text-white/90">الصف الدراسي</Label>
          <Select 
            value={preferences.grade} 
            onValueChange={(value) => setPreferences(prev => ({...prev, grade: value}))}
            required
          >
            <SelectTrigger className="bg-gray-900/50 border-indigo-500/30 text-white">
              <SelectValue placeholder="اختر الصف" />
            </SelectTrigger>
            <SelectContent>
              {grades.map((grade) => (
                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="school" className="text-white/90">اسم المدرسة (اختياري)</Label>
        <Input
          id="school"
          placeholder="مدرسة الملك عبدالله الثاني"
          value={preferences.school}
          onChange={(e) => setPreferences(prev => ({...prev, school: e.target.value}))}
          className="bg-gray-900/50 border-indigo-500/30 text-white placeholder:text-gray-400"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-white/90">مستوى دقة الإجابة المطلوب</Label>
        <Select 
          value={preferences.accuracy} 
          onValueChange={(value) => setPreferences(prev => ({...prev, accuracy: value}))}
          required
        >
          <SelectTrigger className="bg-gray-900/50 border-indigo-500/30 text-white">
            <SelectValue placeholder="اختر مستوى الدقة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">أساسي - معلومات عامة</SelectItem>
            <SelectItem value="intermediate">متوسط - تفاصيل أكثر</SelectItem>
            <SelectItem value="advanced">متقدم - شرح شامل ومفصل</SelectItem>
            <SelectItem value="expert">خبير - تحليل عميق ودقيق</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-white/90">نوع الشرح المفضل</Label>
        <Select 
          value={preferences.explanationType} 
          onValueChange={(value) => setPreferences(prev => ({...prev, explanationType: value}))}
          required
        >
          <SelectTrigger className="bg-gray-900/50 border-indigo-500/30 text-white">
            <SelectValue placeholder="اختر نوع الشرح" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="detailed">شرح مفصل - تفاصيل دقيقة وأمثلة كثيرة</SelectItem>
            <SelectItem value="general">شرح عام - نظرة شاملة مبسطة</SelectItem>
            <SelectItem value="visual">شرح مرئي - اعتماد على الأمثلة والصور</SelectItem>
            <SelectItem value="practical">شرح عملي - تطبيقات وتمارين</SelectItem>
            <SelectItem value="conceptual">شرح مفاهيمي - فهم الأسس النظرية</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="p-4 bg-indigo-900/20 border-indigo-500/30">
        <p className="text-sm text-indigo-200 leading-relaxed">
          💡 <strong>ملاحظة:</strong> ستساعد هذه المعلومات الذكاء الاصطناعي في تخصيص الإجابات لتناسب مستواك التعليمي وأسلوب التعلم المفضل لديك.
        </p>
      </Card>

      <div className="flex justify-center pt-4">
        <Button
          type="submit"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-2"
          disabled={!preferences.age || !preferences.grade || !preferences.accuracy || !preferences.explanationType}
        >
          ✨ بدء التجربة التعليمية
        </Button>
      </div>
    </form>
  );
};

export default PreferencesForm;