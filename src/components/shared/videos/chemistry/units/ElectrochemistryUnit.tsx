import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Play, BookOpen, ArrowRight, Zap } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';
import VideoPlayer from '../../VideoPlayer';

interface ElectrochemistryUnitProps {
  onBack: () => void;
}

const ElectrochemistryUnit = ({ onBack }: ElectrochemistryUnitProps) => {
  const { t, dir } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<{title: string, url: string} | null>(null);

  const lessons = [
    {
      id: 'lesson-1',
      title: 'الدرس الأول: التأكسدُ والاختزالُ والخلايا الجلفانيةُ',
      videos: [
        {
          title: 'مفهوم التأكسد والاختزال',
          url: 'https://www.youtube.com/watch?v=uMFrtMtYR78',
          duration: '14:20'
        },
        {
          title: 'العامل المؤكسد والعامل المختزل',
          url: 'https://www.youtube.com/watch?v=pcMH7LIzQHg',
          duration: '12:15'
        },
        {
          title: 'التأكسد والاختزال وعلاقته بانتاج التيار الكهربائي',
          url: 'https://www.youtube.com/watch?v=11myYV_20-c',
          duration: '16:30'
        },
        {
          title: 'الخلايا الجلفانية البسيطة',
          url: 'https://www.youtube.com/watch?v=z8gdZqt7XxA',
          duration: '15:45'
        },
        {
          title: 'الخلايا الجلفانية – الجزء الثاني',
          url: 'https://www.youtube.com/watch?v=ZV3g4x3-Zkc',
          duration: '13:20'
        },
        {
          title: 'فرق الجهد الكهربائي في الخلايا الجلفانية المختلفة',
          url: 'https://www.youtube.com/watch?v=T0S5w-JVJ2w',
          duration: '17:10'
        },
        {
          title: 'التطبيقات العملية على الخلايا الجلفانية (البطاريات)',
          url: 'https://www.youtube.com/watch?v=zZUWpW3Axpc',
          duration: '14:55'
        }
      ]
    },
    {
      id: 'lesson-2',
      title: 'الدرس الثاني: خلايا التحليلِ الكهربائيِّ',
      videos: [
        {
          title: 'المواد الكهرلية وغير الكهرلية',
          url: 'https://www.youtube.com/watch?v=TaZaktuMCMs',
          duration: '13:30'
        },
        {
          title: 'التحليل الكهربائي لمصاهير المواد الكهرلية',
          url: 'https://www.youtube.com/watch?v=0psplT3BWvI',
          duration: '16:20'
        },
        {
          title: 'التحليل الكهربائي لمحاليل المواد الكهرلية',
          url: 'https://www.youtube.com/watch?v=sfBZW9SVMkw',
          duration: '18:15'
        },
        {
          title: 'التطبيقات العملية للتحليل الكهربائي',
          url: 'https://www.youtube.com/watch?v=ShNX1j0NyTE',
          duration: '15:40'
        }
      ]
    }
  ];

  const openVideo = (title: string, url: string) => {
    setSelectedVideo({ title, url });
  };

  if (selectedVideo) {
    return (
      <VideoPlayer
        videoUrl={selectedVideo.url}
        title={selectedVideo.title}
        onBack={() => setSelectedVideo(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-cyan-400 hover:text-cyan-300 hover:bg-blue-900/30"
        >
          &larr; العودة للوحدات
        </Button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-white to-orange-500 mb-4">
          ⚡ الوحدة الثانية: الكيمياء الكهربائية
        </h2>
        <p className="text-white/70">اكتشف عالم التفاعلات الكهروكيميائية والطاقة</p>
      </div>

      <div className="space-y-6">
        <Accordion type="single" collapsible className="space-y-4">
          {lessons.map((lesson, lessonIndex) => (
            <AccordionItem key={lesson.id} value={lesson.id}>
              <Card className="overflow-hidden bg-gradient-to-br from-yellow-500/10 to-orange-500/20 border-yellow-500/30">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-4 text-right">
                    <div className="p-3 rounded-full bg-yellow-500/20">
                      <Zap className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{lesson.title}</h3>
                      <p className="text-white/60 text-sm">{lesson.videos.length} فيديوهات</p>
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent>
                  <div className="px-6 pb-6 space-y-3">
                    {lesson.videos.map((video, videoIndex) => (
                      <Card 
                        key={videoIndex}
                        className="bg-blue-900/20 border-yellow-500/20 cursor-pointer hover:bg-blue-900/30 transition-all duration-300"
                        onClick={() => openVideo(video.title, video.url)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-full bg-red-500/20">
                              <Play className="w-5 h-5 text-red-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white mb-1">{video.title}</h4>
                              <p className="text-white/60 text-sm">المدة: {video.duration}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-white/40" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default ElectrochemistryUnit;
