
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface ReactionsCalculationsUnitProps {
  onBack: () => void;
}

const ReactionsCalculationsUnit = ({ onBack }: ReactionsCalculationsUnitProps) => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // الصورة المصغرة الموحدة لجميع فيديوهات الكيمياء
  const chemistryThumbnail = "https://i0.wp.com/hagag-edu.com/wp-content/uploads/2023/08/chemistry-colorful-round-vector-12906189.jpg?fit=768%2C829&ssl=1";

  const lessons = [
    {
      title: "الدرس الأول: التفاعلات الكيميائية",
      videos: [
        {
          id: "S7ojpkEau1I",
          title: "تفاعلات الاتحاد",
          duration: "18:30"
        },
        {
          id: "qem73DrChGo", 
          title: "تفاعلات التحلل",
          duration: "20:15"
        },
        {
          id: "0k2Q4YJXhHc",
          title: "تفاعلات الإحلال الأحادي البسيط", 
          duration: "22:45"
        },
        {
          id: "LQ36zDAKWf8",
          title: "تفاعلات الإحلال المزدوج",
          duration: "19:20"
        },
        {
          id: "6tJzSDE8u6E",
          title: "المعادلة الأيونية (الجزء 1)",
          duration: "21:10"
        },
        {
          id: "dbQ7vbOrh20",
          title: "المعادلة الأيونية (الجزء 2)",
          duration: "18:50"
        }
      ]
    },
    {
      title: "الدرس الثاني: تركيز المحاليل",
      videos: [
        {
          id: "klJRsBBNy0Q",
          title: "الكسر المولي",
          duration: "17:25"
        },
        {
          id: "L6pZbI1fL8M",
          title: "النسبة المئوية بالكتلة والحجم",
          duration: "19:40"
        },
        {
          id: "WNvXzFhhcXU",
          title: "التركيز المولاري والمولالي",
          duration: "23:15"
        },
        {
          id: "qy3oi65qS88",
          title: "المحاليل القياسية وتخفيف المحاليل",
          duration: "25:30"
        },
        {
          id: "6nlO9cpi3XQ",
          title: "حل أسئلة الدرس",
          duration: "16:20"
        }
      ]
    },
    {
      title: "الدرس الثالث: الحسابات الكيميائية",
      videos: [
        {
          id: "fa5vXet21WM",
          title: "المادة المحددة للتفاعل (الجزء 1)",
          duration: "22:30"
        },
        {
          id: "hpJNDEdV13s",
          title: "المادة المحددة للتفاعل (الجزء 2)",
          duration: "20:45"
        },
        {
          id: "1xRDkU8cPwA",
          title: "المادة المحددة للتفاعل (الجزء 3)",
          duration: "18:15"
        },
        {
          id: "2C3KXi0EWNQ",
          title: "المادة المحددة للتفاعل (الجزء 4)",
          duration: "24:10"
        }
      ]
    }
  ];

  if (selectedVideo) {
    return (
      <div className="space-y-6">
        <Button
          onClick={() => setSelectedVideo(null)}
          variant="ghost"
          className="text-cyan-400 hover:text-cyan-300 hover:bg-blue-900/30"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          العودة إلى قائمة الفيديوهات
        </Button>
        
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button
        onClick={onBack}
        variant="ghost"
        className="text-cyan-400 hover:text-cyan-300 hover:bg-blue-900/30"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        العودة للوحدات
      </Button>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-white to-pink-500 mb-4">
          ⚗️ الوحدة الثانية: التفاعلات والحسابات الكيميائية
        </h2>
        <p className="text-white/70">دروس التفاعلات الكيميائية وحساباتها</p>
      </div>

      <div className="space-y-8">
        {lessons.map((lesson, lessonIndex) => (
          <div key={lessonIndex} className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-red-500/30 pb-2">
              {lesson.title}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lesson.videos.map((video, videoIndex) => (
                <motion.div
                  key={videoIndex}
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card 
                    className="overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 cursor-pointer hover:border-red-500/30 transition-all duration-300"
                    onClick={() => setSelectedVideo(video.id)}
                  >
                    <div className="relative">
                      <img 
                        src={chemistryThumbnail}
                        alt={video.title}
                        className="w-full h-[120px] object-cover"
                        onError={(e) => {
                          // إذا فشل تحميل الصورة، نستخدم صورة YouTube كبديل
                          e.currentTarget.src = `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`;
                        }}
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                        {video.duration}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-red-600/80 rounded-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-white ml-1" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm line-clamp-2 min-h-[40px] text-white">
                        {video.title}
                      </h4>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReactionsCalculationsUnit;
