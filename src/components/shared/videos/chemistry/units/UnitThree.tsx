
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Play, Link, ChevronDown } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';

interface UnitThreeProps {
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

const UnitThree = ({ onBack }: UnitThreeProps) => {
  const { t, dir } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);

  const lessons: LessonData[] = [
    {
      id: 'lesson-1',
      title: 'الدرس 1: الروابط الكيميائية وأنواعها',
      color: 'from-green-500/20 to-emerald-500/30',
      borderColor: 'border-green-500/30 hover:border-green-500/60'
    },
    {
      id: 'lesson-2',
      title: 'الدرس 2: الصيغ الكيميائية وخصائص المركبات',
      color: 'from-teal-500/20 to-cyan-500/30',
      borderColor: 'border-teal-500/30 hover:border-teal-500/60'
    }
  ];

  const lesson1Videos: VideoData[] = [
    {
      id: 'lewis-structure',
      title: 'تركيب لويس للذرات',
      description: 'شرح تركيب لويس وطريقة رسمه للذرات',
      thumbnailUrl: 'https://img.youtube.com/vi/1PIUd-PauPs/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/1PIUd-PauPs',
      lesson: 1
    },
    {
      id: 'ionic-bond',
      title: 'الرابطة الأيونية',
      description: 'فهم الرابطة الأيونية وآلية تكوينها',
      thumbnailUrl: 'https://img.youtube.com/vi/mNX8C7Nf9lU/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/mNX8C7Nf9lU',
      lesson: 1
    },
    {
      id: 'covalent-single',
      title: 'الرابطة التساهمية الأحادية',
      description: 'شرح الرابطة التساهمية الأحادية وخصائصها',
      thumbnailUrl: 'https://img.youtube.com/vi/LHp40IbQpdo/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/LHp40IbQpdo',
      lesson: 1
    },
    {
      id: 'covalent-multiple',
      title: 'الرابطة التساهمية الثنائية والثلاثية',
      description: 'دراسة الروابط التساهمية المتعددة',
      thumbnailUrl: 'https://img.youtube.com/vi/Ig7JzDtI0Uo/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/Ig7JzDtI0Uo',
      lesson: 1
    },
    {
      id: 'metallic-bond',
      title: 'الرابطة الفلزية وحل أسئلة الدرس الأول',
      description: 'شرح الرابطة الفلزية مع حل الأسئلة',
      thumbnailUrl: 'https://img.youtube.com/vi/N2XmrLG3d58/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/N2XmrLG3d58',
      lesson: 1
    }
  ];

  const lesson2Videos: VideoData[] = [
    {
      id: 'ionic-properties',
      title: 'الخصائص الفيزيائية للمركبات الأيونية',
      description: 'دراسة الخصائص الفيزيائية للمركبات الأيونية',
      thumbnailUrl: 'https://img.youtube.com/vi/LR-B90NtuqY/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/LR-B90NtuqY',
      lesson: 2
    },
    {
      id: 'covalent-metallic-properties',
      title: 'الخصائص الفيزيائية للمركبات التساهمية والفلزية',
      description: 'مقارنة خصائص المركبات التساهمية والفلزية',
      thumbnailUrl: 'https://img.youtube.com/vi/J5UDSKurtlM/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/J5UDSKurtlM',
      lesson: 2
    },
    {
      id: 'chemical-formulas-1',
      title: 'الصيغة الكيميائية للمركبات الجزء 1',
      description: 'تعلم كيفية كتابة الصيغ الكيميائية - الجزء الأول',
      thumbnailUrl: 'https://img.youtube.com/vi/3ZtofgviFms/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/3ZtofgviFms',
      lesson: 2
    },
    {
      id: 'chemical-formulas-2',
      title: 'الصيغ الكيميائية للمركبات الجزء 2',
      description: 'استكمال دراسة الصيغ الكيميائية - الجزء الثاني',
      thumbnailUrl: 'https://img.youtube.com/vi/JVwXTFgQxMk/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/JVwXTFgQxMk',
      lesson: 2
    },
    {
      id: 'final-exam',
      title: 'حل الامتحان النهائي للصف العاشر الفصل الأول',
      description: 'حل شامل للامتحان النهائي مع التوضيحات',
      thumbnailUrl: 'https://img.youtube.com/vi/-lyqa8z0G0k/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/-lyqa8z0G0k',
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
              <Link className="w-12 h-12 text-green-400 mr-3" />
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-white to-emerald-500">
                الدرس 1: الروابط الكيميائية وأنواعها
              </h2>
            </div>
            <p className="text-white/70">فيديوهات تعليمية حول الروابط الكيميائية</p>
          </div>

          <div className="space-y-4">
            <Accordion type="single" collapsible className="space-y-4">
              {lesson1Videos.map((video) => (
                <AccordionItem key={video.id} value={video.id} className="border-none">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <Card className="w-full overflow-hidden bg-gradient-to-r from-green-900/30 to-green-800/20 border-green-500/30 hover:border-green-500/60 transition-all duration-300">
                      <CardContent className="flex items-center justify-between p-6">
                        <div className="flex items-center space-x-4 space-x-reverse text-right">
                          <div className="p-3 rounded-full bg-green-500/20">
                            <Play className="h-6 w-6 text-green-400" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white mb-1">{video.title}</h4>
                            <p className="text-sm text-white/70">{video.description}</p>
                          </div>
                        </div>
                        <ChevronDown className="h-5 w-5 text-green-400 transition-transform duration-200" />
                      </CardContent>
                    </Card>
                  </AccordionTrigger>
                  
                  <AccordionContent className="pt-4 pb-0">
                    <Card className="overflow-hidden bg-green-950/40 border-green-500/20">
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
                              className="rounded-full bg-green-500/80 hover:bg-green-500 transition-all w-16 h-16"
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
              <Link className="w-12 h-12 text-teal-400 mr-3" />
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-white to-cyan-500">
                الدرس 2: الصيغ الكيميائية وخصائص المركبات
              </h2>
            </div>
            <p className="text-white/70">فيديوهات تعليمية حول الصيغ الكيميائية</p>
          </div>

          <div className="space-y-4">
            <Accordion type="single" collapsible className="space-y-4">
              {lesson2Videos.map((video) => (
                <AccordionItem key={video.id} value={video.id} className="border-none">
                  <AccordionTrigger className="hover:no-underline p-0">
                    <Card className="w-full overflow-hidden bg-gradient-to-r from-teal-900/30 to-teal-800/20 border-teal-500/30 hover:border-teal-500/60 transition-all duration-300">
                      <CardContent className="flex items-center justify-between p-6">
                        <div className="flex items-center space-x-4 space-x-reverse text-right">
                          <div className="p-3 rounded-full bg-teal-500/20">
                            <Play className="h-6 w-6 text-teal-400" />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-white mb-1">{video.title}</h4>
                            <p className="text-sm text-white/70">{video.description}</p>
                          </div>
                        </div>
                        <ChevronDown className="h-5 w-5 text-teal-400 transition-transform duration-200" />
                      </CardContent>
                    </Card>
                  </AccordionTrigger>
                  
                  <AccordionContent className="pt-4 pb-0">
                    <Card className="overflow-hidden bg-teal-950/40 border-teal-500/20">
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
                              className="rounded-full bg-teal-500/80 hover:bg-teal-500 transition-all w-16 h-16"
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
          <Link className="w-12 h-12 text-green-400 mr-3" />
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-white to-emerald-500">
            الوحدة الثالثة: المركبات والروابط الكيميائية
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
                <Link className="w-8 h-8 text-green-400" />
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

export default UnitThree;
