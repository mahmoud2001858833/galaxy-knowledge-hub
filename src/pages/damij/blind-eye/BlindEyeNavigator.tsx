import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Power, Volume2, Mic, Activity, ArrowUp, ArrowLeft as ArrowL, ArrowRight as ArrowR, Zap, Eye, EyeOff, Scan, Languages } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LocalVision, type LocalFrameStats } from './localVision';
import HudOverlay, { type DetectedPoint } from './HudOverlay';
import {
  refreshVoices, setActiveLang, enqueueSpeech, speakDedup, cancelAllSpeech,
  earcons, vibrate, isSpeaking, timeSinceLastSpeech,
} from './speechQueue';
import { BlindEyeLangProvider, useBlindEyeLang } from './BlindEyeLangContext';
import { BE_STRINGS, BE_BCP47, defaultSuggestions, type BELang } from './i18n';
import { parseCommand, commandAllowed } from './voiceCommands';
import { parseDestination, LANDMARK_AR, type LocalLandmark } from './navigation/destinationParser';
import { geocodePlace, haversine, bearing, relativeDirectionAr, formatDistanceAr, type LatLng } from './navigation/geo';
import { findTarget, buildStepAr, type LandmarkPoint } from './navigation/localGuidance';
import { getPlace, savePlace, listPlaces, extractSaveAsName, canonicalizePlaceName, getEmergencyPhone } from './navigation/savedPlaces';
import { recognizeImage } from './navigation/ocr';
import { startCompass, requestCompassPermission } from './navigation/compass';
import { startFallDetection, requestMotionPermission } from './navigation/fallDetection';
import { fetchRoute, makeNavState, advanceStep, type TurnByTurnState } from './navigation/turnByTurn';


type Phase = 'starting' | 'calibrating' | 'guiding' | 'stopped';

type AIObject = {
  x: number; y: number; w: number; h: number;
  label: string; hazard: 'low'|'medium'|'high'; proximity: number;
};

type Guide = {
  objects?: AIObject[];
  best_path: 'left'|'center'|'right';
  global_proximity: number;
  spoken: string;
  obstacles_summary: string;
};

type Calib = {
  position_ok: boolean;
  issue?: string | null;
  adjustment?: string | null;
  spoken: string;
};

