
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

const ChemistryVideos = () => {
  const { t, dir } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);

  // Chemistry educational videos data
  const videos: VideoData[] = [
    {
      id: 'chem-1',
      title: 'الجدول الدوري والعناصر',
      description: 'تفسير الجدول الدوري وخصائص العناصر الكيميائية',
      thumbnailUrl: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/rz4Dd1I_fX0'
    },
    {
      id: 'chem-2',
      title: 'التفاعلات الكيميائية',
      description: 'أنواع التفاعلات الكيميائية ومعدل التفاعل',
      thumbnailUrl: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/kGHRjOrXnSM'
    },
    {
      id: 'chem-3',
      title: 'الكيمياء العضوية',
      description: 'مقدمة في المركبات العضوية وتفاعلاتها',
      thumbnailUrl: 'https://images.unsplash.com/photo-1616969635830-6708d0d596ab?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/CRnVtl32HqA'
    },
    {
      id: 'chem-4',
      title: 'التحليل الكيميائي',
      description: 'طرق تحليل المواد الكيميائية والتجارب المختبرية',
      thumbnailUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=500',
      videoUrl: 'https://www.youtube.com/embed/YKAQe7CzGdE'
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((video) => (
          <Card 
            key={video.id}
            className="overflow-hidden bg-blue-900/20 border-subject-chemistry-primary/30 hover:border-subject-chemistry-primary/60 transition-all cursor-pointer group"
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
                  className="rounded-full bg-subject-chemistry-primary/80 hover:bg-subject-chemistry-primary transition-all"
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

export default ChemistryVideos;
