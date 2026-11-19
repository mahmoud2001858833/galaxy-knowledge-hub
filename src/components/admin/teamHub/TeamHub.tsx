import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle, CalendarClock, CheckCircle2, ClipboardList, Clock, GitPullRequest, LayoutDashboard, Loader2, Mail,
  RefreshCw, Settings2, Terminal, Trophy, Users, UsersRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import EmployeesControlCenter from '@/components/team/EmployeesControlCenter';
import CollectiveTasksPanel from '@/components/admin/collective/CollectiveTasksPanel';
import PointsSystemPanel from '@/components/admin/points/PointsSystemPanel';
import TerminalAdminPanel from '@/components/admin/TerminalAdminPanel';
import { DeployApprovalsCard } from '@/components/admin/DeployApprovalsCard';
import ProgrammersSchedule from './ProgrammersSchedule';
import { useLeaderboard } from '@/components/admin/points/pointsApi';
import { ROLE_LABELS, type TeamRole } from '@/components/team/teamApi';
import { WEEKDAYS } from '@/components/admin/collective/collectiveApi';
import {
  emailLooksWrong, fetchTeamSettings, fetchTeamSnapshot, saveTeamSettings, type TeamSettings, type TeamSnapshot,
} from './teamHubApi';

/**
 * «إدارة الفريق»: every team tool in one place. The overview says what needs a decision now; each section
 * is the existing full tool (members & daily tasks, collective tasks, approvals, points, terminal), and
 * «الإعدادات» holds the team-wide controls (how many people per role, default work hours).
 */

export type TeamSection = 'overview' | 'schedule' | 'members' | 'collective' | 'approvals' | 'points' | 'terminal' | 'settings';

const SECTIONS: { id: TeamSection; label: string; icon: React.ElementType; hint: string }[] = [
  { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard, hint: 'ما يحتاج قرارك الآن' },
  { id: 'schedule', label: 'جدول المبرمجين', icon: CalendarClock, hint: 'من يعمل متى، مهمة كل يوم بالترتيب، عدّادات حية، ومساعد ذكي يطمّنك ويعدّل' },
  { id: 'members', label: 'الأعضاء والمهام اليومية', icon: Users, hint: 'الأدوار، الإسناد، الراحة، الإشعارات، المحادثة، المشرف، الملفات' },
  { id: 'collective', label: 'المهام الجماعية', icon: UsersRound, hint: 'خطط الفريق المُوقّتة بالأولوية والاعتماد' },
  { id: 'approvals', label: 'الموافقات', icon: GitPullRequest, hint: 'طلبات نشر التعديلات (منفردة أو مجمّعة آخر اليوم)' },
  { id: 'points', label: 'النقاط', icon: Trophy, hint: 'القواعد، الترتيب العادل، السجل والتعديل' },
  { id: 'terminal', label: 'الطرفية والجلسات', icon: Terminal, hint: 'الصلاحيات، الحصص، الجلسات النشطة، المشاريع' },
  { id: 'settings', label: 'الإعدادات', icon: Settings2, hint: 'أعداد الأشخاص لكل دور وأوقات العمل الافتراضية' },
];

const setUrlSection = (s: TeamSection) => {
  const url = new URL(window.location.href);
  url.searchParams.set('tab', 'team');
  url.searchParams.set('section', s);
  window.history.replaceState({}, '', url.toString());
};

