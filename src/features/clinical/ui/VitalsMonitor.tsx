import React, { useEffect, useState } from 'react';
import { Heart, Activity, Wind, Thermometer, Droplet } from 'lucide-react';

interface Vitals {
  hr?: number;
  rr?: number;
  spo2?: number;
  temp_c?: number;
  bp_sys?: number;
  bp_dia?: number;
  bp?: string;
  glucose?: number;
}

interface Props {
  vitals: Vitals;
  ageYears?: number;
}

type Status = 'ok' | 'warn' | 'crit';

const tone: Record<Status, { bg: string; ring: string; text: string; dot: string; label: string }> = {
  ok:   { bg: 'from-emerald-50 to-white', ring: 'ring-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500',   label: 'طبيعي' },
  warn: { bg: 'from-amber-50 to-white',   ring: 'ring-amber-200',   text: 'text-amber-700',   dot: 'bg-amber-500',     label: 'انتباه' },
  crit: { bg: 'from-rose-50 to-white',    ring: 'ring-rose-300',    text: 'text-rose-700',    dot: 'bg-rose-600',      label: 'حرج' },
};

const hrStatus = (v?: number, age = 30): Status => {
  if (v == null) return 'ok';
  const low = age < 12 ? 70 : 60, high = age < 12 ? 130 : 100;
  if (v < low - 15 || v > high + 30) return 'crit';
  if (v < low || v > high) return 'warn';
  return 'ok';
};
const spo2Status = (v?: number): Status => v == null ? 'ok' : v < 90 ? 'crit' : v < 94 ? 'warn' : 'ok';
const rrStatus = (v?: number): Status => v == null ? 'ok' : v < 8 || v > 30 ? 'crit' : v < 12 || v > 20 ? 'warn' : 'ok';
const tempStatus = (v?: number): Status => v == null ? 'ok' : v >= 39.5 || v < 35 ? 'crit' : v >= 38 || v < 36 ? 'warn' : 'ok';
const bpStatus = (s?: number, d?: number): Status => {
  if (s == null || d == null) return 'ok';
  if (s >= 180 || s < 80 || d >= 120 || d < 50) return 'crit';
  if (s >= 140 || s < 100 || d >= 90) return 'warn';
  return 'ok';
};
const gluStatus = (v?: number): Status => v == null ? 'ok' : v < 60 || v > 250 ? 'crit' : v < 70 || v > 180 ? 'warn' : 'ok';

const Tile: React.FC<{
  icon: React.ReactNode; label: string; value: string; unit?: string; status: Status; pulse?: boolean;
}> = ({ icon, label, value, unit, status, pulse }) => {
  const t = tone[status];
  return (
    <div className={`relative p-2 rounded-xl bg-gradient-to-b ${t.bg} ring-1 ${t.ring} overflow-hidden`}>
      <div className="flex items-center justify-between gap-1">
        <span className={`text-[10px] font-bold ${t.text} truncate`}>{label}</span>
        <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${t.dot} ${status !== 'ok' ? 'animate-pulse' : ''}`} />
      </div>
      <div className="flex items-baseline gap-1 mt-0.5 leading-none">
        <span className={`text-lg font-extrabold tabular-nums ${t.text} ${pulse && status !== 'ok' ? 'animate-pulse' : ''}`}>{value}</span>
        {unit && <span className={`text-[9px] ${t.text} opacity-70 truncate`}>{unit}</span>}
      </div>
      <div className={`mt-1 flex items-center gap-1 text-[9px] ${t.text} opacity-80`}>
        <span className="opacity-70">{icon}</span><span className="truncate">{t.label}</span>
      </div>
    </div>
  );
};

const VitalsMonitor: React.FC<Props> = ({ vitals, ageYears }) => {
  const [tick, setTick] = useState(0);
  useEffect(() => { const i = setInterval(() => setTick(t => t + 1), 1200); return () => clearInterval(i); }, []);

  const hr = vitals.hr;
  const spo2 = vitals.spo2;
  const rr = vitals.rr;
  const temp = vitals.temp_c;
  const bpSys = vitals.bp_sys ?? (vitals.bp ? Number(String(vitals.bp).split('/')[0]) : undefined);
  const bpDia = vitals.bp_dia ?? (vitals.bp ? Number(String(vitals.bp).split('/')[1]) : undefined);
  const glu = vitals.glucose;

  // Slight live jitter so monitor "breathes"
  const j = (v?: number, amp = 1) => v == null ? undefined : Math.round(v + Math.sin(tick / 2) * amp);

  return (
    <div className="rounded-3xl border bg-gradient-to-b from-slate-900 to-slate-800 p-3" dir="rtl">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold text-emerald-300 tracking-wide">PATIENT MONITOR · LIVE</span>
        </div>
        <span className="text-[10px] text-slate-400 tabular-nums">
          {new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        <Tile icon={<Heart className="w-3 h-3" />} label="HR" value={hr != null ? String(j(hr, 1)) : '—'} unit="bpm" status={hrStatus(hr, ageYears)} pulse />
        <Tile icon={<Activity className="w-3 h-3" />} label="BP" value={bpSys && bpDia ? `${j(bpSys, 1)}/${j(bpDia, 0)}` : '—'} unit="mmHg" status={bpStatus(bpSys, bpDia)} />
        <Tile icon={<Droplet className="w-3 h-3" />} label="SpO₂" value={spo2 != null ? String(j(spo2, 0)) : '—'} unit="%" status={spo2Status(spo2)} />
        <Tile icon={<Wind className="w-3 h-3" />} label="RR" value={rr != null ? String(j(rr, 0)) : '—'} unit="/min" status={rrStatus(rr)} />
        <Tile icon={<Thermometer className="w-3 h-3" />} label="Temp" value={temp != null ? temp.toFixed(1) : '—'} unit="°C" status={tempStatus(temp)} />
        <Tile icon={<Droplet className="w-3 h-3" />} label="Glu" value={glu != null ? String(glu) : '—'} unit="mg/dL" status={gluStatus(glu)} />
      </div>
      <div className="mt-2 text-[10px] text-slate-400 text-center">
        تتحدّث القراءات تلقائياً بعد كل تدخّل أو استخدام جهاز
      </div>
    </div>
  );
};

export default VitalsMonitor;
