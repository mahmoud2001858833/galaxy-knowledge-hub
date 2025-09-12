import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Home, Recycle, Droplets, Container, Shirt, Zap, Wrench, ShoppingBag, FileText, Trash2 } from 'lucide-react';

const HomeProjects = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();

  const projectIcons = [
    Trash2, Droplets, Container, Shirt, Droplets, Zap, Recycle, Wrench, ShoppingBag, FileText
  ];

  const projects = Object.entries(t.homeProjects.projects).map(([key, project], index) => ({
    id: key,
    title: project.title,
    description: project.description,
    examples: project.examples,
    icon: projectIcons[index],
    color: [
      "from-blue-600/20 to-cyan-600/20",
      "from-green-600/20 to-emerald-600/20", 
      "from-purple-600/20 to-pink-600/20",
      "from-orange-600/20 to-red-600/20",
      "from-teal-600/20 to-blue-600/20",
      "from-indigo-600/20 to-purple-600/20",
      "from-rose-600/20 to-pink-600/20",
      "from-yellow-600/20 to-orange-600/20",
      "from-gray-600/20 to-slate-600/20",
      "from-lime-600/20 to-green-600/20"
    ][index],
    borderColor: [
      "border-blue-500/30",
      "border-green-500/30",
      "border-purple-500/30", 
      "border-orange-500/30",
      "border-teal-500/30",
      "border-indigo-500/30",
      "border-rose-500/30",
      "border-yellow-500/30",
      "border-gray-500/30",
      "border-lime-500/30"
    ][index]
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-950 p-4" dir={dir}>
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/environmental-sustainability')}
            className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.environmental.backToMain}
          </Button>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Home className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-indigo-400">
              {t.homeProjects.title}
            </h1>
          </div>
          <div className="w-20 h-1 bg-purple-500/50 mx-auto mb-4"></div>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            {t.homeProjects.subtitle}
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
            >
              <Card className={`group h-full cursor-pointer ${project.borderColor} border-2 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-105 bg-gradient-to-br ${project.color} backdrop-blur-sm`}>
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-3 p-3 rounded-full bg-white/10 backdrop-blur-sm w-fit">
                    <project.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors leading-tight">
                    {project.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-white/80 text-sm leading-relaxed">
                    {project.description}
                  </CardDescription>
                  
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <h4 className="text-white font-semibold text-sm mb-2">الأمثلة:</h4>
                    <p className="text-white/70 text-xs leading-relaxed">
                      {project.examples}
                    </p>
                  </div>
                </CardContent>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg">
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/0 via-purple-400/10 to-purple-500/0 rounded-lg"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-purple-400/20 to-transparent rounded-b-lg"></div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <div className="bg-white/10 rounded-xl p-6 border border-white/20 backdrop-blur-sm max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-3">ابدأ مشروعك البيئي في المنزل!</h3>
            <p className="text-white/70 mb-4">
              اختر مشروعاً واحداً من هذه المشاريع وابدأ في تطبيقه في منزلك. كل خطوة صغيرة تحدث فرقاً كبيراً.
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => navigate('/environmental/school-projects')}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                المشاريع المدرسية
              </Button>
              <Button 
                onClick={() => navigate('/environmental/carbon-calculator')}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                حاسبة البصمة الكربونية
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeProjects;