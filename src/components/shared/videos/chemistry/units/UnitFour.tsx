
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, FlaskConical } from "lucide-react";
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
}

const UnitFour = ({ onBack }: UnitFourProps) => {
  const { t, dir } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

  const videos: VideoData[] = [
    {
      id: 'reactions-1',
      title: 'التفاعلات الكيميائية وأنواعها',
      description: 'مقدمة عن التفاعلات الكيميائية وتصنيفها',
      thumbnailUrl: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/kGHRjOrXnSM',
      lesson: 1
    },
    {
      id: 'mole-1',
      title: 'المول والكتلة المولية - المفهوم الأساسي',
      description: 'شرح مفهوم المول وكيفية حساب الكتلة المولية',
      thumbnailUrl: 'https://images.unsplash.com/photo-1616969635830-6708d0d596ab?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/AsqEaHFkWR4',
      lesson: 2
    },
    {
      id: 'mole-2',
      title: 'تحويلات المول والكتلة',
      description: 'التحويل بين المول والكتلة وعدد الجزيئات',
      thumbnailUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/DyLktfzABxg',
      lesson: 2
    },
    {
      id: 'calculations-1',
      title: 'الحسابات الكيميائية - النسب المولية',
      description: 'استخدام النسب المولية في الحسابات الكيميائية',
      thumbnailUrl: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/SjQG3rKSZUw',
      lesson: 3
    },
    {
      id: 'calculations-2',
      title: 'المحاليل والتركيز المولي',
      description: 'حسابات التركيز المولي والتخفيف',
      thumbnailUrl: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/ZmKKVvRPS7w',
      lesson: 3
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
          <div key={lessonNum} className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 text-right">
              الدرس {lessonNum}: {lessonTitles[parseInt(lessonNum) as keyof typeof lessonTitles]}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lessonVideos.map((video) => (
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
