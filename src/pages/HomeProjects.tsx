import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Home, 
  Recycle, 
  Sprout, 
  Droplets, 
  Zap, 
  ShoppingBag, 
  Layers, 
  Sparkles, 
  Sun, 
  Car,
  ChevronLeft
} from 'lucide-react';
import ProjectDetailModal from '@/components/projects/ProjectDetailModal';
import { PageShell, PageHeader } from '@/components/layout/PageShell';
import { SEO } from '@/components/SEO';
import { Badge } from '@/components/ui/badge';

interface Project {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  examples: string;
}

const HomeProjects: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const rawProjects = [
    {
      id: "waste-sorting",
      title: t.homeProjects.wasteSorting,
      description: t.homeProjects.wasteSortingDesc,
      icon: Recycle,
      examples: t.homeProjects.wasteSortingExamples
    },
    {
      id: "home-composting",
      title: t.homeProjects.homeComposting,
      description: t.homeProjects.homeCompostingDesc,
      icon: Sprout,
      examples: t.homeProjects.homeCompostingExamples
    },
    {
      id: "home-garden",
      title: t.homeProjects.homeGarden,
      description: t.homeProjects.homeGardenDesc,
      icon: Sprout,
      examples: t.homeProjects.homeGardenExamples
    },
    {
      id: "water-conservation",
      title: t.homeProjects.waterConservation,
      description: t.homeProjects.waterConservationDesc,
      icon: Droplets,
      examples: t.homeProjects.waterConservationExamples
    },
    {
      id: "energy-efficiency",
      title: t.homeProjects.energyEfficiency,
      description: t.homeProjects.energyEfficiencyDesc,
      icon: Zap,
      examples: t.homeProjects.energyEfficiencyExamples
    },
    {
      id: "plastic-free",
      title: t.homeProjects.plasticFree,
      description: t.homeProjects.plasticFreeDesc,
      icon: ShoppingBag,
      examples: t.homeProjects.plasticFreeExamples
    },
    {
      id: "diy-cleaning",
      title: t.homeProjects.diyCleaning,
      description: t.homeProjects.diyCleaningDesc,
      icon: Sparkles,
      examples: t.homeProjects.diyCleaningExamples
    },
    {
      id: "smart-shopping",
      title: t.homeProjects.smartShopping,
      description: t.homeProjects.smartShoppingDesc,
      icon: Layers,
      examples: t.homeProjects.smartShoppingExamples
    },
    {
      id: "solar-energy",
      title: t.homeProjects.solarEnergy,
      description: t.homeProjects.solarEnergyDesc,
      icon: Sun,
      examples: t.homeProjects.solarEnergyExamples
    },
    {
      id: "green-transport",
      title: t.homeProjects.greenTransport,
      description: t.homeProjects.greenTransportDesc,
      icon: Car,
      examples: t.homeProjects.greenTransportExamples
    }
  ];

  const handleProjectClick = (project: Project) => {
    setSelectedProject({
      ...project,
      type: 'home' as const
    });
    setIsModalOpen(true);
  };

  return (
    <PageShell>
      <SEO 
        title={`${t.homeProjects.title} | ذروة العلم`}
        description={t.homeProjects.subtitle}
      />

      <PageHeader
        title={t.homeProjects.title}
        description={t.homeProjects.subtitle}
        icon={Home}
        crumbs={[
          { label: 'الرئيسية', to: '/' },
          { label: 'المجتمع المدرسي', to: '/school' },
          { label: 'الاستدامة البيئية', to: '/environmental-sustainability' },
          { label: t.homeProjects.title }
        ]}
      />

      {/* Intro info box */}
      <div className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-card-foreground">دليل المبادرات البيئية المنزلية</h2>
          <p className="text-sm text-muted-foreground">
            10 مشاريع منزلية بسيطة ذات أثر كبير لتخفيض فواتير الطاقة والماء وتقليل النفايات في بيتك. اضغط على أي مشروع لعرض التفاصيل.
          </p>
        </div>
        <Badge variant="secondary" className="text-xs px-3 py-1.5 shrink-0">
          10 مشاريع منزلية
        </Badge>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rawProjects.map((project, index) => {
          const Icon = project.icon;
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Card 
                className="group h-full cursor-pointer rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg flex flex-col justify-between"
                onClick={() => handleProjectClick(project)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-primary-foreground shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold">
                      مشروع #{index + 1}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <CardTitle className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors leading-tight">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground leading-relaxed">
                      {project.description}
                    </CardDescription>
                  </div>

                  <div className="rounded-2xl bg-muted/40 p-3.5 border border-border">
                    <h4 className="text-card-foreground font-semibold text-xs mb-1">نماذج وتطبيقات:</h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {project.examples}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-sm font-semibold text-primary">
                  <span>عرض تفاصيل المشروع</span>
                  <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Cross-links Banner */}
      <div className="mt-12 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm text-center max-w-3xl mx-auto space-y-4">
        <h3 className="text-xl font-bold text-card-foreground">تطبيق الأفكار في البيئة المدرسية</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          شارك هذه الحلول مع زملائك ومعلميك في المدرسة أو بادر بإنشاء نادٍ بيئي لمتابعة الأثر الجماعي.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button 
            onClick={() => navigate('/environmental/school-projects')}
            className="rounded-2xl font-bold"
          >
            استعراض المشاريع المدرسية
          </Button>
          <Button 
            onClick={() => navigate('/environmental/carbon-calculator')}
            variant="outline"
            className="rounded-2xl"
          >
            حاسبة البصمة الكربونية
          </Button>
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          project={selectedProject}
        />
      )}
    </PageShell>
  );
};

export default HomeProjects;
