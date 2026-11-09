import React, { useMemo, useState } from 'react';
import { Bell, ClipboardList, Coffee, Crown, Eye, Loader2, MessagesSquare, Plus, Trash2, UserCog, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskBoard } from './TaskBoard';
import { TeamChat } from './TeamChat';
import { DayOffAdminPanel, MemberDayOffQuickToggle } from './DayOffControls';
import { ScreenWatchPanel } from '@/components/screenWatch/ScreenWatchPanel';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  PRINCIPAL,
  ROLE_LABELS,
  WORKER_ROLES,
  errorMessage,
  formatDate,
  nextAtHour,
  toLocalInput,
  useTeamDayOff,
  useTeamMembers,
  useTeamNotifications,
  useTeamRoles,
  useTeamTasks,
  type DayOffRecord,
  type TeamMember,
  type TeamRole,
  type WorkerRole,
  notifyTeamMembersChanged,
} from './teamApi';

const ASSIGNABLE: TeamRole[] = ['supervisor', ...WORKER_ROLES];

/** Emails assigned to one role, with add/remove and quick day-off toggle. */
const RoleEmails: React.FC<{
  role: TeamRole;
  members: TeamMember[];
  dayOffMap: Map<string, DayOffRecord>;
  onDayOffChanged: () => void;
  onChanged: () => void;
}> = ({ role, members, dayOffMap, onDayOffChanged, onChanged }) => {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const rows = members.filter((m) => m.role === role);

  const add = async () => {
    const value = email.trim().toLowerCase();
    if (!value.includes('@')) {
      toast.error('اكتب إيميلاً صحيحاً');
      return;
    }
    setBusy(true);
    // user_id is resolved from the email by a database trigger
    const { error } = await supabase.from('team_members').insert({ email: value, role } as never);
    setBusy(false);
    if (error) toast.error(error.code === '23505' ? 'هذا الإيميل مضاف لهذا الدور مسبقاً' : errorMessage(error));
    else {
      setEmail('');
      toast.success('أضيف العضو');
      onChanged();
      notifyTeamMembersChanged();
    }
  };

  const remove = async (m: TeamMember) => {
    if (!window.confirm(`إزالة ${m.email} من دور ${ROLE_LABELS[role]}؟`)) return;
    const { error } = await supabase.from('team_members').delete().eq('id', m.id);
    if (error) toast.error(errorMessage(error));
    else {
      onChanged();
      notifyTeamMembersChanged();
    }
  };

  return (
    <div className="space-y-3 rounded-3xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold">{ROLE_LABELS[role]}</h4>
        <span className="text-xs text-muted-foreground">{rows.length}</span>
      </div>
      <ul className="space-y-1.5">
        {rows.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-2 rounded-xl bg-muted px-3 py-1.5 text-sm">
            <span className="min-w-0">
              <span className="block truncate font-semibold">{m.display_name}</span>
              <span className="block truncate text-[11px] text-muted-foreground" dir="ltr">
                {m.email}
              </span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <MemberDayOffQuickToggle
                userId={m.user_id}
                memberName={m.display_name || m.email}
                dayOffMap={dayOffMap}
                onChanged={onDayOffChanged}
              />
              <button type="button" onClick={() => remove(m)} className="shrink-0 text-muted-foreground hover:text-destructive" aria-label="إزالة">
                <X className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
        {rows.length === 0 && <li className="text-xs text-muted-foreground">لا يوجد أحد بعد</li>}
      </ul>
      <div className="flex gap-2">
        <Input
          dir="ltr"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="email@example.com"
          className="text-left"
        />
        <Button size="icon" onClick={add} disabled={busy} aria-label="إضافة">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

/** Emails the new task to whoever it is for (team-task-email); the task itself is already saved. */
const emailTask = async (taskId: string) => {
  const { data, error } = await supabase.functions.invoke('team-task-email', { body: { task_id: taskId } });
  if (error) return toast.error('حُفظت المهمة لكن تعذّر إرسالها بالإيميل');
  const sent: string[] = data?.sent ?? [];
  const failed: { email: string; reason: string }[] = data?.failed ?? [];
  if (sent.length) toast.success(`أُرسلت المهمة بالإيميل إلى ${sent.join('، ')}`);
  if (failed.some((f) => f.reason === 'domain_unverified'))
    toast.error('لم يُرسل الإيميل: يجب توثيق نطاق المنصة في Resend أولاً (حالياً يصل البريد لصاحب حساب Resend فقط).', { duration: 10000 });
  else if (failed.length) toast.error(`تعذّر الإرسال إلى: ${failed.map((f) => f.email).join('، ')}`);
};

const NewTaskForm: React.FC<{ members: TeamMember[]; onCreated: () => void }> = ({ members, onCreated }) => {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [role, setRole] = useState<WorkerRole>('speaker');
  const [assignee, setAssignee] = useState('any');
  const [due, setDue] = useState('');
  // empty = send now; otherwise the task reaches the member at this time
  const [publishAt, setPublishAt] = useState('');
  const [reqs, setReqs] = useState<string[]>([]);
  const [req, setReq] = useState('');
  const [saving, setSaving] = useState(false);

  const candidates = members.filter((m) => m.role === role);

  const create = async () => {
    if (!title.trim()) {
      toast.error('اكتب عنوان المهمة');
      return;
    }
    const publish = publishAt ? new Date(publishAt) : null;
    const scheduled = !!publish && publish.getTime() > Date.now();
    if (scheduled && due && new Date(due).getTime() <= publish.getTime()) {
      toast.error('موعد التسليم يجب أن يكون بعد وقت إرسال المهمة');
      return;
    }
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    const { data: created, error } = await supabase.from('team_tasks').insert({
      title: title.trim(),
      details: details.trim() || null,
      assignee_role: role,
      assignee_user_id: assignee === 'any' ? null : assignee,
      due_at: due ? new Date(due).toISOString() : null,
      publish_at: scheduled ? publish.toISOString() : null,
      extra_requirements: reqs,
      created_by: session?.user.id,
    }).select('id').single();
    setSaving(false);
    if (error) toast.error(errorMessage(error));
    else {
      if (scheduled) toast.success(`جُدولت المهمة، تصل للعضو ${formatDate(publish.toISOString())}`);
      else {
        toast.success('أُسندت المهمة');
        if (created?.id) emailTask(created.id);
      }
      setTitle('');
      setDetails('');
      setDue('');
      setPublishAt('');
      setReqs([]);
      onCreated();
    }
  };

  return (
    <div className="space-y-4 rounded-3xl border border-border bg-card p-5">
      <h3 className="font-bold">إسناد مهمة جديدة</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <Label>عنوان المهمة</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <Label>التفاصيل</Label>
          <Textarea rows={3} value={details} onChange={(e) => setDetails(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>الدور</Label>
          <Select
            value={role}
            onValueChange={(v) => {
              setRole(v as WorkerRole);
              setAssignee('any');
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WORKER_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>الشخص</Label>
          <Select value={assignee} onValueChange={setAssignee}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">أي {ROLE_LABELS[role]}</SelectItem>
              {candidates.map((m) => (
                <SelectItem key={m.user_id} value={m.user_id}>
                  {m.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>وقت إرسال المهمة للعضو</Label>
          <Input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
          <div className="flex flex-wrap gap-1.5">
            <Button type="button" variant={publishAt ? 'outline' : 'secondary'} size="sm" onClick={() => setPublishAt('')}>
              الآن
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setPublishAt(toLocalInput(nextAtHour(8)))}>
              الساعة 8 صباحاً
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {publishAt ? 'لن يرى العضو المهمة ولن يصله الإيميل قبل هذا الوقت.' : 'تصل المهمة للعضو فور الإسناد.'}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label>موعد التسليم (اختياري)</Label>
          <Input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>متطلبات إضافية لإغلاق المهمة</Label>
          <div className="flex gap-2">
            <Input value={req} onChange={(e) => setReq(e.target.value)} placeholder="مثال: عدد الطلاب الحاضرين" />
            <Button
              variant="outline"
              size="icon"
              disabled={!req.trim()}
              onClick={() => {
                setReqs([...reqs, req.trim()]);
                setReq('');
              }}
              aria-label="إضافة متطلب"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {reqs.map((r) => (
              <span key={r} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs">
                {r}
                <button type="button" onClick={() => setReqs(reqs.filter((x) => x !== r))} aria-label="حذف">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
      <Button onClick={create} disabled={saving} className="gap-2">
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {publishAt ? 'جدولة المهمة' : 'إسناد المهمة'}
      </Button>
    </div>
  );
};

const CONFIRM_WORD = 'امسح';

/**
 * Principal only: deletes the whole team chat — group and private messages, polls (with their votes)
 * and the images sent in the chat. Task files in the same bucket are not touched.
 * The database already lets leads delete these rows (RLS), so this runs with the principal's own account.
 */
const ClearTeamChat: React.FC<{ onCleared: () => void }> = ({ onCleared }) => {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);

  const clearAll = async () => {
    setBusy(true);
    try {
      const { data: imgs, error: imgErr } = await supabase.from('team_messages').select('image_path').not('image_path', 'is', null);
      if (imgErr) throw imgErr;
      const { error: msgErr, count } = await supabase.from('team_messages').delete({ count: 'exact' }).not('id', 'is', null);
      if (msgErr) throw msgErr;
      const { error: pollErr } = await supabase.from('team_polls').delete().not('id', 'is', null);
      if (pollErr) throw pollErr;
      const paths = (imgs ?? []).map((m) => m.image_path).filter((x): x is string => Boolean(x));
      for (let i = 0; i < paths.length; i += 100) {
        const { error } = await supabase.storage.from('team-files').remove(paths.slice(i, i + 100));
        if (error) console.warn('team chat images', error.message);
      }
      toast.success(`انمسحت كل محادثات الفريق (${count ?? 0} رسالة${paths.length ? ` و${paths.length} صورة` : ''})`);
      setOpen(false);
      setTyped('');
      onCleared();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
      <div className="text-sm">
        <div className="font-bold text-destructive">مسح كل محادثات الفريق</div>
        <div className="text-muted-foreground">يحذف رسائل المجموعة والرسائل الخاصة والاستطلاعات والصور المرسلة. لا يمكن التراجع.</div>
      </div>
      <AlertDialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setTyped(''); }}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="gap-1.5">
            <Trash2 className="h-4 w-4" /> مسح الكل
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>متأكد إنك بدك تمسح كل محادثات الفريق؟</AlertDialogTitle>
            <AlertDialogDescription>
              رح تنحذف كل الرسائل (الجماعية والخاصة) والاستطلاعات والصور عند كل الأعضاء، ولا يمكن استرجاعها.
              للتأكيد اكتب «{CONFIRM_WORD}».
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={CONFIRM_WORD} autoFocus />
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={busy}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy || typed.trim() !== CONFIRM_WORD}
              onClick={(e) => { e.preventDefault(); void clearAll(); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'امسح كل المحادثات'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/** لوحة تحكم الموظفين — for the principal and supervisors only (enforced by RLS). */
export const EmployeesControlCenter: React.FC = () => {
  const { loading: rolesLoading, userId, roles } = useTeamRoles();
  const isLead = roles.includes('principal') || roles.includes('supervisor');
  const { members, reload: reloadMembers } = useTeamMembers();
  const { tasks, reload: reloadTasks } = useTeamTasks();
  const { dayOffMap, reload: reloadDayOff } = useTeamDayOff();
  const notifications = useTeamNotifications();
  const [roleFilter, setRoleFilter] = useState<'all' | WorkerRole>('all');
  const [chatKey, setChatKey] = useState(0); // remounts the chat after it is cleared

  const shown = useMemo(() => (roleFilter === 'all' ? tasks : tasks.filter((t) => t.assignee_role === roleFilter)), [tasks, roleFilter]);

  if (rolesLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!userId || !isLead) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        لوحة تحكم الموظفين متاحة للرئيس والمشرفين فقط.
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-border bg-card p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-from to-brand-to text-white">
          <Crown className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <div className="font-bold">الرئيس: {PRINCIPAL.name}</div>
          <div className="text-xs text-muted-foreground" dir="ltr">
            {PRINCIPAL.email}
          </div>
        </div>
        <span className="mr-auto rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          {roles.includes('principal') ? 'أنت الرئيس' : 'أنت مشرف'}
        </span>
      </div>

      <Tabs defaultValue="roles" dir="rtl">
        <TabsList className="mb-4 flex h-auto flex-wrap justify-start gap-1 rounded-2xl bg-muted p-1">
          <TabsTrigger value="roles" className="gap-1.5 rounded-xl">
            <UserCog className="h-4 w-4" /> الأدوار والإيميلات
          </TabsTrigger>
          <TabsTrigger value="dayoff" className="gap-1.5 rounded-xl">
            <Coffee className="h-4 w-4" /> عدم وجود مهام ({dayOffMap.size})
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1.5 rounded-xl">
            <ClipboardList className="h-4 w-4" /> المهام ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 rounded-xl">
            <Bell className="h-4 w-4" /> الإنجازات والإشعارات
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-1.5 rounded-xl">
            <MessagesSquare className="h-4 w-4" /> المحادثات
          </TabsTrigger>
          {roles.includes('principal') && (
            <TabsTrigger value="watch" className="gap-1.5 rounded-xl">
              <Eye className="h-4 w-4" /> مراقبة الشاشة
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            أضف إيميلاً أو أكثر لكل دور. يجب أن يكون صاحب الإيميل قد أنشأ حساباً في المنصة. تظهر لوحة الدور في صفحته الشخصية فور إضافته.
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {ASSIGNABLE.map((r) => (
              <RoleEmails
                key={r}
                role={r}
                members={members}
                dayOffMap={dayOffMap}
                onDayOffChanged={reloadDayOff}
                onChanged={reloadMembers}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dayoff">
          <DayOffAdminPanel />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <NewTaskForm members={members} onCreated={reloadTasks} />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold">عرض:</span>
            {(['all', ...WORKER_ROLES] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoleFilter(r)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  roleFilter === r ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                {r === 'all' ? 'كل الأدوار' : ROLE_LABELS[r]}
              </button>
            ))}
          </div>
          <TaskBoard tasks={shown} members={members} canWork={() => false} onChanged={reloadTasks} isLead />
        </TabsContent>

        <TabsContent value="notifications">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد إشعارات بعد.</p>
          ) : (
            <ul className="space-y-1.5">
              {notifications.map((n) => (
                <li key={n.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2 text-sm">
                  <span>{n.message}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {n.recipient_role === 'lead' ? 'للإدارة' : ROLE_LABELS[n.recipient_role as TeamRole]} · {formatDate(n.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          {roles.includes('principal') && <ClearTeamChat onCleared={() => setChatKey((k) => k + 1)} />}
          <TeamChat key={chatKey} me={userId} members={members} isLead />
        </TabsContent>

        {roles.includes('principal') && (
          <TabsContent value="watch">
            <ScreenWatchPanel names={Object.fromEntries(members.filter((m) => m.display_name).map((m) => [m.user_id, m.display_name as string]))} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default EmployeesControlCenter;