export default function TeamHub({ initialSection }: { initialSection?: TeamSection }) {
  const [section, setSection] = useState<TeamSection>(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('section') as TeamSection | null;
    return initialSection ?? (fromUrl && SECTIONS.some((s) => s.id === fromUrl) ? fromUrl : 'overview');
  });
  const [snap, setSnap] = useState<TeamSnapshot | null>(null);
  const [settings, setSettings] = useState<TeamSettings | null>(null);

  const reload = useCallback(async () => {
    const [s, t] = await Promise.all([fetchTeamSnapshot(), fetchTeamSettings()]);
    setSnap(s);
    setSettings(t);
  }, []);
  useEffect(() => { reload().catch(() => undefined); }, [reload]);
  // the overview stays fresh while open
  useEffect(() => {
    if (section !== 'overview') return;
    const id = window.setInterval(() => reload().catch(() => undefined), 60_000);
    return () => window.clearInterval(id);
  }, [section, reload]);

  const go = (s: TeamSection) => {
    setSection(s);
    setUrlSection(s);
    if (s === 'overview') reload().catch(() => undefined);
  };

  const badge: Partial<Record<TeamSection, number>> = snap ? {
    members: snap.tasks.overdue,
    collective: snap.collective.postponed + snap.collective.late,
    approvals: snap.approvalsPending,
    terminal: snap.liveSessions,
  } : {};

  return (
    <div dir="rtl" className="space-y-5">
      <header className="rounded-3xl bg-gradient-to-l from-brand-from to-brand-to p-5 text-primary-foreground">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">إدارة الفريق</h2>
            <p className="text-sm opacity-90">كل أدوات الفريق في مكان واحد: الأعضاء، المهام، التوقيت، الموافقات، النقاط والطرفية.</p>
          </div>
          {snap && (
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-background/20 px-3 py-1">{snap.members.length} عضو</span>
              <span className="rounded-full bg-background/20 px-3 py-1">{snap.tasks.open} مهمة مفتوحة</span>
              {snap.approvalsPending > 0 && <span className="rounded-full bg-background/20 px-3 py-1">{snap.approvalsPending} بانتظار موافقتك</span>}
            </div>
          )}
        </div>
      </header>

      <nav className="flex gap-1.5 overflow-x-auto rounded-2xl border border-border bg-card p-1.5" aria-label="أقسام إدارة الفريق">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const active = s.id === section;
          const n = badge[s.id] ?? 0;
          return (
            <button key={s.id} type="button" title={s.hint} onClick={() => go(s.id)}
              aria-current={active ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              <Icon className="h-4 w-4" />
              {s.label}
              {n > 0 && (
                <span className={`rounded-full px-1.5 text-[10px] ${active ? 'bg-background/25' : 'bg-destructive text-destructive-foreground'}`}>{n}</span>
              )}
            </button>
          );
        })}
      </nav>

      {section === 'overview' && <Overview snap={snap} settings={settings} go={go} onRefresh={reload} />}
      {section === 'schedule' && <ProgrammersSchedule />}
      {section === 'members' && <EmployeesControlCenter />}
      {section === 'collective' && <CollectiveTasksPanel />}
      {section === 'approvals' && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            المشاريع على «موافقة جماعية» يصلك منها طلب واحد حين يُنهي آخر شخص مهام اليوم؛ الباقي طلب بعد كل مهمة.
            تغيير النمط من «الطرفية والجلسات ← المشاريع».
          </p>
          <DeployApprovalsCard />
        </div>
      )}
      {section === 'points' && <PointsSystemPanel />}
      {section === 'terminal' && <TerminalAdminPanel />}
      {section === 'settings' && <SettingsSection settings={settings} members={snap?.members ?? []} onSaved={reload} />}
    </div>
  );
}

// ------------------------------------------------------------------ overview
function Kpi({ icon: Icon, label, value, tone = 'default', onClick }: {
  icon: React.ElementType; label: string; value: React.ReactNode; tone?: 'default' | 'alert' | 'good'; onClick?: () => void;
}) {
  const color = tone === 'alert' ? 'text-destructive' : tone === 'good' ? 'text-primary' : 'text-foreground';
  return (
    <button type="button" onClick={onClick} disabled={!onClick}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-right transition-colors enabled:hover:border-primary">
      <span className="rounded-xl bg-muted p-2.5"><Icon className={`h-5 w-5 ${color}`} /></span>
      <span>
        <span className={`block text-2xl font-black ${color}`}>{value}</span>
        <span className="block text-xs text-muted-foreground">{label}</span>
      </span>
    </button>
  );
}

