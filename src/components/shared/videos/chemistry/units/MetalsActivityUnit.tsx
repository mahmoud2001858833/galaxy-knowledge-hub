
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Play, BookOpen, ArrowRight } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';

interface MetalsActivityUnitProps {
  onBack: () => void;
}

const MetalsActivityUnit = ({ onBack }: MetalsActivityUnitProps) => {
  const { t, dir } = useLanguage();

  const lessons = [
    {
      id: 'lesson-1',
      title: 'الدرس الأول: تفاعلاتُ الفلزاتِ',
      videos: [
        {
          title: 'مقدمة الوحدة الثالثة - نشاط الفلزات',
          url: 'https://www.youtube.com/watch?v=WnyFa44E2SU',
          duration: '15:30'
        },
        {
          title: 'تفاعل الفلزات مع الأكسجين',
          url: 'https://www.youtube.com/watch?v=eo0SsQ7u0Mw',
          duration: '12:45'
        },
        {
          title: 'تفاعل الفلزات مع الماء',
          url: 'https://www.youtube.com/watch?v=kgWdinzdxds',
          duration: '14:20'
        },
        {
          title: 'تفاعل الفلزات مع الحمض المخفف',
          url: 'https://www.youtube.com/watch?v=8lrJgfZXtyA',
          duration: '16:10'
        },
        {
          title: 'مراجعة التفاعلات، إكمال المعادلات، والسبائك',
          url: 'https://www.youtube.com/watch?v=AV4YBFtzLjE',
          duration: '18:25'
        }
      ]
    },
    {
      id: 'lesson-2',
      title: 'الدرس الثاني: سلسلةُ النشاطِ الكيميائيِّ وتآكلُ الفلزاتِ',
      videos: [
        {
          title: 'سلسلة النشاط الكيميائي – الجزء الأول',
          url: 'https://www.youtube.com/watch?v=40IWyQHEu84',
          duration: '13:15'
        },
        {
          title: 'سلسلة النشاط الكيميائي – الجزء الثاني',
          url: 'https://www.youtube.com/watch?v=XhOnUKJNCyg',
          duration: '14:50'
        },
        {
          title: 'سلسلة النشاط الكيميائي – الجزء الثالث',
          url: 'https://www.youtube.com/watch?v=S668N8D8DvQ',
          duration: '16:30'
        },
        {
          title: 'تآكل الفلزات',
          url: 'https://www.youtube.com/watch?v=bPNtHfQZqWM',
          duration: '11:40'
        }
      ]
    }
  ];

  const openVideo = (url: string) => {
    window.open(url, '_blank');
  };

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
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-white to-red-500 mb-4">
          🧪 الوحدة الأولى: نشاط الفلزات
        </h2>
        <p className="text-white/70">تعلم عن تفاعلات الفلزات وخصائصها الكيميائية</p>
      </div>

      <div className="space-y-6">
        <Accordion type="single" collapsible className="space-y-4">
          {lessons.map((lesson, lessonIndex) => (
            <AccordionItem key={lesson.id} value={lesson.id}>
              <Card className="overflow-hidden bg-gradient-to-br from-orange-500/10 to-red-500/20 border-orange-500/30">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex items-center gap-4 text-right">
                    <div className="p-3 rounded-full bg-orange-500/20">
                      <BookOpen className="w-6 h-6 text-orange-400" />
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
                        className="bg-blue-900/20 border-orange-500/20 cursor-pointer hover:bg-blue-900/30 transition-all duration-300"
                        onClick={() => openVideo(video.url)}
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

export default MetalsActivityUnit;
