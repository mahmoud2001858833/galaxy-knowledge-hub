
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Play, FlaskConical, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';

interface UnitFourProps {
  onBack: () => void;
}

interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  lesson: number;
  topic: number;
}

const UnitFour = ({ onBack }: UnitFourProps) => {
  const { t, dir } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [openLessons, setOpenLessons] = useState<{ [key: number]: boolean }>({});

  const videos: VideoData[] = [
    // الدرس الأول: التفاعلات الكيميائية
    {
      id: 'reaction-1',
      title: 'التفاعل الكيميائي',
      description: 'مقدمة عن التفاعلات الكيميائية',
      thumbnailUrl: 'https://img.youtube.com/vi/nHrRVi8CFU4/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/nHrRVi8CFU4',
      lesson: 1,
      topic: 1
    },
    {
      id: 'balance-1',
      title: 'موازنة التفاعلات – الجزء الأول',
      description: 'تعلم كيفية موازنة المعادلات الكيميائية',
      thumbnailUrl: 'https://img.youtube.com/vi/28yzNPXS8Wo/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/28yzNPXS8Wo',
      lesson: 1,
      topic: 2
    },
    {
      id: 'balance-2',
      title: 'موازنة التفاعلات – الجزء الثاني',
      description: 'تطبيقات متقدمة على موازنة المعادلات',
      thumbnailUrl: 'https://img.youtube.com/vi/bxz1Z8XLGCo/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/bxz1Z8XLGCo',
      lesson: 1,
      topic: 3
    },
    {
      id: 'types-1',
      title: 'أنواع التفاعلات الكيميائية – الجزء الأول',
      description: 'تصنيف التفاعلات الكيميائية',
      thumbnailUrl: 'https://img.youtube.com/vi/dB3-RMscNw8/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/dB3-RMscNw8',
      lesson: 1,
      topic: 4
    },
    {
      id: 'types-2',
      title: 'أنواع التفاعلات الكيميائية – الجزء الثاني',
      description: 'المزيد من أنواع التفاعلات الكيميائية',
      thumbnailUrl: 'https://img.youtube.com/vi/D1i3jfUsu6U/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/D1i3jfUsu6U',
      lesson: 1,
      topic: 5
    },
    // الدرس الثاني: المول والكتلة المولية
    {
      id: 'atomic-mass',
      title: 'الكتلة الذرية النسبية',
      description: 'مفهوم الكتلة الذرية النسبية',
      thumbnailUrl: 'https://img.youtube.com/vi/a93JCpc0kt4/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/a93JCpc0kt4',
      lesson: 2,
      topic: 1
    },
    {
      id: 'molecular-mass',
      title: 'الكتلة الجزيئية والمول',
      description: 'حساب الكتلة الجزيئية ومفهوم المول',
      thumbnailUrl: 'https://img.youtube.com/vi/-viDLodxN3E/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/-viDLodxN3E',
      lesson: 2,
      topic: 2
    },
    {
      id: 'mole-calc',
      title: 'حسابات المول',
      description: 'تطبيقات عملية على حسابات المول',
      thumbnailUrl: 'https://img.youtube.com/vi/Auxr2c1JVpQ/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/Auxr2c1JVpQ',
      lesson: 2,
      topic: 3
    },
    // الدرس الثالث: الحسابات الكيميائية
    {
      id: 'percentage',
      title: 'النسبة المئوية لكتلة العنصر',
      description: 'حساب النسبة المئوية للعناصر في المركبات',
      thumbnailUrl: 'https://img.youtube.com/vi/FcaTNegL0wY/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/FcaTNegL0wY',
      lesson: 3,
      topic: 1
    },
    {
      id: 'formula',
      title: 'الصيغة الكيميائية للمركبات',
      description: 'تحديد الصيغة الكيميائية للمركبات',
      thumbnailUrl: 'https://img.youtube.com/vi/Wok4fIsXQz8/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/Wok4fIsXQz8',
      lesson: 3,
      topic: 2
    },
    {
      id: 'mole-mass',
      title: 'الحسابات المبنية على المول – كتلة',
      description: 'التحويل بين المول والكتلة',
      thumbnailUrl: 'https://img.youtube.com/vi/ShZGSbCw9Vw/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/ShZGSbCw9Vw',
      lesson: 3,
      topic: 3
    },
    {
      id: 'mass-calculations',
      title: 'حسابات مول-كتلة وكتلة-كتلة',
      description: 'حسابات متقدمة في الكيمياء',
      thumbnailUrl: 'https://img.youtube.com/vi/bxpwcX26rYs/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/bxpwcX26rYs',
      lesson: 3,
      topic: 4
    },
    {
      id: 'yield',
      title: 'حسابات المردود المئوي',
      description: 'حساب المردود المئوي للتفاعلات',
      thumbnailUrl: 'https://img.youtube.com/vi/tu4JPuwcuDI/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/tu4JPuwcuDI',
      lesson: 3,
      topic: 5
    }
  ];

  const lessonGroups = {
    1: videos.filter(v => v.lesson === 1),
    2: videos.filter(v => v.lesson === 2),
    3: videos.filter(v => v.lesson === 3)
  };

  const lessonTitles = {
    1: 'التفاعلات الكيميائية',
    2: 'المول والكتلة المولية',
    3: 'الحسابات الكيميائية'
  };

  const toggleLesson = (lessonNum: number) => {
    setOpenLessons(prev => ({
      ...prev,
      [lessonNum]: !prev[lessonNum]
    }));
  };

  return (
    <>
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
            <FlaskConical className="w-12 h-12 text-blue-400 mr-3" />
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-cyan-500">
              الوحدة الأولى: التفاعلات والحسابات الكيميائية
            </h2>
          </div>
          <p className="text-white/70">فيديوهات تعليمية حول التفاعلات والحسابات الكيميائية</p>
        </div>

        {Object.entries(lessonGroups).map(([lessonNum, lessonVideos]) => (
          <div key={lessonNum} className="mb-6">
            <Collapsible 
              open={openLessons[parseInt(lessonNum)]} 
              onOpenChange={() => toggleLesson(parseInt(lessonNum))}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-6 h-auto bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 hover:border-blue-500/60 rounded-xl transition-all"
                >
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-white mb-2">
                      الدرس {lessonNum}: {lessonTitles[parseInt(lessonNum) as keyof typeof lessonTitles]}
                    </h3>
                    <p className="text-sm text-white/70">
                      {lessonVideos.length} فيديو تعليمي
                    </p>
                  </div>
                  {openLessons[parseInt(lessonNum)] ? (
                    <ChevronUp className="h-5 w-5 text-blue-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-blue-400" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-4 mt-4">
                {lessonVideos.map((video) => (
                  <Collapsible key={video.id}>
                    <CollapsibleTrigger asChild>
                      <div className="w-full p-4 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/20 hover:border-blue-500/40 rounded-lg cursor-pointer transition-all group">
                        <div className="flex justify-between items-center">
                          <div className="text-right flex-1">
                            <h4 className="font-bold text-lg text-white group-hover:text-blue-300 transition-colors">
                              {video.title}
                            </h4>
                            <p className="text-sm text-white/60 mt-1">
                              {video.description}
                            </p>
                          </div>
                          <ChevronDown className="h-4 w-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-2">
                      <Card className="overflow-hidden bg-blue-900/30 border-blue-500/40">
                        <div className="relative aspect-video overflow-hidden">
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center">
                            <Button 
                              size="icon" 
                              className="rounded-full bg-blue-500/80 hover:bg-blue-500 transition-all"
                              onClick={() => setSelectedVideo(video)}
                            >
                              <Play className="h-6 w-6" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <Button
                            onClick={() => setSelectedVideo(video)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            مشاهدة الفيديو
                          </Button>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}
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
};

export default UnitFour;
