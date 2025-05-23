
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Play, Atom, BookOpen, ChevronDown } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';

interface UnitOneProps {
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
  icon: React.ReactNode;
  color: string;
  borderColor: string;
}

const UnitOne = ({ onBack }: UnitOneProps) => {
  const { t, dir } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const lessons: LessonData[] = [
    {
      id: 'lesson-1',
      title: 'الدرس الأول: الذرة ونموذج ذرة الهيدروجين',
      icon: <Atom className="w-8 h-8 text-blue-400" />,
      color: 'from-blue-500/20 to-cyan-500/30',
      borderColor: 'border-blue-500/30 hover:border-blue-500/60'
    },
    {
      id: 'lesson-2',
      title: 'الدرس الثاني: النموذج الميكانيكي الموجي للذرة',
      icon: <BookOpen className="w-8 h-8 text-purple-400" />,
      color: 'from-purple-500/20 to-violet-500/30',
      borderColor: 'border-purple-500/30 hover:border-purple-500/60'
    }
  ];

  const lesson1Videos: VideoData[] = [
    {
      id: 'bohr-intro',
      title: 'مقدمة الدرس الأول – نظرية بور',
      description: 'مقدمة شاملة عن نظرية بور وتطور النماذج الذرية',
      thumbnailUrl: 'https://img.youtube.com/vi/oFGMbGFXiy8/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/oFGMbGFXiy8',
      lesson: 1
    },
    {
      id: 'light-information',
      title: 'الضوء مصدر للمعلومات',
      description: 'فهم كيفية استخدام الضوء للحصول على معلومات عن الذرة',
      thumbnailUrl: 'https://img.youtube.com/vi/-awru2Kvc14/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/-awru2Kvc14',
      lesson: 1
    },
    {
      id: 'wavelength-calculations',
      title: 'حسابات الطول الموجي، التردد، الطاقة',
      description: 'تعلم كيفية حساب الطول الموجي والتردد والطاقة',
      thumbnailUrl: 'https://img.youtube.com/vi/JVrhI7eSZ8Y/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/JVrhI7eSZ8Y',
      lesson: 1
    },
    {
      id: 'atomic-spectrum',
      title: 'الطيف الذري',
      description: 'دراسة الطيف الذري وتفسير خطوط الطيف',
      thumbnailUrl: 'https://img.youtube.com/vi/LDo6ElphTzo/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/LDo6ElphTzo',
      lesson: 1
    },
    {
      id: 'bohr-theory-part1',
      title: 'نظرية بور – الجزء الأول',
      description: 'شرح مفصل لنظرية بور الجزء الأول',
      thumbnailUrl: 'https://img.youtube.com/vi/Mf_hAKKOc-g/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/Mf_hAKKOc-g',
      lesson: 1
    },
    {
      id: 'bohr-theory-part2',
      title: 'نظرية بور – الجزء الثاني',
      description: 'استكمال شرح نظرية بور والتطبيقات العملية',
      thumbnailUrl: 'https://img.youtube.com/vi/_vT4Yv2-7J8/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/_vT4Yv2-7J8',
      lesson: 1
    },
    {
      id: 'worksheet-solution',
      title: 'حل ورقة عمل الدرس الأول',
      description: 'حلول شاملة لورقة عمل الدرس الأول مع التوضيحات',
      thumbnailUrl: 'https://img.youtube.com/vi/FO6mx62ghF4/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/FO6mx62ghF4',
      lesson: 1
    }
  ];

  const lesson2Videos: VideoData[] = [
    {
      id: 'quantum-wave-1',
      title: 'النظرية الميكانيكية الموجية إعداد الكم الجزء 1',
      description: 'مقدمة في النموذج الميكانيكي الموجي للذرة - الجزء الأول',
      thumbnailUrl: 'https://img.youtube.com/vi/gqNP7C8EakY/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/gqNP7C8EakY',
      lesson: 2
    },
    {
      id: 'quantum-wave-2',
      title: 'النظرية الميكانيكية الموجية إعداد الكم الجزء 2',
      description: 'استكمال النموذج الميكانيكي الموجي للذرة - الجزء الثاني',
      thumbnailUrl: 'https://img.youtube.com/vi/aDmldaYPPFE/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/aDmldaYPPFE',
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
              <Atom className="w-12 h-12 text-blue-400 mr-3" />
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-cyan-500">
                الدرس الأول: الذرة ونموذج ذرة الهيدروجين
              </h2>
            </div>
            <p className="text-white/70">فيديوهات تعليمية شاملة حول الذرة ونموذج ذرة الهيدروجين</p>
          </div>

          <div className="space-y-4">
            <Accordion type="single" collapsible className="space-y-4">
              {lesson1Videos.map((video) => (
                <AccordionItem key={video.id} value={video.id} className="border-none">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <Card className="w-full overflow-hidden bg-gradient-to-r from-blue-900/30 to-blue-800/20 border-blue-500/30 hover:border-blue-500/60 transition-all duration-300">
                      <CardContent className="flex items-center justify-between p-6">
                        <div className="flex items-center space-x-4 space-x-reverse text-right">
                          <div className="p-3 rounded-full bg-blue-500/20">
                            <Play className="h-6 w-6 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white mb-1">{video.title}</h4>
                            <p className="text-sm text-white/70">{video.description}</p>
                          </div>
                        </div>
                        <ChevronDown className="h-5 w-5 text-blue-400 transition-transform duration-200" />
                      </CardContent>
                    </Card>
                  </AccordionTrigger>
                  
                  <AccordionContent className="pt-4 pb-0">
                    <Card className="overflow-hidden bg-blue-950/40 border-blue-500/20">
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
                              className="rounded-full bg-blue-500/80 hover:bg-blue-500 transition-all w-16 h-16"
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
              <BookOpen className="w-12 h-12 text-purple-400 mr-3" />
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-violet-500">
                الدرس الثاني: النموذج الميكانيكي الموجي للذرة
              </h2>
            </div>
            <p className="text-white/70">فيديوهات تعليمية شاملة حول النموذج الميكانيكي الموجي</p>
          </div>

          <div className="space-y-4">
            <Accordion type="single" collapsible className="space-y-4">
              {lesson2Videos.map((video) => (
                <AccordionItem key={video.id} value={video.id} className="border-none">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <Card className="w-full overflow-hidden bg-gradient-to-r from-purple-900/30 to-purple-800/20 border-purple-500/30 hover:border-purple-500/60 transition-all duration-300">
                      <CardContent className="flex items-center justify-between p-6">
                        <div className="flex items-center space-x-4 space-x-reverse text-right">
                          <div className="p-3 rounded-full bg-purple-500/20">
                            <Play className="h-6 w-6 text-purple-400" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white mb-1">{video.title}</h4>
                            <p className="text-sm text-white/70">{video.description}</p>
                          </div>
                        </div>
                        <ChevronDown className="h-5 w-5 text-purple-400 transition-transform duration-200" />
                      </CardContent>
                    </Card>
                  </AccordionTrigger>
                  
                  <AccordionContent className="pt-4 pb-0">
                    <Card className="overflow-hidden bg-purple-950/40 border-purple-500/20">
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
                              className="rounded-full bg-purple-500/80 hover:bg-purple-500 transition-all w-16 h-16"
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
          <Atom className="w-12 h-12 text-purple-400 mr-3" />
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-violet-500">
            الوحدة الأولى: بنية الذرة وتركيبها
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
                {lesson.icon}
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

export default UnitOne;
