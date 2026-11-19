import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  CheckCircle2,
  ClipboardList,
  Clock,
  Crown,
  ImagePlus,
  Loader2,
  MessageSquare,
  Play,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CentralTaskChat } from '@/components/admin/collective/CentralTaskChat';
import { TeamImage } from './TeamImages';
import {
  PRINCIPAL,
  ROLE_LABELS,
  WORKER_ROLES,
  createSupervisorTask,
  deleteSupervisorTask,
  errorMessage,
  formatDate,
  nextAtHour,
  toLocalInput,
  updateSupervisorTaskStatus,
  uploadTeamImage,
  useSupervisorTasks,
  useTeamMembers,
  useTeamRoles,
  useTeamTasks,
  type SupervisorTask,
  type SupervisorTaskPriority,
  type TaskStatus,
  type TeamMember,
  type TeamMessage,
  type WorkerRole,
} from './teamApi';

const PRIORITY_META: Record<SupervisorTaskPriority, { label: string; badge: string }> = {
  normal: { label: 'عادي', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  high: { label: 'مهم', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
  urgent: { label: 'عاجل', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
};

const STATUS_META: Record<TaskStatus, { label: string; badge: string }> = {
  todo: { label: 'مطلوبة', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
  in_progress: { label: 'قيد التنفيذ', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
  done: { label: 'منجزة', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
};

/**
 * Column 1 (Right in RTL): Direct real-time private chat between Principal and Supervisor.
 */
const DirectSupervisorChat: React.FC<{
  me: string;
  peerId: string | null;
  peerName: string;
  peerRoleLabel: string;
}> = ({ me, peerId, peerName, peerRoleLabel }) => {
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!peerId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from('team_messages')
      .select('*')
      .or(`and(sender_id.eq.${me},recipient_id.eq.${peerId}),and(sender_id.eq.${peerId},recipient_id.eq.${me})`)
      .order('created_at', { ascending: true })
      .limit(200);
    setMessages(data ?? []);
    setLoading(false);
  }, [me, peerId]);

  useEffect(() => {
    setLoading(true);
    load();
    if (!peerId) return;
    const channel = supabase
      .channel(`direct-sup-chat-${me}-${peerId}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_messages' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, me, peerId]);

  useEffect(() => {
    // Scroll ONLY inside the chat container so the outer page never jumps down
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const sendMessage = async () => {
    if (!peerId || !text.trim() || sending) return;
    setSending(true);
    const body = text.trim();
    setText('');
    const { error } = await supabase.from('team_messages').insert({
      sender_id: me,
      recipient_id: peerId,
      body,
    });
    setSending(false);
    if (error) {
      toast.error(errorMessage(error));
      setText(body);
    } else {
      load();
    }
  };

  const sendImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !peerId) return;
    setSending(true);
    try {
      const path = await uploadTeamImage(file);
      const { error } = await supabase.from('team_messages').insert({
        sender_id: me,
        recipient_id: peerId,
        image_path: path,
      });
      if (error) throw error;
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const deleteMsg = async (id: string) => {
    const { error } = await supabase.from('team_messages').delete().eq('id', id);
    if (error) toast.error(errorMessage(error));
    else load();
  };

  return (
    <div className="flex h-[calc(100vh-11rem)] min-h-[660px] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-gradient-to-l from-indigo-600/10 via-blue-600/5 to-transparent px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-foreground">محادثة مباشرة • {peerName}</h3>
            <p className="text-xs font-medium text-muted-foreground">{peerRoleLabel} • تواصل فوري ومباشر</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          مباشر
        </span>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 space-y-3.5 overflow-y-auto bg-muted/20 p-4 sm:p-5">
        {!peerId ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground p-6">
            <UserCheck className="mb-2 h-9 w-9 opacity-40" />
            <p className="font-bold text-foreground">لم يتم تعيين مشرف بعد</p>
            <p className="mt-1 text-xs">أضف إيميل المشرف من تبويب «الأدوار والإيميلات» في لوحة تحكم الموظفين لتبدأ المحادثة الفورية هنا.</p>
          </div>
        ) : loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-xs text-muted-foreground p-6">
            <MessageSquare className="mb-2 h-8 w-8 opacity-30" />
            <p className="font-semibold text-foreground">لا توجد رسائل بعد</p>
            <p className="mt-1">ابدأ المحادثة الآن مع {peerName}.</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === me;
            return (
              <div key={m.id} className={`flex flex-col ${mine ? 'items-start' : 'items-end'}`}>
                <div
                  className={`group relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                    mine
                      ? 'rounded-tr-sm bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                      : 'rounded-tl-sm border border-border bg-card text-foreground'
                  }`}
                >
                  {m.image_path && (
                    <div className="mb-2 overflow-hidden rounded-xl">
                      <TeamImage path={m.image_path} className="max-h-56 w-auto rounded-xl object-cover" />
                    </div>
                  )}
                  {m.body && <p className="whitespace-pre-wrap break-words leading-relaxed">{m.body}</p>}
                  <div
                    className={`mt-1 flex items-center justify-between gap-2 text-[10px] ${
                      mine ? 'text-blue-100/80' : 'text-muted-foreground'
                    }`}
                  >
                    <span>{formatDate(m.created_at)}</span>
                    {mine && (
                      <button
                        type="button"
                        onClick={() => deleteMsg(m.id)}
                        className="opacity-0 transition group-hover:opacity-100 hover:text-rose-200"
                        title="حذف الرسالة"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-card p-3.5">
        <div className="flex items-end gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={sendImage} />
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={!peerId || sending}
            onClick={() => fileRef.current?.click()}
            className="h-11 w-11 shrink-0 rounded-xl"
            title="إرسال صورة"
          >
            <ImagePlus className="h-5 w-5" />
          </Button>
          <Textarea
            rows={1}
            disabled={!peerId || sending}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={peerId ? `اكتب رسالة إلى ${peerName}...` : 'أضف مشرفاً أولاً...'}
            className="min-h-[44px] max-h-32 resize-none rounded-xl text-sm py-2.5"
          />
          <Button
            type="button"
            size="icon"
            disabled={!peerId || sending || !text.trim()}
            onClick={sendMessage}
            className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            title="إرسال"
          >
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Column 2 (Middle): Tasks assigned by the Principal to the Supervisor.
 * Principal can create, track, and delete tasks. Supervisor can view & update status/completion notes.
 */
const SupervisorTasksColumn: React.FC<{
  isPrincipal: boolean;
  supervisorUserId: string | null;
  supervisorName: string;
}> = ({ isPrincipal, supervisorUserId, supervisorName }) => {
  const { tasks, loading, reload } = useSupervisorTasks();
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');
  const [showAdd, setShowAdd] = useState(false);

  // Add form state (Principal)
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [priority, setPriority] = useState<SupervisorTaskPriority>('high');
  const [dueAt, setDueAt] = useState('');
  const [saving, setSaving] = useState(false);

  // Completion note state (Supervisor)
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completionNote, setCompletionNote] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const visibleTasks = useMemo(() => {
    const scoped = supervisorUserId
      ? tasks.filter((t) => !t.supervisorUserId || t.supervisorUserId === supervisorUserId)
      : tasks;
    if (filter === 'all') return scoped;
    return scoped.filter((t) => t.status === filter);
  }, [tasks, supervisorUserId, filter]);

  const counts = useMemo(() => {
    const scoped = supervisorUserId
      ? tasks.filter((t) => !t.supervisorUserId || t.supervisorUserId === supervisorUserId)
      : tasks;
    return {
      all: scoped.length,
      todo: scoped.filter((t) => t.status === 'todo').length,
      in_progress: scoped.filter((t) => t.status === 'in_progress').length,
      done: scoped.filter((t) => t.status === 'done').length,
    };
  }, [tasks, supervisorUserId]);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('اكتب عنوان المهمة للمشرف');
      return;
    }
    setSaving(true);
    try {
      await createSupervisorTask({
        title,
        details,
        supervisorUserId,
        priority,
        dueAt: dueAt || null,
      });
      toast.success('تم إسناد المهمة للمشرف بنجاح');
      setTitle('');
      setDetails('');
      setPriority('high');
      setDueAt('');
      setShowAdd(false);
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task: SupervisorTask, nextStatus: TaskStatus, note?: string) => {
    setUpdatingId(task.id);
    try {
      await updateSupervisorTaskStatus(task, nextStatus, note);
      toast.success(nextStatus === 'done' ? 'تم تسجيل إنجاز المهمة' : nextStatus === 'in_progress' ? 'تم بدء التنفيذ' : 'تم تحديث الحالة');
      setCompletingId(null);
      setCompletionNote('');
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
    try {
      await deleteSupervisorTask(taskId);
      toast.success('تم حذف المهمة');
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <div className="flex h-[calc(100vh-11rem)] min-h-[660px] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-l from-amber-500/10 via-orange-500/5 to-transparent px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-black text-foreground">
                {isPrincipal ? `مهام المشرف (${supervisorName})` : 'المهام المطلوبة منك (من الرئيس)'}
              </h3>
              <p className="text-xs font-medium text-muted-foreground">
                {counts.todo} مطلوبة · {counts.in_progress} قيد التنفيذ · {counts.done} منجزة
              </p>
            </div>
          </div>

          {isPrincipal && (
            <Button
              type="button"
              size="sm"
              onClick={() => setShowAdd((v) => !v)}
              className="h-10 shrink-0 gap-1.5 rounded-xl bg-amber-600 px-3.5 text-xs font-bold text-white hover:bg-amber-700"
            >
              {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showAdd ? 'إغلاق' : 'مهمة جديدة'}
            </Button>
          )}
        </div>

        {/* Filter pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {([
            ['all', `الكل (${counts.all})`],
            ['todo', `مطلوبة (${counts.todo})`],
            ['in_progress', `قيد التنفيذ (${counts.in_progress})`],
            ['done', `منجزة (${counts.done})`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                filter === key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Task Drawer (Principal Only) */}
      {isPrincipal && showAdd && (
        <div className="space-y-2.5 border-b border-border bg-amber-50/60 dark:bg-amber-950/20 p-3.5">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان المهمة للمشرف..."
            className="rounded-xl bg-background text-sm font-semibold"
          />
          <Textarea
            rows={2}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="التفاصيل والتعليمات المطلوبة من المشرف..."
            className="rounded-xl bg-background text-xs"
          />
          <div className="grid grid-cols-2 gap-2">
            <Select value={priority} onValueChange={(v) => setPriority(v as SupervisorTaskPriority)}>
              <SelectTrigger className="h-9 rounded-xl bg-background text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">أولوية عادية</SelectItem>
                <SelectItem value="high">أولوية مهمة</SelectItem>
                <SelectItem value="urgent">عاجل جداً</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="h-9 rounded-xl bg-background text-xs"
              title="موعد التسليم (اختياري)"
            />
          </div>
          <Button onClick={handleCreate} disabled={saving} className="w-full gap-1.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            إرسال المهمة للمشرف
          </Button>
        </div>
      )}

      {/* Task List */}
      <div className="flex-1 space-y-2.5 overflow-y-auto p-3.5">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : visibleTasks.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground">
            <ClipboardList className="mb-2 h-8 w-8 opacity-30" />
            <p className="font-semibold text-foreground">لا توجد مهام في هذا القسم</p>
            {isPrincipal && <p className="mt-1">اضغط على «مهمة جديدة» بالأعلى لإسناد مهمة مباشرة للمشرف.</p>}
          </div>
        ) : (
          visibleTasks.map((t) => {
            const pMeta = PRIORITY_META[t.priority];
            const sMeta = STATUS_META[t.status];
            const isUpdating = updatingId === t.id;
            return (
              <div
                key={t.id}
                className={`rounded-2xl border p-3.5 transition ${
                  t.status === 'done'
                    ? 'border-emerald-200/70 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/15'
                    : 'border-border bg-background hover:border-primary/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className={`text-sm font-bold leading-snug ${t.status === 'done' ? 'line-through opacity-75' : 'text-foreground'}`}>
                    {t.title}
                  </h4>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${pMeta.badge}`}>{pMeta.label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${sMeta.badge}`}>{sMeta.label}</span>
                  </div>
                </div>

                {t.details && (
                  <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{t.details}</p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                  <span>أُنشئت: {formatDate(t.createdAt)}</span>
                  {t.dueAt && (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                      <Clock className="h-3 w-3" /> التسليم: {formatDate(t.dueAt)}
                    </span>
                  )}
                </div>

                {t.completionNote && (
                  <div className="mt-2 rounded-xl bg-emerald-500/10 px-2.5 py-1.5 text-[11px] text-emerald-900 dark:text-emerald-200">
                    <span className="font-bold">ملاحظة الإنجاز: </span>
                    {t.completionNote}
                  </div>
                )}

                {/* Completion Note Input */}
                {completingId === t.id && (
                  <div className="mt-2.5 space-y-2 rounded-xl border border-emerald-300/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5">
                    <Textarea
                      rows={2}
                      value={completionNote}
                      onChange={(e) => setCompletionNote(e.target.value)}
                      placeholder="اكتب ملاحظة سريعة حول ما تم إنجازه (اختياري)..."
                      className="rounded-lg bg-background text-xs"
                    />
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(t, 'done', completionNote)}
                        className="h-7 gap-1 rounded-lg bg-emerald-600 text-[11px] text-white hover:bg-emerald-700"
                      >
                        {isUpdating ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                        تأكيد الإنجاز
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setCompletingId(null);
                          setCompletionNote('');
                        }}
                        className="h-7 rounded-lg text-[11px]"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {t.status === 'todo' && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(t, 'in_progress')}
                        className="h-7 gap-1 rounded-lg text-[11px] font-bold"
                      >
                        <Play className="h-3 w-3" /> بدء التنفيذ
                      </Button>
                    )}
                    {t.status !== 'done' && completingId !== t.id && (
                      <Button
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => {
                          setCompletingId(t.id);
                          setCompletionNote('');
                        }}
                        className="h-7 gap-1 rounded-lg bg-emerald-600 text-[11px] font-bold text-white hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="h-3 w-3" /> تم الإنجاز
                      </Button>
                    )}
                    {t.status === 'done' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(t, 'todo')}
                        className="h-7 rounded-lg text-[11px]"
                      >
                        إعادة فتح
                      </Button>
                    )}
                  </div>

                  {isPrincipal && (
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" /> حذف
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

/**
 * Column 3 for Supervisor ONLY (replaces AI):
 * Compact, fast task assignment panel for team members (المتكلمين، مسؤول الصفحة، المدقق، إلخ) + live list of assigned tasks.
 */
const SupervisorTeamAssignerColumn: React.FC<{ members: TeamMember[] }> = ({ members }) => {
  const { tasks, reload } = useTeamTasks();
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [role, setRole] = useState<WorkerRole>('speaker');
  const [assignee, setAssignee] = useState('any');
  const [due, setDue] = useState('');
  const [publishAt, setPublishAt] = useState('');
  const [reqs, setReqs] = useState<string[]>([]);
  const [req, setReq] = useState('');
  const [saving, setSaving] = useState(false);

  const candidates = useMemo(() => members.filter((m) => m.role === role), [members, role]);
  const recentTasks = useMemo(() => tasks.slice(0, 6), [tasks]);

  const emailTask = async (taskId: string) => {
    const { data, error } = await supabase.functions.invoke('team-task-email', { body: { task_id: taskId } });
    if (error) return;
    const sent: string[] = data?.sent ?? [];
    if (sent.length) toast.success(`أُرسلت المهمة بالإيميل إلى ${sent.join('، ')}`);
  };

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
    const { data: created, error } = await supabase
      .from('team_tasks')
      .insert({
        title: title.trim(),
        details: details.trim() || null,
        assignee_role: role,
        assignee_user_id: assignee === 'any' ? null : assignee,
        due_at: due ? new Date(due).toISOString() : null,
        publish_at: scheduled ? publish.toISOString() : null,
        extra_requirements: reqs,
        created_by: session?.user.id,
      })
      .select('id')
      .single();
    setSaving(false);
    if (error) {
      toast.error(errorMessage(error));
    } else {
      if (scheduled) toast.success(`جُدولت المهمة، تصل للعضو ${formatDate(publish.toISOString())}`);
      else {
        toast.success(`تم إسناد المهمة لـ ${ROLE_LABELS[role]}`);
        if (created?.id) emailTask(created.id);
      }
      setTitle('');
      setDetails('');
      setDue('');
      setPublishAt('');
      setReqs([]);
      reload();
    }
  };

  return (
    <div className="flex h-[calc(100vh-11rem)] min-h-[660px] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-l from-emerald-600/10 via-teal-600/5 to-transparent px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-foreground">لوحة إعطاء المهام للفريق</h3>
            <p className="text-xs font-medium text-muted-foreground">إسناد مباشر للمتكلمين، مسؤول الصفحة، المدققين والفريق</p>
          </div>
        </div>
      </div>

      {/* Form + Recent */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs font-bold">الدور في الفريق</Label>
              <Select
                value={role}
                onValueChange={(v) => {
                  setRole(v as WorkerRole);
                  setAssignee('any');
                }}
              >
                <SelectTrigger className="h-9 rounded-xl bg-background text-xs">
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
            <div className="space-y-1">
              <Label className="text-xs font-bold">الشخص</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger className="h-9 rounded-xl bg-background text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">أي {ROLE_LABELS[role]}</SelectItem>
                  {candidates.map((m) => (
                    <SelectItem key={m.user_id} value={m.user_id}>
                      {m.display_name || m.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold">عنوان المهمة</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: زيارة مدرسة... أو نشر فيديو..."
              className="h-9 rounded-xl bg-background text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold">التفاصيل</Label>
            <Textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="اكتب تعليمات المهمة بوضوح..."
              className="rounded-xl bg-background text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px] font-bold">وقت الإرسال</Label>
              <Input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} className="h-8 rounded-xl bg-background text-[11px]" />
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setPublishAt('')}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${!publishAt ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
                >
                  الآن
                </button>
                <button
                  type="button"
                  onClick={() => setPublishAt(toLocalInput(nextAtHour(8)))}
                  className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground hover:bg-accent"
                >
                  8 صباحاً
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-bold">موعد التسليم (اختياري)</Label>
              <Input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} className="h-8 rounded-xl bg-background text-[11px]" />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] font-bold">متطلبات إضافية (اختياري)</Label>
            <div className="flex gap-1.5">
              <Input
                value={req}
                onChange={(e) => setReq(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && req.trim()) {
                    e.preventDefault();
                    setReqs([...reqs, req.trim()]);
                    setReq('');
                  }
                }}
                placeholder="مثال: عدد الطلاب"
                className="h-8 rounded-xl bg-background text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-xl"
                disabled={!req.trim()}
                onClick={() => {
                  setReqs([...reqs, req.trim()]);
                  setReq('');
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>
            {reqs.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {reqs.map((r) => (
                  <span key={r} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold">
                    {r}
                    <button type="button" onClick={() => setReqs(reqs.filter((x) => x !== r))}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={create}
            disabled={saving}
            className="w-full gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white hover:from-emerald-700 hover:to-teal-700"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            {publishAt ? 'جدولة المهمة للعضو' : `إسناد المهمة لـ ${ROLE_LABELS[role]}`}
          </Button>
        </div>

        {/* Recent tasks assigned to team */}
        <div className="space-y-2">
          <h4 className="text-xs font-black text-muted-foreground">آخر مهام الفريق ({tasks.length})</h4>
          {recentTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground">لا توجد مهام مسندة للفريق بعد.</p>
          ) : (
            recentTasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-foreground">{t.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {ROLE_LABELS[t.assignee_role as WorkerRole] || t.assignee_role} · {formatDate(t.created_at)}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_META[t.status as TaskStatus]?.badge ?? ''}`}>
                  {STATUS_META[t.status as TaskStatus]?.label ?? t.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * لوحة التواصل مع المشرف (للرئيس) / لوحة التواصل مع الرئيس وتوجيه الفريق (للمشرف)
 * - Right: Direct real-time chat between Principal & Supervisor
 * - Middle: Supervisor's tasks assigned by Principal
 * - Left:
 *     - Principal ONLY: Central Task AI (<CentralTaskChat />)
 *     - Supervisor ONLY: Team Task Assignment Panel (NO AI)
 */
export const SupervisorCommHub: React.FC = () => {
  const { loading: rolesLoading, userId, roles } = useTeamRoles();
  const { members, loading: membersLoading } = useTeamMembers();

  const isPrincipal = roles.includes('principal');
  const isSupervisor = roles.includes('supervisor');
  const isLead = isPrincipal || isSupervisor;

  const supervisors = useMemo(() => members.filter((m) => m.role === 'supervisor'), [members]);
  const principalMember = useMemo(() => members.find((m) => m.role === 'principal') ?? null, [members]);

  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('');

  useEffect(() => {
    if (!selectedSupervisorId && supervisors.length > 0) {
      setSelectedSupervisorId(supervisors[0].user_id);
    }
  }, [supervisors, selectedSupervisorId]);

  if (rolesLoading || membersLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!userId || !isLead) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground" dir="rtl">
        هذه اللوحة مخصصة للرئيس والمشرف فقط.
      </div>
    );
  }

  const activeSupervisor = supervisors.find((s) => s.user_id === selectedSupervisorId) ?? supervisors[0] ?? null;
  const chatPeerId = isPrincipal ? activeSupervisor?.user_id ?? null : principalMember?.user_id ?? null;
  const chatPeerName = isPrincipal
    ? activeSupervisor?.display_name || activeSupervisor?.email || 'المشرف'
    : principalMember?.display_name || PRINCIPAL.name;
  const chatPeerRoleLabel = isPrincipal ? 'المشرف العام للفريق' : 'الرئيس / الأدمن';

  const taskTargetSupervisorId = isPrincipal ? activeSupervisor?.user_id ?? null : userId;
  const taskTargetSupervisorName = isPrincipal
    ? activeSupervisor?.display_name || 'المشرف'
    : 'أنت';

  return (
    <div className="space-y-4" dir="rtl">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md">
            {isPrincipal ? <Crown className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-foreground">
              {isPrincipal ? 'لوحة التواصل مع المشرف' : 'لوحة التواصل مع الرئيس وإدارة مهام الفريق'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isPrincipal
                ? 'شات مباشر مع المشرف، متابعة مهامه المطلوبة، ومساعد الذكاء الاصطناعي للمهام (حصرياً للأدمن)'
                : 'شات مباشر مع الرئيس، مهامك المطلوبة منه، ولوحة إسناد المهام لأعضاء الفريق'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isPrincipal && supervisors.length > 1 && (
            <Select value={selectedSupervisorId} onValueChange={setSelectedSupervisorId}>
              <SelectTrigger className="h-9 w-52 rounded-xl text-xs font-bold">
                <SelectValue placeholder="اختر المشرف" />
              </SelectTrigger>
              <SelectContent>
                {supervisors.map((s) => (
                  <SelectItem key={s.user_id} value={s.user_id}>
                    {s.display_name || s.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Badge variant="secondary" className="gap-1 rounded-full px-3 py-1 text-xs font-bold">
            {isPrincipal ? (
              <>
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                وضع الأدمن (+ AI المهام)
              </>
            ) : (
              <>
                <Users className="h-3.5 w-3.5 text-emerald-600" />
                وضع المشرف (+ توزيع مهام الفريق)
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* 3-Column Layout (RTL: Right = Chat, Middle = Supervisor Tasks, Left = AI for Admin OR Team Task Assigner for Supervisor) */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        {/* 1. Right Column: Direct Chat */}
        <div className="xl:col-span-4">
          <DirectSupervisorChat
            me={userId}
            peerId={chatPeerId}
            peerName={chatPeerName}
            peerRoleLabel={chatPeerRoleLabel}
          />
        </div>

        {/* 2. Middle Column: Supervisor's Tasks from Principal */}
        <div className="xl:col-span-4">
          <SupervisorTasksColumn
            isPrincipal={isPrincipal}
            supervisorUserId={taskTargetSupervisorId}
            supervisorName={taskTargetSupervisorName}
          />
        </div>

        {/* 3. Left Column: AI for Principal ONLY, Team Task Assigner for Supervisor */}
        <div className="xl:col-span-4">
          {isPrincipal ? (
            <div className="flex h-[calc(100vh-11rem)] min-h-[660px] flex-col overflow-hidden rounded-3xl border border-indigo-200/70 dark:border-indigo-900/50 bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border bg-gradient-to-l from-violet-600/10 via-indigo-600/5 to-transparent px-5 py-3">
                <span className="inline-flex items-center gap-2 text-sm font-black text-indigo-700 dark:text-indigo-300">
                  <Bot className="h-5 w-5" />
                  الذكاء الاصطناعي المسؤول عن المهام
                </span>
                <span className="rounded-full bg-indigo-500/15 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  خاص بالأدمن فقط
                </span>
              </div>
              <div className="flex-1 min-h-0 flex flex-col">
                <CentralTaskChat listHeight="flex-1 min-h-0" className="h-full border-0 rounded-none" />
              </div>
            </div>
          ) : (
            <SupervisorTeamAssignerColumn members={members} />
          )}
        </div>
      </div>
    </div>
  );
};

export default SupervisorCommHub;
