
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface MolecularShapesUnitProps {
  onBack: () => void;
}

const MolecularShapesUnit = ({ onBack }: MolecularShapesUnitProps) => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const lessons = [
    {
      title: "الدرس الأول: نظرية تنافر أزواج إلكترونات مستوى التكافؤ (VSEPR)",
      videos: [
        {
          id: "Q7kPfFx0ZWs",
          title: "مراجعة التركيب الإلكتروني",
          duration: "20:15"
        },
        {
          id: "PF9jBxigGag", 
          title: "رسم الجزيئات",
          duration: "25:30"
        },
        {
          id: "XmqeQ7XdWZI",
          title: "رسم الأيونات", 
          duration: "18:45"
        },
        {
          id: "XZXHj3VR720",
          title: "رسم المركبات المحتوية على روابط متعددة",
          duration: "22:20"
        },
        {
          id: "kJ1q8kRzWPg",
          title: "نظرية تنافر أزواج إلكترونات مستوى التكافؤ",
          duration: "28:10"
        },
        {
          id: "-P0qnL8XA2g",
          title: "حل أسئلة الدرس",
          duration: "16:40"
        }
      ]
    },
    {
      title: "الدرس الثاني: الروابط والأفلاك المتداخلة",
      videos: [
        {
          id: "nA7D3xCGv7M",
          title: "نظرية رابطة التكافؤ",
          duration: "24:30"
        },
        {
          id: "6nKJtpiu1cc",
          title: "التهجين وقطبية الجزيئات (الجزء 1)",
          duration: "21:15"
        },
        {
          id: "DPvbY0zYGos",
          title: "التهجين وقطبية الجزيئات (الجزء 2)",
          duration: "19:50"
        },
        {
          id: "QL4hnkQUf6s",
          title: "حل أسئلة الدرس",
          duration: "17:25"
        }
      ]
    },
    {
      title: "الدرس الثالث: القوى بين الجزيئات",
      videos: [
        {
          id: "pBMfoXVal-A",
          title: "القوى بين الجزيئات (الجزء 1)",
          duration: "23:40"
        },
        {
          id: "tVJfbq6AHqk",
          title: "القوى بين الجزيئات (الجزء 2)",
          duration: "20:30"
        },
        {
          id: "RrTfi7dC-SE",
          title: "حل أسئلة الوحدة الأولى",
          duration: "18:15"
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
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-cyan-500 mb-4">
          🔬 الوحدة الأولى: أشكال الجزيئات وقوى التجاذب بينها
        </h2>
        <p className="text-white/70">دروس نظرية VSEPR والروابط الجزيئية</p>
      </div>

      <div className="space-y-8">
        {lessons.map((lesson, lessonIndex) => (
          <div key={lessonIndex} className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-blue-500/30 pb-2">
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
                    className="overflow-hidden bg-white/5 backdrop-blur-sm border-white/10 cursor-pointer hover:border-blue-500/30 transition-all duration-300"
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
                        <div className="w-12 h-12 bg-blue-600/80 rounded-full flex items-center justify-center">
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

export default MolecularShapesUnit;