const BlindEyeNavigatorInner: React.FC = () => {
  const { lang, setLang, toggle } = useBlindEyeLang();
  const langRef = useRef<BELang>(lang);
  useEffect(() => { langRef.current = lang; setActiveLang(lang); }, [lang]);
  const t = BE_STRINGS[lang];

  const videoRef = useRef<HTMLVideoElement>(null);
  const captureCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const localVisionRef = useRef<LocalVision | null>(null);
  const phaseRef = useRef<Phase>('starting');
  const inflightRef = useRef(0);
  const cooldownUntilRef = useRef(0);
  const calibAttemptsRef = useRef<number>(0);
  const lastAITickRef = useRef<number>(0);
  const lastLocalTickRef = useRef<number>(0);
  const lastGuideRef = useRef<Guide | null>(null);
  const lastStatsRef = useRef<LocalFrameStats | null>(null);
  const chatHistoryRef = useRef<Array<{ role: 'user'|'assistant'; text: string }>>([]);
  const userSpeakingRef = useRef<boolean>(false);
  const lastHazardSoundRef = useRef<number>(0);
  const lastApproachSoundRef = useRef<number>(0);
  const lastDirSoundRef = useRef<number>(0);
  const prevProximityRef = useRef<number>(0);
  const sceneChangePendingRef = useRef<boolean>(false);
  const lastSceneChangeAt = useRef<number>(0);
  const lastSpokenPathRef = useRef<{ path: string; t: number }>({ path: '', t: 0 });
  const MAX_CALIB_ATTEMPTS = 1; // reduced for sub-3s startup
  // Navigation state
  const targetLocalRef = useRef<LocalLandmark | null>(null);
  const targetGeoRef = useRef<{ name: string; dest: LatLng } | null>(null);
  const geoWatchRef = useRef<number | null>(null);
  const userPosRef = useRef<LatLng | null>(null);
  const userHeadingRef = useRef<number | null>(null);
  const lastNavSpeakRef = useRef<number>(0);
  const targetStableRef = useRef<{ seen: number; missed: number }>({ seen: 0, missed: 0 });
  const lastNavTextRef = useRef<string>('');
  const turnByTurnRef = useRef<TurnByTurnState | null>(null);




  const [phase, setPhase] = useState<Phase>('starting');
  const [lastGuide, setLastGuide] = useState<Guide | null>(null);
  const [lastCalib, setLastCalib] = useState<Calib | null>(null);
  const [listening, setListening] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [aiFps, setAiFps] = useState<number>(0);
  const [points, setPoints] = useState<DetectedPoint[]>([]);
  const [companionMode, setCompanionMode] = useState<boolean>(true);
  const [eyesOff, setEyesOff] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>(defaultSuggestions[lang]);

  const setPhaseBoth = (p: Phase) => { phaseRef.current = p; setPhase(p); };

  // Default suggestions follow the language
  useEffect(() => { setSuggestions(defaultSuggestions[lang]); }, [lang]);

  // ---- Camera ----
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      calibAttemptsRef.current = 0;
      setPhaseBoth('calibrating');
      enqueueSpeech({ text: BE_STRINGS[langRef.current].greet, priority: 'critical', lang: langRef.current });
      // auto-promote to guiding after a brief moment so first AI tick can render immediately
      setTimeout(() => {
        if (phaseRef.current === 'calibrating') setPhaseBoth('guiding');
      }, 1500);
    } catch (e) {
      console.error(e);
      toast.error(BE_STRINGS[langRef.current].cameraFailed);
      enqueueSpeech({ text: BE_STRINGS[langRef.current].cameraDenied, priority: 'critical', lang: langRef.current });
    }
  }, []);

  const stopAll = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setPhaseBoth('stopped');
    cancelAllSpeech();
    try { recRef.current?.stop(); } catch {}
    setListening(false);
    targetLocalRef.current = null;
    targetGeoRef.current = null;
    if (geoWatchRef.current != null) {
      try { navigator.geolocation.clearWatch(geoWatchRef.current); } catch {}
      geoWatchRef.current = null;
    }
    enqueueSpeech({ text: BE_STRINGS[langRef.current].stopping, priority: 'critical', lang: langRef.current });
  }, []);

  // ---- Frame capture for AI ----
  const captureFrame = useCallback((mode: 'calibration'|'fast'|'detailed'|'points'): string | null => {
    const v = videoRef.current;
    const c = captureCanvasRef.current;
    if (!v || !c || v.readyState < 2) return null;
    const w = mode === 'calibration' ? 224 : mode === 'detailed' ? 480 : 256;
    const h = Math.round((v.videoHeight / v.videoWidth) * w) || Math.round(w * 0.75);
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0, w, h);
    const q = mode === 'calibration' ? 0.4 : mode === 'detailed' ? 0.6 : 0.45;
    return c.toDataURL('image/jpeg', q);

  }, []);

  // ---- AI tick ----
  const runAI = useCallback(async (mode: 'calibration'|'fast'|'detailed'|'points') => {
    if (Date.now() < cooldownUntilRef.current) return;
    if (inflightRef.current >= 4) return;
    const img = captureFrame(mode);

    if (!img) return;
    inflightRef.current += 1;
    const t0 = performance.now();
    try {
      const g = lastGuideRef.current;
      const ctx = g ? `top: ${g.obstacles_summary?.slice(0, 50)}. path: ${g.best_path}.` : undefined;
      const { data, error } = await supabase.functions.invoke('blind-eye-vision', {
        body: { image: img, mode, context: ctx, lang: langRef.current },
      });
      const dt = Math.round(performance.now() - t0);
      setLatencyMs(dt);
      setAiFps(Math.round(1000 / Math.max(dt, 200)));

      if (error) {
        const status = (error as any)?.context?.response?.status ?? (error as any)?.status;
        if (status === 429 || status === 402) {
          cooldownUntilRef.current = Date.now() + 2500;
          setErrMsg(status === 402 ? BE_STRINGS[langRef.current].outOfCredits : BE_STRINGS[langRef.current].rateLimit);
          return;
        }
        throw error;
      }

      setErrMsg(null);
      if (!data?.spoken) return;

      if (mode === 'calibration') {
        const c = data as Calib;
        setLastCalib(c);
        calibAttemptsRef.current += 1;
        // skip speaking calibration message — we promote to guiding fast
        if (c.position_ok || calibAttemptsRef.current >= MAX_CALIB_ATTEMPTS) {
          setTimeout(() => {
            enqueueSpeech({ text: BE_STRINGS[langRef.current].startNow, priority: 'critical', lang: langRef.current });
            setPhaseBoth('guiding');
          }, 200);
        }
      } else {
        const g = data as Guide;
        lastGuideRef.current = g;
        setLastGuide(g);
        if (Array.isArray(g.objects)) {
          setPoints(g.objects.map(o => ({
            x: Math.max(0, Math.min(1, o.x)),
            y: Math.max(0, Math.min(1, o.y)),
            w: o.w, h: o.h,
            label: o.label,
            hazard: o.hazard,
            proximity: o.proximity,
            source: 'ai' as const,
          })));
        }
        const score = g.global_proximity ?? 0;
        const bucket = score >= 75 ? 'H' : score >= 40 ? 'M' : 'L';
        const key = `${g.best_path}|${bucket}|${g.spoken}`;
        const pri = score >= 75 ? 'critical' : score >= 40 ? 'directional' : 'descriptive';
        const now = Date.now();
        const samePath = lastSpokenPathRef.current.path === `${g.best_path}|${bucket}`;
        const tooRecent = samePath && now - lastSpokenPathRef.current.t < (score >= 75 ? 400 : 1200);
        // If user is speaking AND scene is safe, defer; otherwise (urgent), interrupt.
        if (!(userSpeakingRef.current && score < 60) && !tooRecent) {
          speakDedup(g.spoken, key, pri, score >= 75 ? 400 : 1200, {
            lang: langRef.current,
          });
          lastSpokenPathRef.current = { path: `${g.best_path}|${bucket}`, t: now };
        }

        const prev = prevProximityRef.current;
        if (score >= 75 && Date.now() - lastHazardSoundRef.current > 700) {
          lastHazardSoundRef.current = Date.now();
          const pan = g.best_path === 'left' ? 0.9 : g.best_path === 'right' ? -0.9 : 0;
          earcons.hazard(pan);
          vibrate([180, 70, 180]);
        } else if (score - prev > 12 && Date.now() - lastApproachSoundRef.current > 900) {
          lastApproachSoundRef.current = Date.now();
          earcons.approach();
          if (score >= 40) vibrate(60);
        } else if (prev - score > 15 && Date.now() - lastApproachSoundRef.current > 1200) {
          lastApproachSoundRef.current = Date.now();
          earcons.away();
        }
        prevProximityRef.current = score;
        if (Date.now() - lastDirSoundRef.current > 2500) {
          lastDirSoundRef.current = Date.now();
          if (g.best_path === 'left') earcons.pointLeft();
          else if (g.best_path === 'right') earcons.pointRight();
          else earcons.pointAhead();
        }

        // ---- Target-oriented local navigation (with stability filter) ----
        if (targetLocalRef.current && Array.isArray(g.objects)) {
          const lps: LandmarkPoint[] = g.objects.map((o: AIObject) => ({
            x: o.x, y: o.y, w: o.w, h: o.h, label: o.label, proximity: o.proximity,
          }));
          const found = findTarget(lps, targetLocalRef.current);
          if (found) { targetStableRef.current.seen += 1; targetStableRef.current.missed = 0; }
          else { targetStableRef.current.missed += 1; targetStableRef.current.seen = 0; }
          const confident = found && targetStableRef.current.seen >= 2;
          const reallyLost = !found && targetStableRef.current.missed >= 4;
          const step = buildStepAr(targetLocalRef.current, confident ? found : (reallyLost ? null : null));
          const nowN = Date.now();
          if ((confident || reallyLost) && nowN - lastNavSpeakRef.current > 1800 && step.text !== lastNavTextRef.current) {
            lastNavSpeakRef.current = nowN;
            lastNavTextRef.current = step.text;
            const pri = step.arrived ? 'critical' : 'directional';
            enqueueSpeech({ text: step.text, priority: pri as any, lang: langRef.current });
            if (step.arrived) {
              targetLocalRef.current = null;
              targetStableRef.current = { seen: 0, missed: 0 };
              earcons.approach();
              vibrate([120, 60, 120]);
            }
          }
        }
      }
    } catch (e) {
      console.warn('AI tick error', e);
    } finally {
      inflightRef.current = Math.max(0, inflightRef.current - 1);
    }
  }, [captureFrame]);

  // Gyro-based motion trigger
  useEffect(() => {
    if (phase === 'stopped') return;
    const handler = (e: DeviceMotionEvent) => {
      const r = e.rotationRate;
      if (!r) return;
      const mag = Math.abs(r.alpha || 0) + Math.abs(r.beta || 0) + Math.abs(r.gamma || 0);
      if (mag > 45) sceneChangePendingRef.current = true;
    };
    window.addEventListener('devicemotion', handler);
    return () => window.removeEventListener('devicemotion', handler);
  }, [phase]);

  // ---- Main loop ----
  useEffect(() => {
    if (phase === 'stopped' || phase === 'starting') return;
    if (!localVisionRef.current) localVisionRef.current = new LocalVision();

    let cancelled = false;
    const loop = () => {
      if (cancelled) return;
      const now = Date.now();
      const v = videoRef.current;

      if (v && now - lastLocalTickRef.current >= 70) {
        lastLocalTickRef.current = now;
        const stats = localVisionRef.current!.analyze(v);
        if (stats) {
          lastStatsRef.current = stats;
          const bottomDanger = stats.bottomMotion > 0.18 && (stats.cells[7].edge > 0.35 || stats.cells[6].edge > 0.35 || stats.cells[8].edge > 0.35);
          if (bottomDanger && now - lastHazardSoundRef.current > 600) {
            lastHazardSoundRef.current = now;
            earcons.hazard(0);
            vibrate(50);
          }
          if (stats.sceneChange > 0.28) sceneChangePendingRef.current = true;

          if (companionMode) {
            const localPts: DetectedPoint[] = [];
            stats.cells.forEach((cell, idx) => {
              const cx = (idx % 3 + 0.5) / 3;
              const cy = (Math.floor(idx / 3) + 0.5) / 3;
              const activity = Math.max(cell.motion, cell.edge * 0.7);
              if (activity > 0.2) {
                localPts.push({
                  x: cx, y: cy,
                  label: '',
                  hazard: activity > 0.5 && cy > 0.5 ? 'high' : activity > 0.4 ? 'medium' : 'low',
                  proximity: Math.round(activity * 100),
                  source: 'local',
                });
              }
            });
            setPoints(prev => {
              const aiOnly = prev.filter(p => p.source === 'ai');
              return [...aiOnly, ...localPts.slice(0, 9)];
            });
          }
        }
      }

      const score = lastGuideRef.current?.global_proximity ?? 0;
      const stats = lastStatsRef.current;
      const sceneChanged = sceneChangePendingRef.current;
      const stagnant = stats && stats.globalMotion < 0.012;
      let minGap = phase === 'calibrating' ? 1000 : score >= 75 ? 350 : score >= 40 ? 500 : 1200;
      if (sceneChanged) minGap = 220;
      if (stagnant && phase === 'guiding') minGap = Math.max(minGap, 3000);

      if (now - lastAITickRef.current >= minGap) {
        lastAITickRef.current = now;
        if (sceneChanged) {
          sceneChangePendingRef.current = false;
          if (now - lastSceneChangeAt.current > 1500) {
            lastSceneChangeAt.current = now;
            earcons.sceneChange();
          }
        }
        const mode = phase === 'calibrating' ? 'calibration' : 'points';
        runAI(mode);
        if (phase === 'guiding') earcons.scanTick();
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [phase, companionMode, runAI]);

  // Speak "started" once when guiding begins
  useEffect(() => {
    if (phase === 'guiding') {
      const timer = setTimeout(() => {
        enqueueSpeech({ text: BE_STRINGS[langRef.current].starting2, priority: 'critical', lang: langRef.current });
        // force an immediate AI tick so points appear ASAP
        runAI('points');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [phase, runAI]);

  // ---- Voice chat dispatcher ----
  const sendChat = useCallback(async (text: string) => {
    userSpeakingRef.current = true;
    const g = lastGuideRef.current;
    const visualContext = g
      ? `top obstacle: ${g.obstacles_summary}. best direction: ${g.best_path}. proximity: ${g.global_proximity}/100.`
      : undefined;
    chatHistoryRef.current = [...chatHistoryRef.current, { role: 'user' as const, text }].slice(-4);
    try {
      const { data, error } = await supabase.functions.invoke('blind-eye-chat', {
        body: {
          text,
          history: chatHistoryRef.current.slice(0, -1),
          visualContext,
          lang: langRef.current,
        },
      });
      if (error) throw error;
      if (data?.spoken) {
        chatHistoryRef.current = [...chatHistoryRef.current, { role: 'assistant' as const, text: data.spoken }].slice(-4);
        if (Array.isArray(data.suggestions) && data.suggestions.length) {
          setSuggestions(data.suggestions.slice(0, 3));
        }
        enqueueSpeech({
          text: data.spoken,
          priority: 'directional',
          rate: langRef.current === 'ar' ? 1.0 : 1.1,
          lang: langRef.current,
          onEnd: () => { userSpeakingRef.current = false; },
        });
      } else {
        userSpeakingRef.current = false;
      }
    } catch (e) {
      console.warn('chat err', e);
      userSpeakingRef.current = false;
    }
  }, []);

  const switchLang = useCallback((next: BELang) => {
    if (next === langRef.current) return;
    setLang(next);
    setActiveLang(next);
    cancelAllSpeech();
    // Re-bind recognition language on next loop tick
    try { recRef.current?.stop(); } catch {}
    enqueueSpeech({ text: BE_STRINGS[next].switchedLang, priority: 'critical', lang: next });
  }, [setLang]);

  const handleVoiceInput = useCallback((txt: string) => {
    const text = txt.trim();
    if (!text) return;
    const cmd = parseCommand(text, langRef.current);
    if (cmd !== 'CHAT' && !commandAllowed(cmd)) return;
    switch (cmd) {
      case 'STOP': stopAll(); return;
      case 'START':
        if (phaseRef.current === 'stopped') startCamera();
        return;
      case 'REPEAT':
        if (lastGuideRef.current?.spoken) {
          enqueueSpeech({ text: lastGuideRef.current.spoken, priority: 'critical', lang: langRef.current });
        }
        return;
      case 'SCAN_AREA':
      case 'WHATS_AROUND':
        runAI('detailed');
        enqueueSpeech({ text: BE_STRINGS[langRef.current].scanningArea, priority: 'directional', lang: langRef.current });
        return;
      case 'SWITCH_LANG_AR': switchLang('ar'); return;
      case 'SWITCH_LANG_EN': switchLang('en'); return;
      case 'CANCEL_NAV': {
        targetLocalRef.current = null;
        targetGeoRef.current = null;
        if (geoWatchRef.current != null) {
          try { navigator.geolocation.clearWatch(geoWatchRef.current); } catch {}
          geoWatchRef.current = null;
        }
        // Disarm any pending fall-detection emergency call
        (window as any).__beFallArmedAt = 0;
        enqueueSpeech({ text: BE_STRINGS[langRef.current].navCancelled, priority: 'critical', lang: langRef.current });
        return;
      }

      case 'WHERE_AM_I': {
        enqueueSpeech({ text: BE_STRINGS[langRef.current].navHere, priority: 'directional', lang: langRef.current });
        return;
      }
      case 'ARRIVED_QUERY': {
        const g = targetGeoRef.current; const up = userPosRef.current;
        if (g && up) {
          const dist = haversine(up, g.dest);
          enqueueSpeech({ text: `${formatDistanceAr(dist)} ${dist < 20 ? '— وصلت' : 'باقي'}`, priority: 'directional', lang: langRef.current });
        } else if (targetLocalRef.current) {
          enqueueSpeech({ text: `أبحث عن ${LANDMARK_AR[targetLocalRef.current]}`, priority: 'directional', lang: langRef.current });
        } else {
          enqueueSpeech({ text: 'لا يوجد توجيه نشط حالياً', priority: 'directional', lang: langRef.current });
        }
        return;
      }
      case 'GO_TO': {
        const dest = parseDestination(text);
        if (!dest) { sendChat(text); return; }
        if (dest.kind === 'local') {
          targetGeoRef.current = null;
          if (geoWatchRef.current != null) { try { navigator.geolocation.clearWatch(geoWatchRef.current); } catch {} geoWatchRef.current = null; }
          targetLocalRef.current = dest.landmark;
          targetStableRef.current = { seen: 0, missed: 0 };
          lastNavTextRef.current = '';
          enqueueSpeech({ text: `${BE_STRINGS[langRef.current].navStartLocal} ${dest.arabic}`, priority: 'critical', lang: langRef.current });
          runAI('points');
        } else {
          // Check saved places first (e.g. "البيت" / "المدرسة") to skip geocoding.
          const canonical = canonicalizePlaceName(dest.query);
          const saved = getPlace(canonical);
          const startGeo = (latlng: LatLng, displayName: string) => {
            targetGeoRef.current = { name: displayName, dest: latlng };
            if (!navigator.geolocation) {
              enqueueSpeech({ text: BE_STRINGS[langRef.current].navGpsDenied, priority: 'critical', lang: langRef.current });
              return;
            }
            if (geoWatchRef.current != null) { try { navigator.geolocation.clearWatch(geoWatchRef.current); } catch {} }
            geoWatchRef.current = navigator.geolocation.watchPosition(
              (pos) => {
                userPosRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                if (pos.coords.heading != null && !Number.isNaN(pos.coords.heading)) userHeadingRef.current = pos.coords.heading;
                const tg = targetGeoRef.current;
                if (!tg) return;
                const dist = haversine(userPosRef.current, tg.dest);
                const now = Date.now();
                if (now - lastNavSpeakRef.current < 4000) return;
                lastNavSpeakRef.current = now;
                if (dist < 20) {
                  enqueueSpeech({ text: `${BE_STRINGS[langRef.current].navArrived} ${tg.name}`, priority: 'critical', lang: langRef.current });
                  if (geoWatchRef.current != null) { try { navigator.geolocation.clearWatch(geoWatchRef.current); } catch {} geoWatchRef.current = null; }
                  targetGeoRef.current = null;
                  return;
                }
                const b = bearing(userPosRef.current, tg.dest);
                const dir = relativeDirectionAr(b, userHeadingRef.current);
                enqueueSpeech({ text: `${dir} — ${formatDistanceAr(dist)} باتجاه ${tg.name}`, priority: 'directional', lang: langRef.current });
              },
              () => enqueueSpeech({ text: BE_STRINGS[langRef.current].navGpsDenied, priority: 'critical', lang: langRef.current }),
              { enableHighAccuracy: true, maximumAge: 4000, timeout: 12000 }
            );
          };
          if (saved?.coords) {
            enqueueSpeech({ text: `${BE_STRINGS[langRef.current].navStartGeo} ${saved.name}`, priority: 'critical', lang: langRef.current });
            startGeo(saved.coords, saved.name);
          } else {
            const queryForGeo = saved?.query || dest.query;
            enqueueSpeech({ text: `${BE_STRINGS[langRef.current].navStartGeo} ${saved?.name || dest.query}`, priority: 'critical', lang: langRef.current });
            geocodePlace(queryForGeo).then((latlng) => {
              if (!latlng) { enqueueSpeech({ text: BE_STRINGS[langRef.current].navNotFound, priority: 'critical', lang: langRef.current }); return; }
              if (saved) savePlace(saved.name, { query: queryForGeo, coords: latlng });
              startGeo(latlng, saved?.name || dest.query);
            });
          }
        }
        return;
      }
      case 'SAVE_PLACE': {
        const name = extractSaveAsName(text);
        if (!name) { enqueueSpeech({ text: 'قل: احفظ هذا المكان كالبيت', priority: 'directional', lang: langRef.current }); return; }
        if (userPosRef.current) {
          savePlace(name, { coords: userPosRef.current });
          enqueueSpeech({ text: `تم حفظ موقعك الحالي باسم ${name}`, priority: 'critical', lang: langRef.current });
        } else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
              userPosRef.current = c;
              savePlace(name, { coords: c });
              enqueueSpeech({ text: `تم حفظ موقعك الحالي باسم ${name}`, priority: 'critical', lang: langRef.current });
            },
            () => {
              savePlace(name, { query: name });
              enqueueSpeech({ text: `تم حفظ ${name} كاسم. لم أحصل على الموقع الحالي.`, priority: 'critical', lang: langRef.current });
            },
            { enableHighAccuracy: true, timeout: 8000 }
          );
        } else {
          savePlace(name, { query: name });
          enqueueSpeech({ text: `تم حفظ ${name}`, priority: 'critical', lang: langRef.current });
        }
        return;
      }
      case 'LIST_PLACES': {
        const places = listPlaces();
        if (places.length === 0) { enqueueSpeech({ text: 'لا توجد أماكن محفوظة بعد', priority: 'directional', lang: langRef.current }); return; }
        enqueueSpeech({ text: `أماكنك المحفوظة: ${places.map(p => p.name).join('، ')}`, priority: 'directional', lang: langRef.current });
        return;
      }
      case 'EMERGENCY': {
        const phone = getEmergencyPhone();
        enqueueSpeech({ text: phone ? 'أتصل بجهة الطوارئ الآن' : 'لم يتم تعيين رقم طوارئ، اتصال بالإسعاف', priority: 'critical', lang: langRef.current });
        const tel = phone || '911';
        try { window.location.href = `tel:${tel}`; } catch {}
        return;
      }
      case 'READ_TEXT': {
        enqueueSpeech({ text: BE_STRINGS[langRef.current].scanningArea, priority: 'directional', lang: langRef.current });
        const img = captureFrame('detailed');
        if (!img) { enqueueSpeech({ text: 'لم أتمكن من التقاط الصورة', priority: 'directional', lang: langRef.current }); return; }
        recognizeImage(img).then((txt) => {
          const clean = (txt || '').replace(/\s+/g, ' ').trim();
          if (!clean) { enqueueSpeech({ text: 'لا أرى نصاً واضحاً', priority: 'directional', lang: langRef.current }); return; }
          enqueueSpeech({ text: clean.slice(0, 400), priority: 'directional', lang: langRef.current });
        }).catch(() => enqueueSpeech({ text: 'تعذرت قراءة النص', priority: 'directional', lang: langRef.current }));
        return;
      }
      case 'HELP':
        sendChat(langRef.current === 'ar' ? 'ماذا تستطيع أن تفعل؟ اقترح ٣ أوامر مفيدة.' : 'What can you do? Suggest 3 useful commands.');
        return;
      case 'CHAT':
      default:
        sendChat(text);
        return;
    }
  }, [startCamera, stopAll, runAI, switchLang, sendChat]);

  // Voice recognition (re-binds when language changes)
  useEffect(() => {
    refreshVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => { refreshVoices(); };
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      toast.warning(lang === 'ar' ? 'متصفحك لا يدعم الأوامر الصوتية الدائمة' : 'Your browser does not support continuous voice commands');
      return;
    }
    const rec = new SR();
    rec.lang = BE_BCP47[lang];
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      if (isSpeaking()) return;
      const txt = e.results[e.results.length - 1][0].transcript;
      handleVoiceInput(txt);
    };
    rec.onerror = (e: any) => { console.warn('rec err', e?.error); };
    rec.onend = () => {
      if (phaseRef.current !== 'stopped') {
        try { rec.start(); } catch {}
      } else {
        setListening(false);
      }
    };
    recRef.current = rec;
    try { rec.start(); setListening(true); } catch {}
    return () => { try { rec.stop(); } catch {} };
  }, [lang, handleVoiceInput]);

  useEffect(() => {
    startCamera();
    return () => { stopAll(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Compass: keep userHeadingRef fresh even when standing still ----
  useEffect(() => {
    if (phase === 'stopped') return;
    let stop: (() => void) | null = null;
    (async () => {
      await requestCompassPermission();
      stop = startCompass((h) => { userHeadingRef.current = h; });
    })();
    return () => { stop?.(); };
  }, [phase]);

  // ---- Fall detection: warn + auto-call emergency after countdown ----
  useEffect(() => {
    if (phase === 'stopped') return;
    let enabled = true;
    try { enabled = localStorage.getItem('damij.blindEye.fallDetection.v1') !== '0'; } catch {}
    if (!enabled) return;
    let cancelTimer: number | null = null;
    let stop: (() => void) | null = null;
    (async () => {
      await requestMotionPermission();
      stop = startFallDetection(() => {
        enqueueSpeech({
          text: 'تم اكتشاف سقوط محتمل. سأتصل بجهة الطوارئ بعد عشر ثوانٍ. قل "ألغِ" لإيقاف الاتصال.',
          priority: 'critical', lang: langRef.current,
        });
        vibrate([300, 120, 300, 120, 300]);
        if (cancelTimer) window.clearTimeout(cancelTimer);
        const armedAt = Date.now();
        (window as any).__beFallArmedAt = armedAt;
        cancelTimer = window.setTimeout(() => {
          if ((window as any).__beFallArmedAt !== armedAt) return;
          const phone = getEmergencyPhone() || '911';
          enqueueSpeech({ text: 'الاتصال بجهة الطوارئ الآن', priority: 'critical', lang: langRef.current });
          try { window.location.href = `tel:${phone}`; } catch {}
        }, 10000);
      });
    })();
    return () => { stop?.(); if (cancelTimer) window.clearTimeout(cancelTimer); };
  }, [phase]);



  const score = lastGuide?.global_proximity ?? 0;
  const urgencyColor =
    phase === 'calibrating' ? 'bg-indigo-600' :
    score >= 75 ? 'bg-red-600' :
    score >= 40 ? 'bg-amber-500' : 'bg-emerald-600';

  const PathArrow = lastGuide?.best_path === 'left' ? ArrowL : lastGuide?.best_path === 'right' ? ArrowR : ArrowUp;

  return (
    <div className="fixed inset-0 bg-black text-white" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {!eyesOff && <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />}
      {eyesOff && <video ref={videoRef} playsInline muted className="absolute inset-0 w-0 h-0 opacity-0" />}
      <canvas ref={captureCanvasRef} className="hidden" />

      {!eyesOff && phase === 'guiding' && (
        <HudOverlay
          points={points}
          bestPath={lastGuide?.best_path}
          showLabels={companionMode}
          showGrid={companionMode}
        />
      )}

      <div className="absolute top-0 inset-x-0 p-3 flex items-center justify-between bg-gradient-to-b from-black/85 to-transparent z-10">
        <Link
          to="/damij/blind-eye"
          onClick={stopAll}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/15 backdrop-blur text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> {t.back}
        </Link>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={toggle}
            aria-label={t.ariaSwitchLang}
            title={t.langToggleTitle}
            className="text-[11px] px-2 py-1 rounded-full bg-white/15 backdrop-blur flex items-center gap-1 font-bold"
          >
            <Languages className="w-3 h-3" /> {lang.toUpperCase()}
          </button>
          {phase === 'guiding' && (
            <>
              <div className="text-[11px] bg-white/15 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1 font-mono">
                <Zap className="w-3 h-3" /> {latencyMs}ms
              </div>
              <div className="text-[11px] bg-white/15 backdrop-blur px-2 py-1 rounded-full font-mono">
                {aiFps}fps
              </div>
              <button
                onClick={() => setCompanionMode(m => !m)}
                aria-label={t.ariaToggleCompanion}
                className={`text-[11px] px-2 py-1 rounded-full backdrop-blur ${companionMode ? 'bg-emerald-600/80' : 'bg-white/15'}`}
              >
                {companionMode ? t.companion : t.blind}
              </button>
              <button
                onClick={() => setEyesOff(o => !o)}
                aria-label={t.ariaEyesOff}
                className="text-[11px] px-2 py-1 rounded-full bg-white/15 backdrop-blur flex items-center gap-1"
              >
                {eyesOff ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </>
          )}
          <div className={`text-xs px-2 py-1 rounded-full backdrop-blur flex items-center gap-1 ${listening ? 'bg-blue-600/80' : 'bg-white/15'}`}>
            <Mic className="w-3 h-3" />
            {listening ? t.listening : t.silent}
          </div>
          <div className="text-xs bg-white/15 backdrop-blur px-2 py-1 rounded-full flex items-center gap-1">
            <Activity className="w-3 h-3" />
            {phase === 'calibrating' ? t.calibrating : phase === 'guiding' ? t.guiding : phase === 'stopped' ? t.stopped : t.starting}
          </div>
        </div>
      </div>

      {phase === 'guiding' && lastGuide && !eyesOff && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-black/60 backdrop-blur rounded-full p-3 border-2 border-white/40 shadow-2xl">
            <PathArrow className="w-10 h-10" />
          </div>
        </div>
      )}

      {phase === 'calibrating' && lastCalib && (
        <div className="absolute top-20 inset-x-4 p-5 rounded-2xl bg-indigo-700/90 backdrop-blur shadow-2xl z-10">
          <div className="text-2xl font-extrabold leading-tight">{lastCalib.spoken}</div>
          {lastCalib.adjustment && (
            <div className="mt-2 text-white/90 text-sm">{lastCalib.adjustment}</div>
          )}
        </div>
      )}

      {errMsg && (
        <div className="absolute top-20 inset-x-4 p-3 rounded-xl bg-red-600/90 backdrop-blur z-10 text-center font-bold">
          {errMsg}
        </div>
      )}

      {phase === 'guiding' && lastGuide && !eyesOff && (
        <div className={`absolute bottom-40 inset-x-4 p-4 rounded-2xl ${urgencyColor} shadow-2xl z-10`}>
          <div className="flex items-center gap-3">
            <Volume2 className="w-6 h-6 shrink-0" />
            <div className="text-xl font-extrabold leading-tight">{lastGuide.spoken}</div>
          </div>
          {lastGuide.obstacles_summary && (
            <div className="mt-2 text-white/90 text-sm">{lastGuide.obstacles_summary}</div>
          )}
          <div className="mt-2 h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full bg-white" style={{ width: `${Math.min(100, score)}%` }} />
          </div>
        </div>
      )}

      {/* Suggestions chips */}
      {phase === 'guiding' && !eyesOff && suggestions.length > 0 && (
        <div className="absolute bottom-28 inset-x-3 z-10 flex flex-wrap gap-2 justify-center">
          {suggestions.slice(0, 3).map((s, i) => (
            <button
              key={`${s}-${i}`}
              onClick={() => sendChat(s)}
              className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-semibold hover:bg-white/25 active:scale-95 transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {eyesOff && phase === 'guiding' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <div className="text-6xl font-extrabold mb-4">👁</div>
          <div className="text-xl opacity-80">{lang === 'ar' ? 'الشاشة مطفأة لتوفير البطارية' : 'Screen off to save battery'}</div>
          <div className="text-sm opacity-60 mt-2">{lang === 'ar' ? 'الإرشاد الصوتي يعمل' : 'Voice guidance is running'}</div>
          {lastGuide && (
            <div className="mt-6 text-2xl font-bold">{lastGuide.spoken}</div>
          )}
        </div>
      )}

      <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-center gap-4 bg-gradient-to-t from-black/85 to-transparent z-10">
        {phase === 'guiding' && (
          <button
            onClick={() => { runAI('detailed'); enqueueSpeech({ text: BE_STRINGS[langRef.current].scanningArea, priority: 'directional', lang: langRef.current }); }}
            aria-label={t.ariaScan}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-600 shadow-2xl active:scale-95"
          >
            <Scan className="w-7 h-7" />
          </button>
        )}
        <button
          onClick={phase === 'stopped' ? startCamera : stopAll}
          aria-label={t.ariaPower}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-lg font-extrabold shadow-2xl active:scale-95 transition-all ${phase === 'stopped' ? 'bg-emerald-600' : 'bg-red-600'}`}
        >
          <Power className="w-10 h-10" />
        </button>
      </div>
    </div>
  );
};

const BlindEyeNavigator: React.FC = () => (
  <BlindEyeLangProvider>
    <BlindEyeNavigatorInner />
  </BlindEyeLangProvider>
);

export default BlindEyeNavigator;
