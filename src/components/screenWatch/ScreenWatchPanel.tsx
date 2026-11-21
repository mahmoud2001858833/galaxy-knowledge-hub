import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, Loader2, Radio } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LOBBY_TOPIC, userTopic, type LobbyPresence, type StreamPart, type ViewerPresence } from './liveWatch';
import 'rrweb/dist/style.css';

/**
 * Principal only: watch live what team members and terminal users do on the platform pages.
 * Live only — nothing is recorded or kept. The person's tab starts streaming when you open it here
 * and stops the moment you leave (see ScreenRecorder).
 */

type RrEvent = { type: number; timestamp: number; data: unknown };
type Replayer = InstanceType<typeof import('rrweb').Replayer>;

const LIVE_DELAY_MS = 400; // small cushion so events play smoothly
const META = 4; // rrweb EventType.Meta: starts every full picture

const fmtSince = (iso: string, now: number) => {
  const m = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  return m < 1 ? 'الآن' : m < 60 ? `منذ ${m} د` : `منذ ${Math.floor(m / 60)} س ${m % 60} د`;
};

const useNow = (ms: number) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(t);
  }, [ms]);
  return now;
};

/** Watches one tab live: joins the person's stream channel and plays what arrives. */
const LivePlayer: React.FC<{ target: LobbyPresence; online: boolean }> = ({ target, online }) => {
  const frame = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'connecting' | 'live' | 'error'>('connecting');
  const [size, setSize] = useState({ w: 1280, h: 800 });
  const [scale, setScale] = useState(0.5);
  const [path, setPath] = useState('');

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const fit = () => setScale(Math.min(1, el.clientWidth / size.w));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size.w]);

  useEffect(() => {
    let disposed = false;
    let player: Replayer | null = null;
    let ReplayerCls: typeof import('rrweb').Replayer | null = null;
    const pending = new Map<number, string[]>();
    let queue: RrEvent[] = [];
    setState('connecting');
    if (stage.current) stage.current.innerHTML = '';

    const play = (events: RrEvent[]) => {
      if (!ReplayerCls || !stage.current) {
        queue.push(...events);
        return;
      }
      if (!player) {
        // wait for the start of a full picture
        const start = events.findIndex((e) => e.type === META);
        if (start < 0) return;
        events = events.slice(start);
        player = new ReplayerCls([], {
          root: stage.current,
          liveMode: true,
          showWarning: false,
          mouseTail: false,
          UNSAFE_replayCanvas: false,
        });
        player.on('resize', (d) => {
          const { width, height } = d as { width: number; height: number };
          if (width && height) setSize({ w: width, h: height });
        });
        player.startLive(events[0].timestamp - LIVE_DELAY_MS);
        setState('live');
      }
      for (const e of events) player.addEvent(e as never);
    };

    const channel = supabase.channel(userTopic(target.uid), { config: { private: true, presence: { key: `viewer-${crypto.randomUUID()}` } } });
    channel.on('broadcast', { event: 'ev' }, ({ payload }) => {
      const p = payload as StreamPart;
      if (p.sid !== target.sid || disposed) return;
      const parts = pending.get(p.id) ?? new Array<string>(p.n);
      parts[p.i] = p.d;
      pending.set(p.id, parts);
      if (parts.filter((x) => x !== undefined).length < p.n) return;
      pending.delete(p.id);
      setPath(p.path);
      if (p.w && p.h) setSize((s) => (s.w === p.w && s.h === p.h ? s : { w: p.w, h: p.h }));
      try {
        play(JSON.parse(parts.join('')) as RrEvent[]);
      } catch {
        /* a broken batch: the next full picture repairs the view */
      }
    });
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        const me: ViewerPresence = { viewer: true, sid: target.sid };
        void channel.track(me);
      } else if (status === 'CHANNEL_ERROR' && !disposed) setState('error');
    });

    import('rrweb')
      .then(({ Replayer }) => {
        if (disposed) return;
        ReplayerCls = Replayer;
        const early = queue;
        queue = [];
        if (early.length) play(early);
      })
      .catch(() => !disposed && setState('error'));

    return () => {
      disposed = true;
      void supabase.removeChannel(channel); // leaving stops the person's recording
      player?.destroy();
    };
  }, [target.sid, target.uid]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 font-bold text-destructive">
          <Radio className="h-3.5 w-3.5" /> مباشر
        </span>
        <span className="mr-auto truncate text-muted-foreground" dir="ltr">
          {path}
        </span>
      </div>
      <div ref={frame} className="relative overflow-hidden rounded-2xl border border-border bg-muted" style={{ height: size.h * scale }}>
        <div
          ref={stage}
          className="rr-stage absolute right-0 top-0 origin-top-right"
          style={{ width: size.w, height: size.h, transform: `scale(${scale})` }}
          dir="ltr"
        />
        {(state !== 'live' || !online) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 p-6 text-center text-sm text-muted-foreground">
            {!online ? (
              'غادر هذا الشخص المنصة، وانتهى البث.'
            ) : state === 'error' ? (
              'تعذّر الاتصال بالبث المباشر. حدّث الصفحة وحاول مجدداً.'
            ) : (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                جارٍ الاتصال بشاشته…
              </>
            )}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">بث مباشر فقط: لا يُسجَّل ولا يُحفظ شيء، ويتوقف فور مغادرتك.</p>
    </div>
  );
};

