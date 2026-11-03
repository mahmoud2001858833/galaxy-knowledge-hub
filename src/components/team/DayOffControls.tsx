import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Coffee,
  Eye,
  HeartHandshake,
  Leaf,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
  UserCheck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  ROLE_LABELS,
  WORKER_ROLES,
  errorMessage,
  grantDayOff,
  revokeDayOff,
  uniquePeople,
  useTeamDayOff,
  useTeamMembers,
  useTeamRoles,
  type DayOffRecord,
  type TeamMember,
  type TeamRole,
} from './teamApi';

const DISPLAY_ROLES: TeamRole[] = ['supervisor', ...WORKER_ROLES];

const todayArabicLabel = () =>
  new Date().toLocaleDateString('ar-JO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Amman',
  });

/**
 * Small, elegant green modal card ("صفحة خضراء صغيرة أنيقة") shown to a team member
 * when they have no tasks assigned for today, or previewed by an admin.
 */
export const DayOffGreenDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName?: string;
  roleLabels?: string[];
  note?: string | null;
}> = ({ open, onOpenChange, memberName, roleLabels = [], note }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        className="sm:max-w-[410px] overflow-hidden rounded-3xl border-2 border-emerald-400/60 dark:border-emerald-600/60 bg-gradient-to-b from-emerald-50 via-white to-emerald-50/80 dark:from-emerald-950 dark:via-slate-950 dark:to-emerald-950/90 p-0 shadow-2xl shadow-emerald-900/20"
      >
        {/* Top lush emerald header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 px-6 pt-7 pb-6 text-center text-white">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-teal-200/20 blur-2xl" />

          <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md ring-2 ring-white/40 shadow-lg">
            <Coffee className="h-8 w-8 text-white" />
            <Sparkles className="absolute -top-1.5 -left-1.5 h-5 w-5 text-emerald-100 animate-pulse" />
          </div>

          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-emerald-50 backdrop-blur-sm">
            <Leaf className="h-3.5 w-3.5" />
            إجازة خفيفة من المهام · {todayArabicLabel()}
          </span>

          <DialogHeader className="relative mt-3 space-y-1 text-center sm:text-center">
            <DialogTitle className="text-xl font-black tracking-tight text-white">
              لا يوجد عليك مهام اليوم! 🌿
            </DialogTitle>
            {memberName && (
              <DialogDescription className="text-xs font-semibold text-emerald-50/95">
                أهلاً بك {memberName}
                {roleLabels.length > 0 ? ` · ${roleLabels.join('، ')}` : ''}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-5 text-center">
          <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/70 bg-emerald-500/10 dark:bg-emerald-500/10 px-4 py-4 space-y-2">
            <p className="text-sm font-bold leading-relaxed text-emerald-950 dark:text-emerald-100">
              استرح اليوم وخذ قسطاً جميلاً من الراحة، يعطيك ألف عافية على جهودك الرائعة معنا 💚
            </p>
            <p className="text-xs font-semibold leading-relaxed text-emerald-800 dark:text-emerald-300">
              وبكرا لا تنسَ تيجي وتطلّ علينا عشان تتفقدنا وتشوف شو في مهام وأخبار جديدة!
            </p>
          </div>

          {note && note.trim() && (
            <div className="rounded-2xl border border-emerald-300/60 dark:border-emerald-700/60 bg-white/80 dark:bg-emerald-900/30 px-3.5 py-2.5 text-right">
              <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mb-0.5">
                رسالة خاصة لك من الإدارة:
              </div>
              <p className="text-xs font-medium text-emerald-950 dark:text-emerald-100 leading-relaxed">{note}</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            <Sun className="h-3.5 w-3.5" />
            <span>نتمنى لك يوماً هادئاً وسعيداً</span>
          </div>

          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-md shadow-emerald-600/20"
          >
            شكراً، بشوفكم بكرا إن شاء الله 🌸
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Rendered inside a team member's dashboard/window:
 * 1) Automatically opens the small elegant green popup when they enter their dashboard/window if marked "no tasks today".
 * 2) Displays a sleek green reminder banner at the top of the workspace so they can reopen it anytime.
 */
export const DayOffMemberNotice: React.FC<{
  me: string;
  roles: TeamRole[];
  members?: TeamMember[];
  windowKey?: string;
}> = ({ me, roles, members, windowKey }) => {
  const { dayOffMap } = useTeamDayOff();
  const { members: fetchedMembers } = useTeamMembers();
  const roster = members && members.length > 0 ? members : fetchedMembers;
  const record: DayOffRecord | undefined = dayOffMap.get(me);
  const [open, setOpen] = useState(false);

  const myName = useMemo(() => {
    const found = roster.find((m) => m.user_id === me);
    return found?.display_name || found?.email || undefined;
  }, [roster, me]);

  const myRoleLabels = useMemo(
    () => roles.filter((r) => r !== 'principal').map((r) => ROLE_LABELS[r]),
    [roles],
  );

  // Automatically pop open whenever the member enters this dashboard/window while having a day-off today
  useEffect(() => {
    if (record?.taskId) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [record?.taskId, windowKey]);

  if (!record) return null;

  return (
    <>
      <div
        dir="rtl"
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-400/50 dark:border-emerald-700/60 bg-gradient-to-l from-emerald-500/15 via-emerald-500/10 to-teal-500/10 px-4 py-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Coffee className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-black text-emerald-900 dark:text-emerald-200">
              لا يوجد عليك مهام اليوم 🌿
            </div>
            <div className="text-xs text-emerald-800/90 dark:text-emerald-300/90 truncate">
              استرح اليوم، وبكرا ما تنسى تيجي عشان تتفقدنا!
            </div>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setOpen(true)}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5" />
          عرض بطاقة الراحة
        </Button>
      </div>

      <DayOffGreenDialog
        open={open}
        onOpenChange={setOpen}
        memberName={myName}
        roleLabels={myRoleLabels}
        note={record.note}
      />
    </>
  );
};

/**
 * Compact inline toggle button to place directly next to any member row (e.g. inside RoleEmails).
 */
export const MemberDayOffQuickToggle: React.FC<{
  userId: string;
  memberName: string;
  dayOffMap: Map<string, DayOffRecord>;
  onChanged?: () => void;
}> = ({ userId, memberName, dayOffMap, onChanged }) => {
  const [busy, setBusy] = useState(false);
  const active = dayOffMap.has(userId);

  const toggle = async () => {
    setBusy(true);
    try {
      if (active) {
        await revokeDayOff(userId);
        toast.success(`تم إلغاء إعفاء المهام عن ${memberName}`);
      } else {
        await grantDayOff(userId);
        toast.success(`تم تفعيل "عدم وجود مهام اليوم" لـ ${memberName}`);
      }
      onChanged?.();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      title={active ? 'مُعفى من المهام اليوم — اضغط للإلغاء' : 'تفعيل عدم وجود مهام اليوم لهذا العضو'}
      className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition ${
        active
          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25'
      }`}
    >
      {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Coffee className="h-3 w-3" />}
      <span>{active ? 'مُعفى اليوم ✓' : 'عدم وجود مهام'}</span>
    </button>
  );
};

/**
 * Full Admin Panel view listing all team members with their role titles
 * and a "عدم وجود مهام" toggle button beside each member.
 */
export const DayOffAdminPanel: React.FC = () => {
  const { loading: rolesLoading, userId, roles } = useTeamRoles();
  const isLead = roles.includes('principal') || roles.includes('supervisor');
  const { members, loading: membersLoading } = useTeamMembers();
  const { dayOffMap, loading: dayOffLoading, reload: reloadDayOff } = useTeamDayOff();

  const [roleFilter, setRoleFilter] = useState<'all' | TeamRole>('all');
  const [query, setQuery] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [previewPerson, setPreviewPerson] = useState<{
    name: string;
    roleLabels: string[];
    note: string | null;
  } | null>(null);

  // Build unique list of team members (excluding principal-only row unless they also hold another role)
  const people = useMemo(() => {
    return uniquePeople(members)
      .map((p) => ({
        ...p,
        assignableRoles: p.roles.filter((r) => r !== 'principal'),
      }))
      .filter((p) => p.assignableRoles.length > 0);
  }, [members]);

  const filteredPeople = useMemo(() => {
    const q = query.trim().toLowerCase();
    return people.filter((p) => {
      if (roleFilter !== 'all' && !p.assignableRoles.includes(roleFilter)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.assignableRoles.some((r) => ROLE_LABELS[r].toLowerCase().includes(q))
      );
    });
  }, [people, roleFilter, query]);

  const activeCount = useMemo(
    () => people.filter((p) => dayOffMap.has(p.user_id)).length,
    [people, dayOffMap],
  );

  const handleGrant = async (personUserId: string, personName: string) => {
    setBusyId(personUserId);
    try {
      await grantDayOff(personUserId, customNote);
      toast.success(`تم إرسال بطاقة "عدم وجود مهام اليوم" إلى ${personName} 🌿`);
      await reloadDayOff();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const handleRevoke = async (personUserId: string, personName: string) => {
    setBusyId(personUserId);
    try {
      await revokeDayOff(personUserId);
      toast.success(`تم إلغاء إعفاء اليوم عن ${personName}`);
      await reloadDayOff();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const handleGrantAllVisible = async () => {
    const targets = filteredPeople.filter((p) => !dayOffMap.has(p.user_id));
    if (targets.length === 0) {
      toast.info('جميع الأعضاء الظاهرين معفون من المهام اليوم بالفعل');
      return;
    }
    setBulkBusy(true);
    try {
      for (const p of targets) {
        await grantDayOff(p.user_id, customNote);
      }
      toast.success(`تم تفعيل "عدم وجود مهام اليوم" لـ ${targets.length} من أعضاء الفريق 🌿`);
      await reloadDayOff();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBulkBusy(false);
    }
  };

  const handleRevokeAllVisible = async () => {
    const targets = filteredPeople.filter((p) => dayOffMap.has(p.user_id));
    if (targets.length === 0) return;
    setBulkBusy(true);
    try {
      for (const p of targets) {
        await revokeDayOff(p.user_id);
      }
      toast.success(`تم إلغاء الإعفاء عن ${targets.length} من أعضاء الفريق`);
      await reloadDayOff();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBulkBusy(false);
    }
  };

  if (rolesLoading || membersLoading || dayOffLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!userId || !isLead) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        هذا القسم متاح للرئيس والمشرفين فقط.
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Summary Card */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-l from-emerald-500/10 via-card to-card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md">
              <Coffee className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black">خيار عدم وجود مهام اليوم لأعضاء الفريق</h3>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {todayArabicLabel()}
                </span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                اضغط على <strong className="text-foreground">«عدم وجود مهام»</strong> بجانب أي عضو في الفريق ليظهر له فوراً عند دخوله لوحة التحكم نافذة خضراء صغيرة وأنيقة تخبره أنه لا توجد عليه مهام اليوم ليستريح ويعود غداً لتفقدنا. ينتهي الإعفاء تلقائياً مع بداية يوم الغد.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/80 px-4 py-2.5 text-xs">
            <div className="text-center">
              <div className="text-lg font-black text-foreground">{people.length}</div>
              <div className="text-muted-foreground">أعضاء الفريق</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{activeCount}</div>
              <div className="text-muted-foreground">في راحة اليوم</div>
            </div>
          </div>
        </div>

        {/* Optional Custom Note */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] items-center">
          <Input
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="رسالة لطيفة إضافية (اختياري) — مثال: شكراً على إنجازك الرائع أمس، استمتع بيومك!"
            className="rounded-xl bg-background"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={handleGrantAllVisible}
              disabled={bulkBusy || filteredPeople.length === 0}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5"
            >
              {bulkBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <HeartHandshake className="h-3.5 w-3.5" />}
              إعفاء الكل اليوم
            </Button>
            {activeCount > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRevokeAllVisible}
                disabled={bulkBusy}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                إلغاء للكل
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
              roleFilter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            الكل ({people.length})
          </button>
          {DISPLAY_ROLES.map((r) => {
            const count = people.filter((p) => p.assignableRoles.includes(r)).length;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  roleFilter === r
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                {ROLE_LABELS[r]} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم أو الإيميل أو المسمى..."
            className="rounded-xl pr-9 text-xs"
          />
        </div>
      </div>

      {/* Team Members Roster */}
      {filteredPeople.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-10 text-center space-y-2">
          <Users className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-bold">لا يوجد أعضاء مطابقون حالياً</p>
          <p className="text-xs text-muted-foreground">
            تأكد من إضافة إيميلات أعضاء الفريق في تبويب «الأدوار والإيميلات».
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {filteredPeople.map((person) => {
            const record = dayOffMap.get(person.user_id);
            const isActive = Boolean(record);
            const isBusy = busyId === person.user_id;
            const roleLabels = person.assignableRoles.map((r) => ROLE_LABELS[r]);

            return (
              <div
                key={person.user_id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 transition ${
                  isActive
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                {/* Member Info & Role Titles */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {isActive ? <CheckCircle2 className="h-5 w-5" /> : (person.name.trim()[0] || 'ع')}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm truncate">{person.name}</span>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          <Leaf className="h-3 w-3" />
                          مُعفى من المهام اليوم
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground truncate" dir="ltr">
                      {person.email}
                    </div>

                    {/* Role badges ("مع مسمياتهم مثل متكلم والخ") */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {person.assignableRoles.map((r) => (
                        <span
                          key={r}
                          className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary"
                        >
                          <UserCheck className="h-3 w-3" />
                          {ROLE_LABELS[r]}
                        </span>
                      ))}
                    </div>

                    {record?.note && (
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300 pt-0.5">
                        الرسالة المرفقة: «{record.note}»
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons next to each member */}
                <div className="flex items-center gap-2 shrink-0 mr-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="معاينة النافذة الخضراء كما ستظهر للعضو"
                    onClick={() =>
                      setPreviewPerson({
                        name: person.name,
                        roleLabels,
                        note: record?.note ?? (customNote.trim() || null),
                      })
                    }
                    className="h-9 w-9 rounded-xl text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  {isActive ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => handleRevoke(person.user_id, person.name)}
                      className="rounded-xl border-emerald-500/40 text-xs font-bold gap-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40"
                    >
                      {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                      إلغاء الإعفاء
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => handleGrant(person.user_id, person.name)}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-sm"
                    >
                      {isBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Coffee className="h-3.5 w-3.5" />}
                      عدم وجود مهام
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin Preview Modal */}
      <DayOffGreenDialog
        open={Boolean(previewPerson)}
        onOpenChange={(o) => {
          if (!o) setPreviewPerson(null);
        }}
        memberName={previewPerson?.name}
        roleLabels={previewPerson?.roleLabels}
        note={previewPerson?.note}
      />
    </div>
  );
};

export default DayOffAdminPanel;
