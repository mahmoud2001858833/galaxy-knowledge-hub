import React from 'react';
import { Sparkles } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageShell, PageHeader, PageCardLink } from '@/components/layout/PageShell';
import { FUTURE_PROJECTS } from '@/config/platformSections';

const FutureProjectsPage: React.FC = () => (
  <PageShell>
    <SEO
      title="ذكاء المنصة | ذروة العلم"
      description="مشاريع ونماذج ذكية قائمة على الذكاء الاصطناعي والتقنيات الحديثة خارج المسار التعليمي الأساسي للمنصة"
    />
    <PageHeader
      title="ذكاء المنصة"
      description="نماذج ومشاريع ذكية قائمة على الذكاء الاصطناعي والتقنيات الحديثة (الروبوتات، التوأم الرقمي، النماذج الطبية، والكشف المبكر) متاحة للتجربة والاستكشاف."
      icon={Sparkles}
      crumbs={[{ label: 'الرئيسية', to: '/' }, { label: 'ذكاء المنصة' }]}
    />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {FUTURE_PROJECTS.map((p) => (
        <PageCardLink key={p.path} to={p.path} title={p.title} description={p.description} icon={p.icon} badge="تجريبي" />
      ))}
    </div>
  </PageShell>
);

export default FutureProjectsPage;
