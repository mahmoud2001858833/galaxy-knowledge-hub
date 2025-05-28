
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, Microscope } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';
import GradeElevenBiology from './biology/GradeElevenBiology';

const BiologyVideos = () => {
  const { t, dir } = useLanguage();
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

  const grades = [
    {
      id: 'grade-11',
      title: 'الأول ثانوي',
      icon: <GraduationCap className="w-8 h-8 text-green-400" />,
      color: 'from-green-500/20 to-emerald-500/30',
      borderColor: 'border-green-500/30 hover:border-green-500/60',
      units: 2,
      lessons: 7,
      videos: 34
    },
    {
      id: 'grade-12',
      title: 'الثاني ثانوي',
      icon: <Microscope className="w-8 h-8 text-teal-400" />,
      color: 'from-teal-500/20 to-cyan-500/30',
      borderColor: 'border-teal-500/30 hover:border-teal-500/60',
      units: 3,
      lessons: 9,
      videos: 45,
      comingSoon: true
    }
  ];

  if (selectedGrade === 'grade-11') {
    return <GradeElevenBiology onBack={() => setSelectedGrade(null)} />;
  }

  if (selectedGrade === 'grade-12') {
    return (
      <div className="space-y-6">
        <Button
          onClick={() => setSelectedGrade(null)}
          variant="ghost"
          className="text-teal-400 hover:text-teal-300 hover:bg-teal-900/30"
        >
          &larr; العودة للصفوف
        </Button>
        
        <div className="text-center py-12">
          <Microscope className="w-16 h-16 text-teal-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">قريباً</h3>
          <p className="text-white/70">محتوى الثاني ثانوي سيكون متاحاً قريباً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-white to-emerald-500 mb-4">
          فيديوهات الأحياء التعليمية
        </h2>
        <p className="text-white/70">اختر الصف الدراسي لمشاهدة الفيديوهات التعليمية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {grades.map((grade) => (
          <Card 
            key={grade.id}
            className={`cursor-pointer overflow-hidden bg-gradient-to-br ${grade.color} ${grade.borderColor} transition-all duration-300 hover:-translate-y-1 shadow-lg ${grade.comingSoon ? 'opacity-60' : ''}`}
            onClick={() => {
              if (!grade.comingSoon) {
                setSelectedGrade(grade.id);
              }
            }}
          >
            <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
              <div className="mb-6 p-4 rounded-full bg-green-900/30 backdrop-blur-sm">
                {grade.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{grade.title}</h3>
              
              <div className="space-y-1 text-white/70 text-sm mb-4">
                <div>{grade.units} وحدات</div>
                <div>{grade.lessons} دروس</div>
                <div>{grade.videos} فيديو</div>
              </div>
              
              <div className="mt-auto">
                <span className="inline-block px-4 py-1 bg-green-500/20 text-green-300 text-sm rounded-full">
                  {grade.comingSoon ? 'قريباً' : 'استكشف المحتوى'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BiologyVideos;
