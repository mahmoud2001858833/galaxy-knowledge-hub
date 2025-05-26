
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onBack: () => void;
  subject?: string;
}

const VideoPlayer = ({ videoUrl, title, onBack, subject = 'general' }: VideoPlayerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [watchStartTime, setWatchStartTime] = useState<number>(Date.now());

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(videoUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : '';

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Track video watch time
  useEffect(() => {
    setWatchStartTime(Date.now());

    return () => {
      // Save watch time when component unmounts
      saveWatchTime();
    };
  }, []);

  const saveWatchTime = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const watchDuration = Math.floor((Date.now() - watchStartTime) / 1000); // in seconds
      
      // Only save if watched for more than 10 seconds
      if (watchDuration > 10) {
        await supabase
          .from('watched_videos')
          .insert({
            user_id: user.id,
            video_title: title,
            video_url: videoUrl,
            subject: subject,
            duration_watched: watchDuration
          });

        console.log(`Video watch time saved: ${watchDuration} seconds`);
      }
    } catch (error) {
      console.error('Error saving watch time:', error);
    }
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => {
              saveWatchTime();
              onBack();
            }}
            variant="ghost"
            className="text-cyan-400 hover:text-cyan-300 hover:bg-blue-900/30"
          >
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة
          </Button>
          
          <Button
            onClick={toggleFullscreen}
            variant="ghost"
            className="text-white hover:bg-blue-900/30"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>

        <Card className="bg-blue-900/30 border-purple-500/30 overflow-hidden">
          <CardContent className="p-0">
            <div className={`relative ${isFullscreen ? 'h-screen' : 'aspect-video'}`}>
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-800 text-white">
                  <p>لا يمكن تحميل الفيديو</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!isFullscreen && (
          <Card className="bg-green-900/30 border-green-500/30">
            <CardContent className="p-4">
              <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-white/70 text-sm">
                اضغط على زر الشاشة الكاملة لمشاهدة أفضل
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
