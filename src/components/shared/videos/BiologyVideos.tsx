
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

const BiologyVideos = () => {
  const { t, dir } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

  // Biology educational videos data
  const videos: VideoData[] = [
    {
      id: 'bio-1',
      title: 'علم الخلية',
      description: 'استكشاف بنية الخلية ووظائفها',
      thumbnailUrl: 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/7ODP6Ptozh4'
    },
    {
      id: 'bio-2',
      title: 'علم الوراثة',
      description: 'أساسيات علم الوراثة والجينات',
      thumbnailUrl: 'https://images.unsplash.com/photo-1635321593217-40050ad13c74?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/siM5nhWV4dY'
    },
    {
      id: 'bio-3',
      title: 'علم وظائف الأعضاء',
      description: 'كيف تعمل أجهزة الجسم المختلفة',
      thumbnailUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/cQI_YvWTZlM'
    },
    {
      id: 'bio-4',
      title: 'التنوع البيولوجي',
      description: 'استكشاف التنوع البيولوجي والتصنيف',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/iMz6lApJgu4'
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <Card 
            key={video.id}
            className="overflow-hidden bg-blue-900/20 border-subject-biology-primary/30 hover:border-subject-biology-primary/60 transition-all cursor-pointer group"
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
                  className="rounded-full bg-subject-biology-primary/80 hover:bg-subject-biology-primary transition-all"
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

export default BiologyVideos;
