import React, { useCallback, useState } from 'react';
import { Loader2, Mic, MicOff, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { assistDraft, type AssistResult, type ChatTurn } from './collectiveApi';
import { useSpeech } from './useSpeech';

/**
 * "صِف المهمة": the admin talks (or types) the task in their own words; the AI fills the form
 * fields and asks one question about what is still missing. Nothing is saved until the admin presses حفظ.
 */
export function AssistBox({ current, onApply }: {
  current: Record<string, unknown>;
  onApply: (r: AssistResult['draft']) => void;
}) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const addSpoken = useCallback((t: string) => setText((x) => (x ? `${x} ${t}` : t)), []);
  const speech = useSpeech(addSpoken);

  const send = async () => {
    const msg = text.trim();
    if (!msg || busy) return;
    if (speech.listening) speech.toggle();
    const next: ChatTurn[] = [...turns, { role: 'user', content: msg }];
    setTurns(next);
    setText('');
    setBusy(true);
    try {
      const r = await assistDraft(next, current);
      onApply(r.draft);
      setMissing(r.missing);
      setReady(r.ready);
      setTurns([...next, { role: 'assistant', content: r.reply || 'عبّأت الحقول.' }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
      setTurns(turns);
      setText(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-3 rounded-2xl border border-primary/40 bg-card p-5">
      <h3 className="flex items-center gap-2 font-bold text-foreground">
        <Sparkles className="h-4 w-4 text-primary" /> صِف المهمة بكلامك
      </h3>
      <p className="text-sm text-muted-foreground">
        احكِ أو اكتب: شو بدك يصير، شو التصور بالآخر، كم يوم، مين يشتغل عليها، وإيمتى تنبعت. الذكاء الاصطناعي يعبّي
        الحقول تحت ويسألك عن الناقص. ما بينحفظ شي إلا لما تكبس «حفظ».
      </p>

      {turns.length > 0 && (
        <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-border p-3">
          {turns.map((t, i) => (
            <div key={i} className={t.role === 'user' ? 'text-left' : 'text-right'}>
              <div
                className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm leading-7 ${
                  t.role === 'user' ? 'bg-muted text-foreground' : 'bg-primary/10 text-foreground'
                }`}
              >
                {t.content}
              </div>
            </div>
          ))}
          {busy && <div className="text-right text-sm text-muted-foreground"><Loader2 className="inline h-4 w-4 animate-spin" /> يفكّر…</div>}
        </div>
      )}

      {(missing.length > 0 || ready) && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {ready ? <Badge>جاهزة للحفظ</Badge> : <span className="text-muted-foreground">ناقص:</span>}
          {missing.map((m) => <Badge key={m} variant="outline">{m}</Badge>)}
        </div>
      )}

      <div className="flex items-end gap-2">
        <Textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }}
          placeholder="مثال: بدي نعيد بناء قسم الامتحانات خلال أسبوعين، أحمد على الواجهات ومحمد على الأسئلة، وتنبعت بكرة الساعة 8 الصبح…"
        />
        <div className="flex flex-col gap-2">
          {speech.supported && (
            <Button type="button" size="icon" variant={speech.listening ? 'destructive' : 'outline'} onClick={speech.toggle}
              title={speech.listening ? 'أوقف التسجيل' : 'احكِ بدل الكتابة'}>
              {speech.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
          <Button type="button" size="icon" onClick={send} disabled={busy || !text.trim()} title="أرسل">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {speech.listening && <p className="text-xs text-primary">🎙️ عم بسمعك… احكِ، وبعدين اكبس إرسال.</p>}
    </section>
  );
}
