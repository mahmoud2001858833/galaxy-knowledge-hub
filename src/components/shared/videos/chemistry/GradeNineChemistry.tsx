
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, FlaskConical, ArrowRight, Zap } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';
import GradeNineFirstSemester from './GradeNineFirstSemester';
import MetalsActivityUnit from './units/MetalsActivityUnit';
import ElectrochemistryUnit from './units/ElectrochemistryUnit';

interface GradeNineChemistryProps {
  onBack: () => void;
}

const GradeNineChemistry = ({ onBack }: GradeNineChemistryProps) => {
  const { t, dir } = useLanguage();
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  const semesters = [
    {
      id: 'first',
      title: 'الفصل الأول',
      icon: <BookOpen className="w-8 h-8 text-blue-400" />,
      color: 'from-blue-500/20 to-cyan-500/30',
      borderColor: 'border-blue-500/30 hover:border-blue-500/60',
      description: 'بنية الذرة، الحموض والقواعد'
    },
    {
      id: 'second',
      title: 'الفصل الثاني',
      icon: <Calendar className="w-8 h-8 text-green-400" />,
      color: 'from-green-500/20 to-emerald-500/30',
      borderColor: 'border-green-500/30 hover:border-green-500/60',
      description: 'نشاط الفلزات، الكيمياء الكهربائية'
    }
  ];

  if (selectedSemester === 'first') {
    return <GradeNineFirstSemester onBack={() => setSelectedSemester(null)} />;
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

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-white to-emerald-500 mb-4">
            📗 الفصل الثاني - الكيمياء
          </h2>
          <p className="text-white/70">اختر الوحدة التي تريد دراستها</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            key="metals-activity"
            className={`cursor-pointer overflow-hidden bg-gradient-to-br from-orange-500/20 to-red-500/30 border-orange-500/30 hover:border-orange-500/60 transition-all duration-300 hover:-translate-y-1 shadow-lg`}
            onClick={() => setSelectedSemester('metals-activity')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center h-full">
                <div className="mb-6 p-4 rounded-full bg-blue-900/30 backdrop-blur-sm">
                  <FlaskConical className="w-10 h-10 text-orange-400" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4 leading-tight">
                  النشاط الفلزات
                </h3>
                
                <div className="flex flex-col gap-2 mb-6 text-white/80 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>2 دروس</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    <span>9 فيديو</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 text-sm rounded-full">
                  <span>ابدأ التعلم</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            key="electrochemistry"
            className={`cursor-pointer overflow-hidden bg-gradient-to-br from-yellow-500/20 to-orange-500/30 border-yellow-500/30 hover:border-yellow-500/60 transition-all duration-300 hover:-translate-y-1 shadow-lg`}
            onClick={() => setSelectedSemester('electrochemistry')}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center h-full">
                <div className="mb-6 p-4 rounded-full bg-blue-900/30 backdrop-blur-sm">
                  <Zap className="w-10 h-10 text-yellow-400" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4 leading-tight">
                  الكيمياء الكهربائية
                </h3>
                
                <div className="flex flex-col gap-2 mb-6 text-white/80 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>2 دروس</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <FlaskConical className="w-4 h-4" />
                    <span>11 فيديو</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 text-sm rounded-full">
                  <span>ابدأ التعلم</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (selectedSemester === 'metals-activity') {
    return <MetalsActivityUnit onBack={() => setSelectedSemester('second')} />;
  }

  if (selectedSemester === 'electrochemistry') {
    return <ElectrochemistryUnit onBack={() => setSelectedSemester('second')} />;
  }

  return (
    <div className="space-y-6 relative">
      {/* Teacher Credit */}
      <div className="absolute top-0 left-4 z-10">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-500/30 rounded-lg px-3 py-2">
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
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-blue-500 mb-4">
          الصف التاسع - الكيمياء
        </h2>
        <p className="text-white/70">اختر الفصل الدراسي</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {semesters.map((semester) => (
          <Card 
            key={semester.id}
            className={`cursor-pointer overflow-hidden bg-gradient-to-br ${semester.color} ${semester.borderColor} transition-all duration-300 hover:-translate-y-1 shadow-lg`}
            onClick={() => setSelectedSemester(semester.id)}
          >
            <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
              <div className="mb-6 p-4 rounded-full bg-blue-900/30 backdrop-blur-sm">
                {semester.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{semester.title}</h3>
              <p className="text-white/70 text-sm mb-4">{semester.description}</p>
              <div className="mt-auto">
                <span className="inline-block px-4 py-1 bg-cyan-500/20 text-cyan-300 text-sm rounded-full">
                  عرض الوحدات
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GradeNineChemistry;
