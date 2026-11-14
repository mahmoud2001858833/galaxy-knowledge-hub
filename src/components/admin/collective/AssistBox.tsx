import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChatPanel, type ChatMessage } from './ChatPanel';
import { assistDraft, type AssistResult, type ChatTurn } from './collectiveApi';

/**
 * "صِف المهمة": the admin talks (or types, or pastes a whole spec); the AI fills the form fields
 * below and asks about what is still missing. Nothing is saved until the admin presses حفظ.
 */
const GREETING: ChatMessage = {
  role: 'assistant',
  content:
    'احكيلي عن المهمة بكلامك، أو **الصق المواصفات الكاملة للتصور النهائي** كما هي.\n\n' +
    'قلّي كمان: **كم يوم**، **مين يشتغل عليها** (بالأسماء أو الإيميلات)، و**إيمتى تنبعت**. ' +
    'أنا بعبّي الحقول تحت وبسألك عن الناقص؛ ما بينحفظ شي إلا لما تكبس «حفظ».',
};

export function AssistBox({ current, onApply }: {
  current: Record<string, unknown>;
  onApply: (r: AssistResult['draft']) => void;
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
      footer={(missing.length > 0 || ready) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 px-1 text-xs">
          {ready ? <Badge>جاهزة للحفظ</Badge> : <span className="text-muted-foreground">ناقص:</span>}
          {missing.map((m) => <Badge key={m} variant="outline">{m}</Badge>)}
        </div>
      )}
    />
  );
}
