
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Atom, Microscope } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';
import AtomicComponentsLesson from './lessons/AtomicComponentsLesson';
import ElectronicDistributionLesson from './lessons/ElectronicDistributionLesson';

interface AtomicStructureUnitProps {
  onBack: () => void;
}

const AtomicStructureUnit = ({ onBack }: AtomicStructureUnitProps) => {
  const { t, dir } = useLanguage();
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const lessons = [
    {
      id: 'atomic-components',
      title: 'الدرس الأول: مكونات الذرة',
      icon: <Atom className="w-10 h-10 text-purple-400" />,
      color: 'from-purple-500/20 to-violet-500/30',
      borderColor: 'border-purple-500/30 hover:border-purple-500/60',
      videos: 4,
      description: 'تعرف على مكونات الذرة والنماذج الذرية المختلفة'
    },
    {
      id: 'electronic-distribution',
      title: 'الدرس الثاني: التوزيع الإلكتروني والجدول الدوري',
      icon: <Microscope className="w-10 h-10 text-blue-400" />,
      color: 'from-blue-500/20 to-cyan-500/30',
      borderColor: 'border-blue-500/30 hover:border-blue-500/60',
      videos: 8,
      description: 'دراسة التوزيع الإلكتروني والخصائص الدورية'
    }
  ];

  if (selectedLesson === 'atomic-components') {
    return <AtomicComponentsLesson onBack={() => setSelectedLesson(null)} />;
  }

  if (selectedLesson === 'electronic-distribution') {
    return <ElectronicDistributionLesson onBack={() => setSelectedLesson(null)} />;
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
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-violet-500 mb-4">
          ⚛️ الوحدة الأولى: بِنية الذرَّة
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

export default AtomicStructureUnit;
