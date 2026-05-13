import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Power, Mic, MicOff, MapPin, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Guide = {
  direction: 'forward' | 'left' | 'right' | 'stop' | 'back';
  obstacle?: string | null;
  distance?: 'near' | 'mid' | 'far' | null;
  urgency: 'low' | 'medium' | 'high';
  spoken: string;
};

const speak = (text: string, urgent = false) => {
  if (!('speechSynthesis' in window)) return;
  if (urgent) window.speechSynthesis.cancel();
  else if (window.speechSynthesis.speaking) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ar-SA';
  u.rate = urgent ? 1.15 : 1;
  u.pitch = urgent ? 1.2 : 1;
  window.speechSynthesis.speak(u);
};

// Geocoding via OpenStreetMap Nominatim (free, no key)
async function geocode(query: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=ar`,
      { headers: { 'Accept': 'application/json' } }
    );
    const j = await r.json();
    if (Array.isArray(j) && j[0]) {
      return { lat: parseFloat(j[0].lat), lon: parseFloat(j[0].lon), name: j[0].display_name };
    }
  } catch (e) {
    console.warn('geocode error', e);
  }
  return null;
}

function bearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function distMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const BlindEyeNavigator: React.FC = () => {
  const [params] = useSearchParams();
  const destinationMode = params.get('mode') === 'destination';

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);

  const [running, setRunning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastGuide, setLastGuide] = useState<Guide | null>(null);
  const [listening, setListening] = useState(false);
  const [destination, setDestination] = useState<{ lat: number; lon: number; name: string } | null>(null);
  const [destInput, setDestInput] = useState('');
  const [navInfo, setNavInfo] = useState<{ dist: number; brg: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Start camera
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
      setRunning(true);
      speak('الكاميرا جاهزة. سأبدأ الإرشاد الآن.', true);
    } catch (e) {
      console.error(e);
      toast.error('تعذّر فتح الكاميرا — تحقّق من الأذونات');
      speak('تعذّر فتح الكاميرا. الرجاء السماح بالوصول.', true);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setRunning(false);
    window.speechSynthesis.cancel();
    speak('تم إيقاف الإرشاد', true);
  }, []);

  const captureFrame = useCallback((): string | null => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c || v.readyState < 2) return null;
    const w = 640;
    const h = Math.round((v.videoHeight / v.videoWidth) * w) || 480;
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0, w, h);
    return c.toDataURL('image/jpeg', 0.7);
  }, []);

  const analyzeOnce = useCallback(async () => {
    if (busy) return;
    const img = captureFrame();
    if (!img) return;
    setBusy(true);
    try {
      let context: string | undefined;
      if (destination && navInfo) {
        const cardinal = ['شمال', 'شمال شرق', 'شرق', 'جنوب شرق', 'جنوب', 'جنوب غرب', 'غرب', 'شمال غرب'];
        const dir = cardinal[Math.round(navInfo.brg / 45) % 8];
        context = `الوجهة: ${destination.name}. تبعد ${Math.round(navInfo.dist)} متراً في اتجاه ${dir}.`;
      }
      const { data, error } = await supabase.functions.invoke('blind-eye-vision', {
        body: { image: img, context },
      });
      if (error) throw error;
      if (data?.spoken) {
        const g = data as Guide;
        setLastGuide(g);
        const urgent = g.urgency === 'high';
        speak(g.spoken, urgent);
        if (urgent && 'vibrate' in navigator) navigator.vibrate([200, 100, 200]);
      }
    } catch (e) {
      console.warn('analyze error', e);
    } finally {
      setBusy(false);
    }
  }, [busy, captureFrame, destination, navInfo]);

  // Auto-capture loop
  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      analyzeOnce();
    }, 2800);
    // first immediate run
    const t = window.setTimeout(analyzeOnce, 800);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      window.clearTimeout(t);
    };
  }, [running, analyzeOnce]);

  // Voice command recognition
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'ar-SA';
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const txt = e.results[e.results.length - 1][0].transcript.trim();
      console.log('voice cmd:', txt);
      if (/توقف|أوقف|اوقف|قف/.test(txt)) {
        stopCamera();
      } else if (/أكمل|اكمل|تابع|كمل|ابدأ|ابدا/.test(txt)) {
        if (!running) startCamera();
      } else if (/أين|اين|وين/.test(txt)) {
        analyzeOnce();
      } else if (/اذهب إلى|اذهب الى|روح|خذني/.test(txt)) {
        const m = txt.match(/(?:اذهب إلى|اذهب الى|روح|خذني)\s+(?:إلى\s+)?(.+)/);
        if (m?.[1]) {
          setDestInput(m[1]);
          handleSetDestination(m[1]);
        }
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => {
      if (listening) {
        try { rec.start(); } catch {}
      }
    };
    recRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, listening]);

  const toggleListening = () => {
    const rec = recRef.current;
    if (!rec) {
      toast.error('متصفحك لا يدعم الأوامر الصوتية');
      return;
    }
    if (listening) {
      try { rec.stop(); } catch {}
      setListening(false);
    } else {
      try { rec.start(); setListening(true); speak('أنا أستمع'); } catch {}
    }
  };

  // Geolocation watch when destination set
  const handleSetDestination = async (q: string) => {
    if (!q.trim()) return;
    speak('أبحث عن الموقع');
    const dest = await geocode(q);
    if (!dest) {
      toast.error('لم أجد الموقع');
      speak('لم أجد الموقع. حاول باسم آخر.', true);
      return;
    }
    setDestination(dest);
    speak(`تم تحديد الوجهة: ${dest.name.split(',')[0]}. سأرشدك إليها.`, true);
    if (!('geolocation' in navigator)) return;
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const d = distMeters(pos.coords.latitude, pos.coords.longitude, dest.lat, dest.lon);
        const b = bearing(pos.coords.latitude, pos.coords.longitude, dest.lat, dest.lon);
        setNavInfo({ dist: d, brg: b });
        if (d < 15) {
          speak('وصلت إلى وجهتك', true);
          if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        }
      },
      (e) => console.warn('geo err', e),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  };

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const urgencyColor =
    lastGuide?.urgency === 'high' ? 'bg-red-600' :
    lastGuide?.urgency === 'medium' ? 'bg-amber-500' : 'bg-emerald-600';

  return (
    <div className="fixed inset-0 bg-black text-white" dir="rtl">
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <Link
          to="/damij/blind-eye"
          onClick={stopCamera}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur"
        >
          <ArrowLeft className="w-5 h-5" /> رجوع
        </Link>
        <div className="text-sm bg-white/15 backdrop-blur px-3 py-1.5 rounded-full">
          {busy ? 'جاري التحليل…' : running ? 'يعمل' : 'متوقف'}
        </div>
      </div>

      {/* Destination input */}
      {destinationMode && (
        <div className="absolute top-20 inset-x-4 p-3 rounded-2xl bg-black/60 backdrop-blur flex gap-2">
          <input
            type="text"
            value={destInput}
            onChange={(e) => setDestInput(e.target.value)}
            placeholder="اسم الوجهة..."
            className="flex-1 bg-white/10 px-4 py-2 rounded-xl text-white placeholder:text-white/50 outline-none"
          />
          <button
            onClick={() => handleSetDestination(destInput)}
            className="px-4 py-2 rounded-xl bg-emerald-600 font-bold"
          >
            <MapPin className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Last guide overlay */}
      {lastGuide && (
        <div className={`absolute bottom-32 inset-x-4 p-5 rounded-2xl ${urgencyColor} shadow-2xl`}>
          <div className="flex items-center gap-3">
            <Volume2 className="w-7 h-7 shrink-0" />
            <div className="text-2xl font-extrabold leading-tight">{lastGuide.spoken}</div>
          </div>
          {lastGuide.obstacle && (
            <div className="mt-2 text-white/90 text-sm">عقبة: {lastGuide.obstacle}</div>
          )}
          {navInfo && destination && (
            <div className="mt-2 text-white/90 text-sm">
              الوجهة: {Math.round(navInfo.dist)} م
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 inset-x-0 p-6 flex items-center justify-center gap-4 bg-gradient-to-t from-black/80 to-transparent">
        <button
          onClick={toggleListening}
          aria-label={listening ? 'إيقاف الأوامر الصوتية' : 'تشغيل الأوامر الصوتية'}
          className={`w-16 h-16 rounded-full flex items-center justify-center ${listening ? 'bg-blue-600' : 'bg-white/15 backdrop-blur'}`}
        >
          {listening ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
        </button>
        <button
          onClick={running ? stopCamera : startCamera}
          aria-label={running ? 'إيقاف الإرشاد' : 'تشغيل الإرشاد'}
          className={`w-24 h-24 rounded-full flex items-center justify-center text-lg font-extrabold shadow-2xl ${running ? 'bg-red-600' : 'bg-emerald-600'}`}
        >
          <Power className="w-10 h-10" />
        </button>
        <button
          onClick={analyzeOnce}
          aria-label="تحليل فوري"
          disabled={!running || busy}
          className="w-16 h-16 rounded-full bg-white/15 backdrop-blur flex items-center justify-center disabled:opacity-50"
        >
          <Volume2 className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
};

export default BlindEyeNavigator;
