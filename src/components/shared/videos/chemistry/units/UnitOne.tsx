
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Atom } from "lucide-react";
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

const UnitOne = ({ onBack }: UnitOneProps) => {
  const { t, dir } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

  const videos: VideoData[] = [
    {
      id: 'atom-hydrogen-1',
      title: 'الذرة ونموذج ذرة الهيدروجين - الجزء الأول',
      description: 'مقدمة عن الذرة وتطور النماذج الذرية',
      thumbnailUrl: 'https://images.unsplash.com/photo-1635322966219-b75ed372eb01?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/yqLlgIaz1L0',
      lesson: 1
    },
    {
      id: 'atom-hydrogen-2',
      title: 'نموذج ذرة الهيدروجين وطيف الانبعاث',
      description: 'شرح نموذج بوهر وطيف ذرة الهيدروجين',
      thumbnailUrl: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/H6wgs7alI1U',
      lesson: 1
    },
    {
      id: 'wave-model-1',
      title: 'النموذج الميكانيكي الموجي للذرة',
      description: 'مقدمة في الميكانيكا الموجية وأرقام الكم',
      thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/7vc-Uvp3vwg',
      lesson: 2
    },
    {
      id: 'wave-model-2',
      title: 'الأوربيتالات الذرية وأشكالها',
      description: 'شرح مفصل للأوربيتالات s, p, d, f',
      thumbnailUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/cPDptc0wUYI',
      lesson: 2
    }
  ];

  const lessonGroups = {
    1: videos.filter(v => v.lesson === 1),
    2: videos.filter(v => v.lesson === 2)
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
            <Atom className="w-12 h-12 text-purple-400 mr-3" />
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-violet-500">
              الوحدة الأولى: بنية الذرة وتركيبها
            </h2>
          </div>
          <p className="text-white/70">فيديوهات تعليمية شاملة حول بنية الذرة</p>
        </div>

        {Object.entries(lessonGroups).map(([lessonNum, lessonVideos]) => (
          <div key={lessonNum} className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4 text-right">
              الدرس {lessonNum}: {lessonNum === '1' ? 'الذرة ونموذج ذرة الهيدروجين' : 'النموذج الميكانيكي الموجي للذرة'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {lessonVideos.map((video) => (
                <Card 
                  key={video.id}
                  className="overflow-hidden bg-blue-900/20 border-purple-500/30 hover:border-purple-500/60 transition-all cursor-pointer group"
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

export default UnitOne;
