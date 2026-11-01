import React, { useEffect, useState } from 'react';
import { Crown, Loader2 } from 'lucide-react';
import { RoleWorkspace } from './RoleWorkspace';
import { EmployeesControlCenter } from './EmployeesControlCenter';
import {
  ROLE_LABELS,
  WORKER_ROLES,
  isLeadRole,
  useTeamMembers,
  useTeamNotifications,
  useTeamTasks,
  type TeamRole,
  type WorkerRole,
} from './teamApi';

/** The dashboards a member can open: one per worker role they hold, plus the control center for leads. */
export const teamTabsFor = (roles: TeamRole[]) => [
  ...(isLeadRole(roles) ? [{ id: 'control', label: 'لوحة تحكم الموظفين' }] : []),
  ...WORKER_ROLES.filter((r) => roles.includes(r)).map((r) => ({ id: r, label: `لوحة ${ROLE_LABELS[r]}` })),
];

const Workspace: React.FC<{ role: WorkerRole; me: string; isLead: boolean }> = ({ role, me, isLead }) => {
  const { members } = useTeamMembers();
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
export const TeamDashboard: React.FC<{ tab: string; me: string; roles: TeamRole[] }> = ({ tab, me, roles }) =>
  tab === 'control' ? <EmployeesControlCenter /> : <Workspace role={tab as WorkerRole} me={me} isLead={isLeadRole(roles)} />;

/** Role tab bar + the selected dashboard. */
export const TeamPortal: React.FC<{ me: string; roles: TeamRole[]; initialTab?: string }> = ({ me, roles, initialTab }) => {
  const tabs = teamTabsFor(roles);
  const [tab, setTab] = useState(initialTab && tabs.some((t) => t.id === initialTab) ? initialTab : tabs[0]?.id);

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
            {t.label}
          </button>
        ))}
      </div>
      <TeamDashboard tab={tab} me={me} roles={roles} />
    </div>
  );
};
