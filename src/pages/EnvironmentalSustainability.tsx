import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calculator, School, Home, Leaf, BarChart, Users, Recycle, Brain } from 'lucide-react';
import sustainabilityBg from '@/assets/sustainability-background.png';
import heroImage from '@/assets/environmental-hero.jpg';

const EnvironmentalSustainability = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();

  const sections = [
    {
      title: t.environmental.carbonCalculator,
      description: t.environmental.carbonCalculatorDescription,
      icon: Calculator,
      color: "from-blue-600/20 to-cyan-600/20",
      borderColor: "border-blue-500/30",
      hoverBorderColor: "hover:border-blue-500/50",
      link: "/environmental/carbon-calculator"
    },
    {
      title: t.environmental.schoolProjects,
      description: t.environmental.schoolProjectsDescription,
      icon: School,
      color: "from-green-600/20 to-emerald-600/20",
      borderColor: "border-green-500/30",
      hoverBorderColor: "hover:border-green-500/50",
      link: "/environmental/school-projects"
    },
    {
      title: t.environmental.homeProjects,
      description: t.environmental.homeProjectsDescription,
      icon: Home,
      color: "from-purple-600/20 to-pink-600/20",
      borderColor: "border-purple-500/30",
      hoverBorderColor: "hover:border-purple-500/50",
      link: "/environmental/home-projects"
    },
    {
      title: t.environmental.personalSustainabilityIndex,
      description: t.environmental.personalSustainabilityIndexDescription,
      icon: BarChart,
      color: "from-teal-600/20 to-blue-600/20",
      borderColor: "border-teal-500/30",
      hoverBorderColor: "hover:border-teal-500/50",
      link: "/environmental/personal-sustainability-index"
    },
    {
      title: 'مشاريع الطلاب',
      description: 'شارك مشاريعك البيئية مع الآخرين',
      icon: Users,
      color: "from-amber-600/20 to-yellow-600/20",
      borderColor: "border-amber-500/30",
      hoverBorderColor: "hover:border-amber-500/50",
      link: "/environmental/student-projects"
    },
    {
      title: 'خبير إعادة التدوير الذكي',
      description: 'حوّل نفاياتك إلى مشاريع إبداعية مع الذكاء الاصطناعي',
      icon: Recycle,
      color: "from-cyan-600/20 to-teal-600/20",
      borderColor: "border-cyan-500/30",
      hoverBorderColor: "hover:border-cyan-500/50",
      link: "/environmental/recycling-advisor"
    },
    {
      title: 'أداة التنبؤ البيئي الذكية',
      description: 'تحليل بياناتك البيئية وتوقع البصمة الكربونية المستقبلية باستخدام الذكاء الاصطناعي',
      icon: Brain,
      color: "from-indigo-600/20 to-purple-600/20",
      borderColor: "border-indigo-500/30",
      hoverBorderColor: "hover:border-indigo-500/50",
      link: "/environmental/eco-predict"
    }
  ];

  return (
    <div 
      className="min-h-screen p-4 relative" 
      dir={dir}
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${sustainabilityBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="container mx-auto max-w-6xl">
        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 rounded-2xl overflow-hidden shadow-2xl"
        >
          <img 
            src={heroImage} 
            alt="Environmental Sustainability" 
            className="w-full h-64 md:h-96 object-cover"
          />
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.environmental.backToMain}
          </Button>
        </motion.div>

        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf className="w-12 h-12 text-green-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-white to-emerald-400">
              {t.environmental.title}
            </h1>
          </div>
          <div className="w-20 h-1 bg-green-500/50 mx-auto mb-4"></div>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            {t.environmental.subtitle}
          </p>
        </motion.div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card 
                onClick={() => navigate(section.link)}
                className={`group relative h-[300px] cursor-pointer ${section.borderColor} ${section.hoverBorderColor} border-2 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 hover:scale-105 bg-gradient-to-br ${section.color} backdrop-blur-sm`}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-white/10 backdrop-blur-sm w-fit">
                    <section.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-white group-hover:text-green-300 transition-colors">
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-white/80 text-sm leading-relaxed">
                    {section.description}
                  </CardDescription>
                  <Button 
                    variant="outline"
                    className="mt-6 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    {t.platformCategories.explore}
                  </Button>
                </CardContent>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg">
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-500/0 via-green-400/10 to-green-500/0 rounded-lg"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-green-400/20 to-transparent rounded-b-lg"></div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalSustainability;