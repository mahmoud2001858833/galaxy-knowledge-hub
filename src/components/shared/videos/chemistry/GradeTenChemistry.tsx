
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';
import FirstSemester from './FirstSemester';
import SecondSemester from './SecondSemester';

interface GradeTenChemistryProps {
  onBack: () => void;
}

const GradeTenChemistry = ({ onBack }: GradeTenChemistryProps) => {
  const { t, dir } = useLanguage();
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  const semesters = [
    {
      id: 'first',
      title: 'الفصل الأول',
      icon: <BookOpen className="w-8 h-8 text-blue-400" />,
      color: 'from-blue-500/20 to-cyan-500/30',
      borderColor: 'border-blue-500/30 hover:border-blue-500/60',
      description: 'بنية الذرة، التوزيع الإلكتروني، الروابط الكيميائية'
    },
    {
      id: 'second',
      title: 'الفصل الثاني',
      icon: <Calendar className="w-8 h-8 text-green-400" />,
      color: 'from-green-500/20 to-emerald-500/30',
      borderColor: 'border-green-500/30 hover:border-green-500/60',
      description: 'التفاعلات الكيميائية، الحسابات، الطاقة الكيميائية'
    }
  ];

  if (selectedSemester === 'first') {
    return <FirstSemester onBack={() => setSelectedSemester(null)} />;
  }

  if (selectedSemester === 'second') {
    return <SecondSemester onBack={() => setSelectedSemester(null)} />;
  }

  return (
    <div className="space-y-6">
      <Button
        onClick={onBack}
        variant="ghost"
        className="text-cyan-400 hover:text-cyan-300 hover:bg-blue-900/30"
      >
        &larr; العودة للصفوف
      </Button>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-cyan-500 mb-4">
          🧪 الصف العاشر - الكيمياء
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

export default GradeTenChemistry;
