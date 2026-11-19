import React, { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROLE_LABELS, WORKER_ROLES, errorMessage, type TeamRole, type WorkerRole } from '@/components/team/teamApi';
import { EXCELLENCE_RULE, savePointsSettings, type PointsSettings } from './pointsApi';

type NumKey = 'on_time' | 'late_per_day' | 'per_photo' | 'max_photos' | 'quality' | 'rescue' | 'exclude_after_days' | 'max_sources';

const GENERAL: { key: NumKey; label: string; hint: string; sign?: '+' | '−' }[] = [
  { key: 'on_time', label: 'التسليم في الموعد', hint: 'تُضاف عند الإنجاز قبل موعد التسليم', sign: '+' },
  { key: 'late_per_day', label: 'التأخير لكل يوم', hint: 'تُخصم عن كل يوم (أو جزء منه) بعد الموعد', sign: '−' },
  { key: 'per_photo', label: 'لكل صورة إثبات', hint: 'من صور التسليم', sign: '+' },
  { key: 'max_photos', label: 'أقصى عدد صور محسوبة', hint: 'لمنع المبالغة في الصور' },
  { key: 'quality', label: 'الجودة «بلا ملاحظات»', hint: 'عند مراجعة المدقق أو الإدارة', sign: '+' },
  { key: 'rescue', label: 'الإنقاذ', hint: 'لمن يساعد زميلاً في مهمة متأخرة', sign: '+' },
  { key: 'exclude_after_days', label: 'الاستبعاد بعد (أيام تأخير)', hint: 'بعدها لا نقاط إنجاز (الجودة مسموحة)' },
  { key: 'max_sources', label: 'أقصى عدد مصادر رسمية', hint: 'لتميّز مسؤول رفع الملفات' },
];

const BASE_ROLES: TeamRole[] = [...WORKER_ROLES, 'supervisor', 'principal'];

const clampInt = (v: string) => Math.max(0, Math.min(1000, Math.round(Number(v) || 0)));

/** Editable rules (principal only by RLS); changes apply to tasks completed from now on. */
export const PointsRulesEditor: React.FC<{ settings: PointsSettings; canEdit: boolean; onSaved: () => void }> = ({
  settings,
  canEdit,
  onSaved,
}) => {
  const [draft, setDraft] = useState<PointsSettings>(settings);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(settings), [settings]);

  const save = async () => {
    setSaving(true);
    try {
      await savePointsSettings(draft);
      toast.success('حُفظت قواعد النقاط، وتُطبّق على المهام التي تُنجز من الآن');
      onSaved();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const field = (id: string, value: number, onChange: (v: number) => void) => (
    <Input
      id={id}
      type="number"
      min={0}
      inputMode="numeric"
      value={value}
      disabled={!canEdit}
      onChange={(e) => onChange(clampInt(e.target.value))}
      className="w-24 text-center"
    />
  );

  return (
    <div className="space-y-5">
      <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
        <h3 className="font-bold">القواعد العامة</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {GENERAL.map(({ key, label, hint, sign }) => (
            <div key={key} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-3">
              <div className="min-w-0">
                <Label htmlFor={`pts-${key}`} className="font-semibold">
                  {label} {sign && <span className={sign === '+' ? 'text-success' : 'text-destructive'}>{sign}</span>}
                </Label>
                <p className="text-[11px] text-muted-foreground">{hint}</p>
              </div>
              {field(`pts-${key}`, draft[key], (v) => setDraft({ ...draft, [key]: v }))}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-3xl border border-border bg-card p-5">
        <h3 className="font-bold">نقاط كل دور</h3>
        <p className="text-xs text-muted-foreground">
          نقاط الأساس هي القيمة الافتراضية لأي مهمة تُسند لهذا الدور (يمكن تغييرها عند الإسناد). مكافأة التميّز تُضاف بحسب طبيعة كل دور.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="p-2 text-right font-semibold">الدور</th>
                <th className="p-2 text-center font-semibold">نقاط الأساس</th>
                <th className="p-2 text-center font-semibold">مكافأة التميّز</th>
                <th className="p-2 text-right font-semibold">متى تُمنح</th>
              </tr>
            </thead>
            <tbody>
              {BASE_ROLES.map((role) => {
                const worker = (WORKER_ROLES as TeamRole[]).includes(role);
                return (
                  <tr key={role} className="border-b border-border/60 last:border-0">
                    <td className="p-2 font-semibold">{ROLE_LABELS[role]}</td>
                    <td className="p-2">
                      <div className="flex justify-center">
                        {field(`base-${role}`, draft.role_base[role] ?? 0, (v) =>
                          setDraft({ ...draft, role_base: { ...draft.role_base, [role]: v } }),
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex justify-center">
                        {worker
                          ? field(`exc-${role}`, draft.role_excellence[role as WorkerRole] ?? 0, (v) =>
                              setDraft({ ...draft, role_excellence: { ...draft.role_excellence, [role]: v } }),
                            )
                          : <span className="text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className="p-2 text-xs text-muted-foreground">{worker ? EXCELLENCE_RULE[role as WorkerRole] : 'بلا نقاط مهام'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {canEdit ? (
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ القواعد
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">تعديل القواعد للرئيس فقط.</p>
      )}
    </div>
  );
};

export default PointsRulesEditor;
