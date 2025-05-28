
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, BookOpen, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

interface EvolutionDiversityUnitProps {
  onBack: () => void;
}

const EvolutionDiversityUnit = ({ onBack }: EvolutionDiversityUnitProps) => {
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const lessons = [
    {
      id: 'evolution-theory',
      title: 'الدرس الأول: نظرية التطور',
      duration: '52 دقيقة',
      videos: [
        { id: 'darwin-theory', title: 'نظرية داروين في التطور', duration: '18:20', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' },
        { id: 'natural-selection', title: 'الانتخاب الطبيعي', duration: '16:30', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' },
        { id: 'evolution-evidence', title: 'أدلة التطور', duration: '17:25', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' }
      ]
    },
    {
      id: 'classification',
      title: 'الدرس الثاني: تصنيف الكائنات الحية',
      duration: '48 دقيقة',
      videos: [
        { id: 'taxonomy-basics', title: 'أساسيات التصنيف', duration: '15:40', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' },
        { id: 'kingdoms', title: 'الممالك الخمس', duration: '20:15', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' },
        { id: 'binomial-nomenclature', title: 'نظام التسمية الثنائية', duration: '12:30', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' }
      ]
    },
    {
      id: 'biodiversity',
      title: 'الدرس الثالث: التنوع الحيوي والبيئة',
      duration: '55 دقيقة',
      videos: [
        { id: 'biodiversity-importance', title: 'أهمية التنوع الحيوي', duration: '16:45', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' },
        { id: 'ecosystems', title: 'النظم البيئية', duration: '19:20', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' },
        { id: 'conservation', title: 'حماية الطبيعة', duration: '18:50', videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8' }
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
          className="text-teal-400 hover:text-teal-300 hover:bg-teal-900/30"
        >
          &larr; العودة للوحدات
        </Button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-white to-cyan-500 mb-4">
          🌱 الوحدة الثانية: التطور والتنوع الحيوي
        </h2>
        <p className="text-white/70">انقر على أي درس لمشاهدة الفيديوهات التعليمية</p>
      </div>

      <div className="space-y-4">
        {lessons.map((lesson) => (
          <div key={lesson.id}>
            <Card 
              className="cursor-pointer overflow-hidden bg-gradient-to-br from-teal-500/20 to-cyan-500/30 border-teal-500/30 hover:border-teal-500/60 transition-all duration-300 hover:-translate-y-1"
              onClick={() => toggleLesson(lesson.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-teal-900/30 backdrop-blur-sm">
                      <BookOpen className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{lesson.title}</h3>
                      <div className="flex items-center gap-4 text-teal-300 text-sm">
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
                  <div className="text-teal-400">
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
                      className="cursor-pointer bg-gradient-to-r from-teal-900/20 to-cyan-900/20 border-teal-600/30 hover:border-teal-500/60 transition-all duration-300"
                      onClick={() => handleVideoSelect(video.videoUrl)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-teal-800/30">
                              <Play className="w-4 h-4 text-teal-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">{video.title}</h4>
                              <p className="text-teal-300 text-sm">{video.duration}</p>
                            </div>
                          </div>
                          <div className="text-teal-400 hover:text-teal-300">
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
                <Card className="bg-black/50 border-teal-500/30">
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
                        className="text-teal-400 hover:text-teal-300"
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

export default EvolutionDiversityUnit;
