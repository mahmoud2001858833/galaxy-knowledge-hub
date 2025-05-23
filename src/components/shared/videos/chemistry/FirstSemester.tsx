
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Atom, Zap, Link } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';
import UnitOne from './units/UnitOne';
import UnitTwo from './units/UnitTwo';
import UnitThree from './units/UnitThree';

interface FirstSemesterProps {
  onBack: () => void;
}

const FirstSemester = ({ onBack }: FirstSemesterProps) => {
  const { t, dir } = useLanguage();
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const units = [
    {
      id: 'unit-1',
      title: 'الوحدة الأولى: بنية الذرة وتركيبها',
      icon: <Atom className="w-8 h-8 text-purple-400" />,
      color: 'from-purple-500/20 to-violet-500/30',
      borderColor: 'border-purple-500/30 hover:border-purple-500/60',
      lessons: ['الذرة ونموذج ذرة الهيدروجين', 'النموذج الميكانيكي الموجي للذرة']
    },
    {
      id: 'unit-2',
      title: 'الوحدة الثانية: التوزيع الإلكتروني والدورية',
      icon: <Zap className="w-8 h-8 text-yellow-400" />,
      color: 'from-yellow-500/20 to-orange-500/30',
      borderColor: 'border-yellow-500/30 hover:border-yellow-500/60',
      lessons: ['التوزيع الإلكتروني للذرات', 'الخصائص الدورية للعناصر']
    },
    {
      id: 'unit-3',
      title: 'الوحدة الثالثة: المركبات والروابط الكيميائية',
      icon: <Link className="w-8 h-8 text-green-400" />,
      color: 'from-green-500/20 to-emerald-500/30',
      borderColor: 'border-green-500/30 hover:border-green-500/60',
      lessons: ['الروابط الكيميائية وأنواعها', 'الصيغ الكيميائية وخصائص المركبات']
    }
  ];

  if (selectedUnit === 'unit-1') {
    return <UnitOne onBack={() => setSelectedUnit(null)} />;
  }

  if (selectedUnit === 'unit-2') {
    return <UnitTwo onBack={() => setSelectedUnit(null)} />;
  }

  if (selectedUnit === 'unit-3') {
    return <UnitThree onBack={() => setSelectedUnit(null)} />;
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
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-cyan-500 mb-4">
          📘 الفصل الأول - الكيمياء
        </h2>
        <p className="text-white/70">اختر الوحدة التي تريد دراستها</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {units.map((unit) => (
          <Card 
            key={unit.id}
            className={`cursor-pointer overflow-hidden bg-gradient-to-br ${unit.color} ${unit.borderColor} transition-all duration-300 hover:-translate-y-1 shadow-lg`}
            onClick={() => setSelectedUnit(unit.id)}
          >
            <CardContent className="flex flex-col h-64 text-center p-6">
              <div className="mb-4 p-3 rounded-full bg-blue-900/30 backdrop-blur-sm mx-auto">
                {unit.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-3 flex-grow">{unit.title}</h3>
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

export default FirstSemester;
