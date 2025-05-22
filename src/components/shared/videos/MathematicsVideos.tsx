
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play } from "lucide-react";
import { useLanguage } from '@/i18n/LanguageContext';

interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
}

const MathematicsVideos = () => {
  const { t, dir } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

  // Mathematics educational videos data
  const videos: VideoData[] = [
    {
      id: 'math-1',
      title: 'الجبر والمعادلات',
      description: 'حل المعادلات والمتباينات الجبرية',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/T6y7-ePJjNc'
    },
    {
      id: 'math-2',
      title: 'حساب التفاضل والتكامل',
      description: 'مفاهيم أساسية في التفاضل والتكامل',
      thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/N4MrZ1X9aGM'
    },
    {
      id: 'math-3',
      title: 'الهندسة والقياسات',
      description: 'المفاهيم الأساسية في الهندسة التحليلية والفراغية',
      thumbnailUrl: 'https://images.unsplash.com/photo-1573167710701-59cb8a1aa73e?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/zWRb-B1p3kE'
    },
    {
      id: 'math-4',
      title: 'الإحصاء والاحتمالات',
      description: 'تحليل البيانات والاحتمالات والتوزيعات الإحصائية',
      thumbnailUrl: 'https://images.unsplash.com/photo-1599658880436-c61792e70672?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/YtebGVx-Fxw'
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <Card 
            key={video.id}
            className="overflow-hidden bg-blue-900/20 border-subject-mathematics-primary/30 hover:border-subject-mathematics-primary/60 transition-all cursor-pointer group"
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
                  className="rounded-full bg-subject-mathematics-primary/80 hover:bg-subject-mathematics-primary transition-all"
                >
                  <Play className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className={`font-bold text-lg mb-2 text-white ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{video.title}</h3>
              <p className={`text-sm text-white/70 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{video.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
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

export default MathematicsVideos;
