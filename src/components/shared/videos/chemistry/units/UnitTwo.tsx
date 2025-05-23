
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Play, Zap, ChevronDown } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';

interface UnitTwoProps {
  onBack: () => void;
}

interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  lesson: number;
}

interface LessonData {
  id: string;
  title: string;
  color: string;
  borderColor: string;
}

const UnitTwo = ({ onBack }: UnitTwoProps) => {
  const { t, dir } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const lessons: LessonData[] = [
    {
      id: 'lesson-1',
      title: 'الدرس 1: التوزيع الإلكتروني للذرات',
      color: 'from-yellow-500/20 to-orange-500/30',
      borderColor: 'border-yellow-500/30 hover:border-yellow-500/60'
    },
    {
      id: 'lesson-2', 
      title: 'الدرس 2: الخصائص الدورية للعناصر',
      color: 'from-red-500/20 to-pink-500/30',
      borderColor: 'border-red-500/30 hover:border-red-500/60'
    }
  ];

  const lesson1Videos: VideoData[] = [
    {
      id: 'electron-config-1',
      title: 'التوزيع الإلكتروني للذرات الجزء 1',
      description: 'مبادئ التوزيع الإلكتروني وقواعده الأساسية',
      thumbnailUrl: 'https://img.youtube.com/vi/aZHGD1fheAg/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/aZHGD1fheAg',
      lesson: 1
    },
    {
      id: 'electron-config-2',
      title: 'التوزيع الإلكتروني للذرات الجزء 2',
      description: 'استكمال التوزيع الإلكتروني والأمثلة التطبيقية',
      thumbnailUrl: 'https://img.youtube.com/vi/c0ok7P9Hnnw/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/c0ok7P9Hnnw',
      lesson: 1
    },
    {
      id: 'element-classification-1',
      title: 'تصنيف العناصر الجزء 1',
      description: 'تصنيف العناصر حسب خصائصها الإلكترونية',
      thumbnailUrl: 'https://img.youtube.com/vi/0MQQqODr-jQ/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/0MQQqODr-jQ',
      lesson: 1
    },
    {
      id: 'element-classification-2',
      title: 'تصنيف العناصر الجزء 2',
      description: 'استكمال تصنيف العناصر والجدول الدوري',
      thumbnailUrl: 'https://img.youtube.com/vi/MLolCM7HDBM/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/MLolCM7HDBM',
      lesson: 1
    },
    {
      id: 'element-classification-3',
      title: 'تصنيف العناصر الجزء 3',
      description: 'الأقسام النهائية للعناصر وخصائصها',
      thumbnailUrl: 'https://img.youtube.com/vi/Y8UQAYFsva0/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/Y8UQAYFsva0',
      lesson: 1
    },
    {
      id: 'lesson1-solutions',
      title: 'حل أسئلة الدرس الأول الوحدة الثانية',
      description: 'حلول شاملة لأسئلة الدرس الأول',
      thumbnailUrl: 'https://img.youtube.com/vi/p9LtoSrLRKk/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/p9LtoSrLRKk',
      lesson: 1
    }
  ];

  const lesson2Videos: VideoData[] = [
    {
      id: 'atomic-size',
      title: 'الخصائص الدورية للعناصر - الحجم الذري',
      description: 'دراسة تغير الحجم الذري في الجدول الدوري',
      thumbnailUrl: 'https://img.youtube.com/vi/VYJ_mYU7WiA/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/VYJ_mYU7WiA',
      lesson: 2
    },
    {
      id: 'ionic-radius',
      title: 'نصف القطر الأيوني',
      description: 'فهم نصف القطر الأيوني وتغيراته',
      thumbnailUrl: 'https://img.youtube.com/vi/SUKT--7jewI/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/SUKT--7jewI',
      lesson: 2
    },
    {
      id: 'ionization-energy-1',
      title: 'طاقة التأين الجزء الأول',
      description: 'مفهوم طاقة التأين وعواملها',
      thumbnailUrl: 'https://img.youtube.com/vi/I83O3ONJv6c/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/I83O3ONJv6c',
      lesson: 2
    },
    {
      id: 'ionization-energy-2',
      title: 'طاقة التأين الجزء الثاني',
      description: 'استكمال دراسة طاقة التأين والأمثلة',
      thumbnailUrl: 'https://img.youtube.com/vi/YB8lrLt0i0M/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/YB8lrLt0i0M',
      lesson: 2
    },
    {
      id: 'electron-affinity',
      title: 'الألفة الإلكترونية والسالبية الكهربائية',
      description: 'فهم الألفة الإلكترونية والسالبية الكهربائية',
      thumbnailUrl: 'https://img.youtube.com/vi/XRsb7q1XCqU/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/XRsb7q1XCqU',
      lesson: 2
    }
  ];

  if (selectedLesson === 'lesson-1') {
    return (
      <>
        <div className="space-y-6">
          <Button
            onClick={() => setSelectedLesson(null)}
            variant="ghost"
            className="text-cyan-400 hover:text-cyan-300 hover:bg-blue-900/30"
          >
            &larr; العودة للدروس
          </Button>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Zap className="w-12 h-12 text-yellow-400 mr-3" />
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-white to-orange-500">
                الدرس 1: التوزيع الإلكتروني للذرات
              </h2>
            </div>
            <p className="text-white/70">فيديوهات تعليمية حول التوزيع الإلكتروني</p>
          </div>

          <div className="space-y-4">
            <Accordion type="single" collapsible className="space-y-4">
              {lesson1Videos.map((video) => (
                <AccordionItem key={video.id} value={video.id} className="border-none">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <Card className="w-full overflow-hidden bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border-yellow-500/30 hover:border-yellow-500/60 transition-all duration-300">
                      <CardContent className="flex items-center justify-between p-6">
                        <div className="flex items-center space-x-4 space-x-reverse text-right">
                          <div className="p-3 rounded-full bg-yellow-500/20">
                            <Play className="h-6 w-6 text-yellow-400" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white mb-1">{video.title}</h4>
                            <p className="text-sm text-white/70">{video.description}</p>
                          </div>
                        </div>
                        <ChevronDown className="h-5 w-5 text-yellow-400 transition-transform duration-200" />
                      </CardContent>
                    </Card>
                  </AccordionTrigger>
                  
                  <AccordionContent className="pt-4 pb-0">
                    <Card className="overflow-hidden bg-yellow-950/40 border-yellow-500/20">
                      <CardContent className="p-0">
                        <div className="aspect-video relative">
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setSelectedVideo(video)}
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
                               onClick={() => setSelectedVideo(video)}>
                            <Button 
                              size="icon" 
                              className="rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-all w-16 h-16"
                            >
                              <Play className="h-8 w-8" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-right">{selectedVideo?.title}</DialogTitle>
            </DialogHeader>
            <div className="aspect-video w-full">
              {selectedVideo && (
                <iframe 
                  src={selectedVideo.videoUrl} 
                  className="w-full h-full"
                  title={selectedVideo.title}
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (selectedLesson === 'lesson-2') {
    return (
      <>
        <div className="space-y-6">
          <Button
            onClick={() => setSelectedLesson(null)}
            variant="ghost"
            className="text-cyan-400 hover:text-cyan-300 hover:bg-blue-900/30"
          >
            &larr; العودة للدروس
          </Button>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Zap className="w-12 h-12 text-red-400 mr-3" />
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-white to-pink-500">
                الدرس 2: الخصائص الدورية للعناصر
              </h2>
            </div>
            <p className="text-white/70">فيديوهات تعليمية حول الخصائص الدورية</p>
          </div>

          <div className="space-y-4">
            <Accordion type="single" collapsible className="space-y-4">
              {lesson2Videos.map((video) => (
                <AccordionItem key={video.id} value={video.id} className="border-none">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <Card className="w-full overflow-hidden bg-gradient-to-r from-red-900/30 to-red-800/20 border-red-500/30 hover:border-red-500/60 transition-all duration-300">
                      <CardContent className="flex items-center justify-between p-6">
                        <div className="flex items-center space-x-4 space-x-reverse text-right">
                          <div className="p-3 rounded-full bg-red-500/20">
                            <Play className="h-6 w-6 text-red-400" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white mb-1">{video.title}</h4>
                            <p className="text-sm text-white/70">{video.description}</p>
                          </div>
                        </div>
                        <ChevronDown className="h-5 w-5 text-red-400 transition-transform duration-200" />
                      </CardContent>
                    </Card>
                  </AccordionTrigger>
                  
                  <AccordionContent className="pt-4 pb-0">
                    <Card className="overflow-hidden bg-red-950/40 border-red-500/20">
                      <CardContent className="p-0">
                        <div className="aspect-video relative">
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setSelectedVideo(video)}
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
                               onClick={() => setSelectedVideo(video)}>
                            <Button 
                              size="icon" 
                              className="rounded-full bg-red-500/80 hover:bg-red-500 transition-all w-16 h-16"
                            >
                              <Play className="h-8 w-8" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-right">{selectedVideo?.title}</DialogTitle>
            </DialogHeader>
            <div className="aspect-video w-full">
              {selectedVideo && (
                <iframe 
                  src={selectedVideo.videoUrl} 
                  className="w-full h-full"
                  title={selectedVideo.title}
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

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
        <div className="flex items-center justify-center mb-4">
          <Zap className="w-12 h-12 text-yellow-400 mr-3" />
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-white to-orange-500">
            الوحدة الثانية: التوزيع الإلكتروني والدورية
          </h2>
        </div>
        <p className="text-white/70">اختر الدرس الذي تريد دراسته</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {lessons.map((lesson) => (
          <Card 
            key={lesson.id}
            className={`cursor-pointer overflow-hidden bg-gradient-to-br ${lesson.color} ${lesson.borderColor} transition-all duration-300 hover:-translate-y-1 shadow-lg`}
            onClick={() => setSelectedLesson(lesson.id)}
          >
            <CardContent className="flex flex-col items-center justify-center h-48 text-center p-6">
              <div className="mb-6 p-4 rounded-full bg-blue-900/30 backdrop-blur-sm">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{lesson.title}</h3>
              <div className="mt-auto">
                <span className="inline-block px-4 py-1 bg-cyan-500/20 text-cyan-300 text-sm rounded-full">
                  عرض الفيديوهات
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UnitTwo;
