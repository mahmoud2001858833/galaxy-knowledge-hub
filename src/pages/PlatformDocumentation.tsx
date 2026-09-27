import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import {
  BookOpen,
  Cpu,
  Brain,
  Atom,
  GraduationCap,
  Shield,
  Sparkles,
  Printer,
  Download,
  Share2,
  Layers,
  ChevronLeft,
  BookMarked,
  Activity,
  CheckCircle2,
  FileText,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Modular Documentation Components
import { DocsSourcesExplorer } from '@/components/docs/DocsSourcesExplorer';
import { DocsArchitectureTab } from '@/components/docs/DocsArchitectureTab';
import { DocsAITab } from '@/components/docs/DocsAITab';
import { DocsSimulationsTab } from '@/components/docs/DocsSimulationsTab';
import { DocsCurriculaTab } from '@/components/docs/DocsCurriculaTab';
import { DocsSecurityTab } from '@/components/docs/DocsSecurityTab';
import { TOTAL_SOURCES_COUNT } from '@/data/platformSourcesData';

export const PlatformDocumentation: React.FC = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'sources';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Sync tab with URL query parameter
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: '🔗 تم نسخ رابط التوثيق',
        description: 'يمكنك الآن مشاركة التوثيق الشامل لمنصة ذروة العلم.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060919] text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300" dir="rtl">
      <SEO
        title="التوثيق الرسمي والمصادر والمراجع العلمية | ذروة العلم"
        description="التوثيق المعماري الشامل لمنصة ذروة العلم، مع قاعدة بيانات تضم أكثر من 1,100 مصدر ومرجع علمي محكم معتمد في الفيزياء، الكيمياء، الروبوتات، والذكاء الاصطناعي."
        keywords="توثيق المنصة, مصادر ومراجع, فيزياء, كيمياء, روبوتات, ذكاء اصطناعي, ROS2, المناهج الأردنية, BTEC, ذروة العلم"
      />
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              الرئيسية
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">
              التوثيق والمصادر والمراجع
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleShare}
              className="text-xs rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Share2 className="w-3.5 h-3.5 ml-1" />
              مشاركة
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="text-xs rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Printer className="w-3.5 h-3.5 ml-1" />
              طباعة التوثيق
            </Button>
          </div>
        </div>

        {/* Hero Section Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-blue-500/30 bg-gradient-to-br from-blue-900/10 via-indigo-900/10 to-slate-900/10 dark:from-blue-950/60 dark:via-slate-900/80 dark:to-indigo-950/40 p-8 sm:p-12 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 text-xs px-3 py-1 font-bold">
              <Sparkles className="w-3.5 h-3.5 ml-1 text-blue-500" />
              التوثيق الأكاديمي والتقني المعتمد v3.5 Enterprise
            </Badge>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs px-3 py-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 ml-1 text-emerald-500" />
              {TOTAL_SOURCES_COUNT} مصدر ومرجع علمي مفهرس
            </Badge>
          </div>

          <div className="max-w-4xl space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
              التوثيق الشامل لمنظومة ذروة العلم والمصادر الأكاديمية
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              الدليل المرجعي الكامل للمعمارية الهندسية، محركات الذكاء الاصطناعي الـ 25، موسوعة المختبرات والمحاكيات الـ 45، ومكتبة المصادر والمراجع العلمية المعيارية المكونة من أكثر من 1,100 مرجع موثق مع بيان مجالات وأماكن تطبيقها في المنصة.
            </p>
          </div>

          {/* Quick Stats Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-slate-200/60 dark:border-slate-800">
            <div className="space-y-0.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">المصادر والمراجع العلمية</span>
              <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                {TOTAL_SOURCES_COUNT}+
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">المختبرات والمحاكيات</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                45 مختبراً
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">أدوات الذكاء الاصطناعي</span>
              <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                25 أداة
              </div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">سطور الكود البرمجي</span>
              <div className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                5.2M+
              </div>
            </div>
          </div>
        </div>

        {/* Executive Tabs Navigation Interface */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-8">
          <div className="flex justify-center sticky top-20 z-20 bg-slate-50/90 dark:bg-[#060919]/90 backdrop-blur-md py-2">
            <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl w-full flex flex-wrap justify-center gap-1.5 h-auto shadow-md">
              {/* TAB 1: Sources (Primary user-requested feature) */}
              <TabsTrigger
                value="sources"
                className="rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 py-2.5 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
              >
                <BookMarked className="w-4 h-4 text-amber-500" />
                <span>1. المصادر والمراجع ({TOTAL_SOURCES_COUNT})</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-300 font-bold">
                  جديد ✨
                </span>
              </TabsTrigger>

              {/* TAB 2: Architecture */}
              <TabsTrigger
                value="architecture"
                className="rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 py-2.5 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
              >
                <Cpu className="w-4 h-4 text-blue-500" />
                <span>2. الهيكلية المعمارية</span>
              </TabsTrigger>

              {/* TAB 3: AI Ecosystem */}
              <TabsTrigger
                value="ai"
                className="rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 py-2.5 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
              >
                <Brain className="w-4 h-4 text-purple-500" />
                <span>3. منظومة الذكاء الاصطناعي (25)</span>
              </TabsTrigger>

              {/* TAB 4: Scientific Simulations */}
              <TabsTrigger
                value="simulations"
                className="rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 py-2.5 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
              >
                <Atom className="w-4 h-4 text-emerald-500" />
                <span>4. المختبرات والمحاكيات (45)</span>
              </TabsTrigger>

              {/* TAB 5: Curricula */}
              <TabsTrigger
                value="curricula"
                className="rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 py-2.5 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
              >
                <GraduationCap className="w-4 h-4 text-teal-500" />
                <span>5. المناهج و BTEC</span>
              </TabsTrigger>

              {/* TAB 6: Security & Cloud */}
              <TabsTrigger
                value="security"
                className="rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 py-2.5 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
              >
                <Shield className="w-4 h-4 text-rose-500" />
                <span>6. الأمان والسيبرانية</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1 CONTENT: 1,124+ Sources Explorer */}
          <TabsContent value="sources" className="space-y-6 focus:outline-none">
            <DocsSourcesExplorer />
          </TabsContent>

          {/* TAB 2 CONTENT: Architecture */}
          <TabsContent value="architecture" className="space-y-6 focus:outline-none">
            <DocsArchitectureTab />
          </TabsContent>

          {/* TAB 3 CONTENT: AI Ecosystem */}
          <TabsContent value="ai" className="space-y-6 focus:outline-none">
            <DocsAITab />
          </TabsContent>

          {/* TAB 4 CONTENT: Simulations */}
          <TabsContent value="simulations" className="space-y-6 focus:outline-none">
            <DocsSimulationsTab />
          </TabsContent>

          {/* TAB 5 CONTENT: Curricula */}
          <TabsContent value="curricula" className="space-y-6 focus:outline-none">
            <DocsCurriculaTab />
          </TabsContent>

          {/* TAB 6 CONTENT: Security */}
          <TabsContent value="security" className="space-y-6 focus:outline-none">
            <DocsSecurityTab />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default PlatformDocumentation;
