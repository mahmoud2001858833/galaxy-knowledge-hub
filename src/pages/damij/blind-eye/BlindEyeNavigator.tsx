import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Volume2, Mic, Activity, Languages, Camera, FileText, RefreshCw, Power, Eye, EyeOff, Radar, X, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import HudOverlay, { type DetectedPoint } from './HudOverlay';
import { refreshVoices, setActiveLang, enqueueSpeech, cancelAllSpeech, vibrate, isEcho, isSpeaking } from './speechQueue';
import { BlindEyeLangProvider, useBlindEyeLang } from './BlindEyeLangContext';
import { BE_STRINGS, BE_BCP47, defaultSuggestions, type BELang } from './i18n';
import { parseCommand, commandAllowed, detectSwitchLang } from './voiceCommands';
import { extractGoToText, parseDestinationLoose } from './navigation/destinationParser';
import { geocodePlace, haversine, bearing, relativeDirectionAr, formatDistanceAr, type LatLng } from './navigation/geo';
import { getPlace, savePlace, listPlaces, extractSaveAsName, canonicalizePlaceName, getEmergencyPhone } from './navigation/savedPlaces';
import { recognizeImage } from './navigation/ocr';
import { startFallDetection } from './navigation/fallDetection';
import { fetchRoute, makeNavState, advanceStep, type TurnByTurnState } from './navigation/turnByTurn';
import { ensureDetector, detectFromVideo, labelToArabic, summarizeSceneArabic } from './localDetector';
import { isOnline, onConnectivityChange } from './offlineMode';
import { hapticForDirection, haptics } from './haptics';
import BlindEyeEmergencyButton from './BlindEyeEmergencyButton';
import { HeadingTracker, StepDetector, requestSensorPermissions, angleDiff } from './spatial/sensors';
import {
  WorldMap, cameraFov, guidanceTo, summaryText, describeObject, kindFromText, kindWord, stepsText, directionText,
  type Instruction, type Kind, type MapObject, type CapturePose,
} from './spatial/worldMap';
import { aiToObservations, cocoDistance, cocoToObservations } from './spatial/perception';
import { Beacon, chirp, unlockAudio } from './spatial/beacon';
import MiniMap from './spatial/MiniMap';

/*
 * عين الأعمى — how it works
 * 1. Scan: the user turns in a circle; a frame is taken every ~40° of compass heading and the AI
 *    lists the objects in it with distances. Each object is placed on a virtual map (metres, north-up).
 * 2. Walk: steps (accelerometer) and heading (compass) move the user on the map; the on-device
 *    detector (~4 fps) and a slower AI pass keep refining it, so guidance is computed instantly from
 *    the map instead of waiting seconds for the cloud.
 * 3. Guide: "خذني إلى الباب" picks the object on the map; the user hears turn/forward instructions with
 *    step counts, warnings for obstacles on the way, and an audio beacon panned toward the target.
 */

type Phase = 'idle' | 'starting' | 'scanning' | 'guiding' | 'stopped';

type ScanState = {
  accumulated: number;
  lastHeading: number | null;
  lastShotHeading: number | null;
  shots: number;
  quarters: number;
  manual: boolean;
  startedAt: number;
  timer: number | null;
};

const SCAN_DEG = 340;

/** Resolve with `fallback` if the promise takes longer than `ms` (phone prompts can stay unanswered). */
const withTimeout = <T,>(p: Promise<T>, ms: number, fallback: T): Promise<T> =>
  Promise.race([p, new Promise<T>((res) => window.setTimeout(() => res(fallback), ms))]);

