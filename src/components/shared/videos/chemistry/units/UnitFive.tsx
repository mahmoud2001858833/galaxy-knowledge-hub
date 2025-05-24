
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Play, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';

interface UnitFiveProps {
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

const UnitFive = ({ onBack }: UnitFiveProps) => {
  const { t, dir } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [openLessons, setOpenLessons] = useState<{ [key: number]: boolean }>({});

  const videos: VideoData[] = [
    // الدرس الأول: التغيرات الطاقية في التفاعلات الكيميائية
    {
      id: 'energy-reaction',
      title: 'الطاقة المرافقة للتفاعل الكيميائي',
      description: 'فهم الطاقة في التفاعلات الكيميائية',
      thumbnailUrl: 'https://img.youtube.com/vi/ImYIaphNalY/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/ImYIaphNalY',
      lesson: 1,
      topic: 1
    },
    {
      id: 'endo-exo',
      title: 'التفاعلات الطاردة والماصة للطاقة',
      description: 'الفرق بين التفاعلات الطاردة والماصة للحرارة',
      thumbnailUrl: 'https://img.youtube.com/vi/3BHh_TSjVjs/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/3BHh_TSjVjs',
      lesson: 1,
      topic: 2
    },
    {
      id: 'energy-states',
      title: 'الطاقة والحالة الفيزيائية للمادة',
      description: 'علاقة الطاقة بالحالات الفيزيائية للمادة',
      thumbnailUrl: 'https://img.youtube.com/vi/zniodSF_dJw/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/zniodSF_dJw',
      lesson: 1,
      topic: 3
    },
    // الدرس الثاني: الطاقة الممتصة والطاقة المنبعثة من المادة
    {
      id: 'absorbed-emitted',
      title: 'الطاقة الممتصة والطاقة المنبعثة من المادة',
      description: 'دراسة انتقال الطاقة في المواد',
      thumbnailUrl: 'https://img.youtube.com/vi/321jYaDw_8s/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/321jYaDw_8s',
      lesson: 2,
      topic: 1
    },
    {
      id: 'specific-heat',
      title: 'قياس الحرارة النوعية للمادة',
      description: 'كيفية قياس الحرارة النوعية للمواد المختلفة',
      thumbnailUrl: 'https://img.youtube.com/vi/TiIeVZK-Y_M/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/TiIeVZK-Y_M',
      lesson: 2,
      topic: 2
    },
    // الدرس الثالث: حسابات الطاقة في التفاعلات الكيميائية
    {
      id: 'bond-energy',
      title: 'طاقة الرابطة وحسابات التغير في المحتوى الحراري',
      description: 'حسابات طاقة الروابط الكيميائية',
      thumbnailUrl: 'https://img.youtube.com/vi/f4-PPgmVPHQ/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/f4-PPgmVPHQ',
      lesson: 3,
      topic: 1
    },
    {
      id: 'bond-calculations',
      title: 'حسابات طاقة الرابطة',
      description: 'تطبيقات عملية على حسابات طاقة الرابطة',
      thumbnailUrl: 'https://img.youtube.com/vi/mB50xOURGas/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/mB50xOURGas',
      lesson: 3,
      topic: 2
    },
    {
      id: 'hess-law',
      title: 'قانون هيس',
      description: 'تطبيق قانون هيس في الحسابات الكيميائية',
      thumbnailUrl: 'https://img.youtube.com/vi/WFHNWmMTU2I/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/WFHNWmMTU2I',
      lesson: 3,
      topic: 3
    },
    {
      id: 'formation-heat',
      title: 'حساب حرارة التكوين القياسية',
      description: 'كيفية حساب حرارة التكوين للمركبات',
      thumbnailUrl: 'https://img.youtube.com/vi/dv2G41g8gqY/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/dv2G41g8gqY',
      lesson: 3,
      topic: 4
    },
    {
      id: 'reaction-heat',
      title: 'حساب حرارة التفاعل لكتلة معينة من المادة',
      description: 'حسابات عملية لحرارة التفاعل',
      thumbnailUrl: 'https://img.youtube.com/vi/FHUD157fAbo/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/embed/FHUD157fAbo',
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
    1: 'التغيرات الطاقية في التفاعلات الكيميائية',
    2: 'الطاقة الممتصة والطاقة المنبعثة من المادة',
    3: 'حسابات الطاقة في التفاعلات الكيميائية'
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
            <Zap className="w-12 h-12 text-red-400 mr-3" />
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-white to-pink-500">
              الوحدة الثانية: الطاقة الكيميائية
            </h2>
          </div>
          <p className="text-white/70">فيديوهات تعليمية حول الطاقة في التفاعلات الكيميائية</p>
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
                  className="w-full justify-between p-6 h-auto bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 hover:border-red-500/60 rounded-xl transition-all"
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
                    <ChevronUp className="h-5 w-5 text-red-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-red-400" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-4 mt-4">
                {lessonVideos.map((video) => (
                  <Collapsible key={video.id}>
                    <CollapsibleTrigger asChild>
                      <div className="w-full p-4 bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-500/20 hover:border-red-500/40 rounded-lg cursor-pointer transition-all group">
                        <div className="flex justify-between items-center">
                          <div className="text-right flex-1">
                            <h4 className="font-bold text-lg text-white group-hover:text-red-300 transition-colors">
                              {video.title}
                            </h4>
                            <p className="text-sm text-white/60 mt-1">
                              {video.description}
                            </p>
                          </div>
                          <ChevronDown className="h-4 w-4 text-red-400 group-hover:text-red-300 transition-colors" />
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-2">
                      <Card className="overflow-hidden bg-red-900/30 border-red-500/40">
                        <div className="relative aspect-video overflow-hidden">
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center">
                            <Button 
                              size="icon" 
                              className="rounded-full bg-red-500/80 hover:bg-red-500 transition-all"
                              onClick={() => setSelectedVideo(video)}
                            >
                              <Play className="h-6 w-6" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <Button
                            onClick={() => setSelectedVideo(video)}
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
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

export default UnitFive;