export const ScreenWatchPanel: React.FC<{ names?: Record<string, string> }> = ({ names = {} }) => {
  const [people, setPeople] = useState<LobbyPresence[] | null>(null);
  const [selected, setSelected] = useState<LobbyPresence | null>(null);
  const now = useNow(30_000);

  useEffect(() => {
    const lobby = supabase.channel(LOBBY_TOPIC, { config: { private: true } });
    const sync = () => {
      const list = Object.values(lobby.presenceState<LobbyPresence>())
        .flat()
        .filter((p) => p.sid && p.uid)
        .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
      setPeople(list);
    };
    lobby.on('presence', { event: 'sync' }, sync);
    lobby.subscribe((status) => {
      if (status === 'SUBSCRIBED') sync();
      if (status === 'CHANNEL_ERROR') setPeople([]);
    });
    return () => {
      void supabase.removeChannel(lobby);
    };
  }, []);

  const online = useMemo(() => !!selected && !!people?.some((p) => p.sid === selected.sid), [people, selected]);
  const nameOf = (uid: string) => names[uid] || uid.slice(0, 8);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-muted/50 p-4 text-sm">
        <Eye className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <div className="font-bold">شاهد مباشرة ما يفعله الموظفون ومستخدمو الطرفية على المنصة</div>
          <div className="text-xs text-muted-foreground">
            بث مباشر فقط، لا يُحفظ أي تسجيل. يبدأ عندما تفتح شخصاً ويتوقف فور مغادرتك. يُعرض محتوى صفحات المنصة فقط، وتُخفى كلمات المرور، ويرى الشخص شارة «مباشر» أثناء المشاهدة.
          </div>
        </div>
        <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">{people?.length ?? 0} على المنصة الآن</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
        <div className="max-h-[70vh] space-y-1.5 overflow-y-auto">
          {people === null ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : people.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا أحد من الموظفين على المنصة الآن.</p>
          ) : (
            people.map((p) => (
              <button
                key={p.sid}
                type="button"
                onClick={() => setSelected(p)}
                className={`flex w-full items-center gap-2 rounded-xl border p-2.5 text-start text-xs transition ${
                  selected?.sid === p.sid ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-destructive" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{nameOf(p.uid)}</span>
                  <span className="text-muted-foreground">دخل {fmtSince(p.at, now)}</span>
                </span>
              </button>
            ))
          )}
        </div>
        <div className="min-w-0 rounded-2xl border border-border bg-card p-3">
          {selected ? (
            <LivePlayer key={selected.sid} target={selected} online={online} />
          ) : (
            <p className="p-8 text-center text-sm text-muted-foreground">اختر شخصاً لمشاهدته مباشرة.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenWatchPanel;
