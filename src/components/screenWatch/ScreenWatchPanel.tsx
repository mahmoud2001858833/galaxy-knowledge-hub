import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Eye, Loader2, Pause, Play, Radio, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import 'rrweb/dist/style.css';

/**
 * Principal only: watch what team members and terminal users do on the platform (recorded by
 * ScreenRecorder). A session that sent something in the last 15 s is live and plays as it happens
 * (about 5 s behind); any session can be replayed from its start.
 */

type Session = Tables<'screen_watch_sessions'>;
type RrEvent = { type: number; timestamp: number; data: unknown };
type Replayer = InstanceType<typeof import('rrweb').Replayer>;

const LIVE_MS = 15_000;
const LIVE_DELAY_MS = 5_000;
const PAGE = 40; // chunks per request

const isLive = (s: Session, now: number) => now - Date.parse(s.last_event_at) < LIVE_MS;
const fmtTime = (iso: string) => new Date(iso).toLocaleString('ar-JO', { dateStyle: 'short', timeStyle: 'short' });
const fmtDur = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}س ${m}د` : `${m}:${String(s % 60).padStart(2, '0')}`;
};

const useNow = (ms: number) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(t);
  }, [ms]);
  return now;
};

async function loadChunks(sessionId: string, fromSeq: number) {
  const out: Tables<'screen_watch_chunks'>[] = [];
  for (let from = fromSeq; ; ) {
    const { data, error } = await supabase
      .from('screen_watch_chunks')
      .select('*')
      .eq('session_id', sessionId)
      .gte('seq', from)
      .order('seq')
      .limit(PAGE);
    if (error) throw error;
    out.push(...(data ?? []));
    if (!data || data.length < PAGE) return out;
    from = data[data.length - 1].seq + 1;
  }
}

/** Plays one session: live from its latest full snapshot, or from the start. */
const Player: React.FC<{ session: Session; live: boolean }> = ({ session, live }) => {
  const frame = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const player = useRef<Replayer | null>(null);
  const [mode, setMode] = useState<'live' | 'replay'>(live ? 'live' : 'replay');
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [total, setTotal] = useState(0);
  const [at, setAt] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [size, setSize] = useState({ w: session.width ?? 1280, h: session.height ?? 800 });
  const [scale, setScale] = useState(0.5);
  const [path, setPath] = useState(session.last_path);

  useEffect(() => setMode(live ? 'live' : 'replay'), [session.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // fit the recorded viewport into the panel
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
    let channel: ReturnType<typeof supabase.channel> | null = null;
    setLoading(true);
    setFailed(null);
    setPlaying(false);
    setAt(0);
    setTotal(0);

    (async () => {
      try {
        const { Replayer } = await import('rrweb');
        let from = 0;
        if (mode === 'live') {
          const { data } = await supabase
            .from('screen_watch_chunks')
            .select('seq')
            .eq('session_id', session.id)
            .eq('has_full_snapshot', true)
            .order('seq', { ascending: false })
            .limit(1);
          from = data?.[0]?.seq ?? 0;
        }
        const chunks = await loadChunks(session.id, from);
        if (disposed) return;
        const events = chunks.flatMap((c) => c.events as unknown as RrEvent[]);
        if (events.length < 2) {
          setFailed('لا توجد تسجيلات كافية لهذه الجلسة بعد.');
          setLoading(false);
          return;
        }
        if (stage.current) stage.current.innerHTML = '';
        const r = new Replayer(mode === 'live' ? [] : (events as never), {
          root: stage.current!,
          liveMode: mode === 'live',
          showWarning: false,
          mouseTail: false,
          skipInactive: mode === 'replay',
          UNSAFE_replayCanvas: false,
        });
        player.current = r;
        r.on('resize', (d) => {
          const { width, height } = d as { width: number; height: number };
          if (width && height) setSize({ w: width, h: height });
        });
        r.on('finish', () => setPlaying(false));

        if (mode === 'live') {
          // the recorder's clock may differ from ours: estimate it from the newest chunk
          const last = chunks[chunks.length - 1];
          const lastTs = Math.max(...(last.events as unknown as RrEvent[]).map((e) => e.timestamp));
          const skew = lastTs - Date.parse(last.created_at);
          r.startLive(Date.now() + skew - LIVE_DELAY_MS);
          events.forEach((e) => r.addEvent(e as never));
          setPlaying(true);
          let nextSeq = last.seq + 1;
          channel = supabase
            .channel(`screen-watch-${session.id}-${Math.random().toString(36).slice(2)}`)
            .on(
              'postgres_changes',
              { event: 'INSERT', schema: 'public', table: 'screen_watch_chunks', filter: `session_id=eq.${session.id}` },
              ({ new: row }) => {
                const c = row as Tables<'screen_watch_chunks'>;
                if (c.seq < nextSeq) return;
                nextSeq = c.seq + 1;
                if (c.path) setPath(c.path);
                (c.events as unknown as RrEvent[]).forEach((e) => player.current?.addEvent(e as never));
              },
            )
            .subscribe();
        } else {
          setTotal(r.getMetaData().totalTime);
          r.play();
          setPlaying(true);
        }
        setLoading(false);
      } catch (e) {
        if (!disposed) {
          setFailed((e as Error).message);
          setLoading(false);
        }
      }
    })();

    return () => {
      disposed = true;
      if (channel) supabase.removeChannel(channel);
      player.current?.destroy();
      player.current = null;
    };
  }, [session.id, mode]);

  // progress for replays
  useEffect(() => {
    if (mode !== 'replay' || !playing) return;
    const t = window.setInterval(() => setAt(player.current?.getCurrentTime() ?? 0), 250);
    return () => window.clearInterval(t);
  }, [mode, playing]);

  const toggle = () => {
    const r = player.current;
    if (!r) return;
    if (playing) {
      r.pause();
      setPlaying(false);
    } else {
      r.play(at >= total ? 0 : at);
      setPlaying(true);
    }
  };
  const seek = (ms: number) => {
    setAt(ms);
    if (playing) player.current?.play(ms);
    else player.current?.pause(ms);
  };
  const changeSpeed = (s: number) => {
    setSpeed(s);
    player.current?.setConfig({ speed: s });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {live && (
          <Button size="sm" variant={mode === 'live' ? 'default' : 'outline'} className="gap-1.5" onClick={() => setMode('live')}>
            <Radio className="h-3.5 w-3.5" /> مباشر
          </Button>
        )}
        <Button size="sm" variant={mode === 'replay' ? 'default' : 'outline'} className="gap-1.5" onClick={() => setMode('replay')}>
          <RotateCcw className="h-3.5 w-3.5" /> من البداية
        </Button>
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
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {failed && <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-muted-foreground">{failed}</div>}
      </div>

      {mode === 'replay' && !loading && !failed && (
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <Button size="icon" variant="outline" className="h-8 w-8" onClick={toggle} aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <input
            type="range"
            min={0}
            max={total}
            value={Math.min(at, total)}
            onChange={(e) => seek(Number(e.target.value))}
            className="min-w-40 flex-1 accent-primary"
            dir="ltr"
            aria-label="موضع التشغيل"
          />
          <span className="tabular-nums text-muted-foreground" dir="ltr">
            {fmtDur(at)} / {fmtDur(total)}
          </span>
          {[1, 2, 4, 8].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => changeSpeed(s)}
              className={`rounded-full px-2 py-0.5 font-semibold ${speed === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
            >
              {s}×
            </button>
          ))}
        </div>
      )}
      {mode === 'live' && !loading && !failed && <p className="text-xs text-muted-foreground">يُعرض كما يحدث، متأخراً نحو 5 ثوانٍ.</p>}
    </div>
  );
};

