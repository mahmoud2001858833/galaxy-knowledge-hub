
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ChevronDown, ChevronUp } from "lucide-react";
import VideoPlayer from '../../VideoPlayer';

interface ElectronicDistributionLessonProps {
  onBack: () => void;
}

const ElectronicDistributionLesson = ({ onBack }: ElectronicDistributionLessonProps) => {
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);

  const videos = [
    {
      id: 'distribution1',
      title: 'التوزيع الإلكتروني والجدول الدوري (الجزء 1)',
      url: 'https://www.youtube.com/watch?v=GkKnBciP_Jc',
      description: 'أساسيات التوزيع الإلكتروني وعلاقته بالجدول الدوري'
    },
    {
      id: 'distribution2',
      title: 'التوزيع الإلكتروني والجدول الدوري (الجزء 2)',
      url: 'https://www.youtube.com/watch?v=Jbpt0wvjIsU',
      description: 'تطبيقات عملية على التوزيع الإلكتروني'
    },
    {
      id: 'distribution3',
      title: 'التوزيع الإلكتروني والجدول الدوري (الجزء 3)',
      url: 'https://www.youtube.com/watch?v=7y5Mom0w37M',
      description: 'حالات خاصة في التوزيع الإلكتروني'
    },
    {
      id: 'periodic1',
      title: 'الخصائص الدورية في الجدول الدوري (الجزء 1)',
      url: 'https://www.youtube.com/watch?v=0lfEqNqSu20',
      description: 'دراسة الخصائص الدورية للعناصر'
    },
    {
      id: 'periodic2',
      title: 'الخصائص الدورية في الجدول الدوري (الجزء 2)',
      url: 'https://www.youtube.com/watch?v=d1RC_0Ciods',
      description: 'التطبيقات العملية للخصائص الدورية'
    },
    {
      id: 'exercises',
      title: 'حل أسئلة الخصائص الدورية',
      url: 'https://www.youtube.com/watch?v=jgXr7b3GFkw',
      description: 'حل التمارين والمسائل العملية'
    },
    {
      id: 'groups',
      title: 'مجموعات الجدول الدوري للعناصر الممثلة',
      url: 'https://www.youtube.com/watch?v=9p5W54QvWYY',
      description: 'دراسة مجموعات العناصر الممثلة وخصائصها'
    },
    {
      id: 'ions',
      title: 'التوزيع الإلكتروني للأيونات',
      url: 'https://www.youtube.com/watch?v=qvo5ZOIroEc',
      description: 'كيفية كتابة التوزيع الإلكتروني للأيونات'
    }
  ];

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
        <h2 className="text-2xl font-bold text-white mb-2">
          الدرس الثاني: التوزيع الإلكتروني والجدول الدوري
        </h2>
        <p className="text-white/70">اختر الفيديو الذي تريد مشاهدته</p>
      </div>

      <div className="space-y-4">
        {videos.map((video) => (
          <Card 
            key={video.id}
            className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 border-purple-500/30 hover:border-purple-500/60 transition-all duration-300"
          >
            <CardContent className="p-6">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedVideo(expandedVideo === video.id ? null : video.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-purple-600/30">
                    <Play className="w-6 h-6 text-purple-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{video.title}</h3>
                    <p className="text-white/60 text-sm">{video.description}</p>
                  </div>
                </div>
                {expandedVideo === video.id ? (
                  <ChevronUp className="w-5 h-5 text-white/70" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/70" />
                )}
              </div>
              
              {expandedVideo === video.id && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <VideoPlayer
                    videoUrl={video.url}
                    title={video.title}
                    onBack={() => setExpandedVideo(null)}
                    subject="chemistry"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ElectronicDistributionLesson;
