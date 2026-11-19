import React, { useState } from 'react';
import { BadgeCheck, LifeBuoy, Loader2, MessageSquareWarning, Star } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { awardRescue, reviewQuality, usePointsSettings } from '@/components/admin/points/pointsApi';
import { errorMessage, uniquePeople, type TeamMember, type TeamTask } from './teamApi';

/** Task is (or was) late: overdue now, or completed after its due time. */
const wasLate = (t: TeamTask) =>
  !!t.due_at && new Date(t.completed_at ?? Date.now()).getTime() > new Date(t.due_at).getTime();

/**
 * Points controls for the leads inside a task: the task's value (before it is done), the quality
 * review «بلا ملاحظات» (after), and the rescue bonus for a colleague who helped on a late task.
 */
export const TaskPointsActions: React.FC<{ task: TeamTask; members: TeamMember[]; onChanged: () => void }> = ({
  task,
  members,
  onChanged,
}) => {
  const { settings } = usePointsSettings();
  const [value, setValue] = useState(String(task.points ?? ''));
  const [note, setNote] = useState('');
  const [helper, setHelper] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  if (task.points === null) return null; // special rows and tasks finished before the points system

  const owner = task.completed_by ?? task.assignee_user_id;
  const helpers = uniquePeople(members).filter(
    (p) => p.user_id !== owner && p.roles.some((r) => r !== 'principal' && r !== 'supervisor'),
  );

  const run = async (key: string, fn: () => Promise<unknown>, ok: string) => {
    setBusy(key);
    try {
      await fn();
      toast.success(ok);
      onChanged();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const saveValue = () =>
    run(
      'value',
      async () => {
        const { error } = await supabase
          .from('team_tasks')
          .update({ points: Math.max(0, Math.min(1000, Math.round(Number(value) || 0))) })
          .eq('id', task.id);
        if (error) throw error;
      },
      'حُدّثت نقاط المهمة',
    );

  return (
    <div className="space-y-3 rounded-2xl border border-dashed border-border p-4">
      <h4 className="flex items-center gap-1.5 text-sm font-bold">
        <Star className="h-4 w-4 text-primary" aria-hidden /> النقاط
      </h4>

      {task.status !== 'done' ? (
        <div className="flex flex-wrap items-center gap-2">
          <Input type="number" min={0} max={1000} value={value} onChange={(e) => setValue(e.target.value)} className="w-24 text-center" aria-label="نقاط المهمة" />
          <Button variant="outline" size="sm" onClick={saveValue} disabled={busy !== null || Number(value) === task.points}>
            {busy === 'value' && <Loader2 className="h-4 w-4 animate-spin" />} حفظ قيمة المهمة
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">قيمة المهمة: {task.points} نقطة · احتُسبت تلقائياً عند الإنجاز.</p>
      )}

      {task.status === 'done' &&
        (task.quality_status ? (
          <p className="flex items-center gap-1.5 text-xs">
            {task.quality_status === 'no_remarks' ? (
              <>
                <BadgeCheck className="h-4 w-4 text-success" aria-hidden /> رُوجعت: بلا ملاحظات (+{settings.quality})
              </>
            ) : (
              <>
                <MessageSquareWarning className="h-4 w-4 text-warning" aria-hidden /> رُوجعت: عليها ملاحظات
              </>
            )}
            {task.quality_note && <span className="text-muted-foreground">— {task.quality_note}</span>}
          </p>
        ) : (
          <div className="space-y-2">
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="ملاحظة المراجعة (اختياري)" />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="gap-1"
                disabled={busy !== null}
                onClick={() => run('ok', () => reviewQuality(task.id, true, note), `جودة بلا ملاحظات: +${settings.quality}`)}
              >
                {busy === 'ok' ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                بلا ملاحظات (+{settings.quality})
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                disabled={busy !== null}
                onClick={() => run('remarks', () => reviewQuality(task.id, false, note), 'سُجّلت المراجعة')}
              >
                <MessageSquareWarning className="h-4 w-4" /> عليها ملاحظات
              </Button>
            </div>
          </div>
        ))}

      {wasLate(task) && helpers.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <span className="text-xs font-semibold">إنقاذ (+{settings.rescue}):</span>
          <Select value={helper} onValueChange={setHelper}>
            <SelectTrigger className="h-9 w-44">
              <SelectValue placeholder="من ساعد؟" />
            </SelectTrigger>
            <SelectContent>
              {helpers.map((p) => (
                <SelectItem key={p.user_id} value={p.user_id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={!helper || busy !== null}
            onClick={() => run('rescue', () => awardRescue(task.id, helper, note), `مُنحت نقاط الإنقاذ +${settings.rescue}`)}
          >
            {busy === 'rescue' ? <Loader2 className="h-4 w-4 animate-spin" /> : <LifeBuoy className="h-4 w-4" />}
            منح نقاط الإنقاذ
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskPointsActions;
