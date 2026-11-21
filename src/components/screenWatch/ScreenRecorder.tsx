import React, { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LOBBY_TOPIC, PART_CHARS, SEND_MS, userTopic, type LobbyPresence, type StreamPart, type ViewerPresence } from './liveWatch';

/**
 * Live-only screen watch for team members and terminal users (never the principal).
 *
 * Nothing is stored. The person announces themselves in a private presence lobby; rrweb starts only
 * while the principal is actually watching this tab, and its events go straight to the viewer over a
 * private Realtime broadcast channel. When the viewer leaves, recording stops and nothing remains.
 * rrweb captures the page's DOM, not the device screen, and password fields are masked.
 */

type RrEvent = { type: number; timestamp: number; data: unknown };
type RecordFn = typeof import('rrweb').record;

export const ScreenRecorder: React.FC = () => {
  const [watched, setWatched] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    let teardown: (() => void) | null = null;
    let userId: string | null = null;
    let cancelled = false;

    const end = () => {
      teardown?.();
      teardown = null;
      setWatched(false);
    };

    const begin = async (uid: string) => {
      if (userId === uid && teardown) return;
      end();
      userId = uid;
      const { data: applies } = await supabase.rpc('screen_watch_applies');
      if (cancelled || applies !== true || userId !== uid) return;

      const sid = crypto.randomUUID();
      const startedAt = new Date().toISOString();
      let record: RecordFn | null = null;
      let stopRecord: (() => void) | undefined;
      let starting = false;
      let buffer: RrEvent[] = [];
      let msg = 0;
      let viewers = 0;
      let timer: number | undefined;

      // my own stream channel: the viewer announces itself here with presence
      const stream = supabase.channel(userTopic(uid), { config: { private: true, broadcast: { self: false, ack: false } } });

      const send = () => {
        if (!buffer.length) return;
        const text = JSON.stringify(buffer);
        buffer = [];
        const id = msg++;
        const n = Math.max(1, Math.ceil(text.length / PART_CHARS));
        for (let i = 0; i < n; i++) {
          const payload: StreamPart = {
            sid,
            id,
            i,
            n,
            d: text.slice(i * PART_CHARS, (i + 1) * PART_CHARS),
            path: location.pathname.slice(0, 300),
            w: window.innerWidth,
            h: window.innerHeight,
          };
          void stream.send({ type: 'broadcast', event: 'ev', payload });
        }
      };

      const stopRecording = () => {
        stopRecord?.();
        stopRecord = undefined;
        if (timer) window.clearInterval(timer);
        timer = undefined;
        buffer = [];
        setWatched(false);
      };

      const startRecording = async () => {
        if (stopRecord) {
          // another viewer joined: give everyone a fresh full picture
          record?.takeFullSnapshot(true);
          return;
        }
        if (starting) return;
        starting = true;
        try {
          record ??= (await import('rrweb')).record;
        } finally {
          starting = false;
        }
        if (cancelled || userId !== uid || viewers === 0 || stopRecord) return;
        buffer = [];
        stopRecord = record({
          emit: (e) => {
            buffer.push(e as RrEvent);
          },
          maskAllInputs: false,
          maskInputOptions: { password: true },
          sampling: { mousemove: 50, scroll: 100, input: 'last' },
          blockClass: 'rr-block',
          recordCanvas: false,
          collectFonts: false,
          inlineImages: false,
        });
        send(); // the first full snapshot goes out at once
        timer = window.setInterval(send, SEND_MS);
        setWatched(true);
        setExpanded(true);
      };

      stream.on('presence', { event: 'sync' }, () => {
        const state = stream.presenceState<ViewerPresence>();
        const n = Object.values(state).flat().filter((p) => p.viewer && p.sid === sid).length;
        const before = viewers;
        viewers = n;
        if (n > before) void startRecording();
        else if (n === 0 && before > 0) stopRecording();
      });
      stream.subscribe();

      // the lobby: the principal sees who is on the platform right now (no page contents here)
      const lobby = supabase.channel(LOBBY_TOPIC, { config: { private: true, presence: { key: sid } } });
      lobby.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          const me: LobbyPresence = { sid, uid, at: startedAt };
          void lobby.track(me);
        }
      });

      teardown = () => {
        stopRecording();
        void supabase.removeChannel(stream);
        void supabase.removeChannel(lobby);
      };
    };

    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) void begin(u.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      // defer: Supabase calls this inside its auth lock
      setTimeout(() => {
        if (!u) {
          userId = null;
          end();
        } else if (u.id !== userId) void begin(u.id);
      }, 0);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      end();
    };
  }, []);

  useEffect(() => {
    if (!watched || !expanded) return;
    const t = window.setTimeout(() => setExpanded(false), 12_000);
    return () => window.clearTimeout(t);
  }, [watched, expanded]);

  if (!watched) return null;
  return (
    <button
      type="button"
      dir="rtl"
      onClick={() => setExpanded((v) => !v)}
      title="المسؤول يشاهد نشاطك على صفحات المنصة الآن (بث مباشر، لا يُحفظ)"
      className="fixed bottom-3 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-md backdrop-blur"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
      </span>
      <Eye className="h-3.5 w-3.5" aria-hidden />
      {expanded ? 'المسؤول يشاهد نشاطك على المنصة الآن (مباشر، لا يُحفظ)' : 'مباشر'}
    </button>
  );
};

export default ScreenRecorder;
