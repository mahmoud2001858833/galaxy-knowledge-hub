import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BarChart3, Eye, ImagePlus, Loader2, Lock, Plus, Send, Trash2, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TeamImage } from './TeamImages';
import {
  ROLE_LABELS,
  errorMessage,
  formatDate,
  uniquePeople,
  uploadTeamImage,
  type TeamMember,
  type TeamMessage,
  type TeamPoll,
  type TeamPollVote,
} from './teamApi';

/** A conversation: the group, a private chat with one person, or (leads only) any private pair. */
type Conversation = { kind: 'group' } | { kind: 'dm'; with: string } | { kind: 'pair'; a: string; b: string };

const convKey = (c: Conversation) => (c.kind === 'group' ? 'group' : c.kind === 'dm' ? `dm:${c.with}` : `pair:${c.a}:${c.b}`);

const PollCard: React.FC<{
  poll: TeamPoll;
  votes: TeamPollVote[];
  me: string;
  isLead: boolean;
  onChanged: () => void;
}> = ({ poll, votes, me, isLead, onChanged }) => {
  const mine = votes.find((v) => v.user_id === me)?.option_index;
  const total = votes.length;

  const vote = async (i: number) => {
    if (poll.closed) return;
    const { error } =
      mine === undefined
        ? await supabase.from('team_poll_votes').insert({ poll_id: poll.id, option_index: i })
        : await supabase.from('team_poll_votes').update({ option_index: i }).eq('poll_id', poll.id).eq('user_id', me);
    if (error) toast.error(errorMessage(error));
    onChanged();
  };

  const close = async () => {
    const { error } = await supabase.from('team_polls').update({ closed: true }).eq('id', poll.id);
    if (error) toast.error(errorMessage(error));
    onChanged();
  };

  return (
    <div className="w-72 max-w-full space-y-2">
      <div className="flex items-center gap-1.5 font-bold">
        <BarChart3 className="h-4 w-4 text-primary" aria-hidden />
        {poll.question}
      </div>
      {poll.options.map((opt, i) => {
        const count = votes.filter((v) => v.option_index === i).length;
        const pct = total ? Math.round((count / total) * 100) : 0;
        return (
          <button
            key={i}
            type="button"
            disabled={poll.closed}
            onClick={() => vote(i)}
            className={`relative w-full overflow-hidden rounded-xl border px-3 py-2 text-right text-sm transition ${
              mine === i ? 'border-primary' : 'border-border hover:border-primary/40'
            } disabled:cursor-default`}
          >
            <span className="absolute inset-y-0 right-0 bg-primary/15" style={{ width: `${pct}%` }} aria-hidden />
            <span className="relative flex justify-between gap-2">
              <span>{opt}</span>
              <span className="text-xs text-muted-foreground">
                {count} ({pct}%)
              </span>
            </span>
          </button>
        );
      })}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          {total} صوت{poll.closed && ' · مغلق'}
        </span>
        {!poll.closed && (poll.created_by === me || isLead) && (
          <button type="button" onClick={close} className="font-semibold hover:text-foreground">
            إغلاق التصويت
          </button>
        )}
      </div>
    </div>
  );
};