function Overview({ snap, settings, go, onRefresh }: {
  snap: TeamSnapshot | null; settings: TeamSettings | null; go: (s: TeamSection) => void; onRefresh: () => Promise<void>;
}) {
  const { rows: board } = useLeaderboard();
  const [refreshing, setRefreshing] = useState(false);

  const byRole = useMemo(() => {
    const m = new Map<TeamRole, number>();
    for (const p of snap?.members ?? []) m.set(p.role, (m.get(p.role) ?? 0) + 1);
    return m;
  }, [snap]);

  if (!snap) {
    return <div className="flex items-center gap-2 p-8 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> يحمّل حالة الفريق…</div>;
  }

  const badEmails = snap.members.filter((m) => emailLooksWrong(m.email));
  const fullRoles = (Object.keys(ROLE_LABELS) as TeamRole[]).filter((r) => {
    const limit = settings?.role_limits?.[r];
    return typeof limit === 'number' && (byRole.get(r) ?? 0) >= limit;
  });
  const decisions: { text: string; tone: 'alert' | 'info'; action?: { label: string; to: TeamSection } }[] = [
    ...(snap.approvalsPending ? [{ text: `${snap.approvalsPending} طلب نشر بانتظار موافقتك`, tone: 'alert' as const, action: { label: 'راجع', to: 'approvals' as TeamSection } }] : []),
    ...(snap.tasks.overdue ? [{ text: `${snap.tasks.overdue} مهمة يومية متأخرة عن موعدها`, tone: 'alert' as const, action: { label: 'افتح', to: 'members' as TeamSection } }] : []),
    ...(snap.collective.late ? [{ text: `${snap.collective.late} مهمة جماعية تجاوزت وقت صاحبها`, tone: 'alert' as const, action: { label: 'افتح', to: 'collective' as TeamSection } }] : []),
    ...(snap.collective.postponed ? [{ text: `${snap.collective.postponed} مهمة جماعية مؤجّلة بانتظار زميل`, tone: 'info' as const, action: { label: 'التفاصيل', to: 'collective' as TeamSection } }] : []),
    ...badEmails.map((m) => ({ text: `إيميل ${m.display_name ?? ''} يبدو خاطئاً (${m.email}) — لن تصله الرسائل`, tone: 'alert' as const, action: { label: 'صحّح', to: 'members' as TeamSection } })),
    ...fullRoles.map((r) => ({ text: `دور «${ROLE_LABELS[r]}» ممتلئ (${byRole.get(r)}/${settings?.role_limits?.[r]})`, tone: 'info' as const, action: { label: 'الإعدادات', to: 'settings' as TeamSection } })),
  ];
  const onTimePct = snap.collective.done ? Math.round((snap.collective.doneOnTime / snap.collective.done) * 100) : null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi icon={Users} label="أعضاء الفريق" value={snap.members.length} onClick={() => go('members')} />
        <Kpi icon={ClipboardList} label="مهام يومية مفتوحة" value={snap.tasks.open} onClick={() => go('members')} />
        <Kpi icon={AlertTriangle} label="متأخرة" value={snap.tasks.overdue + snap.collective.late} tone={snap.tasks.overdue + snap.collective.late ? 'alert' : 'default'} onClick={() => go('members')} />
        <Kpi icon={CheckCircle2} label="أُنجزت اليوم" value={snap.tasks.doneToday} tone="good" />
        <Kpi icon={GitPullRequest} label="بانتظار موافقتك" value={snap.approvalsPending} tone={snap.approvalsPending ? 'alert' : 'default'} onClick={() => go('approvals')} />
        <Kpi icon={Terminal} label="جلسات طرفية نشطة" value={snap.liveSessions} onClick={() => go('terminal')} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="space-y-3 rounded-2xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">يحتاج قرارك الآن</h3>
            <Button size="sm" variant="ghost" disabled={refreshing}
              onClick={async () => { setRefreshing(true); await onRefresh().catch(() => undefined); setRefreshing(false); }}>
              <RefreshCw className={`ml-1 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> تحديث
            </Button>
          </div>
          {decisions.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-primary" /> لا شيء ينتظرك. الفريق ماشي.</p>
          ) : (
            <ul className="divide-y divide-border">
              {decisions.map((d, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="flex items-center gap-2">
                    {d.tone === 'alert' ? <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" /> : <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />}
                    {d.text}
                  </span>
                  {d.action && <Button size="sm" variant="secondary" onClick={() => go(d.action!.to)}>{d.action.label}</Button>}
                </li>
              ))}
            </ul>
          )}
          {snap.postponedList.length > 0 && (
            <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
              <div className="mb-1 font-bold text-foreground">مؤجّلة الآن</div>
              {snap.postponedList.map((s, i) => (
                <div key={i}>#{s.position} {s.title} — {s.assignee_email?.split('@')[0]}{s.postponed_reason ? `: ${s.postponed_reason}` : ''}</div>
              ))}
            </div>
          )}
          {snap.overdueList.length > 0 && (
            <div className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
              <div className="mb-1 font-bold text-foreground">مهام يومية متأخرة</div>
              {snap.overdueList.map((t) => (
                <div key={t.id}>{t.title} — {ROLE_LABELS[t.assignee_role as TeamRole] ?? t.assignee_role}</div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 font-bold text-foreground"><Trophy className="h-4 w-4" /> الأعلى أداءً</h3>
          {board.length === 0 ? <p className="text-sm text-muted-foreground">لا نقاط بعد.</p> : (
            <ol className="space-y-1.5 text-sm">
              {board.slice(0, 5).map((r) => (
                <li key={r.user_id} className="flex items-center justify-between">
                  <span><span className="ml-2 text-muted-foreground">{r.rank}.</span>{r.display_name ?? '—'}</span>
                  <span className="text-xs text-muted-foreground">{r.total} نقطة{r.perf_index != null ? ` · ${Math.round(r.perf_index)}٪` : ''}</span>
                </li>
              ))}
            </ol>
          )}
          <Button size="sm" variant="ghost" onClick={() => go('points')}>كل الترتيب والسجل</Button>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <h3 className="font-bold text-foreground">تركيبة الفريق</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {(Object.keys(ROLE_LABELS) as TeamRole[]).map((r) => {
              const n = byRole.get(r) ?? 0;
              const limit = settings?.role_limits?.[r];
              return (
                <div key={r} className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
                  <span>{ROLE_LABELS[r]}</span>
                  <span className={`font-bold ${typeof limit === 'number' && n >= limit ? 'text-destructive' : 'text-foreground'}`}>
                    {n}{typeof limit === 'number' ? ` / ${limit}` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 font-bold text-foreground"><CalendarClock className="h-4 w-4" /> المهام الجماعية المُوقّتة</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Stat label="قيد التنفيذ" value={snap.collective.active} />
            <Stat label="مجدولة" value={snap.collective.scheduled} />
            <Stat label="مؤجّلة بانتظار زميل" value={snap.collective.postponed} />
            <Stat label="تجاوزت الوقت" value={snap.collective.late} alert={snap.collective.late > 0} />
            <Stat label="أُنجزت" value={snap.collective.done} />
            <Stat label="الالتزام بالموعد" value={onTimePct == null ? '—' : `${onTimePct}٪`} />
          </div>
          <Button size="sm" variant="ghost" onClick={() => go('collective')}>افتح المهام الجماعية</Button>
        </section>
      </div>
    </div>
  );
}

const Stat = ({ label, value, alert }: { label: string; value: React.ReactNode; alert?: boolean }) => (
  <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
    <span className="text-muted-foreground">{label}</span>
    <span className={`font-bold ${alert ? 'text-destructive' : 'text-foreground'}`}>{value}</span>
  </div>
);

// ------------------------------------------------------------------ settings
function SettingsSection({ settings, members, onSaved }: {
  settings: TeamSettings | null; members: TeamSnapshot['members']; onSaved: () => Promise<void>;
}) {
  const [limits, setLimits] = useState<Record<string, string>>({});
  const [from, setFrom] = useState('16:00');
  const [to, setTo] = useState('20:00');
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 6]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setLimits(Object.fromEntries(Object.entries(settings.role_limits ?? {}).map(([k, v]) => [k, String(v)])));
    setFrom(settings.default_work_start.slice(0, 5));
    setTo(settings.default_work_end.slice(0, 5));
    setDays(settings.default_work_days);
  }, [settings]);

  const count = (r: TeamRole) => members.filter((m) => m.role === r).length;

  if (!settings) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
        الإعدادات متاحة للرئيس والمشرف فقط (أو لم تُحمَّل بعد).
      </div>
    );
  }

  const save = async () => {
    setSaving(true);
    try {
      const role_limits: TeamSettings['role_limits'] = {};
      for (const [r, v] of Object.entries(limits)) {
        if (v.trim() === '') continue;
        const n = Number(v);
        if (!Number.isInteger(n) || n < 0 || n > 200) throw new Error(`عدد غير صالح لدور ${ROLE_LABELS[r as TeamRole]}`);
        role_limits[r as TeamRole] = n;
      }
      await saveTeamSettings({ role_limits, default_work_start: from, default_work_end: to, default_work_days: [...days].sort() });
      toast.success('حُفظت إعدادات الفريق');
      await onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h3 className="flex items-center gap-2 font-bold text-foreground"><Users className="h-4 w-4" /> عدد الأشخاص لكل دور</h3>
        <p className="text-xs text-muted-foreground">الحد الأقصى لكل دور. اتركه فارغاً بلا حد. لا يمكن إضافة عضو لدور ممتلئ (ومن هم فيه الآن يبقون).</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(ROLE_LABELS) as TeamRole[]).filter((r) => r !== 'principal').map((r) => (
            <div key={r} className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-3 py-2">
              <Label className="text-sm">{ROLE_LABELS[r]} <span className="text-xs text-muted-foreground">(الآن {count(r)})</span></Label>
              <Input type="number" min={0} max={200} inputMode="numeric" className="h-8 w-24" placeholder="بلا حد"
                value={limits[r] ?? ''} onChange={(e) => setLimits({ ...limits, [r]: e.target.value })} />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h3 className="flex items-center gap-2 font-bold text-foreground"><CalendarClock className="h-4 w-4" /> وقت العمل الافتراضي (بتوقيت عمّان)</h3>
        <p className="text-xs text-muted-foreground">يُعطى لكل شخص يُضاف لمهمة جماعية جديدة، وتقدر تغيّر وقت كل شخص من المهمة نفسها.</p>
        <div className="flex flex-wrap items-center gap-2">
          <Label className="text-xs">من</Label>
          <Input type="time" className="h-9 w-32" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Label className="text-xs">إلى</Label>
          <Input type="time" className="h-9 w-32" value={to} onChange={(e) => setTo(e.target.value)} />
          <div className="flex flex-wrap gap-1">
            {WEEKDAYS.map((d, i) => {
              const on = days.includes(i);
              return (
                <button key={d} type="button" aria-pressed={on}
                  onClick={() => setDays(on ? days.filter((x) => x !== i) : [...days, i])}
                  className={`rounded-full border px-2.5 py-1 text-xs ${on ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground'}`}>
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-2 rounded-2xl border border-border bg-card p-5 text-sm">
        <h3 className="flex items-center gap-2 font-bold text-foreground"><Mail className="h-4 w-4" /> إعدادات في أقسامها</h3>
        <ul className="list-disc space-y-1 pr-5 text-muted-foreground">
          <li>قواعد النقاط ونقاط كل دور: قسم «النقاط».</li>
          <li>مدة جلسة الطرفية لكل شخص والحصص والموافقة الجماعية لكل مشروع: قسم «الطرفية والجلسات».</li>
          <li>أوقات كل شخص في مهمة جماعية وسياسة التأجيل: داخل المهمة الجماعية نفسها.</li>
        </ul>
      </section>

      <Button onClick={save} disabled={saving}>
        {saving ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : null} حفظ الإعدادات
      </Button>
    </div>
  );
}
