
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical, Zap } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';
import UnitFour from './units/UnitFour';
import UnitFive from './units/UnitFive';

interface SecondSemesterProps {
  onBack: () => void;
}

const SecondSemester = ({ onBack }: SecondSemesterProps) => {
  const { t, dir } = useLanguage();
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const units = [
    {
      id: 'unit-4',
      title: 'الوحدة الأولى: التفاعلات والحسابات الكيميائية',
      icon: <FlaskConical className="w-8 h-8 text-blue-400" />,
      color: 'from-blue-500/20 to-cyan-500/30',
      borderColor: 'border-blue-500/30 hover:border-blue-500/60',
      lessons: ['التفاعلات الكيميائية', 'المول والكتلة المولية', 'الحسابات الكيميائية']
    },
    {
      id: 'unit-5',
      title: 'الوحدة الثانية: الطاقة الكيميائية',
      icon: <Zap className="w-8 h-8 text-red-400" />,
      color: 'from-red-500/20 to-pink-500/30',
      borderColor: 'border-red-500/30 hover:border-red-500/60',
      lessons: ['التغيرات الطاقية في التفاعلات الكيميائية', 'الطاقة الممتصة والطاقة المنبعثة من المادة', 'حسابات الطاقة في التفاعلات الكيميائية']
    }
  ];

  if (selectedUnit === 'unit-4') {
    return <UnitFour onBack={() => setSelectedUnit(null)} />;
  }

  if (selectedUnit === 'unit-5') {
    return <UnitFive onBack={() => setSelectedUnit(null)} />;
  }

  return (
    <div className="space-y-6">
      <Button
        onClick={onBack}
        variant="ghost"
        className="text-cyan-400 hover:text-cyan-300 hover:bg-blue-900/30"
      >
        &larr; العودة للفصول
      </Button>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-white to-emerald-500 mb-4">
          🔬 الفصل الثاني - الكيمياء
        </h2>
        <p className="text-white/70">اختر الوحدة التي تريد دراستها</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {units.map((unit) => (
          <Card 
            key={unit.id}
            className={`cursor-pointer overflow-hidden bg-gradient-to-br ${unit.color} ${unit.borderColor} transition-all duration-300 hover:-translate-y-1 shadow-lg`}
            onClick={() => setSelectedUnit(unit.id)}
          >
            <CardContent className="flex flex-col h-72 text-center p-6">
              <div className="mb-4 p-3 rounded-full bg-blue-900/30 backdrop-blur-sm mx-auto">
                {unit.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-4 flex-grow">{unit.title}</h3>
              <div className="space-y-2 mb-4">
                {unit.lessons.map((lesson, index) => (
                  <div key={index} className="text-xs text-white/60 bg-white/10 rounded px-2 py-1">
                    الدرس {index + 1}: {lesson}
                  </div>
                ))}
              </div>
              <div className="mt-auto">
                <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full">
                  عرض الدروس
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SecondSemester;
