
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

const PhysicsVideos = () => {
  const { t, dir } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

  // Physics educational videos data
  const videos: VideoData[] = [
    {
      id: 'phys-1',
      title: 'مبادئ الحركة والقوى',
      description: 'شرح قوانين نيوتن للحركة والتطبيقات العملية لها',
      thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/FOPsfVJWgZ4'
    },
    {
      id: 'phys-2',
      title: 'الكهرباء والمغناطيسية',
      description: 'مقدمة في أساسيات الكهرومغناطيسية وتطبيقاتها',
      thumbnailUrl: 'https://images.unsplash.com/photo-1617839625591-fdd2a5f85f51?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/6Lew6Laqb44'
    },
    {
      id: 'phys-3',
      title: 'الضوء والبصريات',
      description: 'استكشاف خصائص الضوء والظواهر البصرية',
      thumbnailUrl: 'https://images.unsplash.com/photo-1608110417338-94121d74b638?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/IRBfpBPELmE'
    },
    {
      id: 'phys-4',
      title: 'الفيزياء الحديثة',
      description: 'مقدمة في النسبية وميكانيكا الكم',
      thumbnailUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/wdsMZc27T7w'
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <Card 
            key={video.id}
            className="overflow-hidden bg-blue-900/20 border-subject-physics-primary/30 hover:border-subject-physics-primary/60 transition-all cursor-pointer group"
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
                  className="rounded-full bg-subject-physics-primary/80 hover:bg-subject-physics-primary transition-all"
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

export default PhysicsVideos;
