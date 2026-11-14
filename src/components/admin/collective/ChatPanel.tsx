import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, Check, Copy, Loader2, Mic, MicOff, RotateCcw, Send, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSpeech } from './useSpeech';
import type { PendingAction } from './collectiveApi';

/**
 * One clean chat box for the admin's AI (Central Task AI and "describe the task").
 * Markdown replies, a growing composer for long pasted specs (Enter sends, Shift+Enter = new line),
 * voice input, and confirmation cards: nothing that emails people runs before the admin confirms.
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  time?: string;
  pending?: PendingAction[];
  resolved?: boolean;
}

interface Props {
  title: string;
  subtitle?: string;
  messages: ChatMessage[];
  busy: boolean;
  onSend: (text: string) => void;
  onConfirm?: (index: number, action: PendingAction | null) => void;
  onReset?: () => void;
  suggestions?: string[];
  placeholder?: string;
  /** height of the message list, e.g. "h-[420px]" */
  listHeight?: string;
  footer?: React.ReactNode;
}

export function ChatPanel({
  title, subtitle, messages, busy, onSend, onConfirm, onReset, suggestions = [], placeholder, listHeight = 'h-[420px]', footer,
}: Props) {
  const [text, setText] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const addSpoken = useCallback((t: string) => setText((x) => (x ? `${x} ${t}` : t)), []);
  const speech = useSpeech(addSpoken);

  // keep the newest message in view
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, busy]);

  // grow the composer with its content (up to ~12 lines)
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 280)}px`;
  }, [text]);

  const send = (value = text) => {
    const v = value.trim();
    if (!v || busy) return;
    if (speech.listening) speech.toggle();
    onSend(v);
    setText('');
  };

  const onlyGreeting = messages.filter((m) => m.role === 'user').length === 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card" dir="rtl">
      {/* header */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-bold text-foreground">{title}</div>
            {subtitle && <div className="truncate text-xs text-muted-foreground">{subtitle}</div>}
          </div>
        </div>
        {onReset && messages.length > 1 && (
          <Button variant="ghost" size="sm" onClick={onReset} disabled={busy} title="محادثة جديدة">
            <RotateCcw className="ml-1 h-4 w-4" /> جديدة
          </Button>
        )}
      </div>

      {/* messages */}
      <div ref={listRef} className={cn('space-y-4 overflow-y-auto px-4 py-4', listHeight)}>
        {messages.map((m, i) => (
          <MessageRow key={i} m={m} index={i} busy={busy} onConfirm={onConfirm} />
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary"><Bot className="h-4 w-4" /></div>
            <span className="inline-flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
            </span>
            يفكّر…
          </div>
        )}
        {onlyGreeting && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {suggestions.map((s) => (
              <button key={s} type="button" onClick={() => send(s)} disabled={busy}
                className="rounded-full border border-border px-3 py-1.5 text-right text-xs text-foreground transition hover:border-primary hover:bg-primary/5">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* composer */}
      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2 rounded-xl border border-input bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring">
          <textarea
            ref={boxRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); }
            }}
            placeholder={placeholder ?? 'اكتب رسالتك… (Shift+Enter لسطر جديد)'}
            className="max-h-[280px] min-h-[40px] flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-7 text-foreground outline-none placeholder:text-muted-foreground"
          />
          {speech.supported && (
            <Button type="button" size="icon" variant={speech.listening ? 'destructive' : 'ghost'} className="shrink-0"
              onClick={speech.toggle} title={speech.listening ? 'أوقف التسجيل' : 'احكِ بدل الكتابة'}>
              {speech.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          )}
          <Button type="button" size="icon" className="shrink-0" onClick={() => send()} disabled={busy || !text.trim()} title="أرسل">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 -scale-x-100" />}
          </Button>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2 px-1 text-[11px] text-muted-foreground">
          <span>{speech.listening ? '🎙️ عم بسمعك… احكِ وبعدين أرسل' : 'Enter للإرسال · Shift+Enter لسطر جديد · تقدر تلصق مواصفات كاملة'}</span>
          {text.length > 400 && <span>{text.length.toLocaleString('ar')} حرف</span>}
        </div>
        {footer}
      </div>
    </div>
  );
}

// Markdown styling with design tokens (the project has no typography plugin).
const MD = {
  p: (p: React.HTMLAttributes<HTMLParagraphElement>) => <p className="my-1.5" {...p} />,
  ul: (p: React.HTMLAttributes<HTMLUListElement>) => <ul className="my-1.5 list-disc space-y-0.5 pr-5" {...p} />,
  ol: (p: React.HTMLAttributes<HTMLOListElement>) => <ol className="my-1.5 list-decimal space-y-0.5 pr-5" {...p} />,
  li: (p: React.LiHTMLAttributes<HTMLLIElement>) => <li className="leading-7" {...p} />,
  strong: (p: React.HTMLAttributes<HTMLElement>) => <strong className="font-bold text-foreground" {...p} />,
  h1: (p: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="mb-1.5 mt-3 text-base font-bold" {...p} />,
  h2: (p: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className="mb-1.5 mt-3 text-base font-bold" {...p} />,
  h3: (p: React.HTMLAttributes<HTMLHeadingElement>) => <h4 className="mb-1 mt-3 text-sm font-bold" {...p} />,
  h4: (p: React.HTMLAttributes<HTMLHeadingElement>) => <h4 className="mb-1 mt-2 text-sm font-bold" {...p} />,
  a: (p: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a className="text-primary underline" target="_blank" rel="noreferrer" {...p} />,
  code: (p: React.HTMLAttributes<HTMLElement>) => <code className="rounded bg-muted px-1 py-0.5 text-xs" dir="ltr" {...p} />,
  hr: () => <hr className="my-3 border-border" />,
};

function MessageRow({ m, index, busy, onConfirm }: {
  m: ChatMessage; index: number; busy: boolean; onConfirm?: (i: number, p: PendingAction | null) => void;
}) {
  const [copied, setCopied] = useState(false);
  const mine = m.role === 'user';
  const copy = async () => {
    try { await navigator.clipboard.writeText(m.content); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };
  return (
    <div className={cn('flex gap-2', mine ? 'flex-row-reverse' : 'flex-row')}>
      <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
        mine ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary')}>
        {mine ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn('group max-w-[85%] space-y-2', mine && 'items-end')}>
        <div className={cn('rounded-2xl px-4 py-2.5 text-sm leading-7',
          mine ? 'rounded-tl-sm bg-primary text-primary-foreground' : 'rounded-tr-sm border border-border bg-background text-foreground')}>
          {mine ? (
            <div className="whitespace-pre-wrap break-words">
              {m.content.length > 1200 ? `${m.content.slice(0, 1200)}…\n\n(${m.content.length.toLocaleString('ar')} حرف)` : m.content}
            </div>
          ) : (
            <div className="break-words">
              <ReactMarkdown components={MD}>{m.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {m.pending && m.pending.length > 0 && onConfirm && (
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> يحتاج تأكيدك
            </div>
            {m.resolved ? (
              <div className="text-xs text-muted-foreground">تم الرد على هذا الطلب.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {m.pending.map((p, k) => (
                  <Button key={k} size="sm" onClick={() => onConfirm(index, p)} disabled={busy}>
                    <Check className="ml-1 h-4 w-4" /> {p.label}
                  </Button>
                ))}
                <Button size="sm" variant="outline" onClick={() => onConfirm(index, null)} disabled={busy}>لا، إلغاء</Button>
              </div>
            )}
          </div>
        )}

        <div className={cn('flex items-center gap-2 px-1 text-[11px] text-muted-foreground', mine && 'flex-row-reverse')}>
          {m.time && <span>{m.time}</span>}
          {!mine && (
            <button type="button" onClick={copy} className="opacity-0 transition group-hover:opacity-100" title="نسخ">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
