
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Atom, BookOpen } from "lucide-react";
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
      thumbnailUrl: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/oFGMbGFXiy8',
      lesson: 1
    },
    {
      id: 'light-information',
      title: 'الضوء مصدر للمعلومات',
      description: 'فهم كيفية استخدام الضوء للحصول على معلومات عن الذرة',
      thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/-awru2Kvc14',
      lesson: 1
    },
    {
      id: 'wavelength-calculations',
      title: 'حسابات الطول الموجي، التردد، الطاقة',
      description: 'تعلم كيفية حساب الطول الموجي والتردد والطاقة',
      thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/JVrhI7eSZ8Y',
      lesson: 1
    },
    {
      id: 'atomic-spectrum',
      title: 'الطيف الذري',
      description: 'دراسة الطيف الذري وتفسير خطوط الطيف',
      thumbnailUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/LDo6ElphTzo',
      lesson: 1
    },
    {
      id: 'bohr-theory-part1',
      title: 'نظرية بور – الجزء الأول',
      description: 'شرح مفصل لنظرية بور الجزء الأول',
      thumbnailUrl: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/Mf_hAKKOc-g',
      lesson: 1
    },
    {
      id: 'bohr-theory-part2',
      title: 'نظرية بور – الجزء الثاني',
      description: 'استكمال شرح نظرية بور والتطبيقات العملية',
      thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/_vT4Yv2-7J8',
      lesson: 1
    },
    {
      id: 'worksheet-solution',
      title: 'حل ورقة عمل الدرس الأول',
      description: 'حلول شاملة لورقة عمل الدرس الأول مع التوضيحات',
      thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/FO6mx62ghF4',
      lesson: 1
    }
  ];

  const lesson2Videos: VideoData[] = [
    {
      id: 'wave-model-intro',
      title: 'مقدمة في النموذج الميكانيكي الموجي',
      description: 'مقدمة شاملة عن النموذج الميكانيكي الموجي للذرة',
      thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/7vc-Uvp3vwg',
      lesson: 2
    },
    {
      id: 'quantum-numbers',
      title: 'أرقام الكم والأوربيتالات',
      description: 'شرح مفصل لأرقام الكم وأشكال الأوربيتالات',
      thumbnailUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/cPDptc0wUYI',
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lesson1Videos.map((video) => (
              <Card 
                key={video.id}
                className="overflow-hidden bg-blue-900/20 border-blue-500/30 hover:border-blue-500/60 transition-all cursor-pointer group"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center">
                    <Button 
                      size="icon" 
                      className="rounded-full bg-blue-500/80 hover:bg-blue-500 transition-all"
                    >
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-bold text-lg mb-2 text-white text-right">{video.title}</h4>
                  <p className="text-sm text-white/70 text-right">{video.description}</p>
                </CardContent>
              </Card>
            ))}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lesson2Videos.map((video) => (
              <Card 
                key={video.id}
                className="overflow-hidden bg-purple-900/20 border-purple-500/30 hover:border-purple-500/60 transition-all cursor-pointer group"
                onClick={() => setSelectedVideo(video)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center">
                    <Button 
                      size="icon" 
                      className="rounded-full bg-purple-500/80 hover:bg-purple-500 transition-all"
                    >
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-bold text-lg mb-2 text-white text-right">{video.title}</h4>
                  <p className="text-sm text-white/70 text-right">{video.description}</p>
                </CardContent>
              </Card>
            ))}
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
