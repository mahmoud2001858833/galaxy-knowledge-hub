import React, { useState } from 'react';
import { BrainCircuit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatPanel, type ChatMessage } from './ChatPanel';
import { assistDraft, type AssistResult, type ChatTurn } from './collectiveApi';

/**
 * "صِف المهمة": the admin talks (or types, or pastes a whole spec); the AI fills the form fields
 * below and asks about what is still missing. «احفظ وابنِ الخطة» saves and builds the plan in one click.
 */
const GREETING: ChatMessage = {
  role: 'assistant',
  content:
    'احكيلي عن المهمة بكلامك، أو **الصق المواصفات الكاملة للتصور النهائي** كما هي.\n\n' +
    'قلّي كمان: **كم يوم**، **مين يشتغل عليها** (بالأسماء أو الإيميلات)، و**إيمتى تنبعت**. ' +
    'وإذا عندك طريقة توزيع (مثلاً «أصعب المهام لمحمد») احكيها.\n\n' +
    'أنا بعبّي الحقول تحت وبسألك عن الناقص، وبعدها اكبس **«احفظ وابنِ الخطة»** وبتطلع الخطة والجدول اليومي.',
};

export function AssistBox({ current, onApply, onSaveAndPlan, saving }: {
  current: Record<string, unknown>;
  onApply: (r: AssistResult['draft']) => void;
  /** saves the form and asks the AI planner for the day-by-day plan */
  onSaveAndPlan: () => void;
  saving: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  const send = async (text: string) => {
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setBusy(true);
    try {
      const turns: ChatTurn[] = next.slice(1).map((m) => ({ role: m.role, content: m.content }));
      const r = await assistDraft(turns, current);
      onApply(r.draft);
      setMissing(r.missing);
      setReady(r.ready);
      setMessages([...next, { role: 'assistant', content: r.reply || 'عبّأت الحقول تحت.' }]);
    } catch (e) {
      setMessages([...next, { role: 'assistant', content: `تعذّر الفهم: ${e instanceof Error ? e.message : String(e)}` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ChatPanel
      title="صِف المهمة بكلامك"
      subtitle="يعبّي العنوان والأهداف والتصور والمدة والأشخاص والموعد"
      messages={messages}
      busy={busy}
      onSend={send}
      onReset={() => { setMessages([GREETING]); setMissing([]); setReady(false); }}
      placeholder="مثال: بدي صفحة «خطى التطوع» حسب المواصفات التالية… خلال 10 أيام، أحمد على الواجهة ومحمد على المحتوى، وتنبعت بكرة الساعة 8 الصبح"
      listHeight="h-[320px]"
      footer={
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {ready && <Badge>جاهزة</Badge>}
            {missing.length > 0 && <span className="text-muted-foreground">ناقص:</span>}
            {missing.map((m) => <Badge key={m} variant="outline">{m}</Badge>)}
          </div>
          {messages.length > 1 && (
            <Button onClick={onSaveAndPlan} disabled={busy || saving}>
              {saving ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <BrainCircuit className="ml-1 h-4 w-4" />}
              {saving ? 'يحفظ ويبني الخطة… (حتى دقيقة)' : 'احفظ وابنِ الخطة'}
            </Button>
          )}
        </div>
      }
    />
  );
}
