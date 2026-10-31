import React from 'react';
import { Navigate } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { PageShell, PageHeader, PageCardLink } from '@/components/layout/PageShell';
import { CORE_SECTIONS } from '@/config/platformSections';

/** Hub page for one of the core sections, driven entirely by src/config/platformSections.ts */
const SectionHubPage: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const section = CORE_SECTIONS.find((s) => s.id === sectionId);
  if (!section) return <Navigate to="/" replace />;

  return (
    <PageShell>
      <SEO title={`${section.title} | ذروة العلم`} description={section.tagline} />
      <PageHeader
        title={section.title}
        description={section.tagline}
        icon={section.icon}
        crumbs={[{ label: 'الرئيسية', to: '/' }, { label: section.title }]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {section.pages.map((page) => (
          <PageCardLink
            key={page.path}
            to={page.path}
            title={page.title}
            description={page.description}
            icon={page.icon}
            badge={page.requiresAuth ? 'يتطلب تسجيل الدخول' : undefined}
          />
        ))}
      </div>
    </PageShell>
  );
};

export default SectionHubPage;
