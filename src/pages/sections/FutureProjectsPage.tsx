import React from 'react';
import { Lightbulb } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageShell, PageHeader, PageCardLink } from '@/components/layout/PageShell';
import { FUTURE_PROJECTS } from '@/config/platformSections';

const FutureProjectsPage: React.FC = () => (
  <PageShell>
    <SEO
      title="المشاريع المستقبلية | ذروة العلم"
      description="مشاريع تجريبية وأفكار قيد التطوير خارج المسار التعليمي الأساسي للمنصة"
    />
    <PageHeader
      title="المشاريع المستقبلية"
      description="نماذج تجريبية وأفكار نعمل عليها لاحقاً. هي متاحة للتجربة، لكنها ليست جزءاً من المسار التعليمي الأساسي ولا تخضع للتطوير النشط حالياً."
      icon={Lightbulb}
      crumbs={[{ label: 'الرئيسية', to: '/' }, { label: 'المشاريع المستقبلية' }]}
    />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {FUTURE_PROJECTS.map((p) => (
        <PageCardLink key={p.path} to={p.path} title={p.title} description={p.description} icon={p.icon} badge="تجريبي" />
      ))}
    </div>
  </PageShell>
);

export default FutureProjectsPage;
