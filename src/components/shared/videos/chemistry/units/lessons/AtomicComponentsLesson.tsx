
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ChevronDown, ChevronUp } from "lucide-react";
import VideoPlayer from '../../VideoPlayer';

interface AtomicComponentsLessonProps {
  onBack: () => void;
}

const AtomicComponentsLesson = ({ onBack }: AtomicComponentsLessonProps) => {
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);

  const videos = [
    {
      id: 'intro',
      title: 'مقدمة الوحدة الأولى: البنية الذرية',
      url: 'https://www.youtube.com/watch?v=YzZrcpFWEI4',
      description: 'مقدمة شاملة عن بنية الذرة ومكوناتها الأساسية'
    },
    {
      id: 'dalton',
      title: 'نموذج دالتون الذري وتجارب التحليل الكهربائي',
      url: 'https://www.youtube.com/watch?v=FDluh_-2zwI',
      description: 'شرح نموذج دالتون الذري وأهمية تجارب التحليل الكهربائي'
    },
    {
      id: 'thomson',
      title: 'نموذج ثومسون ورذر فورد',
      url: 'https://www.youtube.com/watch?v=br-xYOSz3qQ',
      description: 'مقارنة بين نماذج ثومسون ورذر فورد الذرية'
    },
    {
      id: 'isotopes',
      title: 'النظائر وحل أسئلة الدرس الأول',
      url: 'https://www.youtube.com/watch?v=LOBSBbf76qA',
      description: 'فهم النظائر وحل التمارين العملية'
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
          الدرس الأول: مكونات الذرة
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

export default AtomicComponentsLesson;
