
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface AtomicStructureUnitProps {
  onBack: () => void;
}

const AtomicStructureUnit = ({ onBack }: AtomicStructureUnitProps) => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const lessons = [
    {
      title: "الدرس الأول: مكونات الذرة",
      videos: [
        {
          id: "YzZrcpFWEI4",
          title: "مقدمة الوحدة الأولى: البنية الذرية",
          duration: "15:30"
        },
        {
          id: "FDluh_-2zwI", 
          title: "نموذج دالتون الذري وتجارب التحليل الكهربائي",
          duration: "22:45"
        },
        {
          id: "br-xYOSz3qQ",
          title: "نموذج ثومسون ورذر فورد", 
          duration: "18:20"
        },
        {
          id: "LOBSBbf76qA",
          title: "النظائر وحل أسئلة الدرس الأول",
          duration: "25:15"
        }
      ]
    },
    {
      title: "الدرس الثاني: التوزيع الإلكتروني والجدول الدوري",
      videos: [
        {
          id: "GkKnBciP_Jc",
          title: "التوزيع الإلكتروني والجدول الدوري (الجزء 1)",
          duration: "20:30"
        },
        {
          id: "Jbpt0wvjIsU",
          title: "التوزيع الإلكتروني والجدول الدوري (الجزء 2)", 
          duration: "18:45"
        },
        {
          id: "7y5Mom0w37M",
          title: "التوزيع الإلكتروني والجدول الدوري (الجزء 3)",
          duration: "22:10"
        },
        {
          id: "0lfEqNqSu20",
          title: "الخصائص الدورية في الجدول الدوري (الجزء 1)",
          duration: "19:25"
        },
        {
          id: "d1RC_0Ciods",
          title: "الخصائص الدورية في الجدول الدوري (الجزء 2)",
          duration: "21:30"
        },
        {
          id: "jgXr7b3GFkw",
          title: "حل أسئلة الخصائص الدورية",
          duration: "16:40"
        },
        {
          id: "9p5W54QvWYY",
          title: "مجموعات الجدول الدوري للعناصر الممثلة",
          duration: "24:15"
        },
        {
          id: "qvo5ZOIroEc",
          title: "التوزيع الإلكتروني للأيونات",
          duration: "17:50"
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
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-violet-500 mb-4">
          ⚛️ الوحدة الأولى: بِنية الذرَّة
        </h2>
        <p className="text-white/70">دروس بنية الذرة والتوزيع الإلكتروني</p>
      </div>

      <div className="space-y-8">
        {lessons.map((lesson, lessonIndex) => (
          <div key={lessonIndex} className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-purple-500/30 pb-2">
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
                    className="overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 cursor-pointer hover:border-purple-500/30 transition-all duration-300"
                    onClick={() => setSelectedVideo(video.id)}
                  >
                    <div className="relative">
                      <img 
                        src={`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`}
                        alt={video.title}
                        className="w-full h-[120px] object-cover"
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                        {video.duration}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity duration-300">
                        <div className="w-12 h-12 bg-purple-600/80 rounded-full flex items-center justify-center">
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

export default AtomicStructureUnit;
