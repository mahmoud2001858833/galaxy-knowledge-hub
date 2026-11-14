import React, { useState } from 'react';
import { toast } from 'sonner';
import { ChatPanel, type ChatMessage } from './ChatPanel';
import { commandAi, confirmPending, type ChatTurn, type PendingAction } from './collectiveApi';

/**
 * الذكاء الاصطناعي المركزي للمهام: the admin's chat with the real Central Task AI
 * (collective-task-ai "command": tools over collective tasks + team tasks, never emails without confirmation).
 */
const GREETING: ChatMessage = {
  role: 'assistant',
  content:
    'أهلاً! أنا **الذكاء الاصطناعي المركزي للمهام**، أشتغل على بيانات المنصة الحقيقية.\n\n' +
    'تقدر تلصقلي **مواصفات مشروع كاملة** وتحكيلي كم يوم ومين يشتغل عليه، وأنا بحلّلها وبقسّمها مهام يومية لكل شخص، ' +
    'وبتوصل كل واحد مهام يومه كل يوم.\n\nأي إرسال للفريق ما بيصير إلا بعد تأكيدك.',
};

const SUGGESTIONS = [
  'اعمل مهمة جماعية جديدة',
  'كيف ماشية المهام الجماعية؟',
  'مين متأخر بمهام الفريق؟',
  'شو لازم ينخلص اليوم؟',
];

const nowTime = () => new Date().toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' });

export function CentralTaskChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [busy, setBusy] = useState(false);

  const send = async (text: string) => {
    const next: ChatMessage[] = [...messages, { role: 'user', content: text, time: nowTime() }];
    setMessages(next);
    setBusy(true);
    try {
      const turns: ChatTurn[] = next.slice(1).map((m) => ({ role: m.role, content: m.content }));
      const r = await commandAi(turns);
      setMessages([...next, { role: 'assistant', content: r.reply || 'تم.', time: nowTime(), pending: r.pending }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setMessages([...next, { role: 'assistant', content: `تعذّر الوصول للذكاء الاصطناعي: ${msg}`, time: nowTime() }]);
    } finally {
      setBusy(false);
    }
  };

  const confirm = async (index: number, p: PendingAction | null) => {
    setMessages((prev) => prev.map((m, i) => (i === index ? { ...m, resolved: true } : m)));
    if (!p) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'تمام، ما أرسلت شي.', time: nowTime() }]);
      return;
    }
    setBusy(true);
    try {
      const r = await confirmPending(p);
      setMessages((prev) => [...prev, { role: 'assistant', content: r.reply, time: nowTime() }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ChatPanel
      title="الذكاء الاصطناعي المركزي للمهام"
      subtitle="ينشئ ويخطط ويتابع المهام الجماعية ومهام الفريق"
      messages={messages}
      busy={busy}
      onSend={send}
      onConfirm={confirm}
      onReset={() => setMessages([GREETING])}
      suggestions={SUGGESTIONS}
      placeholder="اكتب طلبك أو الصق مواصفات المشروع… (Shift+Enter لسطر جديد)"
      listHeight="h-[460px]"
    />
  );
}
