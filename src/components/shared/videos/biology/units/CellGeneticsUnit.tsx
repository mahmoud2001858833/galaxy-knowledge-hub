
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, BookOpen, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

interface CellGeneticsUnitProps {
  onBack: () => void;
}

const CellGeneticsUnit = ({ onBack }: CellGeneticsUnitProps) => {
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const lessons = [
    {
      id: 'cell-structure',
      title: 'الدرس الأول: تركيب الخلية ووظائفها',
      duration: '45 دقيقة',
      videos: [
        { id: 'cell-intro', title: 'مقدمة عن الخلية', duration: '12:30', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' },
        { id: 'cell-organelles', title: 'عضيات الخلية', duration: '15:45', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' },
        { id: 'cell-membrane', title: 'الغشاء الخلوي', duration: '10:20', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' },
        { id: 'cell-nucleus', title: 'النواة والمادة الوراثية', duration: '13:15', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' }
      ]
    },
    {
      id: 'cell-division',
      title: 'الدرس الثاني: انقسام الخلية',
      duration: '50 دقيقة',
      videos: [
        { id: 'mitosis-intro', title: 'الانقسام المتساوي - مقدمة', duration: '14:20', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' },
        { id: 'mitosis-phases', title: 'مراحل الانقسام المتساوي', duration: '18:30', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' },
        { id: 'meiosis', title: 'الانقسام المنصف', duration: '16:45', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' }
      ]
    },
    {
      id: 'genetics-basics',
      title: 'الدرس الثالث: أساسيات الوراثة',
      duration: '55 دقيقة',
      videos: [
        { id: 'mendel-laws', title: 'قوانين مندل في الوراثة', duration: '20:15', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' },
        { id: 'dominant-recessive', title: 'الصفات السائدة والمتنحية', duration: '15:30', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' },
        { id: 'genetic-crosses', title: 'التهجين الوراثي', duration: '19:20', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' }
      ]
    },
    {
      id: 'dna-rna',
      title: 'الدرس الرابع: DNA و RNA',
      duration: '48 دقيقة',
      videos: [
        { id: 'dna-structure', title: 'تركيب الحمض النووي DNA', duration: '16:40', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' },
        { id: 'rna-types', title: 'أنواع RNA ووظائفه', duration: '14:25', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' },
        { id: 'protein-synthesis', title: 'تصنيع البروتين', duration: '17:10', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' }
      ]
    }
  ];

  const toggleLesson = (lessonId: string) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
    setSelectedVideo(null);
  };

  const handleVideoSelect = (videoUrl: string) => {
    setSelectedVideo(videoUrl);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-green-400 hover:text-green-300 hover:bg-green-900/30"
        >
          &larr; العودة للوحدات
        </Button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-white to-emerald-500 mb-4">
          🧬 الوحدة الأولى: الخلية والوراثة
        </h2>
        <p className="text-white/70">انقر على أي درس لمشاهدة الفيديوهات التعليمية</p>
      </div>

      <div className="space-y-4">
        {lessons.map((lesson) => (
          <div key={lesson.id}>
            <Card 
              className="cursor-pointer overflow-hidden bg-gradient-to-br from-green-500/20 to-emerald-500/30 border-green-500/30 hover:border-green-500/60 transition-all duration-300 hover:-translate-y-1"
              onClick={() => toggleLesson(lesson.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-900/30 backdrop-blur-sm">
                      <BookOpen className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{lesson.title}</h3>
                      <div className="flex items-center gap-4 text-green-300 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{lesson.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Play className="w-4 h-4" />
                          <span>{lesson.videos.length} فيديو</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-green-400">
                    {expandedLesson === lesson.id ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                  </div>
                </div>
              </CardContent>
            </Card>

            <AnimatePresence>
              {expandedLesson === lesson.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-3"
                >
                  {lesson.videos.map((video) => (
                    <Card 
                      key={video.id}
                      className="cursor-pointer bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-600/30 hover:border-green-500/60 transition-all duration-300"
                      onClick={() => handleVideoSelect(video.videoUrl)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-green-800/30">
                              <Play className="w-4 h-4 text-green-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{video.title}</h4>
                              <p className="text-green-300 text-sm">{video.duration}</p>
                            </div>
                          </div>
                          <div className="text-green-400 hover:text-green-300">
                            <Play className="w-5 h-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {selectedVideo && expandedLesson === lesson.id && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-6"
              >
                <Card className="bg-black/50 border-green-500/30">
                  <CardContent className="p-6">
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                      <iframe
                        src={selectedVideo}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="فيديو تعليمي"
                      />
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={() => setSelectedVideo(null)}
                        variant="ghost"
                        className="text-green-400 hover:text-green-300"
                      >
                        إغلاق الفيديو
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CellGeneticsUnit;
