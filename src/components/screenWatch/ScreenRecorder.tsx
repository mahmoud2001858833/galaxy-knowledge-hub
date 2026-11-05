import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

/**
 * Records what team members and terminal users (never the principal) do on the platform pages,
 * so the principal can watch live or later in /admin?tab=terminal → «مراقبة الشاشة».
 *
 * rrweb records the page's DOM, not the device screen: nothing outside this tab is seen, and
 * password fields are masked. screen_watch_applies() decides who is recorded; the rows are readable
 * only by the principal (RLS). The person always sees a notice that recording is on.
 */

const FLUSH_MS = 2000;
const FULL_SNAPSHOT_EVERY_MS = 60_000; // lets a live viewer join at most a minute back
const MAX_CHUNK_CHARS = 1_500_000;

type RrEvent = { type: number; timestamp: number; data: unknown };

export const ScreenRecorder: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    let stop: (() => void) | null = null;
    let userId: string | null = null;
    let cancelled = false;

    const end = () => {
      stop?.();
      stop = null;
      setRecording(false);
    };

    const begin = async (uid: string, email: string | null) => {
      if (userId === uid && stop) return;
      end();
      userId = uid;
      const { data: applies } = await supabase.rpc('screen_watch_applies');
      if (cancelled || applies !== true || userId !== uid) return;

      const sessionId = crypto.randomUUID();
      const { error } = await supabase.from('screen_watch_sessions').insert({
        id: sessionId,
        email,
        user_agent: navigator.userAgent.slice(0, 400),
        width: window.innerWidth,
        height: window.innerHeight,
        last_path: location.pathname.slice(0, 500),
      });
      if (error || cancelled || userId !== uid) return;

      const { record } = await import('rrweb');
      if (cancelled || userId !== uid) return;

      let buffer: RrEvent[] = [];
      let seq = 0;
      let sending = Promise.resolve();
      let failed = false;

      const flush = () => {
        if (!buffer.length || failed) return;
        const events = buffer;
        buffer = [];
        // a full snapshot can be large: send it on its own, the rest in slices
        const chunks: RrEvent[][] = [];
        let cur: RrEvent[] = [];
        let size = 0;
        for (const e of events) {
          const n = JSON.stringify(e).length;
          if (cur.length && size + n > MAX_CHUNK_CHARS) {
            chunks.push(cur);
            cur = [];
            size = 0;
          }
          cur.push(e);
          size += n;
        }
        if (cur.length) chunks.push(cur);
        for (const c of chunks) {
          const row = {
            session_id: sessionId,
            seq: seq++,
            has_full_snapshot: c.some((e) => e.type === 2),
            path: location.pathname.slice(0, 500),
            events: c as unknown as Json,
          };
          sending = sending.then(async () => {
            if (failed) return;
            const { error: e } = await supabase.from('screen_watch_chunks').insert(row);
            // access revoked or signed out: stop recording
            if (e) {
              failed = true;
              end();
            }
          });
        }
      };

      const stopRecord = record({
        emit: (e) => {
          buffer.push(e as RrEvent);
        },
        checkoutEveryNms: FULL_SNAPSHOT_EVERY_MS,
        maskAllInputs: false,
        maskInputOptions: { password: true },
        sampling: { mousemove: 100, scroll: 150, input: 'last' },
        blockClass: 'rr-block',
        recordCanvas: false,
        collectFonts: false,
        inlineImages: false,
      });
      const timer = window.setInterval(flush, FLUSH_MS);
      const onHide = () => document.visibilityState === 'hidden' && flush();
      document.addEventListener('visibilitychange', onHide);
      window.addEventListener('pagehide', flush);
      stop = () => {
        stopRecord?.();
        window.clearInterval(timer);
        document.removeEventListener('visibilitychange', onHide);
        window.removeEventListener('pagehide', flush);
        flush();
      };
      setRecording(true);
      setExpanded(true);
    };

    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) begin(u.id, u.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      // defer: Supabase calls this inside its auth lock
      setTimeout(() => {
        if (!u) {
          userId = null;
          end();
        } else if (u.id !== userId) begin(u.id, u.email ?? null);
      }, 0);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      end();
    };
  }, []);

  useEffect(() => {
    if (!recording || !expanded) return;
    const t = window.setTimeout(() => setExpanded(false), 12_000);
    return () => window.clearTimeout(t);
  }, [recording, expanded]);

  if (!recording) return null;
  return (
    <button
      type="button"
      dir="rtl"
      onClick={() => setExpanded((v) => !v)}
      title="نشاطك على صفحات المنصة مسجَّل ويطّلع عليه المسؤول"
      className="fixed bottom-3 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-md backdrop-blur"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
      </span>
      <Eye className="h-3.5 w-3.5" aria-hidden />
      {expanded ? 'نشاطك على صفحات المنصة مسجَّل ويطّلع عليه المسؤول' : 'مسجَّل'}
    </button>
  );
};

export default ScreenRecorder;