const NewPollDialog: React.FC<{ open: boolean; onClose: () => void; onCreated: () => void }> = ({ open, onClose, onCreated }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [saving, setSaving] = useState(false);

  const create = async () => {
    const opts = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || opts.length < 2) {
      toast.error('اكتب السؤال وخيارين على الأقل');
      return;
    }
    setSaving(true);
    const { data: poll, error } = await supabase.from('team_polls').insert({ question: question.trim(), options: opts }).select('id').single();
    if (!error && poll) {
      const { error: e2 } = await supabase.from('team_messages').insert({ poll_id: poll.id });
      if (e2) toast.error(errorMessage(e2));
    } else if (error) toast.error(errorMessage(error));
    setSaving(false);
    setQuestion('');
    setOptions(['', '']);
    onCreated();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md rounded-3xl text-right" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle>استطلاع رأي جديد</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="السؤال" value={question} onChange={(e) => setQuestion(e.target.value)} />
          {options.map((o, i) => (
            <div key={i} className="flex gap-2">
              <Input placeholder={`الخيار ${i + 1}`} value={o} onChange={(e) => setOptions(options.map((x, j) => (j === i ? e.target.value : x)))} />
              {options.length > 2 && (
                <Button variant="ghost" size="icon" onClick={() => setOptions(options.filter((_, j) => j !== i))} aria-label="حذف الخيار">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {options.length < 10 && (
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setOptions([...options, ''])}>
              <Plus className="h-4 w-4" /> خيار
            </Button>
          )}
          <Button className="w-full" onClick={create} disabled={saving}>
            {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            نشر الاستطلاع في القروب
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/** University group chat + private chats. Leads (principal/supervisor) can also open any private conversation. */
export const TeamChat: React.FC<{ me: string; members: TeamMember[]; isLead: boolean }> = ({ me, members, isLead }) => {
  const people = useMemo(() => uniquePeople(members), [members]);
  const nameOf = useCallback((id: string) => people.find((p) => p.user_id === id)?.name ?? 'عضو سابق', [people]);
  const titleOf = useCallback((id: string) => people.find((p) => p.user_id === id)?.title ?? 'عضو سابق', [people]);

  const [conv, setConv] = useState<Conversation>({ kind: 'group' });
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [polls, setPolls] = useState<Record<string, TeamPoll>>({});
  const [votes, setVotes] = useState<TeamPollVote[]>([]);
  const [pairs, setPairs] = useState<{ a: string; b: string; last: string }[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [pollOpen, setPollOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    let q = supabase.from('team_messages').select('*').order('created_at', { ascending: true }).limit(300);
    if (conv.kind === 'group') q = q.is('recipient_id', null);
    else {
      const [a, b] = conv.kind === 'dm' ? [me, conv.with] : [conv.a, conv.b];
      q = q.or(`and(sender_id.eq.${a},recipient_id.eq.${b}),and(sender_id.eq.${b},recipient_id.eq.${a})`);
    }
    const { data } = await q;
    const msgs = data ?? [];
    setMessages(msgs);

    const pollIds = msgs.map((m) => m.poll_id).filter(Boolean) as string[];
    if (pollIds.length) {
      const [{ data: p }, { data: v }] = await Promise.all([
        supabase.from('team_polls').select('*').in('id', pollIds),
        supabase.from('team_poll_votes').select('*').in('poll_id', pollIds),
      ]);
      setPolls(Object.fromEntries((p ?? []).map((x) => [x.id, x])));
      setVotes(v ?? []);
    } else {
      setPolls({});
      setVotes([]);
    }
  }, [conv, me]);

  // Leads: every private pair that has messages
  const loadPairs = useCallback(async () => {
    if (!isLead) return;
    const { data } = await supabase
      .from('team_messages')
      .select('sender_id, recipient_id, created_at')
      .not('recipient_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1000);
    const seen = new Map<string, { a: string; b: string; last: string }>();
    for (const m of data ?? []) {
      const [a, b] = [m.sender_id, m.recipient_id as string].sort();
      if (!seen.has(`${a}:${b}`)) seen.set(`${a}:${b}`, { a, b, last: m.created_at });
    }
    setPairs([...seen.values()]);
  }, [isLead]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadPairs();
  }, [loadPairs]);

  useEffect(() => {
    const channel = supabase
      .channel(`team-chat-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_messages' }, () => {
        load();
        loadPairs();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_poll_votes' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, loadPairs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, conv]);

  const recipient = conv.kind === 'dm' ? conv.with : null;
  const canWrite = conv.kind !== 'pair';

  const send = async (imagePath?: string) => {
    const body = text.trim();
    if (!body && !imagePath) return;
    setSending(true);
    const { error } = await supabase.from('team_messages').insert({
      body: imagePath ? body || null : body,
      image_path: imagePath ?? null,
      recipient_id: recipient,
    });
    setSending(false);
    if (error) toast.error(errorMessage(error));
    else {
      setText('');
      load();
    }
  };

  const sendImage = async (file?: File) => {
    if (!file) return;
    try {
      setSending(true);
      const path = await uploadTeamImage(file);
      await send(path);
    } catch (e) {
      toast.error(errorMessage(e));
      setSending(false);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('team_messages').delete().eq('id', id);
    if (error) toast.error(errorMessage(error));
    else load();
  };

  const title =
    conv.kind === 'group'
      ? 'القروب الجامعي'
      : conv.kind === 'dm'
        ? `محادثة خاصة مع ${nameOf(conv.with)}`
        : `مراقبة: ${nameOf(conv.a)} ↔ ${nameOf(conv.b)}`;

  const navItem = (c: Conversation, label: React.ReactNode, sub?: string) => (
    <button
      key={convKey(c)}
      type="button"
      onClick={() => setConv(c)}
      className={`w-full rounded-xl px-3 py-2 text-right text-sm transition ${
        convKey(c) === convKey(conv) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
      }`}
    >
      <div className="font-semibold">{label}</div>
      {sub && <div className="truncate text-[11px] opacity-75">{sub}</div>}
    </button>
  );

  return (
    <div className="grid min-h-[560px] grid-cols-1 overflow-hidden rounded-3xl border border-border bg-card md:grid-cols-[240px_1fr]">
      <aside className="max-h-64 space-y-1 overflow-y-auto border-b border-border p-2 md:max-h-[640px] md:border-b-0 md:border-l">
        {navItem(
          { kind: 'group' },
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" aria-hidden /> القروب الجامعي
          </span>,
          'كل أعضاء الفريق',
        )}
        <div className="px-3 pb-1 pt-3 text-[11px] font-bold text-muted-foreground">محادثة خاصة</div>
        {people
          .filter((p) => p.user_id !== me)
          .map((p) => navItem({ kind: 'dm', with: p.user_id }, p.name, p.roles.map((r) => ROLE_LABELS[r]).join('، ')))}
        {isLead && pairs.some((p) => p.a !== me && p.b !== me) && (
          <>
            <div className="flex items-center gap-1 px-3 pb-1 pt-3 text-[11px] font-bold text-muted-foreground">
              <Eye className="h-3.5 w-3.5" aria-hidden /> كل المحادثات الخاصة
            </div>
            {pairs
              .filter((p) => p.a !== me && p.b !== me)
              .map((p) => navItem({ kind: 'pair', a: p.a, b: p.b }, `${nameOf(p.a)} ↔ ${nameOf(p.b)}`, formatDate(p.last)))}
          </>
        )}
      </aside>

      <section className="flex min-h-[480px] flex-col">
        <header className="border-b border-border px-4 py-3">
          <h3 className="font-bold">{title}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Lock className="h-3 w-3" aria-hidden />
            محادثات الفريق، العامة والخاصة، مرئية للرئيس والمشرف.
          </p>
        </header>

        <div className="max-h-[520px] flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">لا توجد رسائل بعد</p>}
          {messages.map((m) => {
            const mine = m.sender_id === me;
            const poll = m.poll_id ? polls[m.poll_id] : undefined;
            return (
              <div key={m.id} className={`group flex ${mine ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {!mine && (
                    <div className="mb-0.5 text-[11px] font-bold opacity-80">
                      {titleOf(m.sender_id)}
                      {people.find((p) => p.user_id === m.sender_id)?.hasName && <span className="font-normal opacity-80"> · {nameOf(m.sender_id)}</span>}
                    </div>
                  )}
                  {m.image_path && <TeamImage path={m.image_path} className="mb-1 max-h-64 w-full rounded-xl" />}
                  {poll && (
                    <div className="rounded-xl bg-background p-2 text-foreground">
                      <PollCard poll={poll} votes={votes.filter((v) => v.poll_id === poll.id)} me={me} isLead={isLead} onChanged={load} />
                    </div>
                  )}
                  {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                  <div className="mt-1 flex items-center justify-between gap-3 text-[10px] opacity-70">
                    <span>{formatDate(m.created_at)}</span>
                    {(mine || isLead) && (
                      <button type="button" onClick={() => remove(m.id)} className="opacity-0 transition group-hover:opacity-100" aria-label="حذف الرسالة">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {canWrite ? (
          <footer className="flex items-end gap-2 border-t border-border p-3">
            <Button variant="ghost" size="icon" onClick={() => fileRef.current?.click()} disabled={sending} aria-label="إرسال صورة">
              <ImagePlus className="h-5 w-5" />
            </Button>
            {conv.kind === 'group' && (
              <Button variant="ghost" size="icon" onClick={() => setPollOpen(true)} aria-label="استطلاع رأي">
                <BarChart3 className="h-5 w-5" />
              </Button>
            )}
            <Textarea
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="اكتب رسالة…"
              className="min-h-10 flex-1 resize-none"
            />
            <Button size="icon" onClick={() => send()} disabled={sending || !text.trim()} aria-label="إرسال">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => sendImage(e.target.files?.[0])} />
          </footer>
        ) : (
          <footer className="border-t border-border p-3 text-center text-xs text-muted-foreground">وضع المراقبة: القراءة فقط</footer>
        )}
      </section>
      <NewPollDialog open={pollOpen} onClose={() => setPollOpen(false)} onCreated={load} />
    </div>
  );
};
