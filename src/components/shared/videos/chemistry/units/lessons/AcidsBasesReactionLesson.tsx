
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ChevronDown, ChevronUp } from "lucide-react";
import VideoPlayer from '../../VideoPlayer';

interface AcidsBasesReactionLessonProps {
  onBack: () => void;
}

const AcidsBasesReactionLesson = ({ onBack }: AcidsBasesReactionLessonProps) => {
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);

  const videos = [
    {
      id: 'neutralization',
      title: 'تفاعل التعادل',
      url: 'https://www.youtube.com/watch?v=OtR3WRIHrK0',
      description: 'فهم تفاعلات التعادل بين الأحماض والقواعد'
    },
    {
      id: 'ionic',
      title: 'المعادلة الأيونية',
      url: 'https://www.youtube.com/watch?v=Hwewn1aGN40',
      description: 'كتابة المعادلات الأيونية للتفاعلات'
    },
    {
      id: 'salts',
      title: 'الأملاح وطرق تحضيرها',
      url: 'https://www.youtube.com/watch?v=ETf0znVmyOc',
      description: 'تصنيف الأملاح والطرق المختلفة لتحضيرها'
    },
    {
      id: 'classification',
      title: 'تصنيف الأملاح وتحضير الأحماض صناعيًا',
      url: 'https://www.youtube.com/watch?v=4P6rBmFWFgQ',
      description: 'التطبيقات الصناعية لتحضير الأحماض'
    },
    {
      id: 'worksheet',
      title: 'حل ورقة العمل (خصائص الأحماض والقواعد)',
      url: 'https://www.youtube.com/watch?v=8XgPMjzo9IY',
      description: 'حل التمارين العملية والتطبيقات'
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
          الدرس الثاني: تفاعل الحموض والقواعد
        </h2>
        <p className="text-white/70">اختر الفيديو الذي تريد مشاهدته</p>
      </div>

      <div className="space-y-4">
        {videos.map((video) => (
          <Card 
            key={video.id}
            className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500/30 hover:border-green-500/60 transition-all duration-300"
          >
            <CardContent className="p-6">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedVideo(expandedVideo === video.id ? null : video.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-600/30">
                    <Play className="w-6 h-6 text-green-300" />
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
                    url={video.url}
                    title={video.title}
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

export default AcidsBasesReactionLesson;
