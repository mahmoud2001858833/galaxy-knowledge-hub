import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  School, 
  Recycle, 
  Sprout, 
  Droplets, 
  Zap, 
  TreePine, 
  ArrowLeft,
  Sparkles,
  Layers,
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

const SchoolProjects: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const rawProjects = [
    {
      id: "paper-recycling",
      title: t.schoolProjects.paperRecycling,
      description: t.schoolProjects.paperRecyclingDesc,
      icon: Recycle,
      examples: t.schoolProjects.paperRecyclingExamples
    },
    {
      id: "plastic-recycling",
      title: t.schoolProjects.plasticRecycling,
      description: t.schoolProjects.plasticRecyclingDesc,
      icon: Recycle,
      examples: t.schoolProjects.plasticRecyclingExamples
    },
    {
      id: "school-garden",
      title: t.schoolProjects.schoolGarden,
      description: t.schoolProjects.schoolGardenDesc,
      icon: Sprout,
      examples: t.schoolProjects.schoolGardenExamples
    },
    {
      id: "water-saving",
      title: t.schoolProjects.waterSaving,
      description: t.schoolProjects.waterSavingDesc,
      icon: Droplets,
      examples: t.schoolProjects.waterSavingExamples
    },
    {
      id: "energy-saving",
      title: t.schoolProjects.energySaving,
      description: t.schoolProjects.energySavingDesc,
      icon: Zap,
      examples: t.schoolProjects.energySavingExamples
    },
    {
      id: "tree-planting",
      title: t.schoolProjects.treePlanting,
      description: t.schoolProjects.treePlantingDesc,
      icon: TreePine,
      examples: t.schoolProjects.treePlantingExamples
    },
    {
      id: "composting",
      title: t.schoolProjects.composting,
      description: t.schoolProjects.compostingDesc,
      icon: Sprout,
      examples: t.schoolProjects.compostingExamples
    },
    {
      id: "clean-school",
      title: t.schoolProjects.cleanSchool,
      description: t.schoolProjects.cleanSchoolDesc,
      icon: Sparkles,
      examples: t.schoolProjects.cleanSchoolExamples
    },
    {
      id: "awareness-club",
      title: t.schoolProjects.awarenessClub,
      description: t.schoolProjects.awarenessClubDesc,
      icon: School,
      examples: t.schoolProjects.awarenessClubExamples
    },
    {
      id: "green-library",
      title: t.schoolProjects.greenLibrary,
      description: t.schoolProjects.greenLibraryDesc,
      icon: Layers,
      examples: t.schoolProjects.greenLibraryExamples
    }
  ];

  const handleProjectClick = (project: Project) => {
    setSelectedProject({
      ...project,
      type: 'school' as const
    });
    setIsModalOpen(true);
  };

  return (
    <PageShell>
      <SEO 
        title={`${t.schoolProjects.title} | ذروة العلم`}
        description={t.schoolProjects.subtitle}
      />

      <PageHeader
        title={t.schoolProjects.title}
        description={t.schoolProjects.subtitle}
        icon={School}
        crumbs={[
          { label: 'الرئيسية', to: '/' },
          { label: 'المجتمع المدرسي', to: '/school' },
          { label: 'الاستدامة البيئية', to: '/environmental-sustainability' },
          { label: t.schoolProjects.title }
        ]}
      />

      {/* Intro info box */}
      <div className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-card-foreground">دليل المبادرات البيئية للمدارس</h2>
          <p className="text-sm text-muted-foreground">
            10 مشاريع تعليمية وتطبيقية تعزز ثقافة الترشيد والعمل الجماعي بين الطلبة والمعلمين. اضغط على أي مشروع لعرض خطة تنفيذه.
          </p>
        </div>
        <Badge variant="secondary" className="text-xs px-3 py-1.5 shrink-0">
          10 مشاريع معتمدة
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
        <h3 className="text-xl font-bold text-card-foreground">توسيع نطاق المبادرة إلى المنزل</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          يمكن للطلبة وأولياء الأمور نقل الخبرات المكتسبة في المدرسة إلى المنزل عبر تطبيق مشاريع الاستدامة المنزلية أو حساب البصمة الكربونية للأسرة.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button 
            onClick={() => navigate('/environmental/home-projects')}
            className="rounded-2xl font-bold"
          >
            استعراض المشاريع المنزلية
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

export default SchoolProjects;
