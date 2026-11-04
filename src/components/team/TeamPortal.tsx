import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Crown, Loader2, TerminalSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RoleWorkspace } from './RoleWorkspace';
import { EmployeesControlCenter } from './EmployeesControlCenter';
import { DayOffMemberNotice } from './DayOffControls';
import {
  ROLE_LABELS,
  WORKER_ROLES,
  isLeadRole,
  useTeamMembers,
  useTeamNotifications,
  useTeamTasks,
  type TeamMember,
  type TeamRole,
  type WorkerRole,
} from './teamApi';

const TerminalWorkspace = lazy(() => import('@/pages/terminal/TerminalPage').then((m) => ({ default: m.TerminalWorkspace })));

/** The dashboards a member can open: one per worker role they hold, the control center for leads,
 * and the terminal for whoever the principal gave terminal access (the principal always has it). */
export const teamTabsFor = (roles: TeamRole[], terminal = false) => [
  ...(isLeadRole(roles) ? [{ id: 'control', label: 'لوحة تحكم الموظفين' }] : []),
  ...WORKER_ROLES.filter((r) => roles.includes(r)).map((r) => ({ id: r, label: `لوحة ${ROLE_LABELS[r]}` })),
  ...(terminal || roles.includes('principal') ? [{ id: 'terminal', label: 'الطرفية' }] : []),
];

/** Whether the signed-in member has terminal access (usage_quotas row, enabled, not banned); live. */
export function useTerminalAccess(me: string) {
  const [has, setHas] = useState(false);
  useEffect(() => {
    const load = () =>
      supabase
        .from('usage_quotas')
        .select('enabled, banned')
        .eq('user_id', me)
        .maybeSingle()
        .then(({ data }) => setHas(!!data && data.enabled && !data.banned));
    load();
    const ch = supabase
      .channel(`team-terminal-access-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'usage_quotas' }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [me]);
  return has;
}

const Workspace: React.FC<{ role: WorkerRole; me: string; isLead: boolean; members: TeamMember[] }> = ({
  role,
  me,
  isLead,
  members,
}) => {
  const { tasks, loading, reload } = useTeamTasks();
  const notifications = useTeamNotifications();
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return (
    <RoleWorkspace role={role} me={me} isLead={isLead} members={members} tasks={tasks} notifications={notifications} reloadTasks={reload} />
  );
};

/** Renders the dashboard for one tab id from teamTabsFor(). */
export const TeamDashboard: React.FC<{ tab: string; me: string; roles: TeamRole[] }> = ({ tab, me, roles }) => {
  const { members } = useTeamMembers();
  return (
    <div className="space-y-4" dir="rtl">
      <DayOffMemberNotice me={me} roles={roles} members={members} windowKey={tab} />
      {tab === 'control' ? (
        <EmployeesControlCenter />
      ) : tab === 'terminal' ? (
        <Suspense fallback={<Loader2 className="mx-auto my-16 h-6 w-6 animate-spin text-muted-foreground" />}>
          <TerminalWorkspace />
        </Suspense>
      ) : (
        <Workspace role={tab as WorkerRole} me={me} isLead={isLeadRole(roles)} members={members} />
      )}
    </div>
  );
};

/** Role tab bar + the selected dashboard. */
export const TeamPortal: React.FC<{ me: string; roles: TeamRole[]; initialTab?: string }> = ({ me, roles, initialTab }) => {
  const terminal = useTerminalAccess(me);
  const tabs = teamTabsFor(roles, terminal);
  const [tab, setTab] = useState(initialTab && tabs.some((t) => t.id === initialTab) ? initialTab : tabs[0]?.id);

  // terminal access arrives after the first render: honour ?tab=terminal once it does
  useEffect(() => {
    if (initialTab === 'terminal' && terminal) setTab('terminal');
  }, [initialTab, terminal]);
  useEffect(() => {
    if (!tabs.some((t) => t.id === tab)) setTab(tabs[0]?.id);
  }, [tabs, tab]);

  if (!tab) return null;

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-bold transition ${
              tab === t.id ? 'bg-primary text-primary-foreground shadow' : 'border border-border bg-card hover:bg-accent'
            }`}
          >
            {t.id === 'control' && <Crown className="h-4 w-4" aria-hidden />}
            {t.id === 'terminal' && <TerminalSquare className="h-4 w-4" aria-hidden />}
            {t.label}
          </button>
        ))}
      </div>
      <TeamDashboard tab={tab} me={me} roles={roles} />
    </div>
  );
};
