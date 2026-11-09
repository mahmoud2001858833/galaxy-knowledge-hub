import React, { useMemo, useState } from 'react';
import { Bell, ClipboardList, Inbox, MessagesSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskBoard, TaskDialog } from './TaskBoard';
import { TeamChat } from './TeamChat';
import {
  ROLE_LABELS,
  ROLE_PROOF,
  formatDate,
  isOverdue,
  isScheduled,
  type TeamMember,
  type TeamNotification,
  type TeamTask,
  type WorkerRole,
} from './teamApi';

interface RoleWorkspaceProps {
  role: WorkerRole;
  me: string;
  isLead: boolean;
  members: TeamMember[];
  tasks: TeamTask[];
  notifications: TeamNotification[];
  reloadTasks: () => void;
}

const TaskRow: React.FC<{ task: TeamTask; onOpen: () => void; note?: string }> = ({ task, onOpen, note }) => (
  <button
    type="button"
    onClick={onOpen}
    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 text-right transition hover:border-primary/40"
  >
    <span>
      <span className="block font-semibold">{task.title}</span>
      <span className="text-[11px] text-muted-foreground">
        {note ?? formatDate(task.publish_at ?? task.created_at)}
        {task.due_at && ` · التسليم ${formatDate(task.due_at)}`}
      </span>
    </span>
    {isOverdue(task) && <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-bold text-destructive">متأخرة</span>}
  </button>
);

/**
 * One role's dashboard: (أ) قسم المسؤول — tasks handed to this person and role-specific inputs,
 * (ب) the university group chat, (ج) the task execution board.
 */
export const RoleWorkspace: React.FC<RoleWorkspaceProps> = ({ role, me, isLead, members, tasks, notifications, reloadTasks }) => {
  const [open, setOpen] = useState<TeamTask | null>(null);

  const myTasks = useMemo(
    // leads can read scheduled tasks early; as a worker they get them at publish_at like everyone else
    () => tasks.filter((t) => t.assignee_role === role && (t.assignee_user_id === null || t.assignee_user_id === me) && !isScheduled(t)),
    [tasks, role, me],
  );
  const inbox = myTasks.filter((t) => t.status !== 'done');
  // Finished work goes to the principal and supervisor only; no hand-over between roles.
  const myNotifications = notifications.filter((n) => n.recipient_role === role);

  const canWork = (t: TeamTask) => t.assignee_role === role && (t.assignee_user_id === null || t.assignee_user_id === me);

  return (
    <Tabs defaultValue="inbox" dir="rtl" className="w-full">
      <TabsList className="mb-4 flex h-auto flex-wrap justify-start gap-1 rounded-2xl bg-muted p-1">
        <TabsTrigger value="inbox" className="gap-1.5 rounded-xl">
          <Inbox className="h-4 w-4" /> قسم المسؤول
          {inbox.length > 0 && <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{inbox.length}</span>}
        </TabsTrigger>
        <TabsTrigger value="board" className="gap-1.5 rounded-xl">
          <ClipboardList className="h-4 w-4" /> تنفيذ المهام
        </TabsTrigger>
        <TabsTrigger value="chat" className="gap-1.5 rounded-xl">
          <MessagesSquare className="h-4 w-4" /> القروب الجامعي
        </TabsTrigger>
      </TabsList>

      <TabsContent value="inbox" className="space-y-6">
        <p className="rounded-2xl bg-accent p-4 text-sm text-accent-foreground">
          <span className="font-bold">{ROLE_LABELS[role]}: </span>
          لإغلاق أي مهمة يلزمك {ROLE_PROOF[role]}.
        </p>

        <section className="space-y-2">
          <h3 className="font-bold">مهام وصلتك من المشرف ({inbox.length})</h3>
          {inbox.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد مهام مفتوحة.</p>
          ) : (
            inbox.map((t) => (
              <TaskRow key={t.id} task={t} onOpen={() => setOpen(t)} />
            ))
          )}
        </section>

        <section className="space-y-2">
          <h3 className="flex items-center gap-1.5 font-bold">
            <Bell className="h-4 w-4" aria-hidden /> الإشعارات
          </h3>
          {myNotifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد إشعارات.</p>
          ) : (
            <ul className="space-y-1.5">
              {myNotifications.map((n) => (
                <li key={n.id} className="rounded-xl border border-border bg-card px-3 py-2 text-sm">
                  {n.message}
                  <span className="mr-2 text-[11px] text-muted-foreground">{formatDate(n.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </TabsContent>

      <TabsContent value="board">
        <TaskBoard tasks={myTasks} members={members} canWork={canWork} onChanged={reloadTasks} />
      </TabsContent>

      <TabsContent value="chat">
        <TeamChat me={me} members={members} isLead={isLead} />
      </TabsContent>

      <TaskDialog task={open} members={members} canWork={!!open && canWork(open)} onClose={() => setOpen(null)} onChanged={reloadTasks} />
    </Tabs>
  );
};