export const ScreenWatchPanel: React.FC<{ names?: Record<string, string> }> = ({ names = {} }) => {
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [days, setDays] = useState(3);
  const now = useNow(5000);

  const reload = useCallback(async () => {
    const since = new Date(Date.now() - days * 86400_000).toISOString();
    const { data, error } = await supabase
      .from('screen_watch_sessions')
      .select('*')
      .gte('last_event_at', since)
      .order('last_event_at', { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    setSessions(data ?? []);
  }, [days]);

  useEffect(() => {
    reload();
    const ch = supabase
      .channel(`screen-watch-sessions-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'screen_watch_sessions' }, ({ eventType, new: row, old }) => {
        setSessions((cur) => {
          if (!cur) return cur;
          if (eventType === 'DELETE') return cur.filter((s) => s.id !== (old as Session).id);
          const s = row as Session;
          return [s, ...cur.filter((x) => x.id !== s.id)].sort((a, b) => Date.parse(b.last_event_at) - Date.parse(a.last_event_at));
        });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [reload]);

  const current = useMemo(() => sessions?.find((s) => s.id === selected) ?? null, [sessions, selected]);
  // keep "live" stable while watching, so the player does not restart on every chunk
  const currentLive = current ? isLive(current, now) : false;

  const remove = async (s: Session) => {
    if (!window.confirm(`حذف تسجيل ${s.email ?? ''}؟ لا يمكن التراجع.`)) return;
    const { error } = await supabase.from('screen_watch_sessions').delete().eq('id', s.id);
    if (error) return toast.error(error.message);
    if (selected === s.id) setSelected(null);
    setSessions((cur) => cur?.filter((x) => x.id !== s.id) ?? cur);
  };

  const liveCount = sessions?.filter((s) => isLive(s, now)).length ?? 0;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-muted/50 p-4 text-sm">
        <Eye className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <div className="font-bold">ما يفعله الموظفون ومستخدمو الطرفية على المنصة</div>
          <div className="text-xs text-muted-foreground">
            يُسجَّل محتوى صفحات المنصة فقط (لا شاشة الجهاز كاملة)، وتُخفى كلمات المرور. يرى الموظف شارة «مسجَّل» أثناء التسجيل. أنت وحدك ترى التسجيلات.
          </div>
        </div>
        <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">{liveCount} مباشر الآن</span>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="h-8 rounded-lg border border-border bg-background px-2 text-xs"
          aria-label="المدة"
        >
          <option value={1}>آخر يوم</option>
          <option value={3}>آخر 3 أيام</option>
          <option value={7}>آخر أسبوع</option>
          <option value={30}>آخر شهر</option>
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
        <div className="max-h-[70vh] space-y-1.5 overflow-y-auto">
          {sessions === null ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد جلسات مسجلة في هذه المدة.</p>
          ) : (
            sessions.map((s) => {
              const live = isLive(s, now);
              return (
                <div
                  key={s.id}
                  className={`group flex items-start gap-2 rounded-xl border p-2.5 text-xs transition ${
                    selected === s.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <button type="button" onClick={() => setSelected(s.id)} className="min-w-0 flex-1 text-start">
                    <div className="flex items-center gap-1.5 font-bold">
                      {live && <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-destructive" />}
                      <span className="truncate">{names[s.user_id] || s.email || s.user_id.slice(0, 8)}</span>
                    </div>
                    <div className="truncate text-muted-foreground" dir="ltr">
                      {s.last_path}
                    </div>
                    <div className="text-muted-foreground">
                      {fmtTime(s.started_at)} · {fmtDur(Date.parse(s.last_event_at) - Date.parse(s.started_at))}
                      {live ? ' · مباشر' : ''}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(s)}
                    className="rounded-md p-1 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
                    aria-label="حذف التسجيل"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
        <div className="min-w-0 rounded-2xl border border-border bg-card p-3">
          {current ? (
            <Player key={current.id} session={current} live={currentLive} />
          ) : (
            <p className="p-8 text-center text-sm text-muted-foreground">اختر جلسة لمشاهدتها.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenWatchPanel;