const BlindEyeNavigatorInner: React.FC = () => {
  const { lang, setLang, toggle } = useBlindEyeLang();
  const langRef = useRef<BELang>(lang);
  useEffect(() => { langRef.current = lang; setActiveLang(lang); }, [lang]);
  const t = BE_STRINGS[lang];
  const ar = lang === 'ar';
  const L = (arText: string, enText: string) => (langRef.current === 'ar' ? arText : enText);
  const say = (text: string, priority: 'critical' | 'directional' | 'descriptive' = 'directional', onEnd?: () => void) =>
    enqueueSpeech({ text, priority, lang: langRef.current, onEnd });

  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<any>(null);

  // ---- spatial engine ----
  const mapRef = useRef(new WorldMap());
  const trackerRef = useRef<HeadingTracker | null>(null);
  const stepsRef = useRef<StepDetector | null>(null);
  const beaconRef = useRef(new Beacon());
  const targetIdRef = useRef<number | null>(null);
  const targetMetaRef = useRef<{ label: string; kind: Kind } | null>(null);
  const pendingRef = useRef<{ query: string; kind: Kind | null; name: string } | null>(null);
  const cloudInflightRef = useRef(0);
  const cloudCooldownRef = useRef(0);
  const lastCloudRef = useRef<{ t: number; x: number; y: number; heading: number }>({ t: 0, x: 0, y: 0, heading: 0 });
  const detectBusyRef = useRef(false);
  const detectorReadyRef = useRef(false);
  const detectNextRef = useRef(0);
  const lastInstrRef = useRef<{ key: string; t: number; text: string }>({ key: '', t: 0, text: '' });
  const warnedRef = useRef<Map<string, number>>(new Map());
  const scanRef = useRef<ScanState | null>(null);
  const awaitingDestinationRef = useRef(false);
  const lastSpokenRef = useRef('');
  const placeChangeRef = useRef<{ place: string; count: number }>({ place: '', count: 0 });
  const lastStepAtRef = useRef(0);
  const walking = () => Date.now() - lastStepAtRef.current < 3000;

  // geo navigation (outdoors)
  const targetGeoRef = useRef<{ name: string; dest: LatLng } | null>(null);
  const geoWatchRef = useRef<number | null>(null);
  const userPosRef = useRef<LatLng | null>(null);
  const userHeadingRef = useRef<number | null>(null);
  const lastNavSpeakRef = useRef(0);
  const turnByTurnRef = useRef<TurnByTurnState | null>(null);

  const chatHistoryRef = useRef<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const onlineRef = useRef<boolean>(isOnline());

  const [phase, setPhase] = useState<Phase>('idle');
  const phaseRef = useRef<Phase>('idle');
  const setPhaseBoth = (p: Phase) => { phaseRef.current = p; setPhase(p); };
  const [online, setOnline] = useState<boolean>(isOnline());
  const [mapVersion, setMapVersion] = useState(0);
  const [bigMap, setBigMap] = useState(false);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [searching, setSearching] = useState<string | null>(null);
  const [instr, setInstr] = useState<Instruction | null>(null);
  const [scanPct, setScanPct] = useState(0);
  const [busy, setBusy] = useState<null | 'describe' | 'read' | 'identify'>(null);
  const [lastAnnounced, setLastAnnounced] = useState('');
  const [listening, setListening] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [points, setPoints] = useState<DetectedPoint[]>([]);
  const [eyesOff, setEyesOff] = useState(false);
  const [sensorNote, setSensorNote] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(defaultSuggestions[lang]);

  useEffect(() => { setSuggestions(defaultSuggestions[lang]); }, [lang]);

  const speakTracked = (text: string, priority: 'critical' | 'directional' | 'descriptive' = 'directional') => {
    lastSpokenRef.current = text;
    say(text, priority);
  };

  // ------------------------------------------------------------------ camera & frames
  const captureFrame = useCallback((width: number, quality: number): string | null => {
    const v = videoRef.current;
    const c = captureCanvasRef.current;
    if (!v || !c || v.readyState < 2 || !v.videoWidth) return null;
    const h = Math.round((v.videoHeight / v.videoWidth) * width);
    c.width = width; c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0, width, h);
    return c.toDataURL('image/jpeg', quality);
  }, []);

  const currentPose = useCallback((): CapturePose => {
    const v = videoRef.current;
    const fov = cameraFov(v?.videoWidth ?? 0, v?.videoHeight ?? 0);
    return mapRef.current.pose(fov.hfov, fov.vfov, trackerRef.current?.pitchDown ?? null);
  }, []);

  const bump = () => setMapVersion((n) => (n + 1) % 1_000_000);

  // ------------------------------------------------------------------ targets
  const clearTarget = useCallback(() => {
    targetIdRef.current = null;
    pendingRef.current = null;
    setTargetId(null);
    setSearching(null);
    setInstr(null);
    beaconRef.current.stop();
    lastInstrRef.current = { key: '', t: 0, text: '' };
  }, []);

  const lockTarget = useCallback((m: MapObject, announce: boolean) => {
    targetIdRef.current = m.id;
    targetMetaRef.current = { label: m.label, kind: m.kind };
    pendingRef.current = null;
    setTargetId(m.id);
    setSearching(null);
    lastInstrRef.current = { key: '', t: 0, text: '' };
    if (announce) {
      chirp.found();
      vibrate([60, 40, 60]);
      speakTracked(L(`سأرشدك إلى ${m.label}. ${describeObject(mapRef.current, m, 'ar')}.`, `Guiding you to ${m.label}. ${describeObject(mapRef.current, m, 'en')}.`), 'critical');
    }
  }, []);

  /** "الباب" / "الكرسي الأحمر" -> object on the map, or search for it while the user turns. */
  const goToLocal = useCallback((query: string): boolean => {
    const map = mapRef.current;
    const kind = kindFromText(query);
    const found = map.find(query, kind);
    if (found) { lockTarget(found, true); return true; }
    if (!kind) return false;
    targetIdRef.current = null;
    setTargetId(null);
    const name = kindWord(kind, langRef.current);
    pendingRef.current = { query, kind, name };
    setSearching(name);
    lastCloudRef.current.t = 0; // look right away
    speakTracked(L(`لم أجد ${name} بعد. استدر ببطء وسأخبرك فور أن أراه.`, `I haven't found ${name} yet. Turn slowly and I'll tell you as soon as I see it.`), 'critical');
    return true;
  }, [lockTarget]);

  // ------------------------------------------------------------------ cloud mapping
  const cloudMap = useCallback(async (reason: 'scan' | 'walk' | 'search') => {
    if (!onlineRef.current || Date.now() < cloudCooldownRef.current) return;
    if (cloudInflightRef.current >= (reason === 'scan' ? 4 : 1)) return;
    const img = captureFrame(512, 0.62);
    if (!img) return;
    const pose = currentPose();
    const map = mapRef.current;
    lastCloudRef.current = { t: Date.now(), x: pose.x, y: pose.y, heading: pose.heading };
    cloudInflightRef.current += 1;
    try {
      const { data, error } = await supabase.functions.invoke('blind-eye-vision', {
        body: { image: img, mode: 'map', lang: langRef.current },
      });
      if (error) {
        const status = (error as any)?.context?.status ?? (error as any)?.context?.response?.status;
        if (status === 429 || status === 402) {
          cloudCooldownRef.current = Date.now() + 6000;
          setErrMsg(status === 402 ? BE_STRINGS[langRef.current].outOfCredits : BE_STRINGS[langRef.current].rateLimit);
        }
        return;
      }
      setErrMsg(null);
      const { obs, place } = aiToObservations(data, pose, langRef.current);
      const added = map.observe(pose, obs, true);
      if (place) {
        if (!map.place) map.place = place;
        else if (place !== map.place && reason === 'walk') {
          // a different room reported twice in a row while walking = the user went somewhere new
          const pc = placeChangeRef.current;
          pc.count = pc.place === place ? pc.count + 1 : 1;
          pc.place = place;
          if (pc.count >= 2) {
            pc.count = 0;
            map.place = place;
            say(L(`يبدو أنك دخلت إلى ${place}. قل امسح لأتعرف على المكان الجديد.`, `Looks like you entered ${place}. Say scan to map it.`), 'directional');
          }
        }
      }
      bump();
      // announce doors/stairs discovered while walking (not during the scan: the summary covers them)
      if (reason !== 'scan' && phaseRef.current === 'guiding' && !targetIdRef.current) {
        const key = added.find((m) => ['door', 'doorway', 'stairs', 'step', 'elevator'].includes(m.kind));
        if (key) say(L(`لاحظت ${key.label} ${directionText(map.rel(key).rel, 'ar')}`, `I see ${key.label} ${directionText(map.rel(key).rel, 'en')}`), 'descriptive');
      }
      // the thing we were looking for showed up
      const p = pendingRef.current;
      if (p) {
        const m = map.find(p.query, p.kind);
        if (m) lockTarget(m, true);
      }
    } catch (e) {
      console.warn('map tick failed', e);
    } finally {
      cloudInflightRef.current = Math.max(0, cloudInflightRef.current - 1);
    }
  }, [captureFrame, currentPose, lockTarget]);

  // ------------------------------------------------------------------ scan (learn the room)
  const finishScan = useCallback(async () => {
    const s = scanRef.current;
    if (!s) return;
    if (s.timer) window.clearInterval(s.timer);
    scanRef.current = null;
    setScanPct(1);
    if (s.manual) mapRef.current.heading = 0; // full circle: facing the start again
    // give the last frames a moment to come back
    const until = Date.now() + 6000;
    while (cloudInflightRef.current > 0 && Date.now() < until) await new Promise((r) => setTimeout(r, 250));
    if (phaseRef.current !== 'scanning') return;
    setPhaseBoth('guiding');
    bump();
    const map = mapRef.current;
    const lg = langRef.current;
    const top = map.highlights(3).map((m) => m.label);
    awaitingDestinationRef.current = true;
    if (top.length) {
      setSuggestions(top.map((n) => (lg === 'ar' ? `خذني إلى ${n}` : `Take me to ${n}`)));
      speakTracked(`${L('انتهى المسح.', 'Scan complete.')} ${summaryText(map, lg)} ${L(`إلى أين تريد أن تذهب؟ مثلاً: ${top.slice(0, 2).join(' أو ')}.`, `Where would you like to go? For example: ${top.slice(0, 2).join(' or ')}.`)}`, 'critical');
    } else {
      speakTracked(L('انتهى المسح لكن لم أتعرف على أشياء واضحة. تأكد من الإضاءة وأن الكاميرا غير مغطاة، ثم قل امسح مرة أخرى.', "Scan done but I couldn't recognise anything. Check the light and that the camera isn't covered, then say scan again."), 'critical');
    }
  }, []);

  const startScan = useCallback(() => {
    if (!streamRef.current) return;
    const old = scanRef.current;
    if (old?.timer) window.clearInterval(old.timer);
    clearTarget();
    mapRef.current.reset();
    bump();
    setScanPct(0);
    setPhaseBoth('scanning');
    awaitingDestinationRef.current = false;
    const tracker = trackerRef.current;
    const manual = !tracker || tracker.source === 'none';
    const s: ScanState = { accumulated: 0, lastHeading: null, lastShotHeading: null, shots: 0, quarters: 0, manual, startedAt: Date.now(), timer: null };
    scanRef.current = s;
    cancelAllSpeech();
    if (!manual) {
      setSensorNote(null);
      say(L('سأتعرف على المكان من حولك. أمسك الهاتف أمام صدرك والكاميرا للأمام، واستدر حول نفسك ببطء دورة كاملة. ستسمع نقرة مع كل لقطة.',
        "Let me learn the room. Hold the phone at chest height, camera forward, and turn slowly in a full circle. You'll hear a click with each picture."), 'critical');
      cloudMap('scan');
      chirp.shot();
      s.lastShotHeading = mapRef.current.heading;
      s.shots = 1;
      // safety: finish even if the user stops turning
      s.timer = window.setInterval(() => {
        if (scanRef.current !== s) return;
        if (Date.now() - s.startedAt > 45000) finishScan();
      }, 1000);
    } else {
      // no compass/gyro (desktop, permission denied): 8 timed pictures, 45° apart
      setSensorNote(L('لا تتوفر بوصلة على هذا الجهاز: المسح بالتوقيت، والاتجاهات تقريبية.', 'No compass on this device: timed scan, directions are approximate.'));
      say(L('سأتعرف على المكان. سألتقط ثماني صور. بعد كل نقرة استدر قليلاً إلى اليمين، ثُمن دورة.',
        "Let me learn the room. I'll take eight pictures. After each click, turn a little to the right, an eighth of a circle."), 'critical');
      const shoot = () => {
        if (scanRef.current !== s) return;
        mapRef.current.heading = s.shots * 45;
        chirp.shot();
        cloudMap('scan');
        s.shots += 1;
        setScanPct(s.shots / 8);
        if (s.shots >= 8) { finishScan(); return; }
        say(L('استدر قليلاً إلى اليمين', 'Turn a little to the right'), 'descriptive');
      };
      window.setTimeout(() => {
        if (scanRef.current !== s) return;
        shoot();
        s.timer = window.setInterval(shoot, 2600);
      }, 3500);
    }
  }, [cloudMap, finishScan, clearTarget]);

  // ------------------------------------------------------------------ start / stop
  const stopAll = useCallback(() => {
    const s = scanRef.current;
    if (s?.timer) window.clearInterval(s.timer);
    scanRef.current = null;
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    trackerRef.current?.stop();
    trackerRef.current = null;
    stepsRef.current?.stop();
    stepsRef.current = null;
    beaconRef.current.stop();
    targetIdRef.current = null;
    pendingRef.current = null;
    setTargetId(null);
    setSearching(null);
    setInstr(null);
    if (geoWatchRef.current != null) {
      try { navigator.geolocation.clearWatch(geoWatchRef.current); } catch { /* ignore */ }
      geoWatchRef.current = null;
    }
    targetGeoRef.current = null;
    turnByTurnRef.current = null;
    cancelAllSpeech();
    try { recRef.current?.stop(); } catch { /* ignore */ }
    setListening(false);
    if (phaseRef.current !== 'idle') say(BE_STRINGS[langRef.current].stopping, 'critical');
    setPhaseBoth('stopped');
  }, []);

  /** Must run inside a tap: iOS only grants motion/compass, sound and speech from a user gesture. */
  const begin = useCallback(() => {
    if (phaseRef.current === 'starting') return;
    setStartError(null);
    setPhaseBoth('starting');
    try { unlockAudio(); } catch { /* no audio */ }
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    } catch { /* no speech */ }
    // both prompts must be requested now, inside the tap; never wait on them for long
    const perm = withTimeout(requestSensorPermissions().catch(() => false), 4000, false);
    (async () => {
      let stream: MediaStream | null = null;
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('no-camera-api');
        const ask = (c: MediaStreamConstraints) => withTimeout(navigator.mediaDevices.getUserMedia(c), 20000, null);
        try {
          stream = await ask({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
        } catch (e) {
          if ((e as Error)?.name === 'NotAllowedError') throw e;
          stream = await ask({ video: true, audio: false }); // some phones reject the size hints
        }
        if (!stream) throw new Error('timeout');
      } catch (e) {
        console.error(e);
        const name = (e as Error)?.name;
        const msg = name === 'NotAllowedError'
          ? L('لم يُسمح باستخدام الكاميرا. اسمح بها من إعدادات المتصفح ثم اضغط مرة أخرى.', 'Camera permission was denied. Allow it in the browser settings, then tap again.')
          : (e as Error)?.message === 'no-camera-api'
            ? L('هذا المتصفح لا يسمح بالكاميرا (غالباً متصفح داخل تطبيق). افتح الرابط في Chrome أو Safari.', "This browser doesn't allow the camera (often an in-app browser). Open the link in Chrome or Safari.")
          : (e as Error)?.message === 'timeout'
            ? L('الكاميرا لم تستجب. أغلق التطبيقات التي تستخدم الكاميرا ثم اضغط مرة أخرى.', 'The camera did not respond. Close other apps using it, then tap again.')
            : L('تعذّر فتح الكاميرا على هذا الجهاز. اضغط للمحاولة مرة أخرى.', 'Could not open the camera. Tap to try again.');
        setStartError(msg);
        say(msg, 'critical');
        setPhaseBoth('stopped');
        return;
      }
      streamRef.current = stream;
      const v = videoRef.current;
      if (v) {
        v.srcObject = stream;
        await withTimeout(v.play().then(() => true).catch(() => false), 3000, false);
      }
      await perm;
      const tracker = new HeadingTracker();
      tracker.onChange((h) => {
        // during a timed (no-compass) scan the heading is set by the scan itself
        if (scanRef.current?.manual) return;
        mapRef.current.heading = h;
        userHeadingRef.current = h;
        onHeadingRef.current(h);
      });
      tracker.start();
      trackerRef.current = tracker;
      const steps = new StepDetector(() => { lastStepAtRef.current = Date.now(); mapRef.current.step(); bump(); });
      steps.start();
      stepsRef.current = steps;
      try { recRef.current?.start(); setListening(true); } catch { /* already running */ }
      setPhaseBoth('guiding');
      say(L('مرحباً، أنا عين الأعمى.', 'Hello, this is Blind Eye.'), 'critical');
      // the on-device detector is heavy to load: start it only once everything else runs
      window.setTimeout(() => {
        ensureDetector().then(() => { detectorReadyRef.current = true; }).catch(() => {});
      }, 2500);
      // wait (up to 3 s) for the first compass/gyro reading, then learn the room
      const t0 = Date.now();
      const waitSensors = window.setInterval(() => {
        if (tracker.source !== 'none' || Date.now() - t0 > 3000) {
          window.clearInterval(waitSensors);
          if (trackerRef.current === tracker) startScan();
        }
      }, 150);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startScan]);

  // heading changes drive the scan: one picture every ~40° of turning
  const onHeadingRef = useRef<(h: number) => void>(() => {});
  onHeadingRef.current = (h: number) => {
    const s = scanRef.current;
    if (!s || s.manual) return;
    if (s.lastHeading != null) s.accumulated += Math.abs(angleDiff(h, s.lastHeading));
    s.lastHeading = h;
    const pct = Math.min(1, s.accumulated / SCAN_DEG);
    setScanPct(pct);
    if (s.lastShotHeading == null || Math.abs(angleDiff(h, s.lastShotHeading)) >= 40) {
      s.lastShotHeading = h;
      s.shots += 1;
      chirp.shot();
      cloudMap('scan');
    }
    const q = Math.floor(pct * 4);
    if (q > s.quarters && q < 4) {
      s.quarters = q;
      say(q === 2 ? L('نصف الدورة، استمر', 'Halfway, keep turning') : L('استمر بالدوران', 'Keep turning'), 'descriptive');
    }
    if (s.accumulated >= SCAN_DEG) finishScan();
  };

  // ------------------------------------------------------------------ on-device detector (fast layer)
  useEffect(() => {
    if (phase !== 'guiding' && phase !== 'scanning') return;
    const id = window.setInterval(async () => {
      const v = videoRef.current;
      if (!v || !v.videoWidth || detectBusyRef.current || !detectorReadyRef.current || Date.now() < detectNextRef.current) return;
      detectBusyRef.current = true;
      const tStart = performance.now();
      try {
        const pose = currentPose();
        const objs = await detectFromVideo(v, 8);
        const map = mapRef.current;
        map.observe(pose, cocoToObservations(objs, pose, langRef.current), false);
        setPoints(objs.slice(0, 6).map((o) => ({
          x: o.x + o.w / 2, y: o.y + o.h / 2, w: o.w, h: o.h,
          label: langRef.current === 'ar' ? labelToArabic(o.label) : o.label,
          hazard: o.w * o.h > 0.18 && o.y + o.h / 2 > 0.5 ? 'high' : 'medium',
          proximity: Math.round(Math.min(100, o.w * o.h * 200)),
          source: 'local' as const,
        })));
        // something close right in front: warn now, don't wait for the map
        // (within ~1.3 m while walking, ~0.7 m when standing)
        let hz: (typeof objs)[number] | null = null;
        let hzDist = Infinity;
        for (const o of objs) {
          const cx = o.x + o.w / 2;
          if (o.score < 0.5 || cx < 0.25 || cx > 0.75 || o.label === 'tv' || o.label === 'laptop') continue;
          const d = cocoDistance(o, pose);
          if (d != null && d < hzDist) { hz = o; hzDist = d; }
        }
        if (hz && hzDist < (walking() ? 1.3 : 0.7) && phaseRef.current === 'guiding') {
          const k = `hz:${hz.label}`;
          const last = warnedRef.current.get(k) ?? 0;
          if (Date.now() - last > 3500) {
            warnedRef.current.set(k, Date.now());
            const name = langRef.current === 'ar' ? labelToArabic(hz.label) : hz.label;
            const right = hz.x + hz.w / 2 < 0.5;
            chirp.warn(right ? -0.6 : 0.6);
            haptics.stop();
            say(L(`قف! ${name} أمامك مباشرة. تحرك إلى ${right ? 'اليمين' : 'اليسار'}.`, `Stop! ${name} right in front. Move ${right ? 'right' : 'left'}.`), 'critical');
          }
        }
      } catch { /* detector not ready */ } finally {
        detectBusyRef.current = false;
        // slow phone: leave the main thread free (pause about twice as long as the detection took)
        detectNextRef.current = Date.now() + Math.min(1500, (performance.now() - tStart) * 2);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [phase, currentPose]);

  // ------------------------------------------------------------------ AI map refresh while walking
  useEffect(() => {
    if (phase !== 'guiding') return;
    const id = window.setInterval(() => {
      const map = mapRef.current;
      const last = lastCloudRef.current;
      const since = Date.now() - last.t;
      const moved = Math.hypot(map.x - last.x, map.y - last.y);
      const turned = Math.abs(angleDiff(map.heading, last.heading));
      if (pendingRef.current) {
        if (since > 1500 && (turned > 20 || moved > 0.6 || since > 4000)) cloudMap('search');
      } else if (since > 2200 && (moved > 0.6 || turned > 25 || since > 9000)) {
        cloudMap('walk');
      }
    }, 300);
    return () => window.clearInterval(id);
  }, [phase, cloudMap]);

  // ------------------------------------------------------------------ guidance (instant, from the map)
  useEffect(() => {
    if (phase !== 'guiding') return;
    const id = window.setInterval(() => {
      const map = mapRef.current;
      const lg = langRef.current;
      const tid = targetIdRef.current;
      bump();
      if (tid != null) {
        const target = map.objects.find((o) => o.id === tid);
        if (!target) {
          // the map dropped it (it moved, or the sighting was wrong): look for it again
          const meta = targetMetaRef.current;
          clearTarget();
          if (meta) {
            pendingRef.current = { query: meta.label, kind: meta.kind, name: meta.label };
            setSearching(meta.label);
            lastCloudRef.current.t = 0;
            say(L(`فقدت ${meta.label}. استدر ببطء لأجده من جديد.`, `I lost ${meta.label}. Turn slowly so I can find it again.`), 'critical');
          }
          return;
        }
        const ins = guidanceTo(map, target, lg);
        setInstr(ins);
        beaconRef.current.update(ins.rel, ins.dist);
        const prev = lastInstrRef.current;
        const age = Date.now() - prev.t;
        const changed = ins.key !== prev.key;
        const repeatAfter = ins.key === 'forward' ? 6000 : ins.key === 'blocked' ? 3500 : 3200;
        if ((changed && age > 1200) || age > repeatAfter) {
          lastInstrRef.current = { key: ins.key, t: Date.now(), text: ins.text };
          if (ins.key === 'arrived') {
            chirp.arrived();
            vibrate([120, 60, 120, 60, 200]);
            speakTracked(ins.text, 'critical');
            clearTarget();
            setInstr(ins);
            return;
          }
          if (ins.key.includes('left')) hapticForDirection('left');
          else if (ins.key.includes('right')) hapticForDirection('right');
          else if (ins.key === 'blocked') haptics.stop();
          speakTracked(ins.text, ins.key === 'blocked' || ins.key === 'behind' ? 'critical' : 'directional');
        }
        return;
      }
      if (pendingRef.current || scanRef.current) return;
      // free walking: warn about mapped obstacles straight ahead
      const b = walking() ? map.blockers(null, 1.6)[0] : undefined;
      if (b) {
        const k = `blk:${b.m.id}`;
        const last = warnedRef.current.get(k) ?? 0;
        if (Date.now() - last > 7000) {
          warnedRef.current.set(k, Date.now());
          const go = b.side >= 0 ? L('اليسار', 'left') : L('اليمين', 'right');
          haptics.alert();
          say(L(`انتبه، ${b.m.label} أمامك بعد ${stepsText(b.along, 'ar')}. مُرّ من ${go}.`, `Careful, ${b.m.label} ahead in ${stepsText(b.along, 'en')}. Pass on the ${go}.`), 'directional');
        }
      }
    }, 450);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, clearTarget]);

  // keep the map drawing smooth while scanning too
  useEffect(() => {
    if (phase !== 'scanning') return;
    const id = window.setInterval(bump, 300);
    return () => window.clearInterval(id);
  }, [phase]);

  // connectivity
  useEffect(() => {
    const off = onConnectivityChange((o) => {
      onlineRef.current = o;
      setOnline(o);
      say(o ? L('عاد الاتصال.', 'Back online.') : L('لا يوجد إنترنت. التحذير من العوائق القريبة ما زال يعمل.', 'Offline. Close-obstacle warnings still work.'), o ? 'directional' : 'critical');
    });
    return () => { off(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------------------------------ describe / read / identify (cloud)
  const askVision = useCallback(async (mode: 'describe_scene' | 'ocr' | 'identify') => {
    const lg = langRef.current;
    const kind = mode === 'describe_scene' ? 'describe' : mode === 'ocr' ? 'read' : 'identify';
    setBusy(kind);
    vibrate([80, 50, 80]);
    say(mode === 'describe_scene' ? L('لحظة، أصف ما أمامك...', 'One moment, describing...')
      : mode === 'ocr' ? L('لحظة، أقرأ النص...', 'One moment, reading...')
      : L('لحظة، أتعرف على ما أمامك...', 'One moment, identifying...'), 'critical');
    try {
      const img = captureFrame(mode === 'describe_scene' ? 840 : 1024, 0.85);
      if (!img) { say(L('تعذر التقاط الصورة.', 'Could not capture a picture.'), 'critical'); return; }
      let text = '';
      if (onlineRef.current) {
        const { data } = await supabase.functions.invoke('blind-eye-vision', { body: { image: img, mode, lang: lg } });
        text = (data?.spoken || data?.full_text || '').toString();
      }
      if (!text && mode === 'ocr') text = ((await recognizeImage(img)) || '').replace(/\s+/g, ' ').trim();
      if (!text && mode !== 'ocr' && videoRef.current) text = summarizeSceneArabic(await detectFromVideo(videoRef.current, 10));
      if (!text) text = mode === 'ocr' ? L('لا أرى نصاً واضحاً. قرّب الهاتف من النص وثبّت يدك.', 'No clear text. Move closer and hold steady.') : L('تعذر التعرف حالياً.', 'Could not recognise it right now.');
      setLastAnnounced(text.slice(0, 500));
      speakTracked(text.slice(0, 600), 'critical');
    } catch (e) {
      console.warn(mode, e);
      say(L('حدث خطأ، حاول مرة أخرى.', 'Something went wrong, try again.'), 'critical');
    } finally {
      setBusy(null);
    }
  }, [captureFrame]);

  // ------------------------------------------------------------------ free conversation
  const sendChat = useCallback(async (text: string, intent?: string) => {
    const map = mapRef.current;
    const ctx: string[] = [];
    if (map.objects.length) ctx.push(`room map: ${summaryText(map, 'en', 6)}`);
    const tid = targetIdRef.current;
    const tgt = tid != null ? map.objects.find((o) => o.id === tid) : null;
    if (tgt) ctx.push(`guiding to: ${tgt.label}`);
    chatHistoryRef.current = [...chatHistoryRef.current, { role: 'user' as const, text }].slice(-6);
    try {
      const { data, error } = await supabase.functions.invoke('blind-eye-chat', {
        body: {
          text,
          image: captureFrame(640, 0.75),
          history: chatHistoryRef.current.slice(0, -1),
          visualContext: ctx.join(' | ') || undefined,
          lang: langRef.current,
          intent,
        },
      });
      if (error) throw error;
      if (data?.spoken) {
        chatHistoryRef.current = [...chatHistoryRef.current, { role: 'assistant' as const, text: data.spoken }].slice(-6);
        if (Array.isArray(data.suggestions) && data.suggestions.length) setSuggestions(data.suggestions.slice(0, 3));
        speakTracked(data.spoken, 'critical');
      }
    } catch (e) {
      console.warn('chat err', e);
      say(L('لم أستطع الرد الآن.', "I couldn't answer right now."), 'directional');
    }
  }, [captureFrame]);

  // ------------------------------------------------------------------ outdoor navigation (GPS)
  const startGeoNav = useCallback((query: string) => {
    clearTarget();
    const canonical = canonicalizePlaceName(query);
    const saved = getPlace(canonical);
    const startGeo = (latlng: LatLng, displayName: string) => {
      targetGeoRef.current = { name: displayName, dest: latlng };
      turnByTurnRef.current = null;
      if (!navigator.geolocation) { say(BE_STRINGS[langRef.current].navGpsDenied, 'critical'); return; }
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const from: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        userPosRef.current = from;
        const route = await fetchRoute(from, latlng);
        if (route && route.steps.length > 0) {
          turnByTurnRef.current = makeNavState(route);
          const kms = (route.totalDistance / 1000).toFixed(2);
          const mins = Math.max(1, Math.round(route.totalDuration / 60));
          say(`سنسير ${kms} كيلومتر، حوالي ${mins} دقيقة مشياً إلى ${displayName}. الخطوة الأولى: ${route.steps[0].instruction}`, 'critical');
        } else {
          say(`لم أجد مساراً تفصيلياً. سأرشدك بالاتجاه نحو ${displayName}.`, 'directional');
        }
        if (geoWatchRef.current != null) { try { navigator.geolocation.clearWatch(geoWatchRef.current); } catch { /* ignore */ } }
        geoWatchRef.current = navigator.geolocation.watchPosition((p) => {
          userPosRef.current = { lat: p.coords.latitude, lng: p.coords.longitude };
          const tg = targetGeoRef.current;
          if (!tg) return;
          const tbt = turnByTurnRef.current;
          if (tbt) {
            const tick = advanceStep(tbt, userPosRef.current);
            if (tick.speak) say(tick.speak, 'directional');
            if (tick.arrived) {
              say(`${BE_STRINGS[langRef.current].navArrived} ${tg.name}`, 'critical');
              if (geoWatchRef.current != null) { try { navigator.geolocation.clearWatch(geoWatchRef.current); } catch { /* ignore */ } geoWatchRef.current = null; }
              targetGeoRef.current = null;
              turnByTurnRef.current = null;
            }
            return;
          }
          const dist = haversine(userPosRef.current, tg.dest);
          if (Date.now() - lastNavSpeakRef.current < 4000) return;
          lastNavSpeakRef.current = Date.now();
          if (dist < 20) {
            say(`${BE_STRINGS[langRef.current].navArrived} ${tg.name}`, 'critical');
            if (geoWatchRef.current != null) { try { navigator.geolocation.clearWatch(geoWatchRef.current); } catch { /* ignore */ } geoWatchRef.current = null; }
            targetGeoRef.current = null;
            return;
          }
          const dir = relativeDirectionAr(bearing(userPosRef.current, tg.dest), userHeadingRef.current);
          say(`${dir} — ${formatDistanceAr(dist)} باتجاه ${tg.name}`, 'directional');
        }, () => say(BE_STRINGS[langRef.current].navGpsDenied, 'critical'), { enableHighAccuracy: true, maximumAge: 2000, timeout: 12000 });
      }, () => say(BE_STRINGS[langRef.current].navGpsDenied, 'critical'), { enableHighAccuracy: true, timeout: 10000 });
    };
    if (saved?.coords) {
      say(`${BE_STRINGS[langRef.current].navStartGeo} ${saved.name}`, 'critical');
      startGeo(saved.coords, saved.name);
    } else {
      const q = saved?.query || query;
      say(`${BE_STRINGS[langRef.current].navStartGeo} ${saved?.name || query}`, 'critical');
      geocodePlace(q).then((latlng) => {
        if (!latlng) { say(BE_STRINGS[langRef.current].navNotFound, 'critical'); return; }
        if (saved) savePlace(saved.name, { query: q, coords: latlng });
        startGeo(latlng, saved?.name || query);
      });
    }
  }, [clearTarget]);

  /** Destination from speech: the room map first, then a known object kind to search for, then GPS. */
  const goTo = useCallback((raw: string) => {
    const q = (extractGoToText(raw) ?? raw).replace(/[.!؟?،,]+$/, '').trim();
    if (!q) return;
    if (goToLocal(q)) return;
    const loose = parseDestinationLoose(q);
    if (loose?.kind === 'local' && goToLocal(loose.arabic)) return;
    startGeoNav(loose?.kind === 'geo' ? loose.query : q);
  }, [goToLocal, startGeoNav]);

  // ------------------------------------------------------------------ voice commands
  const switchLang = useCallback((next: BELang) => {
    if (next === langRef.current) return;
    setLang(next);
    setActiveLang(next);
    cancelAllSpeech();
    try { recRef.current?.stop(); } catch { /* ignore */ }
    enqueueSpeech({ text: BE_STRINGS[next].switchedLang, priority: 'critical', lang: next });
  }, [setLang]);

  const announceStatus = useCallback(() => {
    vibrate(60);
    const map = mapRef.current;
    const lg = langRef.current;
    const tid = targetIdRef.current;
    const tgt = tid != null ? map.objects.find((o) => o.id === tid) : null;
    if (tgt) { speakTracked(guidanceTo(map, tgt, lg).text, 'critical'); return; }
    if (pendingRef.current) { say(L(`أبحث عن ${pendingRef.current.name}. استدر ببطء.`, `Looking for ${pendingRef.current.name}. Turn slowly.`), 'critical'); return; }
    if (scanRef.current) { say(L('أمسح المكان، استمر بالدوران ببطء.', 'Scanning, keep turning slowly.'), 'critical'); return; }
    speakTracked(summaryText(map, lg, 3), 'critical');
  }, []);

  const handleVoiceInput = useCallback((txt: string) => {
    const text = txt.trim();
    if (!text) return;
    const targetLang = detectSwitchLang(text);
    if (targetLang && targetLang !== langRef.current) { switchLang(targetLang); return; }
    const map = mapRef.current;
    // right after "where do you want to go?", a bare answer ("الباب") is the destination
    if (awaitingDestinationRef.current) {
      const cmd0 = parseCommand(text, langRef.current);
      if (cmd0 === 'CHAT' || cmd0 === 'GO_TO') {
        awaitingDestinationRef.current = false;
        if (map.find(text, kindFromText(text)) || kindFromText(text) || cmd0 === 'GO_TO') { goTo(text); return; }
      }
    }
    const cmd = parseCommand(text, langRef.current);
    if (cmd !== 'CHAT' && !commandAllowed(cmd, 500)) return;
    switch (cmd) {
      case 'STOP': stopAll(); return;
      case 'START': if (phaseRef.current === 'stopped') begin(); return;
      case 'REPEAT': if (lastSpokenRef.current) say(lastSpokenRef.current, 'critical'); return;
      case 'SCAN_AREA': startScan(); return;
      case 'AROUND':
        if (map.objects.length) speakTracked(summaryText(map, langRef.current), 'critical');
        else startScan();
        return;
      case 'WHATS_AROUND': askVision('describe_scene'); return;
      case 'READ_TEXT': askVision('ocr'); return;
      case 'IDENTIFY': askVision('identify'); return;
      case 'SWITCH_LANG_AR': switchLang('ar'); return;
      case 'SWITCH_LANG_EN': switchLang('en'); return;
      case 'WHERE_IS': {
        const q = text.replace(/^(وين|أين|اين|فين|وينه|وينها|دور على|دوّر على|ابحث عن|إبحث عن|where'?s|where is|where are|find|help me find)\s+/i, '');
        const m = map.find(q, kindFromText(q));
        if (m) speakTracked(`${describeObject(map, m, langRef.current)}. ${L('قل خذني إليه لأرشدك.', 'Say take me there to be guided.')}`, 'critical');
        else say(L(`لم أجد ${q} في خريطة المكان بعد. قل خذني إلى ${q} وسأبحث عنه.`, `${q} isn't on the map yet. Say take me to ${q} and I'll look for it.`), 'critical');
        return;
      }
      case 'GO_TO': goTo(text); return;
      case 'CANCEL_NAV':
        clearTarget();
        targetGeoRef.current = null;
        turnByTurnRef.current = null;
        if (geoWatchRef.current != null) { try { navigator.geolocation.clearWatch(geoWatchRef.current); } catch { /* ignore */ } geoWatchRef.current = null; }
        (window as any).__beFallArmedAt = 0;
        say(BE_STRINGS[langRef.current].navCancelled, 'critical');
        return;
      case 'WHERE_AM_I':
        speakTracked(map.objects.length ? summaryText(map, langRef.current, 3) : BE_STRINGS[langRef.current].navHere, 'critical');
        return;
      case 'ARRIVED_QUERY': announceStatus(); return;
      case 'SAVE_PLACE': {
        const name = extractSaveAsName(text);
        if (!name) { say('قل: احفظ هذا المكان كالبيت', 'directional'); return; }
        navigator.geolocation?.getCurrentPosition(
          (pos) => {
            savePlace(name, { coords: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
            say(`تم حفظ موقعك الحالي باسم ${name}`, 'critical');
          },
          () => { savePlace(name, { query: name }); say(`تم حفظ ${name} كاسم. لم أحصل على الموقع الحالي.`, 'critical'); },
          { enableHighAccuracy: true, timeout: 8000 },
        );
        return;
      }
      case 'LIST_PLACES': {
        const places = listPlaces();
        say(places.length ? `أماكنك المحفوظة: ${places.map((p) => p.name).join('، ')}` : 'لا توجد أماكن محفوظة بعد', 'directional');
        return;
      }
      case 'EMERGENCY': {
        const phone = getEmergencyPhone();
        say(phone ? 'أتصل بجهة الطوارئ الآن' : 'لم يتم تعيين رقم طوارئ، اتصال بالإسعاف', 'critical');
        try { window.location.href = `tel:${phone || '911'}`; } catch { /* ignore */ }
        return;
      }
      case 'HELP':
        say(L('قل: امسح، لأتعرف على المكان. شو حولي، لأخبرك بما حولك. وين الباب، لأقول لك مكانه. خذني إلى الباب، لأرشدك خطوة بخطوة. صف، اقرأ، أو شو هاد، للوصف والقراءة. والغِ التوجيه للإيقاف.',
          "Say: scan, to learn the room. What's around me. Where is the door. Take me to the door, for step-by-step guidance. Describe, read, or what is this. And cancel navigation to stop."), 'critical');
        return;
      case 'CHAT':
      default:
        sendChat(text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopAll, begin, startScan, askVision, switchLang, goTo, clearTarget, announceStatus, sendChat]);

  // voice recognition (re-binds when the language changes)
  const handleVoiceRef = useRef(handleVoiceInput);
  useEffect(() => { handleVoiceRef.current = handleVoiceInput; }, [handleVoiceInput]);
  useEffect(() => {
    refreshVoices();
    if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = () => refreshVoices();
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.warning(lang === 'ar' ? 'متصفحك لا يدعم الأوامر الصوتية، استخدم الأزرار' : 'Voice commands are not supported in this browser, use the buttons');
      return;
    }
    const rec = new SR();
    rec.lang = BE_BCP47[lang];
    rec.continuous = true;
    rec.interimResults = true;
    let lastBargeIn = -1;
    rec.onresult = (e: any) => {
      const last = e.results[e.results.length - 1];
      const txt = (last[0]?.transcript || '').trim();
      if (!last.isFinal) {
        // the user starts talking over us: stop speaking so they are heard (but not for our own echo)
        if (txt.length >= 4 && isSpeaking() && lastBargeIn !== e.results.length - 1 && !isEcho(txt)) {
          lastBargeIn = e.results.length - 1;
          cancelAllSpeech();
        }
        return;
      }
      lastBargeIn = -1;
      if (isEcho(txt)) return; // the microphone heard the phone itself
      handleVoiceRef.current(txt);
    };
    rec.onerror = (e: any) => { if (e?.error !== 'no-speech') console.warn('rec err', e?.error); };
    rec.onend = () => {
      if (phaseRef.current === 'guiding' || phaseRef.current === 'scanning') {
        try { rec.start(); } catch { /* restarting */ }
      } else setListening(false);
    };
    recRef.current = rec;
    if (phaseRef.current === 'guiding' || phaseRef.current === 'scanning') {
      try { rec.start(); setListening(true); } catch { /* running */ }
    }
    return () => { try { rec.onend = null; rec.stop(); } catch { /* ignore */ } };
  }, [lang]);

  useEffect(() => () => { stopAll(); }, [stopAll]);

  // fall detection: warn, then call the emergency number unless cancelled
  useEffect(() => {
    if (phase !== 'guiding' && phase !== 'scanning') return;
    let enabled = true;
    try { enabled = localStorage.getItem('damij.blindEye.fallDetection.v1') !== '0'; } catch { /* default on */ }
    if (!enabled) return;
    let cancelTimer: number | null = null;
    const stop = startFallDetection(() => {
      say('تم اكتشاف سقوط محتمل. سأتصل بجهة الطوارئ بعد عشر ثوانٍ. قل "ألغِ التوجيه" لإيقاف الاتصال.', 'critical');
      vibrate([300, 120, 300, 120, 300]);
      if (cancelTimer) window.clearTimeout(cancelTimer);
      const armedAt = Date.now();
      (window as any).__beFallArmedAt = armedAt;
      cancelTimer = window.setTimeout(() => {
        if ((window as any).__beFallArmedAt !== armedAt) return;
        say('الاتصال بجهة الطوارئ الآن', 'critical');
        try { window.location.href = `tel:${getEmergencyPhone() || '911'}`; } catch { /* ignore */ }
      }, 10000);
    });
    return () => { stop(); if (cancelTimer) window.clearTimeout(cancelTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase === 'stopped' || phase === 'idle']);

  // ------------------------------------------------------------------ touch gestures
  const lastTapRef = useRef(0);
  const singleTapRef = useRef<number | null>(null);
  const longPressRef = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    if (phaseRef.current === 'idle' || phaseRef.current === 'stopped') return;
    if (e.touches.length === 2) {
      if (singleTapRef.current) window.clearTimeout(singleTapRef.current);
      if (lastSpokenRef.current) say(lastSpokenRef.current, 'critical');
      return;
    }
    if (longPressRef.current) window.clearTimeout(longPressRef.current);
    longPressRef.current = window.setTimeout(() => { longPressRef.current = null; askVision('describe_scene'); }, 850);
  };
  const onTouchEnd = () => {
    if (phaseRef.current === 'idle' || phaseRef.current === 'stopped') return;
    if (longPressRef.current) { window.clearTimeout(longPressRef.current); longPressRef.current = null; }
    const now = Date.now();
    if (now - lastTapRef.current < 360) {
      if (singleTapRef.current) { window.clearTimeout(singleTapRef.current); singleTapRef.current = null; }
      lastTapRef.current = 0;
      vibrate([80, 50, 80]);
      say(L('تحدث، أنا أستمع...', 'Speak, I am listening...'), 'critical');
      try { recRef.current?.start(); setListening(true); } catch { /* already listening */ }
    } else {
      lastTapRef.current = now;
      if (singleTapRef.current) window.clearTimeout(singleTapRef.current);
      singleTapRef.current = window.setTimeout(() => { singleTapRef.current = null; announceStatus(); }, 380);
    }
  };

  // ------------------------------------------------------------------ render
  const map = mapRef.current;
  const target = targetId != null ? map.objects.find((o) => o.id === targetId) ?? null : null;
  const destinations = phase === 'guiding' ? map.highlights(6) : [];
  const instrColor = !instr ? 'bg-black/70' : instr.key === 'arrived' ? 'bg-emerald-600' : instr.key === 'blocked' || instr.key === 'behind' ? 'bg-red-600' : instr.key === 'forward' ? 'bg-sky-700' : 'bg-amber-600';
  void mapVersion;

  return (
    <div
      className="fixed inset-0 bg-black text-white select-none overflow-hidden touch-none"
      dir={ar ? 'rtl' : 'ltr'}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <video ref={videoRef} playsInline muted className={eyesOff ? 'absolute w-0 h-0 opacity-0' : 'absolute inset-0 w-full h-full object-cover'} />
      <canvas ref={captureCanvasRef} className="hidden" />

      {/* start: one tap anywhere (needed for camera, compass, sound and speech on phones) */}
      {(phase === 'idle' || phase === 'stopped') && (
        <button
          type="button"
          onClick={begin}
          className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-black/90 p-8 text-center"
          aria-label={ar ? 'اضغط في أي مكان للبدء' : 'Tap anywhere to start'}
        >
          <Radar className="h-20 w-20 text-sky-400" />
          <span className="text-3xl font-black">{ar ? 'اضغط في أي مكان للبدء' : 'Tap anywhere to start'}</span>
          {startError ? (
            <span role="alert" className="max-w-sm rounded-2xl bg-rose-600/90 p-3 text-base font-bold">{startError}</span>
          ) : (
            <span className="max-w-sm text-base text-white/75">
              {ar
                ? 'سأطلب الكاميرا والبوصلة والميكروفون، ثم أمسح المكان وأنت تستدير ببطء، وأبني خريطة لما حولك لأرشدك إلى أي شيء فيها.'
                : "I'll ask for the camera, compass and microphone, then map the room while you turn slowly, and guide you to anything on the map."}
            </span>
          )}
        </button>
      )}
      {phase === 'starting' && (
        <div role="status" className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-black/90 p-8 text-center">
          <RefreshCw className="h-14 w-14 animate-spin text-sky-400" />
          <span className="text-2xl font-black">{ar ? 'لحظة، أشغّل الكاميرا...' : 'One moment, starting the camera...'}</span>
          <span className="max-w-sm text-sm text-white/70">
            {ar ? 'إذا ظهرت رسالة تطلب الإذن بالكاميرا أو الحركة، اضغط «سماح».' : 'If the phone asks for camera or motion access, tap Allow.'}
          </span>
        </div>
      )}

      <BlindEyeEmergencyButton />

      {!online && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-rose-600/90 text-sm font-bold shadow-2xl">
          {ar ? '⚠ بدون إنترنت — التحذير من العوائق القريبة يعمل' : '⚠ Offline — close-obstacle warnings still work'}
        </div>
      )}

      {!eyesOff && phase !== 'idle' && <HudOverlay points={points} showLabels showGrid={false} />}

      {/* top bar */}
      <div className="absolute top-0 inset-x-0 p-3 flex items-center justify-between bg-gradient-to-b from-black/85 to-transparent z-20">
        <Link to="/damij/blind-eye" onClick={stopAll} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/15 backdrop-blur text-sm">
          <ArrowLeft className="w-4 h-4" /> {t.back}
        </Link>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button onClick={toggle} aria-label={t.ariaSwitchLang} className="text-[11px] px-2 py-1 rounded-full bg-white/15 backdrop-blur flex items-center gap-1 font-bold">
            <Languages className="w-3 h-3" /> {lang.toUpperCase()}
          </button>
          <button onClick={() => setEyesOff((o) => !o)} aria-label={t.ariaEyesOff} className="text-[11px] px-2 py-1 rounded-full bg-white/15 backdrop-blur">
            {eyesOff ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
          <div className={`text-xs px-2 py-1 rounded-full backdrop-blur flex items-center gap-1 ${listening ? 'bg-blue-600/80' : 'bg-white/15'}`}>
            <Mic className="w-3 h-3" /> {listening ? t.listening : t.silent}
          </div>
          <div className="text-xs bg-white/15 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {phase === 'scanning' ? (ar ? 'مسح المكان' : 'Scanning') : phase === 'guiding' ? t.guiding : phase === 'stopped' ? t.stopped : t.starting}
          </div>
        </div>
      </div>

      {/* the virtual map */}
      {phase !== 'idle' && phase !== 'stopped' && (
        <div className={`absolute z-20 ${bigMap ? 'top-16 inset-x-0 flex justify-center' : 'top-16 start-3'}`}>
          <MiniMap map={map} targetId={targetId} version={mapVersion} big={bigMap} onToggle={() => setBigMap((b) => !b)} lang={lang} />
        </div>
      )}

      {/* scan progress */}
      {phase === 'scanning' && (
        <div className="absolute bottom-44 inset-x-4 z-20 rounded-2xl bg-fuchsia-700/90 p-4 text-center shadow-2xl backdrop-blur">
          <div className="text-lg font-extrabold">{ar ? 'استدر ببطء دورة كاملة' : 'Turn slowly in a full circle'}</div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/25">
            <div className="h-full bg-white transition-all" style={{ width: `${Math.round(scanPct * 100)}%` }} />
          </div>
          <div className="mt-2 text-sm text-white/85">
            {ar ? `${Math.round(scanPct * 100)}٪ · ${map.objects.length} عنصر على الخريطة` : `${Math.round(scanPct * 100)}% · ${map.objects.length} objects mapped`}
          </div>
          {sensorNote && <div className="mt-1 text-xs text-white/75">{sensorNote}</div>}
          <button
            onClick={(e) => { e.stopPropagation(); finishScan(); }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className="mt-3 rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold"
          >
            {ar ? 'إنهاء المسح الآن' : 'Finish scan now'}
          </button>
        </div>
      )}

      {/* busy overlay for describe / read / identify */}
      {busy && (
        <div className="absolute top-1/3 inset-x-6 z-30 flex items-center gap-3 rounded-2xl bg-fuchsia-700/95 p-4 shadow-2xl">
          <RefreshCw className="h-7 w-7 shrink-0 animate-spin" />
          <div className="text-lg font-black">
            {busy === 'describe' ? (ar ? 'أصف المشهد...' : 'Describing...') : busy === 'read' ? (ar ? 'أقرأ النص...' : 'Reading...') : (ar ? 'أتعرف على الشيء...' : 'Identifying...')}
          </div>
        </div>
      )}

      {lastAnnounced && !busy && !eyesOff && phase === 'guiding' && !instr && (
        <div className="absolute bottom-60 inset-x-4 z-20 flex items-start gap-3 rounded-xl border border-white/20 bg-black/80 p-3 text-sm shadow-2xl">
          <div className="flex-1 line-clamp-4 font-bold text-emerald-300">{lastAnnounced}</div>
          <button onClick={(e) => { e.stopPropagation(); setLastAnnounced(''); }} className="rounded bg-white/20 px-2 text-xs" aria-label="close">✕</button>
        </div>
      )}

      {errMsg && <div className="absolute top-1/2 inset-x-4 z-20 rounded-xl bg-red-600/90 p-3 text-center font-bold">{errMsg}</div>}

      {/* current instruction */}
      {phase === 'guiding' && (instr || searching) && (
        <div className={`absolute bottom-44 inset-x-4 z-20 rounded-2xl p-4 shadow-2xl ${searching ? 'bg-indigo-700/95' : instrColor}`}>
          <div className="flex items-center gap-3">
            {searching ? <Radar className="h-7 w-7 shrink-0 animate-pulse" /> : <Volume2 className="h-6 w-6 shrink-0" />}
            <div className="flex-1 text-xl font-extrabold leading-tight">
              {searching ? (ar ? `أبحث عن ${searching}... استدر ببطء` : `Looking for ${searching}... turn slowly`) : instr?.text}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); clearTarget(); say(BE_STRINGS[langRef.current].navCancelled, 'critical'); }}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              className="rounded-full bg-black/30 p-2"
              aria-label={ar ? 'إلغاء التوجيه' : 'Cancel guidance'}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {target && instr && !instr.arrived && (
            <div className="mt-2 text-sm text-white/85">
              {target.label} · {stepsText(instr.dist, lang)} · {ar ? `الساعة ${map.rel(target).clock}` : `${map.rel(target).clock} o'clock`}
            </div>
          )}
        </div>
      )}

      {/* where to: objects on the map (for a companion, or a user with some sight) */}
      {phase === 'guiding' && !targetId && !searching && destinations.length > 0 && !eyesOff && (
        <div
          className="absolute bottom-44 inset-x-3 z-20 flex flex-wrap justify-center gap-2"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {destinations.map((m) => (
            <button
              key={m.id}
              onClick={(e) => { e.stopPropagation(); lockTarget(m, true); }}
              className="flex items-center gap-1 rounded-full bg-sky-600/85 px-3 py-1.5 text-xs font-bold backdrop-blur active:scale-95"
            >
              <Navigation className="h-3 w-3" /> {m.label}
            </button>
          ))}
        </div>
      )}

      {phase === 'guiding' && !targetId && !searching && destinations.length === 0 && !eyesOff && suggestions.length > 0 && (
        <div className="absolute bottom-44 inset-x-3 z-20 flex flex-wrap justify-center gap-2" onTouchStart={(e) => e.stopPropagation()} onTouchEnd={(e) => e.stopPropagation()}>
          {suggestions.slice(0, 3).map((s, i) => (
            <button key={`${s}-${i}`} onClick={(e) => { e.stopPropagation(); handleVoiceInput(s); }} className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
              {s}
            </button>
          ))}
        </div>
      )}

      {eyesOff && phase === 'guiding' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="text-xl opacity-80">{ar ? 'الشاشة مطفأة لتوفير البطارية' : 'Screen off to save battery'}</div>
          <div className="mt-2 text-sm opacity-60">{ar ? 'الإرشاد الصوتي يعمل' : 'Voice guidance is running'}</div>
          {instr && <div className="mt-6 text-2xl font-bold">{instr.text}</div>}
        </div>
      )}

      {/* bottom dock */}
      {phase !== 'idle' && (
        <div
          className="absolute bottom-0 inset-x-0 z-30 flex flex-col gap-2 bg-gradient-to-t from-black/95 via-black/90 to-transparent p-3 sm:p-4"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto flex w-full max-w-md items-center justify-between gap-2">
            <div className="flex-1 truncate rounded-full bg-white/10 px-3 py-1 text-center text-[11px] text-white/70">
              {ar ? 'نقرة: أين أنا من الهدف • نقرتان: تحدث • ضغطة مطولة: صف' : 'Tap: status • Double-tap: speak • Long-press: describe'}
            </div>
            <button
              onClick={() => askVision('identify')}
              aria-label={ar ? 'فحص العملة والأغراض' : 'Identify currency & objects'}
              className="flex shrink-0 items-center gap-1 rounded-full border border-amber-400/50 bg-amber-500/25 px-3 py-1 text-[11px] font-bold text-amber-200"
            >
              💵 {ar ? 'عملة/غرض' : 'Item'}
            </button>
          </div>
          <div className="mx-auto flex w-full max-w-md items-center justify-between gap-2">
            {[
              { key: 'scan', icon: Radar, label: ar ? 'امسح المكان' : 'Scan', on: () => startScan(), active: phase === 'scanning' },
              { key: 'around', icon: Navigation, label: ar ? 'شو حولي' : 'Around', on: () => handleVoiceInput(ar ? 'شو حولي' : "what's around me"), active: false },
              { key: 'describe', icon: Camera, label: ar ? 'صف أمامي' : 'Describe', on: () => askVision('describe_scene'), active: busy === 'describe' },
              { key: 'read', icon: FileText, label: ar ? 'اقرأ النص' : 'Read', on: () => askVision('ocr'), active: busy === 'read' },
              {
                key: 'speak', icon: Mic, label: listening ? (ar ? 'أسمعك' : 'Listening') : (ar ? 'تحدث' : 'Speak'),
                on: () => { say(L('تحدث، أنا أستمع...', 'Speak, I am listening...'), 'critical'); try { recRef.current?.start(); setListening(true); } catch { /* listening */ } },
                active: listening,
              },
            ].map((b) => (
              <button
                key={b.key}
                onClick={b.on}
                disabled={phase === 'stopped'}
                aria-label={b.label}
                className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-3 transition-all active:scale-95 disabled:opacity-40 ${b.active ? 'bg-sky-600 font-black ring-2 ring-sky-300/70' : 'bg-white/15 text-white/85'}`}
              >
                <b.icon className="h-5 w-5" />
                <span className="text-[11px] font-bold">{b.label}</span>
              </button>
            ))}
            <button
              onClick={phase === 'stopped' ? begin : stopAll}
              aria-label={phase === 'stopped' ? t.start : t.stop}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-2xl ${phase === 'stopped' ? 'bg-emerald-600' : 'bg-rose-600'}`}
            >
              <Power className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const BlindEyeNavigator: React.FC = () => (
  <BlindEyeLangProvider>
    <BlindEyeNavigatorInner />
  </BlindEyeLangProvider>
);

export default BlindEyeNavigator;
