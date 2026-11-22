import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, CheckCircle2, ChevronDown, Clock, FileText, Loader2, Paperclip, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { isSpecialTeamTaskRow, todayAmman, type PageManagerFileItem, type TeamTask } from './teamApi';

/** One day of the page manager's schedule: the task(s) of that day and the files already sent for it. */
export interface PageManagerDayTask {
  id: string;
  day: string; // YYYY-MM-DD, Amman
  title: string;
  details: string;
  status: TeamTask['status'];
  publishAt: string | null;
  assigneeUserId: string | null;
}

const ammanDay = (iso: string) => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Amman' });

const dayLabel = (day: string) => {
  const d = new Date(`${day}T12:00:00Z`);
  return {
    weekday: d.toLocaleDateString('ar-JO', { weekday: 'long', timeZone: 'UTC' }),
    date: `${d.getUTCDate()}/${d.getUTCMonth() + 1}`,
  };
};

/** Strip the "[الأحد 22/11] " prefix the scheduled titles carry — the day is already shown. */
const cleanTitle = (t: string) => t.replace(/^\[[^\]]*\]\s*/, '');

export const PageManagerDayPlan: React.FC<{
  files: PageManagerFileItem[];
  memberName: (userId: string | null) => string | null;
  onUpload: (task: PageManagerDayTask) => void;
  onOpenFile: (file: PageManagerFileItem) => void;
}> = ({ files, memberName, onUpload, onOpenFile }) => {
  const [tasks, setTasks] = useState<PageManagerDayTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const today = todayAmman();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('team_tasks')
      .select('*')
      .eq('assignee_role', 'page_manager')
      .not('publish_at', 'is', null)
      .order('publish_at', { ascending: true });
    const rows = (data ?? []).filter((t) => !isSpecialTeamTaskRow(t));
    setTasks(
      rows.map((t) => ({
        id: t.id,
        day: ammanDay(t.publish_at as string),
        title: t.title,
        details: t.details ?? '',
        status: t.status,
        publishAt: t.publish_at,
        assigneeUserId: t.assignee_user_id,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const days = useMemo(() => {
    const map = new Map<string, PageManagerDayTask[]>();
    for (const t of tasks) map.set(t.day, [...(map.get(t.day) ?? []), t]);
    return [...map.entries()].map(([day, dayTasks]) => {
      const ids = new Set(dayTasks.map((t) => t.id));
      const dayFiles = files.filter((f) => (f.taskId ? ids.has(f.taskId) : f.forDay === day));
      return { day, tasks: dayTasks, files: dayFiles };
    });
  }, [tasks, files]);

  // Open on today (or the next day that has a task) the first time the schedule loads.
  useEffect(() => {
    if (selectedDay || days.length === 0) return;
    setSelectedDay((days.find((d) => d.day >= today) ?? days[days.length - 1]).day);
  }, [days, selectedDay, today]);

  useEffect(() => {
    stripRef.current?.querySelector<HTMLElement>('[data-selected="true"]')?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
    });
    setShowDetails(false);
  }, [selectedDay]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
        لا توجد مهام مجدولة لمسؤول الصفحة بعد.
      </div>
    );
  }

  const current = days.find((d) => d.day === selectedDay) ?? days[0];
  const upcomingEmpty = days.filter((d) => d.day >= today && d.files.length === 0).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-black text-foreground">
          <CalendarDays className="h-4 w-4 text-primary" />
          جدول مسؤول الصفحة يوماً بيوم
        </div>
        <div className="text-xs text-muted-foreground">
          {upcomingEmpty > 0 ? (
            <span className="font-bold text-destructive">{upcomingEmpty} يوم قادم لسا بدون ملفات</span>
          ) : (
            <span className="font-bold text-success">كل الأيام القادمة إلها ملفات</span>
          )}
        </div>
      </div>

      {/* Day strip */}
      <div ref={stripRef} className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        {days.map((d) => {
          const { weekday, date } = dayLabel(d.day);
          const isSel = d.day === current.day;
          const isToday = d.day === today;
          const isPast = d.day < today;
          return (
            <button
              key={d.day}
              type="button"
              data-selected={isSel}
              onClick={() => setSelectedDay(d.day)}
              className={`relative flex min-w-[86px] shrink-0 flex-col items-center gap-0.5 rounded-2xl border px-3 py-2.5 transition ${
                isSel
                  ? 'border-primary bg-primary text-primary-foreground shadow-md'
                  : `border-border bg-card hover:border-primary/50 ${isPast ? 'opacity-60' : ''}`
              }`}
            >
              {isToday && (
                <span className={`text-[10px] font-black ${isSel ? 'text-primary-foreground' : 'text-primary'}`}>اليوم</span>
              )}
              <span className="text-xs font-bold">{weekday}</span>
              <span className="text-base font-black tabular-nums">{date}</span>
              <span
                className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isSel
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : d.files.length > 0
                      ? 'bg-success/15 text-success'
                      : 'bg-destructive/10 text-destructive'
                }`}
              >
                <Paperclip className="h-2.5 w-2.5" />
                {d.files.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected day */}
      <div className="rounded-3xl border border-border bg-card p-4 sm:p-5 shadow-sm space-y-4">
        {current.tasks.map((t) => {
          const who = memberName(t.assigneeUserId);
          const sent = !t.publishAt || new Date(t.publishAt).getTime() <= Date.now();
          const time = t.publishAt
            ? new Date(t.publishAt).toLocaleTimeString('ar-JO', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Amman' })
            : null;
          return (
            <div key={t.id} className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground">
                  {dayLabel(t.day).weekday} {dayLabel(t.day).date}
                </span>
                {who && <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground">{who}</span>}
                {t.status === 'done' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-success">
                    <CheckCircle2 className="h-3 w-3" /> أنجزها
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 ${
                      sent ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {sent ? 'وصلته' : `بتوصله ${time ?? ''}`}
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-black leading-snug text-foreground">
                شو بده يرفع: {cleanTitle(t.title)}
              </h3>
              {t.details && (
                <div>
                  <div
                    className={`whitespace-pre-wrap rounded-2xl border border-border bg-muted/40 p-3.5 text-sm leading-relaxed text-foreground ${
                      showDetails ? '' : 'max-h-28 overflow-hidden'
                    }`}
                  >
                    {t.details}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDetails((v) => !v)}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-primary"
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition ${showDetails ? 'rotate-180' : ''}`} />
                    {showDetails ? 'إخفاء نص المهمة' : 'نص المهمة كامل'}
                  </button>
                </div>
              )}
              <Button
                type="button"
                onClick={() => onUpload(t)}
                className="h-11 w-full gap-2 rounded-2xl bg-gradient-to-l from-brand-from to-brand-to font-black text-primary-foreground sm:w-auto"
              >
                <Upload className="h-4 w-4" /> ارفع ملف لهاد اليوم
              </Button>
            </div>
          );
        })}

        <div className="border-t border-border pt-3">
          <div className="mb-2 text-xs font-black text-muted-foreground">
            الملفات المرفوعة لهاد اليوم ({current.files.length})
          </div>
          {current.files.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              لسا ما رفعت ولا ملف لهاد اليوم.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {current.files.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onOpenFile(f)}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3 text-right transition hover:border-primary/50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-foreground">{f.title}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {f.description || 'اضغط لعرض الرابط'}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageManagerDayPlan;
