import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Briefcase, Loader2 } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHeader, PageShell } from '@/components/layout/PageShell';
import { TeamPortal } from '@/components/team/TeamPortal';
import { useTeamRoles } from '@/components/team/teamApi';

/** /team — workspace for members of the competition team. */
const TeamPage: React.FC = () => {
  const { loading, userId, roles } = useTeamRoles();
  const [params] = useSearchParams();

  return (
    <PageShell>
      <SEO title="فريق العمل | ذروة العلم" description="لوحات أدوار فريق العمل والمهام والقروب الجامعي" />
      <PageHeader
        title="فريق العمل"
        description="مهامك، القروب الجامعي، ولوحة دورك في الفريق."
        icon={Briefcase}
        crumbs={[{ label: 'الرئيسية', to: '/' }, { label: 'فريق العمل' }]}
      />
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !userId ? (
        <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm">
          <Link to="/auth" className="font-bold text-primary hover:underline">
            سجّل الدخول
          </Link>{' '}
          لفتح لوحة فريق العمل.
        </div>
      ) : roles.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          حسابك ليس ضمن فريق العمل. اطلب من المشرف إضافة إيميلك إلى أحد الأدوار.
        </div>
      ) : (
        <TeamPortal me={userId} roles={roles} initialTab={params.get('tab') ?? undefined} />
      )}
    </PageShell>
  );
};

export default TeamPage;
