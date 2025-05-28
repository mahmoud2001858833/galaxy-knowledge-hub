
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';
import GradeElevenFirstSemester from './GradeElevenFirstSemester';

interface GradeElevenChemistryProps {
  onBack: () => void;
}

const GradeElevenChemistry = ({ onBack }: GradeElevenChemistryProps) => {
  const { t, dir } = useLanguage();
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  const semesters = [
    {
      id: 'first',
      title: 'الفصل الأول',
      icon: <BookOpen className="w-8 h-8 text-purple-400" />,
      color: 'from-purple-500/20 to-violet-500/30',
      borderColor: 'border-purple-500/30 hover:border-purple-500/60',
      description: 'أشكال الجزيئات، التفاعلات والحسابات الكيميائية'
    },
    {
      id: 'second',
      title: 'الفصل الثاني',
      icon: <Calendar className="w-8 h-8 text-pink-400" />,
      color: 'from-pink-500/20 to-rose-500/30',
      borderColor: 'border-pink-500/30 hover:border-pink-500/60',
      description: 'قريباً - سيكون متاحاً قريباً'
    }
  ];

  if (selectedSemester === 'first') {
    return <GradeElevenFirstSemester onBack={() => setSelectedSemester(null)} />;
  }

  if (selectedSemester === 'second') {
    return (
      <div className="space-y-6">
        <Button
          onClick={() => setSelectedSemester(null)}
          variant="ghost"
          className="text-cyan-400 hover:text-cyan-300 hover:bg-blue-900/30"
        >
          &larr; العودة للفصول
        </Button>
        
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">قريباً</h3>
          <p className="text-white/70">محتوى الفصل الثاني سيكون متاحاً قريباً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Teacher Credit */}
      <div className="absolute top-0 left-4 z-10">
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-2">
          <p className="text-white/80 text-sm font-medium">فيديوهات للأستاذ ليث دبابسة</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-cyan-400 hover:text-cyan-300 hover:bg-blue-900/30"
        >
          &larr; العودة للصفوف
        </Button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-pink-500 mb-4">
          🎓 الأول ثانوي - الكيمياء
        </h2>
        <p className="text-white/70">اختر الفصل الدراسي</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {semesters.map((semester) => (
          <Card 
            key={semester.id}
            className={`cursor-pointer overflow-hidden bg-gradient-to-br ${semester.color} ${semester.borderColor} transition-all duration-300 hover:-translate-y-1 shadow-lg ${semester.id === 'second' ? 'opacity-60' : ''}`}
            onClick={() => {
              if (semester.id === 'first') {
                setSelectedSemester(semester.id);
              }
            }}
          >
            <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
              <div className="mb-6 p-4 rounded-full bg-blue-900/30 backdrop-blur-sm">
                {semester.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{semester.title}</h3>
              <p className="text-white/70 text-sm mb-4">{semester.description}</p>
              <div className="mt-auto">
                <span className="inline-block px-4 py-1 bg-cyan-500/20 text-cyan-300 text-sm rounded-full">
                  {semester.id === 'first' ? 'عرض الوحدات' : 'قريباً'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GradeElevenChemistry;
