import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ChevronDown, ChevronUp } from "lucide-react";
import VideoPlayer from '../../../VideoPlayer';

interface VSEPRLessonProps {
  onBack: () => void;
}

const VSEPRLesson = ({ onBack }: VSEPRLessonProps) => {
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);

  const videos = [
    {
      id: 'review',
      title: 'مراجعة التركيب الإلكتروني',
      url: 'https://www.youtube.com/watch?v=Q7kPfFx0ZWs',
      description: 'مراجعة شاملة للتركيب الإلكتروني للذرات'
    },
    {
      id: 'molecules',
      title: 'رسم الجزيئات',
      url: 'https://www.youtube.com/watch?v=PF9jBxigGag',
      description: 'تعلم كيفية رسم الجزيئات بطريقة صحيحة'
    },
    {
      id: 'ions',
      title: 'رسم الأيونات',
      url: 'https://www.youtube.com/watch?v=XmqeQ7XdWZI',
      description: 'رسم الأيونات وفهم تركيبها'
    },
    {
      id: 'multiple',
      title: 'رسم المركبات المحتوية على روابط متعددة',
      url: 'https://www.youtube.com/watch?v=XZXHj3VR720',
      description: 'التعامل مع الروابط المتعددة في المركبات'
    },
    {
      id: 'vsepr',
      title: 'نظرية تنافر أزواج إلكترونات مستوى التكافؤ',
      url: 'https://www.youtube.com/watch?v=kJ1q8kRzWPg',
      description: 'فهم نظرية VSEPR وتطبيقاتها'
    },
    {
      id: 'exercises',
      title: 'حل أسئلة الدرس',
      url: 'https://www.youtube.com/watch?v=-P0qnL8XA2g',
      description: 'حل التمارين العملية على النظرية'
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
          الدرس الأول: نظرية تنافر أزواج إلكترونات مستوى التكافؤ (VSEPR)
        </h2>
        <p className="text-white/70">اختر الفيديو الذي تريد مشاهدته</p>
      </div>

      <div className="space-y-4">
        {videos.map((video) => (
          <Card 
            key={video.id}
            className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border-blue-500/30 hover:border-blue-500/60 transition-all duration-300"
          >
            <CardContent className="p-6">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedVideo(expandedVideo === video.id ? null : video.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-600/30">
                    <Play className="w-6 h-6 text-blue-300" />
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

export default VSEPRLesson;
