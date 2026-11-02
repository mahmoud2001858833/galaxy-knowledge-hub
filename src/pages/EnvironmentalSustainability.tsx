import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calculator, 
  School, 
  Home, 
  Leaf, 
  BarChart3, 
  Users, 
  Recycle, 
  Brain, 
  ArrowLeft,
  Sparkles,
  TreePine,
  ShieldCheck
} from 'lucide-react';
import { PageShell, PageHeader, PageSection } from '@/components/layout/PageShell';
import { SEO } from '@/components/SEO';
import { Badge } from '@/components/ui/badge';

interface SustainabilityTool {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  link: string;
  badge: string;
  category: string;
}

const tools: SustainabilityTool[] = [
  {
    title: 'حاسبة البصمة الكربونية',
    description: 'احسب تأثيرك البيئي السنوي بدقة من استهلاك الكهرباء والماء والمواصلات والرحلات.',
    icon: Calculator,
    link: '/environmental/carbon-calculator',
    badge: 'حاسبة دقيقة',
    category: 'القياس والحساب',
  },
  {
    title: 'خبير إعادة التدوير الذكي',
    description: 'حوّل مخلفاتك وموادك المستعملة إلى مشاريع إبداعية وعملية بمساعدة الذكاء الاصطناعي.',
    icon: Recycle,
    link: '/environmental/recycling-advisor',
    badge: 'ذكاء اصطناعي',
    category: 'إعادة التدوير',
  },
  {
    title: 'مؤشر الاستدامة الشخصي',
    description: 'تقييم شامل لسلوكك البيئي عبر 7 مجالات رئيسية، مع خطة وتوصيات مخصصة وتقرير PDF.',
    icon: BarChart3,
    link: '/environmental/personal-sustainability-index',
    badge: 'اختبار تفاعلي',
    category: 'التقييم الشامل',
  },
  {
    title: 'أداة التنبؤ البيئي الذكية',
    description: 'تحليل متقدم مع توقع البصمة المستقبلية ومقارنة عالمية وسيناريوهات تقليل الانبعاثات.',
    icon: Brain,
    link: '/environmental/eco-predict',
    badge: 'تنبؤ ذكي',
    category: 'الذكاء الاصطناعي',
  },
  {
    title: 'المشاريع البيئية المدرسية',
    description: '10 مشاريع بيئية متكاملة قابلة للتنفيذ في المدرسة لترسيخ الاستدامة وتقليل الهدر.',
    icon: School,
    link: '/environmental/school-projects',
    badge: 'مشاريع مدرسية',
    category: 'البيئة المدرسية',
  },
  {
    title: 'المشاريع البيئية المنزلية',
    description: '10 مشاريع منزلية عملية لتحويل نمط حياتك إلى نمط حياة مستدام وموفر للموارد.',
    icon: Home,
    link: '/environmental/home-projects',
    badge: 'مشاريع منزلية',
    category: 'البيئة المنزلية',
  },
  {
    title: 'مشاريع الطلاب البيئية',
    description: 'معرض تفاعلي لمشاركة ابتكارات الطلبة البيئية وتوثيق إنجازاتهم وإلهام زملائهم.',
    icon: Users,
    link: '/environmental/student-projects',
    badge: 'مشاركة مجتمعية',
    category: 'المجتمع الطلابي',
  },
];

const EnvironmentalSustainability: React.FC = () => {
  return (
    <PageShell>
      <SEO 
        title="الاستدامة البيئية | ذروة العلم" 
        description="حاسبة البصمة الكربونية، خبير إعادة التدوير، مؤشر الاستدامة الشخصي ومشاريع المدارس والمنازل الخضراء." 
      />

      <PageHeader
        title="الاستدامة البيئية"
        description="أدوات ذكية ومشاريع تطبيقية لحساب البصمة الكربونية، تشجيع إعادة التدوير، وترسيخ الثقافة البيئية في المدارس والمنازل."
        icon={Leaf}
        crumbs={[
          { label: 'الرئيسية', to: '/' },
          { label: 'المجتمع المدرسي', to: '/school' },
          { label: 'الاستدامة البيئية' },
        ]}
      />

      {/* Hero Mission Card */}
      <div className="relative mb-10 overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              مبادرة الاستدامة في ذروة العلم
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-card-foreground">
              نحو بيئة مدرسية ومجتمعية مستدامة وخالية من الهدر
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              توفّر المنصة باقة من الأدوات العلمية الموثوقة لحساب انبعاثاتك، تحويل النفايات إلى مشاريع تعليمية، ومتابعة أثرك البيئي خطوة بخطوة.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto shrink-0">
            <div className="rounded-2xl border border-border bg-background/60 p-4 text-center">
              <div className="flex items-center justify-center mb-1 text-primary">
                <Calculator className="h-5 w-5" />
              </div>
              <div className="text-lg font-bold text-card-foreground">دقيقة</div>
              <div className="text-xs text-muted-foreground">حسابات الكربون</div>
            </div>
            <div className="rounded-2xl border border-border bg-background/60 p-4 text-center">
              <div className="flex items-center justify-center mb-1 text-primary">
                <TreePine className="h-5 w-5" />
              </div>
              <div className="text-lg font-bold text-card-foreground">20+</div>
              <div className="text-xs text-muted-foreground">مشروع تطبيقي</div>
            </div>
            <div className="rounded-2xl border border-border bg-background/60 p-4 text-center col-span-2 sm:col-span-1">
              <div className="flex items-center justify-center mb-1 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="text-lg font-bold text-card-foreground">100%</div>
              <div className="text-xs text-muted-foreground">محلي وعلمي</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <PageSection title="الأدوات والخدمات البيئية المتاحة">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.link}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
              >
                <Link
                  to={tool.link}
                  className="group relative flex flex-col justify-between h-full rounded-3xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-primary-foreground shadow-sm">
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary" className="text-xs font-semibold">
                        {tool.badge}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        {tool.category}
                      </div>
                      <h3 className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-sm font-semibold text-primary">
                    <span>استكشف الخيار</span>
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </PageSection>
    </PageShell>
  );
};

export default EnvironmentalSustainability;
