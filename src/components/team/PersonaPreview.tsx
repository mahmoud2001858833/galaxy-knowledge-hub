import React, { useMemo, useState } from 'react';
import { ArrowRight, Glasses } from 'lucide-react';
import { TeamPortal } from './TeamPortal';
import { uniquePeople, type TeamMember } from './teamApi';

/**
 * Admin-only: pick any team member and see their panel exactly as they see it, to know how to
 * explain it to them. Reuses the real dashboards so it stays accurate — previewOnly disables every
 * action inside so nothing is actually done on the member's behalf.
 */
export const PersonaPreviewPanel: React.FC<{ members: TeamMember[] }> = ({ members }) => {
  const people = useMemo(() => uniquePeople(members), [members]);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const person = people.find((p) => p.user_id === pickedId) ?? null;

  if (!person) {
    return (
      <div className="space-y-4" dir="rtl">
        <p className="text-sm text-muted-foreground">
          اختر أي عضو لتشوف لوحته بالضبط كما يراها هو — مفيدة خصوصاً مع «رفع الملفات» لمعرفة كيف تشرحلهم المكتبة والمهام. هذا للعرض فقط ولا يُنفَّذ منه أي شيء.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((p) => (
            <button
              key={p.user_id}
              type="button"
              onClick={() => setPickedId(p.user_id)}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-right transition hover:border-primary/40"
            >
              <span className="min-w-0">
                <span className="block truncate font-semibold">{p.name}</span>
                <span className="block truncate text-[11px] text-muted-foreground">{p.title}</span>
              </span>
              <Glasses className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </button>
          ))}
          {people.length === 0 && <p className="text-sm text-muted-foreground">لا يوجد أعضاء بعد.</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-primary/30 bg-primary/5 p-3">
        <span className="text-sm">
          <Glasses className="ml-1 inline h-4 w-4 text-primary" aria-hidden />
          <span className="font-bold">وضع المعاينة: </span>
          لوحة <span className="font-bold">{person.name}</span> ({person.title}) بالضبط كما يراها — أي زر تنفيذ هنا معطّل.
        </span>
        <button
          type="button"
          onClick={() => setPickedId(null)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold hover:bg-accent"
        >
          <ArrowRight className="h-3.5 w-3.5" aria-hidden /> رجوع لقائمة الأعضاء
        </button>
      </div>
      <TeamPortal me={person.user_id} roles={person.roles} previewOnly />
    </div>
  );
};

export default PersonaPreviewPanel;
