import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, Home, Recycle, Droplets, Container, Shirt, 
  Zap, Wrench, ShoppingBag, FileText, Trash2, Search, 
  ChevronRight, Sparkles, ArrowUpRight, CheckCircle2 
} from 'lucide-react';
import ProjectDetailModal from '@/components/projects/ProjectDetailModal';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const HomeProjects = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleProjectClick = (project: any) => {
    setSelectedProject({
      ...project,
      type: 'home' as const
    });
    setIsModalOpen(true);
  };

  const projectIcons = [
    Trash2, Droplets, Container, Shirt, Droplets, Zap, Recycle, Wrench, ShoppingBag, FileText
  ];

  const colorPalettes = [
    { iconBg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
    { iconBg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-200/60 dark:border-sky-800/40', badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300' },
    { iconBg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-800/40', badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' },
    { iconBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
    { iconBg: 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border-teal-200/60 dark:border-teal-800/40', badge: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300' },
    { iconBg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/40', badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' },
    { iconBg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40', badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
    { iconBg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40', badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
    { iconBg: 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border-cyan-200/60 dark:border-cyan-800/40', badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300' },
    { iconBg: 'bg-lime-50 dark:bg-lime-950/50 text-lime-600 dark:text-lime-400 border-lime-200/60 dark:border-lime-800/40', badge: 'bg-lime-50 text-lime-700 dark:bg-lime-950/60 dark:text-lime-300' }
  ];

  const projects = Object.entries(t.homeProjects?.projects || {}).map(([key, project]: [string, any], index) => ({
    id: key,
    title: project.title,
    description: project.description,
    examples: project.examples,
    icon: projectIcons[index % projectIcons.length],
    palette: colorPalettes[index % colorPalettes.length]
  }));

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) || 
      (p.examples && p.examples.toLowerCase().includes(q))
    );
  }, [projects, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#050714] text-slate-900 dark:text-slate-100 transition-colors" dir={dir}>
      <SEO 
        title="مشاريع الاستدامة المنزلية | منصة المعرفة"
        description="مبادرات وحلول بيئية ذكية وسهلة التطبيق لترشيد الاستهلاك المنزلي، تقليل النفايات، وتوفير الطاقة."
      />
      
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Breadcrumb Bar */}
        <div className="border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md sticky top-16 z-30">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Link to="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                <span>الرئيسية</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-slate-400" />
              <Link to="/environmental-sustainability" className="hover:text-emerald-600 transition-colors">
                الاستدامة البيئية
              </Link>
              <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-slate-400" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">مشاريع المنازل الخضراء</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const isGJU = sessionStorage.getItem('gju_mode') === 'true';
                navigate(isGJU ? '/gju-competition' : '/environmental-sustainability');
              }}
              className="h-8 gap-1.5 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>العودة للبوابة</span>
            </Button>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="container mx-auto px-4 pt-10 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
              <Home className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>حلول المنازل البيئية المستدامة · توفير التكاليف وحماية البيئة</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              {t.homeProjects?.title || "مشاريع الاستدامة المنزلية"}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              {t.homeProjects?.subtitle || "طرق عملية ومبتكرة لتطبيق ممارسات الاستدامة في كل ركن من أركان المنزل لتقليل الهدر وتوفير الفواتير."}
            </p>

            {/* Search Input */}
            <div className="relative max-w-md mx-auto mt-6">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="ابحث عن مشروع منزلي، مياه، تسميد، حفظ طاقة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-xs text-sm"
              />
            </div>
          </motion.div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project, index) => {
              const IconComp = project.icon;
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card 
                    className="group h-full cursor-pointer bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
                    onClick={() => handleProjectClick(project)}
                  >
                    <div>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-3 rounded-xl border ${project.palette.iconBg} transition-transform group-hover:scale-110`}>
                            <IconComp className="w-6 h-6" />
                          </div>
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${project.palette.badge}`}>
                            مشروع منزلي
                          </span>
                        </div>
                        <CardTitle className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                          {project.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <CardDescription className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">
                          {project.description}
                        </CardDescription>
                        
                        {project.examples && (
                          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                            <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-emerald-500" />
                              أمثلة تطبيقية:
                            </h4>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed line-clamp-2">
                              {project.examples}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </div>

                    <div className="px-6 pb-5 pt-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                        <span>عرض خطوات التنفيذ</span>
                        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-[-2px] group-hover:translate-y-[-2px]" />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-slate-500">لا توجد مشاريع تطابق بحثك. جرّب كلمات أخرى.</p>
            </div>
          )}

          {/* Quick Access CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-14 max-w-3xl mx-auto"
          >
            <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-blue-950/30 rounded-3xl p-8 border border-emerald-200/60 dark:border-emerald-800/50 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                اصنع من منزلك واحة خضراء ومستدامة!
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-lg mx-auto">
                المشاريع المنزلية تحقق وفراً مباشراً في فواتير الطاقة والمياه مع تعزيز الوعي البيئي للأسرة كاملة.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button 
                  onClick={() => navigate('/environmental/school-projects')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  استكشف المشاريع المدرسية
                </Button>
                <Button 
                  onClick={() => navigate('/environmental/carbon-calculator')}
                  variant="outline"
                  className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 rounded-xl"
                >
                  حاسبة البصمة الكربونية
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Project Detail Modal */}
          {selectedProject && (
            <ProjectDetailModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              project={selectedProject}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomeProjects;