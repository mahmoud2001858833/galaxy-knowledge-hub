import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { FaceLandmarker, HandLandmarker } from '@mediapipe/tasks-vision';
import {
  Bone,
  Camera,
  Hand,
  ImageUp,
  Loader2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  ScanFace,
  ShieldCheck,
  SwitchCamera,
  VideoOff,
} from 'lucide-react';
import { PageHeader, PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ANATOMY_MIRROR, ANATOMY_PARTS, type AnatomyPartId } from '@/config/anatomyMirror';
import { drawFace, drawHand, drawLabels, smooth, type LabelAnchor, type LabelHit, type Pt } from '@/components/anatomy/anatomyDraw';

type Target = 'both' | 'hand' | 'face';
type Status = 'idle' | 'loading' | 'live' | 'photo';

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm';
const HAND_MODEL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const FACE_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

interface Models {
  hand: HandLandmarker;
  face: FaceLandmarker;
}

/** Loads both landmarkers for one running mode, GPU first and CPU as fallback. */
async function loadModels(mode: 'VIDEO' | 'IMAGE'): Promise<Models> {
  const { FilesetResolver, HandLandmarker, FaceLandmarker } = await import('@mediapipe/tasks-vision');
  const vision = await FilesetResolver.forVisionTasks(WASM);
  const make = async <T,>(create: (delegate: 'GPU' | 'CPU') => Promise<T>) => {
    try {
      return await create('GPU');
    } catch {
      return create('CPU');
    }
  };
  const [hand, face] = await Promise.all([
    make((delegate) =>
      HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: HAND_MODEL, delegate },
        runningMode: mode,
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      }),
    ),
    make((delegate) =>
      FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: FACE_MODEL, delegate },
        runningMode: mode,
        numFaces: 1,
      }),
    ),
  ]);
  return { hand, face };
}

interface Frame {
  hands: Pt[][];
  face: Pt[] | null;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

const KIND_LABEL = { bone: 'عظم', muscle: 'عضلة', vessel: 'وعاء دموي', organ: 'عضو' } as const;
const KIND_DOT = { bone: 'bg-warning', muscle: 'bg-destructive', vessel: 'bg-destructive', organ: 'bg-primary' } as const;
const KIND_BADGE = {
  bone: 'bg-warning/15 text-warning',
  muscle: 'bg-destructive/10 text-destructive',
  vessel: 'bg-destructive/10 text-destructive',
  organ: 'bg-primary/10 text-primary',
} as const;

const AnatomyMirror: React.FC = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<Target>('both');
  const [muscles, setMuscles] = useState(false);
  const [organs, setOrgans] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [found, setFound] = useState<AnatomyPartId[]>([]);
  const [card, setCard] = useState<{ id: AnatomyPartId; zoom: string | null } | null>(null);
  const [zoom, setZoom] = useState({ s: 1, x: 0, y: 0 });

  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoModels = useRef<Models | null>(null);
  const imageModels = useRef<Models | null>(null);
  const rafRef = useRef<number | null>(null);
  const frameRef = useRef<Frame>({ hands: [], face: null });
  const hitsRef = useRef<LabelHit[]>([]);
  const foundKey = useRef('');
  const opts = useRef({ target, muscles, organs, frozen, mirror: true, highlight: null as AnatomyPartId | null });
  opts.current.target = target;
  opts.current.muscles = muscles;
  opts.current.organs = organs;
  opts.current.frozen = frozen;
  opts.current.highlight = card?.id ?? null;

  // ---------------------------------------------------------------- drawing
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { target: t, muscles: m, organs: o, highlight } = opts.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { hands, face } = frameRef.current;
    let anchors: LabelAnchor[] = [];
    if (face && t !== 'hand') anchors = drawFace(ctx, face, { muscles: m, organs: o });
    if (t !== 'face') {
      // label one hand only (the biggest, i.e. the nearest), and only when the face is not labelled
      const inside = (h: Pt[]) => h.filter((p) => p.x > 0 && p.y > 0 && p.x < canvas.width && p.y < canvas.height).length / h.length;
      const score = (h: Pt[]) => Math.hypot(h[0].x - h[9].x, h[0].y - h[9].y) * inside(h) ** 2;
      const main = hands.reduce((best, h, i) => (score(h) > score(hands[best]) ? i : best), 0);
      const labelHand = t === 'hand' || anchors.length === 0;
      hands.forEach((h, i) => {
        const a = drawHand(ctx, h, canvas.width, canvas.height);
        if (i === main && labelHand) anchors = a;
      });
    }
    const unit = canvas.width / Math.max(1, canvas.clientWidth);
    hitsRef.current = drawLabels(ctx, anchors, canvas.width, canvas.height, unit, highlight);
    const key = hitsRef.current.map((h) => h.id).join(',');
    if (key !== foundKey.current) {
      foundKey.current = key;
      setFound(hitsRef.current.map((h) => h.id));
    }
  }, []);

  /** Converts raw normalized landmarks into canvas points (mirrored for the selfie camera). */
  const toPts = (lms: { x: number; y: number }[], w: number, h: number, mirror: boolean): Pt[] =>
    lms.map((l) => ({ x: (mirror ? 1 - l.x : l.x) * w, y: l.y * h }));

  const loop = useCallback(() => {
    rafRef.current = requestAnimationFrame(loop);
    const v = videoRef.current;
    const models = videoModels.current;
    const canvas = canvasRef.current;
    if (!v || !models || !canvas || v.readyState < 2 || opts.current.frozen) return;
    const w = v.videoWidth;
    const h = v.videoHeight;
    if (!w || !h) return;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const now = performance.now();
    const { target: t, mirror } = opts.current;
    const prev = frameRef.current;
    const next: Frame = { hands: [], face: null };
    if (t !== 'face') {
      const r = models.hand.detectForVideo(v, now);
      next.hands = r.landmarks.map((l, i) => smooth(prev.hands[i], toPts(l, w, h, mirror)));
    }
    if (t !== 'hand') {
      const r = models.face.detectForVideo(v, now + 0.01);
      next.face = r.faceLandmarks[0] ? smooth(prev.face ?? undefined, toPts(r.faceLandmarks[0], w, h, mirror), 0.6) : null;
    }
    frameRef.current = next;
    render();
  }, [render]);

  // re-draw a frozen frame or a photo when the options change
  useEffect(() => {
    if (frozen || status === 'photo') render();
  }, [target, muscles, organs, frozen, status, card, render]);

  // ---------------------------------------------------------------- camera
  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(
    async (face: 'user' | 'environment' = facing) => {
      setError(null);
      setStatus('loading');
      setFrozen(false);
      stopCamera();
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw Object.assign(new Error('nocam'), { name: 'NotSupported' });
        const streamP = navigator.mediaDevices.getUserMedia({
          video: { facingMode: face, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        const modelsP = videoModels.current ? Promise.resolve(videoModels.current) : loadModels('VIDEO');
        const [stream, models] = await Promise.all([streamP, modelsP]);
        videoModels.current = models;
        streamRef.current = stream;
        opts.current.mirror = face === 'user';
        frameRef.current = { hands: [], face: null };
        const v = videoRef.current!;
        v.srcObject = stream;
        await v.play();
        setStatus('live');
        rafRef.current = requestAnimationFrame(loop);
      } catch (e) {
        stopCamera();
        const name = (e as Error).name;
        setError(
          name === 'NotAllowedError'
            ? 'المتصفح ما سمح بالكاميرا. اكبس على رمز القفل جنب عنوان الموقع واسمح للكاميرا، أو جرّب بصورة.'
            : name === 'NotFoundError' || name === 'NotSupported'
              ? 'ما لقينا كاميرا على هاد الجهاز. جرّب بصورة بدالها.'
              : 'ما زبط تشغيل التجربة. تأكد من الإنترنت (أول مرة بتنزّل النماذج) وجرّب مرة ثانية.',
        );
        setStatus('idle');
      }
    },
    [facing, loop, stopCamera],
  );

  useEffect(
    () => () => {
      stopCamera();
      videoModels.current?.hand.close();
      videoModels.current?.face.close();
      imageModels.current?.hand.close();
      imageModels.current?.face.close();
    },
    [stopCamera],
  );

  const flipCamera = () => {
    const next = facing === 'user' ? 'environment' : 'user';
    setFacing(next);
    startCamera(next);
  };

  const toggleFreeze = () => {
    const v = videoRef.current;
    if (!v) return;
    if (frozen) v.play().catch(() => {});
    else v.pause();
    setFrozen(!frozen);
  };

  // ---------------------------------------------------------------- photo
  const analyseImage = useCallback(
    async (src: string) => {
      setError(null);
      setStatus('loading');
      stopCamera();
      setFrozen(false);
      try {
        const models = imageModels.current ?? (await loadModels('IMAGE'));
        imageModels.current = models;
        const img = imgRef.current!;
        img.crossOrigin = 'anonymous';
        await new Promise<void>((res, rej) => {
          img.onload = () => res();
          img.onerror = () => rej(new Error('image'));
          img.src = src;
        });
        const canvas = canvasRef.current!;
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        canvas.width = w;
        canvas.height = h;
        opts.current.mirror = false;
        const hands = models.hand.detect(img).landmarks.map((l) => toPts(l, w, h, false));
        const faceL = models.face.detect(img).faceLandmarks[0];
        frameRef.current = { hands, face: faceL ? toPts(faceL, w, h, false) : null };
        setStatus('photo');
        requestAnimationFrame(render);
        if (!hands.length && !faceL) setError('ما لقينا إيد ولا وجه بالصورة. جرّب صورة أوضح فيها الإيد أو الوجه كامل.');
      } catch {
        setError('ما زبط تحليل الصورة. جرّب صورة ثانية.');
        setStatus('idle');
      }
    },
    [render, stopCamera],
  );

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (f) analyseImage(URL.createObjectURL(f));
  };

  // dev-only hook so the page can be checked without a camera
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    (window as unknown as { __anatomyTestImage?: (u: string) => void }).__anatomyTestImage = analyseImage;
  }, [analyseImage]);

  // ---------------------------------------------------------------- zoom & taps
  const clampZoom = useCallback((s: number, x: number, y: number) => {
    const el = stageRef.current;
    const W = el?.clientWidth ?? 0;
    const H = el?.clientHeight ?? 0;
    const sc = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, s));
    return { s: sc, x: Math.min(0, Math.max(W * (1 - sc), x)), y: Math.min(0, Math.max(H * (1 - sc), y)) };
  }, []);

  /** Zoom around a point given in stage (CSS) coordinates. */
  const zoomAt = useCallback(
    (factor: number, px?: number, py?: number) => {
      setZoom((z) => {
        const el = stageRef.current;
        const cx = px ?? (el?.clientWidth ?? 0) / 2;
        const cy = py ?? (el?.clientHeight ?? 0) / 2;
        const s = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z.s * factor));
        const k = s / z.s;
        return clampZoom(s, cx - (cx - z.x) * k, cy - (cy - z.y) * k);
      });
    },
    [clampZoom],
  );

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ dist: number; mid: { x: number; y: number }; z: typeof zoom; moved: number } | null>(null);
  const tapStart = useRef<{ x: number; y: number } | null>(null);

  const local = (e: React.PointerEvent | React.WheelEvent) => {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const openPart = useCallback((id: AnatomyPartId) => {
    const hit = hitsRef.current.find((h) => h.id === id);
    let zoomImg: string | null = null;
    const canvas = canvasRef.current;
    const src = status === 'photo' ? imgRef.current : videoRef.current;
    if (hit && canvas && src) {
      // a magnified crop of the real picture + overlay around that part
      const size = Math.min(canvas.width, canvas.height) * 0.34;
      const sx = Math.min(canvas.width - size, Math.max(0, hit.anchor.x - size / 2));
      const sy = Math.min(canvas.height - size, Math.max(0, hit.anchor.y - size / 2));
      const out = document.createElement('canvas');
      out.width = out.height = 480;
      const o = out.getContext('2d');
      if (o) {
        const k = 480 / size;
        o.save();
        if (opts.current.mirror && status !== 'photo') {
          o.translate(480, 0);
          o.scale(-1, 1);
          o.drawImage(src, (canvas.width - sx - size), sy, size, size, 0, 0, 480, 480);
        } else {
          o.drawImage(src, sx, sy, size, size, 0, 0, 480, 480);
        }
        o.restore();
        o.drawImage(canvas, sx, sy, size, size, 0, 0, 480, 480);
        o.strokeStyle = '#ffd666';
        o.lineWidth = 4;
        o.beginPath();
        o.arc((hit.anchor.x - sx) * k, (hit.anchor.y - sy) * k, 22, 0, Math.PI * 2);
        o.stroke();
        try {
          zoomImg = out.toDataURL('image/jpeg', 0.85);
        } catch {
          zoomImg = null;
        }
      }
    }
    setCard({ id, zoom: zoomImg });
  }, [status]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, local(e));
    const pts = [...pointers.current.values()];
    if (pts.length === 1) tapStart.current = pts[0];
    if (pts.length === 2) tapStart.current = null;
    gesture.current = {
      dist: pts.length === 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
      mid: pts.length === 2 ? { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 } : pts[0],
      z: zoom,
      moved: 0,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, local(e));
    const pts = [...pointers.current.values()];
    const g = gesture.current;
    if (pts.length >= 2 && g.dist) {
      const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
      const s = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, (g.z.s * d) / g.dist));
      const k = s / g.z.s;
      setZoom(clampZoom(s, mid.x - (g.mid.x - g.z.x) * k, mid.y - (g.mid.y - g.z.y) * k));
    } else if (pts.length === 1 && g.z.s > 1) {
      const p = pts[0];
      g.moved = Math.max(g.moved, Math.hypot(p.x - g.mid.x, p.y - g.mid.y));
      setZoom(clampZoom(g.z.s, g.z.x + p.x - g.mid.x, g.z.y + p.y - g.mid.y));
    } else if (tapStart.current) {
      const p = pts[0];
      g.moved = Math.max(g.moved, Math.hypot(p.x - tapStart.current.x, p.y - tapStart.current.y));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const p = local(e);
    const wasTap = pointers.current.size === 1 && tapStart.current && (gesture.current?.moved ?? 0) < 10;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) gesture.current = null;
    else {
      // one finger left after a pinch: continue as a pan from here
      const rest = [...pointers.current.values()][0];
      gesture.current = { dist: 0, mid: rest, z: zoom, moved: 99 };
    }
    if (!wasTap) return;
    tapStart.current = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const r = canvas.getBoundingClientRect();
    const sr = stageRef.current!.getBoundingClientRect();
    const cx = ((p.x + sr.left - r.left) / r.width) * canvas.width;
    const cy = ((p.y + sr.top - r.top) / r.height) * canvas.height;
    const near = (h: LabelHit) => Math.hypot(h.anchor.x - cx, h.anchor.y - cy);
    const hit =
      hitsRef.current.find((h) => cx >= h.x && cx <= h.x + h.w && cy >= h.y && cy <= h.y + h.h) ??
      [...hitsRef.current].sort((a, b) => near(a) - near(b)).find((h) => near(h) < canvas.width * 0.04);
    if (hit) openPart(hit.id);
  };

  const onWheel = (e: React.WheelEvent) => {
    if (status === 'idle' || status === 'loading') return;
    const p = local(e);
    zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, p.x, p.y);
  };

  // ---------------------------------------------------------------- UI
  const fileInput = useRef<HTMLInputElement>(null);
  const showStage = status === 'live' || status === 'photo';
  const targets: { id: Target; label: string; icon: React.ElementType }[] = [
    { id: 'both', label: 'الإيد والوجه', icon: Bone },
    { id: 'hand', label: 'الإيد', icon: Hand },
    { id: 'face', label: 'الجمجمة', icon: ScanFace },
  ];
  const part = card ? ANATOMY_PARTS[card.id] : null;

  return (
    <PageShell className="max-w-3xl">
      <PageHeader
        title={ANATOMY_MIRROR.title}
        description={ANATOMY_MIRROR.tagline}
        icon={Bone}
        crumbs={[{ label: 'المختبرات', to: '/labs' }, { label: ANATOMY_MIRROR.title }]}
      />

      <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={onPickFile} />

      {/* Controls */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex rounded-2xl border border-border bg-card p-1">
          {targets.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTarget(id)}
              aria-pressed={target === id}
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition',
                target === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setMuscles((m) => !m)}
          aria-pressed={muscles}
          className={cn(
            'inline-flex h-11 items-center gap-1.5 rounded-2xl border px-3 text-xs font-bold transition',
            muscles ? 'border-destructive/50 bg-destructive/10 text-destructive' : 'border-border bg-card text-muted-foreground',
          )}
        >
          <span className={cn('h-2.5 w-2.5 rounded-full', muscles ? 'bg-destructive' : 'bg-muted-foreground/40')} />
          عضلات الوجه
        </button>
        <button
          type="button"
          onClick={() => setOrgans((o) => !o)}
          aria-pressed={organs}
          className={cn(
            'inline-flex h-11 items-center gap-1.5 rounded-2xl border px-3 text-xs font-bold transition',
            organs ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground',
          )}
        >
          <span className={cn('h-2.5 w-2.5 rounded-full', organs ? 'bg-primary' : 'bg-muted-foreground/40')} />
          الدماغ والشرايين
        </button>
      </div>

      {/* Stage */}
      <div
        ref={stageRef}
        onPointerDown={showStage ? onPointerDown : undefined}
        onPointerMove={showStage ? onPointerMove : undefined}
        onPointerUp={showStage ? onPointerUp : undefined}
        onPointerCancel={showStage ? onPointerUp : undefined}
        onWheel={showStage ? onWheel : undefined}
        className={cn(
          'relative w-full select-none overflow-hidden rounded-3xl border border-border bg-foreground/95 shadow-lg',
          showStage ? 'touch-none' : 'aspect-[4/3]',
        )}
      >
        <div
          className="relative origin-top-left"
          style={{ transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.s})` }}
        >
          <video
            ref={videoRef}
            playsInline
            muted
            className={cn('block w-full', status === 'live' ? '' : 'hidden', facing === 'user' && '-scale-x-100')}
          />
          <img ref={imgRef} alt="" className={cn('block w-full', status === 'photo' ? '' : 'hidden')} />
          <canvas ref={canvasRef} className={cn('absolute inset-0 h-full w-full', showStage ? '' : 'hidden')} />
        </div>

        {!showStage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-background">
            {status === 'loading' ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin" />
                <p className="text-sm font-bold">بنجهّز التجربة… أول مرة بتاخذ ثواني لتنزيل النماذج</p>
              </>
            ) : (
              <>
                <Bone className="h-12 w-12 opacity-90" />
                <p className="max-w-sm text-sm leading-relaxed opacity-90">
                  ارفع إيدك قدام الكاميرا أو قرّب وجهك، وشوف عظامك تتحرك معك. اكبس على أي اسم لتكبّره وتعرف عنه أكثر.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button onClick={() => startCamera()} className="h-12 gap-2 rounded-2xl bg-gradient-to-l from-brand-from to-brand-to px-6 font-black text-primary-foreground">
                    <Camera className="h-5 w-5" /> شغّل الكاميرا
                  </Button>
                  <Button variant="secondary" onClick={() => fileInput.current?.click()} className="h-12 gap-2 rounded-2xl px-5 font-bold">
                    <ImageUp className="h-5 w-5" /> جرّب بصورة
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {showStage && (
          <>
            <div className="absolute bottom-3 left-3 flex gap-1.5">
              <StageButton label="تكبير" onClick={() => zoomAt(1.4)}>
                <Plus className="h-5 w-5" />
              </StageButton>
              <StageButton label="تصغير" onClick={() => zoomAt(1 / 1.4)}>
                <Minus className="h-5 w-5" />
              </StageButton>
              {zoom.s > 1 && (
                <StageButton label="رجوع للحجم الطبيعي" onClick={() => setZoom({ s: 1, x: 0, y: 0 })}>
                  <RotateCcw className="h-5 w-5" />
                </StageButton>
              )}
            </div>
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              {status === 'live' && (
                <>
                  <StageButton label={frozen ? 'كمّل' : 'ثبّت الصورة'} onClick={toggleFreeze} wide>
                    {frozen ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                    <span className="text-xs font-bold">{frozen ? 'كمّل' : 'ثبّت'}</span>
                  </StageButton>
                  <StageButton label="بدّل الكاميرا" onClick={flipCamera}>
                    <SwitchCamera className="h-5 w-5" />
                  </StageButton>
                </>
              )}
              <StageButton label="صورة" onClick={() => fileInput.current?.click()}>
                <ImageUp className="h-5 w-5" />
              </StageButton>
              <StageButton
                label="إيقاف"
                onClick={() => {
                  stopCamera();
                  setStatus('idle');
                  setZoom({ s: 1, x: 0, y: 0 });
                  setFound([]);
                  foundKey.current = '';
                }}
              >
                <VideoOff className="h-5 w-5" />
              </StageButton>
            </div>
            {status === 'live' && found.length === 0 && (
              <div className="pointer-events-none absolute inset-x-0 top-3 mx-auto w-fit rounded-full bg-background/85 px-4 py-1.5 text-xs font-bold text-foreground">
                {target === 'face' ? 'قرّب وجهك من الكاميرا' : target === 'hand' ? 'ارفع إيدك قدام الكاميرا' : 'ارفع إيدك أو قرّب وجهك'}
              </div>
            )}
          </>
        )}
      </div>

      {error && <p className="mt-3 rounded-2xl bg-destructive/10 p-3 text-center text-sm font-bold text-destructive">{error}</p>}

      {/* Parts on screen now */}
      {showStage && found.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-xs font-black text-muted-foreground">اكبس على أي جزء لتكبيره:</div>
          <div className="flex flex-wrap gap-1.5">
            {found.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => openPart(id)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground transition hover:border-primary/50"
              >
                <span className={cn('h-2 w-2 rounded-full', KIND_DOT[ANATOMY_PARTS[id].kind])} />
                {ANATOMY_PARTS[id].name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-border bg-card p-3 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
        الكاميرا والصور بتنحلّل على جهازك بس. ما في ولا صورة ولا فيديو بينرفع أو بينحفظ.
      </div>

      <Dialog open={!!card} onOpenChange={(o) => !o && setCard(null)}>
        <DialogContent className="w-[95vw] max-w-md rounded-3xl text-right" dir="rtl">
          {part && card && (
            <>
              <DialogHeader className="text-right">
                <DialogTitle className="flex items-center gap-2 text-xl font-black">
                  {part.name}
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-bold', KIND_BADGE[part.kind])}>
                    {KIND_LABEL[part.kind]}
                  </span>
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-foreground">{part.about}</DialogDescription>
              </DialogHeader>
              {card.zoom && <img src={card.zoom} alt={`${part.name} مكبّر`} className="w-full rounded-2xl border border-border" />}
              <div className="rounded-2xl bg-muted p-3 text-sm leading-relaxed text-foreground">
                <span className="font-black">بتعرف؟ </span>
                {part.fact}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
};

const StageButton: React.FC<{ label: string; onClick: () => void; children: React.ReactNode; wide?: boolean }> = ({
  label,
  onClick,
  children,
  wide,
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onPointerDown={(e) => e.stopPropagation()}
    onPointerUp={(e) => e.stopPropagation()}
    onClick={onClick}
    className={cn(
      'inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-background/85 text-foreground shadow-md backdrop-blur transition hover:bg-background active:scale-95',
      wide ? 'px-3' : 'w-11',
    )}
  >
    {children}
  </button>
);

export default AnatomyMirror;
