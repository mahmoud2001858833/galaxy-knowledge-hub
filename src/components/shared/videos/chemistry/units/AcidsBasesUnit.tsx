
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, FlaskConical, TestTube } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';
import AcidsPropertiesLesson from './lessons/AcidsPropertiesLesson';
import AcidsBasesReactionLesson from './lessons/AcidsBasesReactionLesson';

interface AcidsBasesUnitProps {
  onBack: () => void;
}

const AcidsBasesUnit = ({ onBack }: AcidsBasesUnitProps) => {
  const { t, dir } = useLanguage();
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const lessons = [
    {
      id: 'acids-properties',
      title: 'الدرس الأول: خصائص الحموض والقواعد',
      icon: <FlaskConical className="w-10 h-10 text-green-400" />,
      color: 'from-green-500/20 to-emerald-500/30',
      borderColor: 'border-green-500/30 hover:border-green-500/60',
      videos: 5,
      description: 'تعرف على خصائص الأحماض والقواعد والكواشف'
    },
    {
      id: 'acids-bases-reaction',
      title: 'الدرس الثاني: تفاعل الحموض والقواعد',
      icon: <TestTube className="w-10 h-10 text-teal-400" />,
      color: 'from-teal-500/20 to-cyan-500/30',
      borderColor: 'border-teal-500/30 hover:border-teal-500/60',
      videos: 5,
      description: 'دراسة تفاعلات التعادل وتكوين الأملاح'
    }
  ];

  if (selectedLesson === 'acids-properties') {
    return <AcidsPropertiesLesson onBack={() => setSelectedLesson(null)} />;
  }

  if (selectedLesson === 'acids-bases-reaction') {
    return <AcidsBasesReactionLesson onBack={() => setSelectedLesson(null)} />;
  }

  return (
    <div className="space-y-6">
      <Button
        onClick={onBack}
        variant="ghost"
        className="text-cyan-400 hover:text-cyan-300 hover:bg-blue-900/30"
      >
        &larr; العودة للوحدات
      </Button>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-white to-emerald-500 mb-4">
          🧪 الوحدة الثانية: الحموض والقواعد والأملاح
        </h2>
        <p className="text-white/70">اختر الدرس الذي تريد دراسته</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lessons.map((lesson) => (
          <Card 
            key={lesson.id}
            className={`cursor-pointer overflow-hidden bg-gradient-to-br ${lesson.color} ${lesson.borderColor} transition-all duration-300 hover:-translate-y-1 shadow-lg`}
            onClick={() => setSelectedLesson(lesson.id)}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center h-full">
                <div className="mb-6 p-4 rounded-full bg-blue-900/30 backdrop-blur-sm">
                  {lesson.icon}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4 leading-tight">
                  {lesson.title}
                </h3>
                
                <p className="text-white/70 text-sm mb-6 leading-relaxed">
                  {lesson.description}
                </p>
                
                <div className="flex flex-col gap-2 mb-6 text-white/80 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{lesson.videos} فيديو</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 text-sm rounded-full">
                  <span>ابدأ التعلم</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AcidsBasesUnit;
