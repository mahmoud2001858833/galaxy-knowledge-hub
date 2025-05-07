
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface Video {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  duration: string;
}

const videos: Video[] = [
  {
    id: "GVwVDCQVwY0",
    title: "موسيقى هادئة للاسترخاء والتأمل",
    category: "music",
    thumbnail: "https://i.ytimg.com/vi/GVwVDCQVwY0/maxresdefault.jpg",
    duration: "3:01:24"
  },
  {
    id: "lFcSrYw-ARY",
    title: "أصوات طبيعية للتركيز والدراسة",
    category: "nature",
    thumbnail: "https://i.ytimg.com/vi/lFcSrYw-ARY/maxresdefault.jpg",
    duration: "1:04:19"
  },
  {
    id: "Y3QDNV_WgTs",
    title: "أصوات المطر للاسترخاء والنوم",
    category: "nature",
    thumbnail: "https://i.ytimg.com/vi/Y3QDNV_WgTs/maxresdefault.jpg",
    duration: "2:05:00"
  },
  {
    id: "17O2a0_o-o4",
    title: "موسيقى كلاسيكية للدراسة والتركيز",
    category: "music",
    thumbnail: "https://i.ytimg.com/vi/17O2a0_o-o4/maxresdefault.jpg",
    duration: "1:30:31"
  },
  {
    id: "cI4ryatVkKw",
    title: "تمارين تنفس للاسترخاء وتقليل التوتر",
    category: "meditation",
    thumbnail: "https://i.ytimg.com/vi/cI4ryatVkKw/maxresdefault.jpg",
    duration: "10:25"
  },
  {
    id: "bthZQC711do",
    title: "تدريب الاسترخاء العضلي التدريجي",
    category: "meditation",
    thumbnail: "https://i.ytimg.com/vi/bthZQC711do/maxresdefault.jpg",
    duration: "15:02"
  },
  {
    id: "kyCm7PfNYoE",
    title: "أصوات الغابة مع موسيقى هادئة",
    category: "nature",
    thumbnail: "https://i.ytimg.com/vi/kyCm7PfNYoE/maxresdefault.jpg",
    duration: "1:15:33"
  },
  {
    id: "1ZYbU82GVz4",
    title: "موسيقى بيانو هادئة للقراءة والتركيز",
    category: "music",
    thumbnail: "https://i.ytimg.com/vi/1ZYbU82GVz4/maxresdefault.jpg",
    duration: "2:00:44"
  }
];

const RelaxationVideos = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  
  const filteredVideos = activeCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === activeCategory);

  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue="all" 
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="w-full"
      >
        <div className="flex justify-center mb-6">
          <TabsList>
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="nature">أصوات الطبيعة</TabsTrigger>
            <TabsTrigger value="music">موسيقى هادئة</TabsTrigger>
            <TabsTrigger value="meditation">تأمل واسترخاء</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value={activeCategory} className="mt-0">
          {selectedVideo ? (
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-4">
                <div className="relative pb-[56.25%] h-0">
                  <iframe 
                    className="absolute top-0 left-0 w-full h-full rounded-md"
                    src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedVideo(null)}
                    className="bg-transparent border-white/20 text-white/80 hover:bg-white/10"
                  >
                    العودة إلى القائمة
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <motion.div
                  key={video.id}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 cursor-pointer" onClick={() => setSelectedVideo(video.id)}>
                    <div className="relative">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-[160px] object-cover"
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                        {video.duration}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity duration-300">
                        <div className="w-16 h-16 bg-red-600/80 rounded-full flex items-center justify-center">
                          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 4L18 12L6 20V4Z" fill="white"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium line-clamp-2 min-h-[48px]">{video.title}</h3>
                      <div className="flex items-center mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full 
                          ${video.category === 'nature' ? 'bg-green-900/40 text-green-300' : 
                           video.category === 'music' ? 'bg-blue-900/40 text-blue-300' : 
                           'bg-purple-900/40 text-purple-300'}`}
                        >
                          {video.category === 'nature' ? 'أصوات الطبيعة' : 
                           video.category === 'music' ? 'موسيقى هادئة' : 
                           'تأمل واسترخاء'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {!selectedVideo && (
        <div className="text-center text-white/60 mt-2 text-sm">
          <p>يمكنك الاستماع إلى هذه الفيديوهات خلال فترات الراحة أو أثناء الدراسة للمساعدة على الاسترخاء والتركيز</p>
        </div>
      )}
    </div>
  );
};

export default RelaxationVideos;
