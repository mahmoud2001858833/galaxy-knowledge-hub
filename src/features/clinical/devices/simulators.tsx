// All-in-one interactive medical device simulators.
// Pure Canvas/SVG/WebAudio — no external assets. Each component takes a
// CaseContext so readings reflect the patient and never need AI to render.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Droplet, Thermometer, Wind, Zap, Eye, Ear, FlaskConical, Bandage, RefreshCw } from 'lucide-react';

export interface CaseContext {
  category: string;
  severity?: string;
  age_years?: number;
  vitals?: {
    hr?: number; bp_sys?: number; bp_dia?: number; spo2?: number;
    rr?: number; temp?: number; glucose?: number; pain?: number;
  };
  presenting_signs_ar?: string[];
  name_ar?: string;
}
export interface SimProps {
  ctx: CaseContext;
  onApply?: (reading: { reading_ar: string; vitals?: any; success_score?: number }) => void;
}

// =============== shared helpers ===============
const Screen: React.FC<{ children: React.ReactNode; tone?: 'dark'|'green'|'amber' }> = ({ children, tone='dark' }) => (
  <div className={`p-3 rounded-xl font-mono text-sm text-center ${
    tone==='dark' ? 'bg-slate-900 text-emerald-300' :
    tone==='green' ? 'bg-emerald-900 text-emerald-100' :
    'bg-amber-900 text-amber-100'
  }`}>{children}</div>
);
const Wrap: React.FC<{ title: string; icon?: string; tone?: string; children: React.ReactNode }> = ({ title, icon, tone='from-sky-50 to-white', children }) => (
  <div className={`rounded-2xl border bg-gradient-to-b ${tone} p-3 space-y-2`}>
    <div className="font-bold text-sm flex items-center gap-2">{icon && <span className="text-lg">{icon}</span>}{title}</div>
    {children}
  </div>
);
const ApplyBtn: React.FC<{ onClick: () => void; label?: string }> = ({ onClick, label='✓ اعتمد القراءة كحدث في الجلسة' }) => (
  <button onClick={onClick} className="w-full py-2 rounded-xl bg-[hsl(var(--damij-primary))] text-white text-xs font-bold">{label}</button>
);

// =============== BP Monitor ===============
export const SimBP: React.FC<SimProps> = ({ ctx, onApply }) => {
  const target = { sys: ctx.vitals?.bp_sys ?? 120, dia: ctx.vitals?.bp_dia ?? 80 };
  const [phase, setPhase] = useState<'idle'|'inflating'|'reading'|'done'>('idle');
  const [cuff, setCuff] = useState(0);
  const [reading, setReading] = useState<{sys:number; dia:number; pulse:number}|null>(null);
  const start = () => {
    setPhase('inflating'); setReading(null); setCuff(0);
    const id = setInterval(() => setCuff(c => {
      if (c >= 180) { clearInterval(id); setPhase('reading');
        setTimeout(() => { setReading({ sys: target.sys, dia: target.dia, pulse: ctx.vitals?.hr ?? 75 }); setPhase('done'); }, 1800);
        return 180; }
      return c + 12;
    }), 60);
  };
  const status = reading ? (reading.sys >= 180 ? 'أزمة ارتفاع ضغط' : reading.sys >= 140 ? 'ارتفاع ضغط' : reading.sys < 90 ? 'انخفاض ضغط' : 'طبيعي') : '';
  return (
    <Wrap title="جهاز قياس ضغط الدم" icon="🩸" tone="from-rose-50 to-white">
      <Screen>
        {phase === 'idle' && '⏳ جاهز — اضغط Start'}
        {phase === 'inflating' && `🔄 ينفخ الكفّ... ${cuff} mmHg`}
        {phase === 'reading' && '🎧 يستمع لأصوات Korotkoff...'}
        {phase === 'done' && reading && (
          <div>
            <div className="text-3xl font-extrabold text-white">{reading.sys}/{reading.dia}</div>
            <div className="text-xs">mmHg • نبض {reading.pulse}</div>
            <div className="text-[11px] mt-1 text-amber-300">{status}</div>
          </div>
        )}
      </Screen>
      <div className="flex gap-2">
        <button onClick={start} disabled={phase==='inflating'||phase==='reading'} className="flex-1 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold disabled:opacity-50">▶ Start</button>
        <button onClick={() => { setPhase('idle'); setReading(null); }} className="px-3 py-2 rounded-lg bg-white border text-xs"><RefreshCw className="w-3 h-3" /></button>
      </div>
      {reading && <ApplyBtn onClick={() => onApply?.({ reading_ar: `ضغط الدم: ${reading.sys}/${reading.dia} mmHg، النبض ${reading.pulse} (${status})`, vitals: { bp_sys: reading.sys, bp_dia: reading.dia, hr: reading.pulse } })} />}
    </Wrap>
  );
};

// =============== Pulse Oximeter ===============
export const SimPulseOx: React.FC<SimProps> = ({ ctx, onApply }) => {
  const spo2 = ctx.vitals?.spo2 ?? 98;
  const hr = ctx.vitals?.hr ?? 75;
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT(v => v+1), 50);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx2 = c.getContext('2d'); if (!ctx2) return;
    const W = c.width = 280, H = c.height = 70;
    ctx2.fillStyle = '#0f172a'; ctx2.fillRect(0,0,W,H);
    ctx2.strokeStyle = '#22d3ee'; ctx2.lineWidth = 2;
    ctx2.beginPath();
    for (let x = 0; x < W; x++) {
      const phase = (x + t*4) / W * Math.PI * 4;
      const y = H/2 - Math.exp(-Math.pow((Math.sin(phase) - 0.7), 2) * 5) * 25;
      x === 0 ? ctx2.moveTo(x, y) : ctx2.lineTo(x, y);
    }
    ctx2.stroke();
  }, [t]);
  const status = spo2 < 90 ? 'نقص أكسجة شديد' : spo2 < 94 ? 'نقص أكسجة' : 'طبيعي';
  return (
    <Wrap title="مقياس الأكسجين النبضي" icon="🫁" tone="from-sky-50 to-white">
      <canvas ref={canvasRef} className="w-full rounded-lg" />
      <div className="grid grid-cols-2 gap-2">
        <Screen><div className="text-[10px]">SpO₂</div><div className="text-3xl font-extrabold text-cyan-300">{spo2}%</div></Screen>
        <Screen><div className="text-[10px]">PR</div><div className="text-3xl font-extrabold text-rose-300 animate-pulse">{hr}</div></Screen>
      </div>
      <div className="text-[11px] text-center text-slate-600">{status}</div>
      <ApplyBtn onClick={() => onApply?.({ reading_ar: `SpO₂ ${spo2}% • النبض ${hr} bpm — ${status}`, vitals: { spo2, hr } })} />
    </Wrap>
  );
};

// =============== Glucometer ===============
export const SimGlucometer: React.FC<SimProps> = ({ ctx, onApply }) => {
  const glucose = ctx.vitals?.glucose ?? 100;
  const [phase, setPhase] = useState<'idle'|'drop'|'count'|'done'>('idle');
  const [count, setCount] = useState(5);
  const start = () => {
    setPhase('drop'); setTimeout(() => {
      setPhase('count'); setCount(5);
      const id = setInterval(() => setCount(c => { if (c <= 1) { clearInterval(id); setPhase('done'); return 0; } return c-1; }), 800);
    }, 800);
  };
  const status = glucose < 70 ? 'انخفاض سكر' : glucose < 140 ? 'طبيعي' : glucose < 200 ? 'مرتفع' : 'مرتفع جداً';
  return (
    <Wrap title="جهاز قياس السكر" icon="💉" tone="from-purple-50 to-white">
      <div className="flex justify-center text-4xl py-2">
        {phase==='idle' && '🩸'}
        {phase==='drop' && <span className="animate-bounce">💧</span>}
        {phase==='count' && <span className="animate-pulse">⏳</span>}
        {phase==='done' && '✅'}
      </div>
      <Screen>
        {phase==='idle' && 'ضع قطرة دم على الشريط'}
        {phase==='drop' && 'يمتص العينة...'}
        {phase==='count' && `يحلّل... ${count}`}
        {phase==='done' && (<><div className="text-3xl font-extrabold text-white">{glucose}</div><div className="text-xs">mg/dL</div><div className="text-[11px] mt-1 text-amber-300">{status}</div></>)}
      </Screen>
      <button onClick={start} disabled={phase!=='idle'&&phase!=='done'} className="w-full py-2 rounded-lg bg-purple-600 text-white text-xs font-bold disabled:opacity-50">{phase==='done' ? 'إعادة الفحص' : 'ابدأ الفحص'}</button>
      {phase==='done' && <ApplyBtn onClick={() => onApply?.({ reading_ar: `سكر الدم: ${glucose} mg/dL (${status})`, vitals: { glucose } })} />}
    </Wrap>
  );
};

// =============== IR Thermometer ===============
export const SimThermo: React.FC<SimProps> = ({ ctx, onApply }) => {
  const temp = ctx.vitals?.temp ?? 37.0;
  const [aimed, setAimed] = useState(false);
  const status = temp >= 39 ? 'حمى عالية' : temp >= 38 ? 'حمى' : temp >= 37.5 ? 'حرارة خفيفة' : temp < 36 ? 'انخفاض حرارة' : 'طبيعي';
  const color = temp >= 38 ? 'text-rose-400' : temp >= 37.5 ? 'text-amber-300' : 'text-emerald-300';
  return (
    <Wrap title="ميزان حرارة بالأشعة تحت الحمراء" icon="🌡️" tone="from-orange-50 to-white">
      <div className="relative h-24 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-5xl">🤒</div>
        {aimed && <div className="absolute inset-0 bg-red-500/10"><div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]" /></div>}
      </div>
      <Screen>
        {aimed ? (<><div className={`text-3xl font-extrabold ${color}`}>{temp.toFixed(1)}°C</div><div className="text-[11px] mt-1">{status}</div></>) : 'صوّب نحو الجبهة'}
      </Screen>
      <button onClick={() => setAimed(true)} className="w-full py-2 rounded-lg bg-orange-600 text-white text-xs font-bold">🎯 قس الحرارة</button>
      {aimed && <ApplyBtn onClick={() => onApply?.({ reading_ar: `الحرارة: ${temp.toFixed(1)}°C (${status})`, vitals: { temp } })} />}
    </Wrap>
  );
};

// =============== Spirometer / Peak Flow ===============
const blowReading = (ctx: CaseContext, peakOnly = false) => {
  const sev = ctx.severity ?? 'low';
  const isResp = ctx.category === 'pulmonology';
  const factor = isResp && (sev==='high'||sev==='critical') ? 0.5 : isResp ? 0.7 : 0.95;
  const fvc = +(4.5 * factor).toFixed(2);
  const fev1 = +(fvc * (isResp ? 0.65 : 0.82)).toFixed(2);
  const ratio = Math.round(fev1/fvc * 100);
  const peak = Math.round(550 * factor);
  return { fvc, fev1, ratio, peak };
};
export const SimSpirometer: React.FC<SimProps> = ({ ctx, onApply }) => {
  const r = useMemo(() => blowReading(ctx), [ctx]);
  const [blown, setBlown] = useState(false);
  const [progress, setProgress] = useState(0);
  const blow = () => {
    setBlown(false); setProgress(0);
    const id = setInterval(() => setProgress(p => { if (p >= 100) { clearInterval(id); setBlown(true); return 100; } return p+5; }), 60);
  };
  const interp = r.ratio < 70 ? 'نمط انسدادي (Obstructive)' : r.fvc < 3.5 ? 'نمط تقييدي (Restrictive)' : 'طبيعي';
  return (
    <Wrap title="مقياس التنفس Spirometer" icon="🌬️" tone="from-emerald-50 to-white">
      <div className="h-24 rounded-lg bg-slate-100 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-emerald-500 to-emerald-300 transition-all" style={{ height: `${progress}%` }} />
        <div className="absolute inset-0 flex items-center justify-center text-3xl">{progress > 0 && progress < 100 ? '💨' : '🫁'}</div>
      </div>
      {blown && (
        <div className="grid grid-cols-3 gap-1 text-center text-[11px]">
          <div className="p-1.5 bg-white rounded border"><div className="text-slate-500">FVC</div><div className="font-bold">{r.fvc} L</div></div>
          <div className="p-1.5 bg-white rounded border"><div className="text-slate-500">FEV1</div><div className="font-bold">{r.fev1} L</div></div>
          <div className="p-1.5 bg-white rounded border"><div className="text-slate-500">FEV1/FVC</div><div className="font-bold">{r.ratio}%</div></div>
        </div>
      )}
      {blown && <div className="text-[11px] text-center text-slate-700 font-bold">{interp}</div>}
      <button onClick={blow} className="w-full py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold">انفخ بقوة</button>
      {blown && <ApplyBtn onClick={() => onApply?.({ reading_ar: `Spirometry: FVC ${r.fvc}L, FEV1 ${r.fev1}L, نسبة ${r.ratio}% — ${interp}` })} />}
    </Wrap>
  );
};
export const SimPeakFlow: React.FC<SimProps> = ({ ctx, onApply }) => {
  const r = useMemo(() => blowReading(ctx, true), [ctx]);
  const [needle, setNeedle] = useState(0);
  const blow = () => {
    setNeedle(0);
    const id = setInterval(() => setNeedle(n => { if (n >= r.peak) { clearInterval(id); return r.peak; } return n + 20; }), 30);
  };
  const status = r.peak < 300 ? 'منخفض جداً' : r.peak < 450 ? 'منخفض' : 'طبيعي';
  return (
    <Wrap title="مقياس التدفق الأقصى" icon="📊" tone="from-teal-50 to-white">
      <div className="relative h-32 rounded-lg bg-gradient-to-b from-teal-50 to-white border overflow-hidden">
        <svg viewBox="0 0 200 100" className="w-full h-full">
          <path d="M 20 90 A 80 80 0 0 1 180 90" stroke="#cbd5e1" strokeWidth="3" fill="none" />
          {[100,200,300,400,500,600,700].map((v,i) => {
            const a = Math.PI - (i/6) * Math.PI;
            return <line key={v} x1={100+80*Math.cos(a)} y1={90-80*Math.sin(a)} x2={100+90*Math.cos(a)} y2={90-90*Math.sin(a)} stroke="#64748b" strokeWidth="1" />;
          })}
          <line x1="100" y1="90" x2={100 + 70*Math.cos(Math.PI - (needle/700)*Math.PI)} y2={90 - 70*Math.sin(Math.PI - (needle/700)*Math.PI)} stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="90" r="5" fill="#1e293b" />
        </svg>
        <div className="absolute bottom-1 left-0 right-0 text-center text-xs font-bold">{needle} L/min</div>
      </div>
      <button onClick={blow} className="w-full py-2 rounded-lg bg-teal-600 text-white text-xs font-bold">انفخ بأقصى قوة</button>
      {needle > 0 && <div className="text-center text-[11px]">{status}</div>}
      {needle > 0 && <ApplyBtn onClick={() => onApply?.({ reading_ar: `PEF: ${r.peak} L/min (${status})` })} />}
    </Wrap>
  );
};

// =============== Nebulizer ===============
export const SimNebulizer: React.FC<SimProps> = ({ onApply }) => {
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(600);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTime(t => { if (t<=1) { clearInterval(id); setRunning(false); return 0; } return t-1; }), 1000);
    return () => clearInterval(id);
  }, [running]);
  const m = Math.floor(time/60), s = time%60;
  return (
    <Wrap title="جهاز الاستنشاق Nebulizer" icon="💨" tone="from-cyan-50 to-white">
      <div className="relative h-24 bg-gradient-to-b from-slate-100 to-white rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-5xl">😷</div>
        {running && <>
          <div className="absolute top-2 left-1/2 text-2xl animate-pulse opacity-70">☁️</div>
          <div className="absolute top-4 right-1/3 text-xl animate-bounce opacity-60">💨</div>
          <div className="absolute top-6 left-1/3 text-xl animate-pulse opacity-50">💨</div>
        </>}
      </div>
      <Screen>{running ? `يعمل... ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : time === 0 ? '✅ انتهت الجلسة' : '⏳ جاهز'}</Screen>
      <button onClick={() => { if (time===0) setTime(600); setRunning(r=>!r); }} className="w-full py-2 rounded-lg bg-cyan-600 text-white text-xs font-bold">{running ? '⏸ إيقاف' : '▶ تشغيل (10 دقائق سالبوتامول)'}</button>
      {time === 0 && <ApplyBtn onClick={() => onApply?.({ reading_ar: 'تم إعطاء جلسة استنشاق سالبوتامول لمدة 10 دقائق' })} />}
    </Wrap>
  );
};

// =============== O2 Concentrator ===============
export const SimO2: React.FC<SimProps> = ({ ctx, onApply }) => {
  const [flow, setFlow] = useState(2);
  const [device, setDevice] = useState<'cannula'|'mask'|'nrm'>('cannula');
  const fio2 = device==='cannula' ? Math.min(44, 21 + flow*4) : device==='mask' ? 35 + flow*5 : 60 + flow*5;
  const expectedSpo2 = Math.min(100, (ctx.vitals?.spo2 ?? 95) + Math.round(flow*1.5));
  return (
    <Wrap title="مكثف الأكسجين" icon="🟢" tone="from-green-50 to-white">
      <div className="flex justify-around text-3xl py-2">{device==='cannula'?'👃':device==='mask'?'😷':'🎭'}</div>
      <div className="grid grid-cols-3 gap-1">
        {[['cannula','كانيولا'],['mask','قناع بسيط'],['nrm','NRM']].map(([k,l]) => (
          <button key={k} onClick={() => setDevice(k as any)} className={`py-1 rounded text-[11px] border ${device===k?'bg-green-600 text-white':'bg-white'}`}>{l}</button>
        ))}
      </div>
      <div>
        <div className="text-[11px] text-slate-600 mb-1">معدل التدفق: <b>{flow} L/min</b></div>
        <input type="range" min={1} max={15} value={flow} onChange={e => setFlow(+e.target.value)} className="w-full" />
      </div>
      <Screen><div>FiO₂ ≈ {fio2}%</div><div className="text-xs">SpO₂ متوقع: {expectedSpo2}%</div></Screen>
      <ApplyBtn onClick={() => onApply?.({ reading_ar: `بدء أكسجين ${flow} L/min عبر ${device==='cannula'?'كانيولا':device==='mask'?'قناع':'NRM'} (FiO₂≈${fio2}%)`, vitals: { spo2: expectedSpo2 } })} />
    </Wrap>
  );
};

// =============== Capnograph ===============
export const SimCapno: React.FC<SimProps> = ({ ctx, onApply }) => {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const co2 = ctx.category==='pulmonology' && (ctx.severity==='high'||ctx.severity==='critical') ? 52 : 38;
  const [t, setT] = useState(0);
  useEffect(() => { const id = setInterval(() => setT(v=>v+1), 80); return () => clearInterval(id); }, []);
  useEffect(() => {
    const c = canvasRef.current; if (!c) return; const ctx2 = c.getContext('2d'); if (!ctx2) return;
    const W = c.width=300, H=c.height=80;
    ctx2.fillStyle='#0f172a'; ctx2.fillRect(0,0,W,H);
    ctx2.strokeStyle='#fbbf24'; ctx2.lineWidth=2; ctx2.beginPath();
    for (let x=0;x<W;x++){
      const p = ((x+t*3) % 100) / 100;
      let y = H - 5;
      if (p>0.2 && p<0.7) y = H - 5 - (co2*1.2);
      else if (p>=0.7 && p<0.75) y = H - 5 - (co2*1.2)*((0.75-p)/0.05);
      x===0?ctx2.moveTo(x,y):ctx2.lineTo(x,y);
    }
    ctx2.stroke();
  }, [t, co2]);
  return (
    <Wrap title="جهاز قياس CO₂ الزفير" icon="📈" tone="from-yellow-50 to-white">
      <canvas ref={canvasRef} className="w-full rounded-lg" />
      <Screen tone="amber"><div className="text-2xl font-extrabold">{co2} mmHg</div><div className="text-xs">EtCO₂ — {co2>45?'احتباس':co2<35?'فرط تهوية':'طبيعي'}</div></Screen>
      <ApplyBtn onClick={() => onApply?.({ reading_ar: `EtCO₂: ${co2} mmHg` })} />
    </Wrap>
  );
};

// =============== Imaging (X-Ray / CT / MRI / US / Echo) ===============
const ImagingPanel: React.FC<{ title: string; icon: string; ctx: CaseContext; onApply?: SimProps['onApply']; modality: 'xray'|'ct'|'mri'|'us'|'echo' }> = ({ title, icon, ctx, onApply, modality }) => {
  const isOrtho = /ortho/i.test(ctx.category);
  const isResp = /pulm/i.test(ctx.category);
  const isTrauma = isOrtho || /emergency|trauma/i.test(ctx.category);
  const findings = isOrtho ? 'كسر بالعظم — انفصال واضح في القشرة' : isResp ? 'ارتشاح رئوي ثنائي الجانب' : modality==='echo' ? `EF ≈ ${ctx.severity==='high'||ctx.severity==='critical'?35:60}%` : 'بنية تشريحية ضمن الطبيعي';
  const [zoom, setZoom] = useState(1);
  return (
    <Wrap title={title} icon={icon} tone="from-slate-100 to-white">
      <div className="relative h-44 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="h-full" style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s' }}>
          {modality==='xray' && isOrtho && (
            <g stroke="#fff" strokeWidth="2" fill="none">
              <line x1="60" y1="40" x2="140" y2="40" />
              <rect x="80" y="40" width="40" height="100" rx="5" fill="#e2e8f0" opacity="0.3" />
              <line x1="100" y1="80" x2="105" y2="100" stroke="#ef4444" strokeWidth="3" />
              <text x="110" y="95" fill="#ef4444" fontSize="10">Fx</text>
            </g>
          )}
          {modality==='xray' && !isOrtho && (
            <g><ellipse cx="100" cy="120" rx="70" ry="60" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
              <ellipse cx="70" cy="110" rx="25" ry="40" fill={isResp?'#94a3b8':'#0f172a'} opacity="0.7" />
              <ellipse cx="130" cy="110" rx="25" ry="40" fill={isResp?'#94a3b8':'#0f172a'} opacity="0.7" />
            </g>
          )}
          {modality==='ct' && (
            <g><circle cx="100" cy="100" r="80" fill="#334155" stroke="#fff" />
              {Array.from({length:6}).map((_,i)=><circle key={i} cx={50+i*20} cy={70+(i%2)*40} r={5+i} fill="#94a3b8" opacity="0.6" />)}
              {isTrauma && <circle cx="120" cy="80" r="12" fill="#ef4444" opacity="0.7" />}
            </g>
          )}
          {modality==='mri' && (
            <g><ellipse cx="100" cy="100" rx="75" ry="85" fill="#1f2937" stroke="#fff" />
              <path d="M 60 80 Q 100 60 140 80 Q 130 130 100 140 Q 70 130 60 80" fill="#475569" />
              {isTrauma && <ellipse cx="115" cy="95" rx="8" ry="6" fill="#fbbf24" opacity="0.8" />}
            </g>
          )}
          {modality==='us' && (
            <g><path d="M 100 30 L 30 180 L 170 180 Z" fill="#000" stroke="#22d3ee" />
              {Array.from({length:30}).map((_,i)=><circle key={i} cx={40+Math.random()*120} cy={50+Math.random()*120} r={Math.random()*2} fill="#22d3ee" opacity={Math.random()*0.6} />)}
            </g>
          )}
          {modality==='echo' && (
            <g><ellipse cx="100" cy="100" rx="60" ry="80" fill="none" stroke="#22d3ee" strokeWidth="2" />
              <line x1="100" y1="20" x2="100" y2="180" stroke="#22d3ee" strokeWidth="1" opacity="0.5" />
              <ellipse cx="80" cy="80" rx="25" ry="35" fill="#0891b2" className="animate-pulse" />
              <ellipse cx="120" cy="120" rx="25" ry="35" fill="#0e7490" className="animate-pulse" />
            </g>
          )}
        </svg>
        <div className="absolute top-1 right-1 text-[10px] text-white bg-black/50 px-1 rounded">{title}</div>
      </div>
      <div className="flex gap-2"><button onClick={() => setZoom(z=>Math.min(2,z+0.2))} className="flex-1 py-1 rounded bg-slate-200 text-xs">🔍+</button><button onClick={() => setZoom(z=>Math.max(0.6,z-0.2))} className="flex-1 py-1 rounded bg-slate-200 text-xs">🔍−</button><button onClick={() => setZoom(1)} className="flex-1 py-1 rounded bg-slate-200 text-xs">↻</button></div>
      <div className="text-[11px] p-2 bg-amber-50 border border-amber-200 rounded"><b>تقرير الأشعّة: </b>{findings}</div>
      <ApplyBtn onClick={() => onApply?.({ reading_ar: `${title}: ${findings}` })} />
    </Wrap>
  );
};
export const SimXRay: React.FC<SimProps> = (p) => <ImagingPanel {...p} title="الأشعة السينية" icon="📷" modality="xray" />;
export const SimCT: React.FC<SimProps> = (p) => <ImagingPanel {...p} title="التصوير المقطعي CT" icon="🌀" modality="ct" />;
export const SimMRI: React.FC<SimProps> = (p) => <ImagingPanel {...p} title="الرنين المغناطيسي MRI" icon="🧲" modality="mri" />;
export const SimUS: React.FC<SimProps> = (p) => <ImagingPanel {...p} title="الموجات فوق الصوتية" icon="🔊" modality="us" />;
export const SimEcho: React.FC<SimProps> = (p) => <ImagingPanel {...p} title="إيكو القلب" icon="🫀" modality="echo" />;

// =============== Goniometer ===============
export const SimGoniometer: React.FC<SimProps> = ({ ctx, onApply }) => {
  const [angle, setAngle] = useState(45);
  const max = ctx.category==='orthopedics' ? 60 : 130;
  return (
    <Wrap title="مقياس مدى الحركة" icon="📐" tone="from-violet-50 to-white">
      <div className="relative h-32 bg-violet-50 rounded-lg overflow-hidden">
        <svg viewBox="0 0 200 120" className="w-full h-full">
          <line x1="100" y1="100" x2="180" y2="100" stroke="#1e293b" strokeWidth="4" />
          <line x1="100" y1="100" x2={100+80*Math.cos(-angle*Math.PI/180)} y2={100+80*Math.sin(-angle*Math.PI/180)} stroke="#7c3aed" strokeWidth="4" />
          <circle cx="100" cy="100" r="6" fill="#7c3aed" />
          <path d={`M 130 100 A 30 30 0 0 0 ${100+30*Math.cos(-angle*Math.PI/180)} ${100+30*Math.sin(-angle*Math.PI/180)}`} stroke="#7c3aed" fill="none" strokeWidth="1" strokeDasharray="3" />
          <text x="135" y="92" fontSize="14" fontWeight="bold" fill="#7c3aed">{angle}°</text>
        </svg>
      </div>
      <input type="range" min={0} max={180} value={angle} onChange={e => setAngle(+e.target.value)} className="w-full" />
      <div className="text-[11px] text-center">المدى الطبيعي ≈ {max}° • المُقاس: <b>{angle}°</b> {angle<max?'(محدود)':'(طبيعي)'}</div>
      <ApplyBtn onClick={() => onApply?.({ reading_ar: `مدى الحركة المقاس: ${angle}° (الحد الأعلى المتوقع ${max}°)` })} />
    </Wrap>
  );
};

// =============== Reflex Hammer ===============
export const SimReflex: React.FC<SimProps> = ({ ctx, onApply }) => {
  const [tap, setTap] = useState(false);
  const grade = ctx.category==='neurology' ? (ctx.severity==='high'?1:ctx.severity==='critical'?0:3) : 2;
  return (
    <Wrap title="مطرقة المنعكسات" icon="🔨" tone="from-amber-50 to-white">
      <div className="relative h-32 bg-slate-50 rounded-lg overflow-hidden flex items-end justify-center">
        <svg viewBox="0 0 200 120" className="w-full h-full">
          <line x1="60" y1="100" x2="140" y2="100" stroke="#1e293b" strokeWidth="4" />
          <line x1="100" y1="100" x2={tap?(grade>=2?160:130):100} y2={tap?(grade>=2?40:80):100} stroke="#7c3aed" strokeWidth="4" className="transition-all duration-300" />
          <text x="80" y="60" fontSize="32">🔨</text>
        </svg>
      </div>
      <Screen>الدرجة: <b className="text-2xl">{grade}+</b> ({['غائب','ضعيف','طبيعي','مفرط','بالقدم/كلونوس'][grade]})</Screen>
      <button onClick={() => { setTap(true); setTimeout(() => setTap(false), 600); }} className="w-full py-2 rounded-lg bg-amber-600 text-white text-xs font-bold">🔨 اطرق الركبة</button>
      <ApplyBtn onClick={() => onApply?.({ reading_ar: `منعكس الركبة: ${grade}+/4` })} />
    </Wrap>
  );
};

// =============== Tuning Fork ===============
export const SimTuning: React.FC<SimProps> = ({ onApply }) => {
  const [freq, setFreq] = useState<256|512>(512);
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext|null>(null);
  const stopRef = useRef<(()=>void)|null>(null);
  const play = async () => {
    stopRef.current?.();
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    const c: AudioContext = ctxRef.current || new Ctx(); ctxRef.current = c; if (c.state==='suspended') await c.resume();
    const o = c.createOscillator(); o.type='sine'; o.frequency.value = freq;
    const g = c.createGain(); g.gain.setValueAtTime(0.3, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime+3);
    o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime+3); setPlaying(true);
    stopRef.current = () => { try { o.stop(); } catch {} setPlaying(false); };
    setTimeout(() => setPlaying(false), 3000);
  };
  return (
    <Wrap title="شوكة رنانة" icon="🎵" tone="from-blue-50 to-white">
      <div className="text-center text-5xl py-2"><span className={playing?'animate-pulse':''}>🔱</span></div>
      <div className="grid grid-cols-2 gap-2">
        {[256,512].map(f => <button key={f} onClick={() => setFreq(f as any)} className={`py-2 rounded text-xs font-bold ${freq===f?'bg-blue-600 text-white':'bg-white border'}`}>{f} Hz</button>)}
      </div>
      <button onClick={play} className="w-full py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">▶ اضرب الشوكة</button>
      <div className="text-[10px] text-center text-slate-500">{freq===512?'لاختبار السمع (Rinne/Weber)':'لاختبار الإحساس بالاهتزاز'}</div>
      <ApplyBtn onClick={() => onApply?.({ reading_ar: `استخدام شوكة ${freq}Hz — يسمع بشكل متناظر` })} />
    </Wrap>
  );
};

// =============== GCS ===============
export const SimGCS: React.FC<SimProps> = ({ ctx, onApply }) => {
  const sev = ctx.severity;
  const [eye, setEye] = useState(sev==='critical'?1:sev==='high'?3:4);
  const [verbal, setVerbal] = useState(sev==='critical'?1:sev==='high'?3:5);
  const [motor, setMotor] = useState(sev==='critical'?2:sev==='high'?4:6);
  const total = eye+verbal+motor;
  const sevLabel = total<=8?'إصابة شديدة':total<=12?'متوسطة':'خفيفة';
  return (
    <Wrap title="مقياس غلاسكو للوعي GCS" icon="🧠" tone="from-indigo-50 to-white">
      <Field label="فتح العين (E)" value={eye} setValue={setEye} max={4} options={['لا','للألم','للصوت','تلقائياً']} />
      <Field label="الاستجابة اللفظية (V)" value={verbal} setValue={setVerbal} max={5} options={['لا','أصوات','كلمات','مشوّش','موجّه']} />
      <Field label="الاستجابة الحركية (M)" value={motor} setValue={setMotor} max={6} options={['لا','بسط','ثني','سحب','موضعة','تنفيذ']} />
      <Screen tone="green">المجموع: <b className="text-3xl">{total}</b>/15 <span className="text-xs">({sevLabel})</span></Screen>
      <ApplyBtn onClick={() => onApply?.({ reading_ar: `GCS: E${eye}V${verbal}M${motor} = ${total}/15 (${sevLabel})` })} />
    </Wrap>
  );
};
const Field: React.FC<{label:string;value:number;setValue:(n:number)=>void;max:number;options:string[]}> = ({label,value,setValue,max,options}) => (
  <div className="text-[11px]"><div className="font-bold mb-1">{label}: {value}</div>
    <div className="flex gap-0.5">{Array.from({length:max}).map((_,i)=>(
      <button key={i} onClick={() => setValue(i+1)} className={`flex-1 py-1 rounded text-[9px] ${value===i+1?'bg-indigo-600 text-white':'bg-white border'}`}>{i+1}<div className="text-[8px] truncate">{options[i]}</div></button>
    ))}</div>
  </div>
);

// =============== EEG ===============
export const SimEEG: React.FC<SimProps> = ({ ctx, onApply }) => {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const [t, setT] = useState(0);
  useEffect(() => { const id = setInterval(() => setT(v=>v+1), 50); return () => clearInterval(id); }, []);
  const abnormal = ctx.category==='neurology' && (ctx.severity==='high'||ctx.severity==='critical');
  useEffect(() => {
    const c = canvasRef.current; if (!c) return; const ctx2 = c.getContext('2d'); if (!ctx2) return;
    const W=c.width=320, H=c.height=200; ctx2.fillStyle='#0f172a'; ctx2.fillRect(0,0,W,H);
    const channels=['Fp1','Fp2','C3','C4','T5','T6','O1','O2'];
    channels.forEach((label,i) => {
      const yOff = 15+i*22;
      ctx2.fillStyle='#94a3b8'; ctx2.font='9px monospace'; ctx2.fillText(label,2,yOff+3);
      ctx2.strokeStyle='#22d3ee'; ctx2.lineWidth=1; ctx2.beginPath();
      for (let x=25;x<W;x++){
        const phase=(x+t*2)/30 + i;
        const spike = abnormal && Math.sin((x+t)/15+i)>0.95 ? 12 : 0;
        const y = yOff + Math.sin(phase)*4 + Math.sin(phase*2.3)*2 + (Math.random()-0.5)*1.5 + spike;
        x===25?ctx2.moveTo(x,y):ctx2.lineTo(x,y);
      }
      ctx2.stroke();
    });
  }, [t, abnormal]);
  return (
    <Wrap title="جهاز رسم المخ EEG" icon="🧠" tone="from-purple-50 to-white">
      <canvas ref={canvasRef} className="w-full rounded-lg" />
      <div className="text-[11px] text-center">{abnormal?'🚨 موجات شاذة (احتمال صرع)':'موجات ألفا/بيتا طبيعية'}</div>
      <ApplyBtn onClick={() => onApply?.({ reading_ar: abnormal?'EEG: نشاط صرعي بؤري':'EEG: ضمن الطبيعي' })} />
    </Wrap>
  );
};

// =============== Otoscope / Ophthalmoscope ===============
const ScopePanel: React.FC<{title:string;icon:string;findings:string;onApply?:SimProps['onApply']; type:'ear'|'eye'}> = ({title, icon, findings, onApply, type}) => {
  const [pos, setPos] = useState({x:50,y:50});
  return (
    <Wrap title={title} icon={icon} tone="from-pink-50 to-white">
      <div className="relative h-40 bg-slate-900 rounded-lg overflow-hidden cursor-crosshair" onMouseMove={e => { const r=e.currentTarget.getBoundingClientRect(); setPos({x:((e.clientX-r.left)/r.width)*100, y:((e.clientY-r.top)/r.height)*100}); }}>
        <div className="absolute inset-0" style={{ background: type==='ear'?'radial-gradient(circle at 50% 50%, #fda4af, #be123c)':'radial-gradient(circle at 50% 50%, #fb923c, #7c2d12)' }} />
        {type==='eye' && <svg className="absolute inset-0" viewBox="0 0 100 100"><circle cx="50" cy="50" r="15" fill="#1e293b" /><line x1="50" y1="50" x2="20" y2="20" stroke="#dc2626" strokeWidth="0.5" /><line x1="50" y1="50" x2="80" y2="30" stroke="#dc2626" strokeWidth="0.5" /><line x1="50" y1="50" x2="30" y2="80" stroke="#dc2626" strokeWidth="0.5" /></svg>}
        <div className="absolute inset-0 bg-black" style={{ clipPath: `circle(30px at ${pos.x}% ${pos.y}%)`, background: 'rgba(0,0,0,0.85)', WebkitClipPath: `circle(60px at ${pos.x}% ${pos.y}%)`, mask: `radial-gradient(circle 60px at ${pos.x}% ${pos.y}%, transparent 100%, black 100%)`, WebkitMask: `radial-gradient(circle 60px at ${pos.x}% ${pos.y}%, transparent 100%, black 100%)` }} />
      </div>
      <div className="text-[11px] p-2 bg-white border rounded"><b>الفحص: </b>{findings}</div>
      <ApplyBtn onClick={() => onApply?.({ reading_ar: `${title}: ${findings}` })} />
    </Wrap>
  );
};
export const SimOtoscope: React.FC<SimProps> = ({ ctx, onApply }) => <ScopePanel title="منظار الأذن" icon="👂" type="ear" findings={ctx.category==='ent'?'احمرار وانتفاخ طبلة الأذن — التهاب أذن وسطى':'طبلة لؤلؤية، انعكاس الضوء طبيعي'} onApply={onApply} />;

// =============== Realistic Fundus Ophthalmoscope ===============
type EyePathology = 'normal' | 'diabetic' | 'hypertensive' | 'glaucoma' | 'retinal_detachment' | 'macular_degeneration';

const detectEyePathology = (ctx: CaseContext): EyePathology => {
  const cat = (ctx.category || '').toLowerCase();
  const sev = ctx.severity || '';
  if (cat === 'endocrinology') return 'diabetic';
  if (cat === 'cardiology' && (sev === 'high' || sev === 'critical' || sev === 'severe')) return 'hypertensive';
  if (cat === 'ophthalmology') {
    if (sev === 'severe' || sev === 'high') return 'retinal_detachment';
    if (sev === 'moderate') return 'glaucoma';
    return 'macular_degeneration';
  }
  if (cat === 'neurology' && (sev === 'high' || sev === 'severe')) return 'glaucoma';
  return 'normal';
};

const PATHO_LABEL: Record<EyePathology, string> = {
  normal: 'قاع عين طبيعي — قرص بصري وردي، أوعية متناظرة، بقعة صفراء سليمة',
  diabetic: 'اعتلال شبكية سكري: نزيف نقطي + إفرازات قطنية صلبة + microaneurysms',
  hypertensive: 'اعتلال شبكية ارتفاع ضغط: AV nicking + cotton wool spots + ضيق شراييني',
  glaucoma: 'زرق: cupping متقدم للقرص البصري (نسبة C/D > 0.7)، شحوب حلقي',
  retinal_detachment: 'انفصال شبكية: تمزّق علوي + ثنيات مرفوعة شفافة + فقدان انعكاس',
  macular_degeneration: 'تنكّس بقعي: drusen صفراء حول البقعة + تشوّش الصبغ + atrophy خفيف',
};

export const SimOphthalmo: React.FC<SimProps> = ({ ctx, onApply }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(70);
  const [captured, setCaptured] = useState(false);
  const patho = useMemo(() => detectEyePathology(ctx), [ctx]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const g = c.getContext('2d'); if (!g) return;
    const W = c.width = 320, H = c.height = 240;
    const cx = W * (pos.x / 100), cy = H * (pos.y / 100);

    // Base fundus (orange/red retina)
    const bg = g.createRadialGradient(cx, cy, 0, cx, cy, 220);
    bg.addColorStop(0, '#ff8c5a');
    bg.addColorStop(0.5, '#d65a2a');
    bg.addColorStop(1, '#7a2e15');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);

    // Choroidal texture (random subtle blotches)
    for (let i = 0; i < 90; i++) {
      g.fillStyle = `rgba(${120 + Math.random() * 60}, ${40 + Math.random() * 30}, 20, ${0.15 + Math.random() * 0.15})`;
      g.beginPath(); g.arc(Math.random() * W, Math.random() * H, 4 + Math.random() * 10, 0, Math.PI * 2); g.fill();
    }

    // Optic disc (yellowish-pink circle, slightly left of center)
    const discX = W * 0.35, discY = H * 0.5, discR = 22;
    const discGrad = g.createRadialGradient(discX, discY, 0, discX, discY, discR);
    if (patho === 'glaucoma') {
      discGrad.addColorStop(0, '#e5e7eb'); // deep cup
      discGrad.addColorStop(0.55, '#fde68a');
      discGrad.addColorStop(1, '#fbbf24');
    } else {
      discGrad.addColorStop(0, '#fef3c7');
      discGrad.addColorStop(0.7, '#fbbf24');
      discGrad.addColorStop(1, '#d97706');
    }
    g.fillStyle = discGrad;
    g.beginPath(); g.arc(discX, discY, discR, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#92400e'; g.lineWidth = 1.2; g.stroke();

    // Vessels (branching tree from optic disc)
    const drawVessel = (sx: number, sy: number, ex: number, ey: number, width: number, isArtery: boolean, depth: number) => {
      g.strokeStyle = isArtery ? (patho === 'hypertensive' ? '#b91c1c' : '#dc2626') : '#7f1d1d';
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath(); g.moveTo(sx, sy);
      const mx = (sx + ex) / 2 + (Math.random() - 0.5) * 10;
      const my = (sy + ey) / 2 + (Math.random() - 0.5) * 10;
      g.quadraticCurveTo(mx, my, ex, ey); g.stroke();
      // AV nicking marker
      if (patho === 'hypertensive' && depth === 1 && isArtery) {
        g.fillStyle = '#fbbf24'; g.beginPath(); g.arc(mx, my, 2.5, 0, Math.PI * 2); g.fill();
      }
      if (depth < 3 && width > 1) {
        drawVessel(ex, ey, ex + (Math.random() - 0.3) * 60, ey + (Math.random() - 0.5) * 50, width * 0.65, isArtery, depth + 1);
        drawVessel(ex, ey, ex + (Math.random() - 0.7) * 60, ey + (Math.random() - 0.5) * 50, width * 0.65, !isArtery, depth + 1);
      }
    };
    // 4 main branches from disc
    drawVessel(discX, discY, discX + 90, discY - 70, 3.2, true, 1);
    drawVessel(discX, discY, discX + 110, discY + 60, 3.2, false, 1);
    drawVessel(discX, discY, discX + 60, discY - 90, 2.8, true, 1);
    drawVessel(discX, discY, discX + 130, discY + 20, 2.8, false, 1);

    // Macula (darker zone, right of disc)
    const macX = W * 0.65, macY = H * 0.5;
    const macGrad = g.createRadialGradient(macX, macY, 0, macX, macY, 28);
    macGrad.addColorStop(0, 'rgba(60,20,10,0.5)');
    macGrad.addColorStop(1, 'rgba(60,20,10,0)');
    g.fillStyle = macGrad;
    g.beginPath(); g.arc(macX, macY, 28, 0, Math.PI * 2); g.fill();

    // Pathology overlays
    if (patho === 'diabetic') {
      // microaneurysms (small red dots)
      for (let i = 0; i < 16; i++) {
        g.fillStyle = '#7f1d1d';
        g.beginPath(); g.arc(80 + Math.random() * 220, 30 + Math.random() * 180, 1.5 + Math.random() * 1.2, 0, Math.PI * 2); g.fill();
      }
      // hemorrhages (irregular dark splotches)
      for (let i = 0; i < 6; i++) {
        g.fillStyle = 'rgba(80,10,10,0.85)';
        g.beginPath(); g.ellipse(100 + Math.random() * 180, 50 + Math.random() * 140, 5 + Math.random() * 4, 3 + Math.random() * 3, Math.random() * Math.PI, 0, Math.PI * 2); g.fill();
      }
      // cotton wool / hard exudates (yellow patches)
      for (let i = 0; i < 8; i++) {
        g.fillStyle = 'rgba(254,240,138,0.85)';
        g.beginPath(); g.arc(90 + Math.random() * 200, 40 + Math.random() * 160, 3 + Math.random() * 3, 0, Math.PI * 2); g.fill();
      }
    }
    if (patho === 'hypertensive') {
      for (let i = 0; i < 7; i++) {
        g.fillStyle = 'rgba(254,240,138,0.8)';
        g.beginPath(); g.arc(100 + Math.random() * 180, 50 + Math.random() * 140, 4 + Math.random() * 3, 0, Math.PI * 2); g.fill();
      }
      // flame hemorrhages
      for (let i = 0; i < 4; i++) {
        g.fillStyle = 'rgba(127,29,29,0.8)';
        g.beginPath();
        const fx = 120 + Math.random() * 160, fy = 60 + Math.random() * 120;
        g.moveTo(fx, fy); g.lineTo(fx + 8, fy + 14); g.lineTo(fx - 2, fy + 12); g.closePath(); g.fill();
      }
    }
    if (patho === 'glaucoma') {
      // deep central cup
      g.fillStyle = '#e5e7eb';
      g.beginPath(); g.arc(discX, discY, discR * 0.7, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#9ca3af'; g.lineWidth = 0.8; g.stroke();
    }
    if (patho === 'retinal_detachment') {
      // wavy translucent fold upper area
      g.fillStyle = 'rgba(200,200,255,0.35)';
      g.beginPath();
      g.moveTo(40, 30);
      for (let x = 40; x < W - 30; x += 8) g.lineTo(x, 80 + Math.sin(x * 0.1) * 20);
      g.lineTo(W - 30, 30); g.closePath(); g.fill();
      // tear arc
      g.strokeStyle = '#fde047'; g.lineWidth = 2;
      g.beginPath(); g.arc(W * 0.7, 90, 18, 0, Math.PI); g.stroke();
    }
    if (patho === 'macular_degeneration') {
      // drusen (small yellowish-white deposits around macula)
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * Math.PI * 2; const r = 8 + Math.random() * 22;
        g.fillStyle = 'rgba(254,243,199,0.9)';
        g.beginPath(); g.arc(macX + Math.cos(a) * r, macY + Math.sin(a) * r, 1.5 + Math.random() * 2, 0, Math.PI * 2); g.fill();
      }
    }

    // Apply zoom by clipping a circle at pos
    g.save();
    g.beginPath(); g.arc(cx, cy, 110 / zoom, 0, Math.PI * 2);
    g.clip();
    // brighten viewable area
    g.fillStyle = `rgba(255,255,200,${(brightness - 70) / 200})`;
    if (brightness > 70) g.fillRect(0, 0, W, H);
    g.restore();

    // Dark vignette outside the ophthalmoscope aperture
    const vig = g.createRadialGradient(cx, cy, 80 / zoom, cx, cy, 160);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(0.6, 'rgba(0,0,0,0.55)');
    vig.addColorStop(1, 'rgba(0,0,0,0.95)');
    g.fillStyle = vig; g.fillRect(0, 0, W, H);

    // Aperture ring
    g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 2;
    g.beginPath(); g.arc(cx, cy, 110 / zoom, 0, Math.PI * 2); g.stroke();
  }, [pos, zoom, brightness, patho]);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    const target = e.currentTarget as HTMLDivElement;
    const r = target.getBoundingClientRect();
    const p = 'touches' in e ? e.touches[0] : (e as React.MouseEvent);
    setPos({ x: ((p.clientX - r.left) / r.width) * 100, y: ((p.clientY - r.top) / r.height) * 100 });
  };

  return (
    <Wrap title="منظار العين (Fundoscopy)" icon="👁️" tone="from-indigo-50 to-white">
      <div
        className="relative w-full bg-slate-950 rounded-lg overflow-hidden cursor-crosshair touch-none select-none"
        onMouseMove={handleMove}
        onTouchMove={handleMove}
        style={{ aspectRatio: '4/3' }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute top-2 right-2 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded font-mono">
          ×{zoom.toFixed(1)} • {brightness}%
        </div>
        <div className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
          حرّك المؤشر لاستكشاف القاع
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <label className="space-y-0.5">
          <div className="text-slate-600">التكبير</div>
          <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={e => setZoom(+e.target.value)} className="w-full accent-indigo-600" />
        </label>
        <label className="space-y-0.5">
          <div className="text-slate-600">شدة الإضاءة</div>
          <input type="range" min={30} max={100} value={brightness} onChange={e => setBrightness(+e.target.value)} className="w-full accent-amber-500" />
        </label>
      </div>
      <button
        onClick={() => setCaptured(true)}
        className="w-full py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1"
      >📸 التقاط صورة القاع</button>
      {captured && (
        <div className="text-[11px] p-2 bg-white border rounded space-y-1">
          <div className="font-bold text-indigo-700">تقرير قاع العين:</div>
          <div>{PATHO_LABEL[patho]}</div>
        </div>
      )}
      <ApplyBtn onClick={() => onApply?.({ reading_ar: `Fundoscopy: ${PATHO_LABEL[patho]}` })} />
    </Wrap>
  );
};

// =============== Urine Strip ===============
export const SimUrineStrip: React.FC<SimProps> = ({ ctx, onApply }) => {
  const [shown, setShown] = useState(false);
  const isDiabetic = ctx.category==='endocrinology';
  const isUTI = /uti|nephro|بول/i.test(ctx.category);
  const pads = [
    { k:'pH', v: isUTI?8.5:6.0, ok:true },
    { k:'Glucose', v: isDiabetic?'+++':'سلبي', ok:!isDiabetic },
    { k:'Ketones', v: isDiabetic?'++':'سلبي', ok:!isDiabetic },
    { k:'Protein', v: isDiabetic?'+':'سلبي', ok:!isDiabetic },
    { k:'Blood', v: isUTI?'++':'سلبي', ok:!isUTI },
    { k:'Leukocytes', v: isUTI?'+++':'سلبي', ok:!isUTI },
    { k:'Nitrites', v: isUTI?'إيجابي':'سلبي', ok:!isUTI },
    { k:'Bilirubin', v:'سلبي', ok:true },
    { k:'Urobilinogen', v:'طبيعي', ok:true },
    { k:'Sp.Gravity', v:1.020, ok:true },
  ];
  return (
    <Wrap title="شريط فحص البول" icon="🧪" tone="from-yellow-50 to-white">
      <div className="grid grid-cols-10 gap-0.5 h-10 rounded overflow-hidden">
        {pads.map((p,i) => <div key={i} style={{background: shown ? (p.ok?'#fde68a':'#f87171') : '#f5f5f4'}} className="border" />)}
      </div>
      <button onClick={() => setShown(true)} className="w-full py-2 rounded-lg bg-yellow-600 text-white text-xs font-bold">⏱️ اقرأ بعد 60 ثانية</button>
      {shown && (
        <div className="grid grid-cols-2 gap-1 text-[10px]">
          {pads.map(p => <div key={p.k} className={`p-1 rounded border ${p.ok?'bg-emerald-50':'bg-rose-50'}`}><b>{p.k}:</b> {p.v}</div>)}
        </div>
      )}
      {shown && <ApplyBtn onClick={() => onApply?.({ reading_ar: `شريط البول: ${pads.filter(p=>!p.ok).map(p=>`${p.k}=${p.v}`).join('، ') || 'كله ضمن الطبيعي'}` })} />}
    </Wrap>
  );
};

// =============== Troponin Rapid Test ===============
export const SimTroponin: React.FC<SimProps> = ({ ctx, onApply }) => {
  const [phase, setPhase] = useState<'idle'|'wait'|'done'>('idle');
  const [mins, setMins] = useState(0);
  const positive = ctx.category==='cardiology' && (ctx.severity==='high'||ctx.severity==='critical');
  const start = () => {
    setPhase('wait'); setMins(0);
    const id = setInterval(() => setMins(m => { if (m>=15) { clearInterval(id); setPhase('done'); return 15; } return m+1; }), 400);
  };
  return (
    <Wrap title="اختبار التروبونين السريع" icon="🩸" tone="from-rose-50 to-white">
      <div className="h-16 bg-white border-2 rounded-lg flex items-center justify-around relative">
        <div className="text-[9px] absolute top-1 left-2">C</div>
        <div className="w-10 h-1 bg-rose-600" />
        <div className="text-[9px] absolute top-1 right-12">T</div>
        {phase==='done' && <div className={`w-10 h-1 ${positive?'bg-rose-600':'bg-transparent'}`} />}
        {phase==='wait' && <div className="text-xs animate-pulse">⏳</div>}
      </div>
      <Screen>{phase==='idle'?'ضع 3 قطرات دم':phase==='wait'?`انتظر... ${mins}/15 دقيقة`:positive?'⚠️ إيجابي — تلف عضلة القلب':'✅ سلبي'}</Screen>
      <button onClick={start} disabled={phase==='wait'} className="w-full py-2 rounded-lg bg-rose-600 text-white text-xs font-bold disabled:opacity-50">ابدأ الفحص</button>
      {phase==='done' && <ApplyBtn onClick={() => onApply?.({ reading_ar: `Troponin: ${positive?'إيجابي (>0.04 ng/mL)':'سلبي'}` })} />}
    </Wrap>
  );
};

// =============== Vascular Doppler ===============
export const SimDoppler: React.FC<SimProps> = ({ ctx, onApply }) => {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext|null>(null);
  const stopRef = useRef<(()=>void)|null>(null);
  const weak = ctx.category==='cardiology' || /vasc/i.test(ctx.category);
  const start = async () => {
    stopRef.current?.();
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    const c: AudioContext = ctxRef.current || new Ctx(); ctxRef.current = c; if (c.state==='suspended') await c.resume();
    const noise = c.createBufferSource(); const buf = c.createBuffer(1, c.sampleRate*2, c.sampleRate); const d = buf.getChannelData(0);
    for (let i=0;i<d.length;i++) d[i] = (Math.random()*2-1) * (Math.sin(i/c.sampleRate * 2 * Math.PI * (ctx.vitals?.hr??75)/60) > 0 ? 1 : 0.2);
    noise.buffer=buf; noise.loop=true;
    const filt = c.createBiquadFilter(); filt.type='bandpass'; filt.frequency.value=300; filt.Q.value=5;
    const g = c.createGain(); g.gain.value = weak ? 0.15 : 0.4;
    noise.connect(filt); filt.connect(g); g.connect(c.destination); noise.start();
    stopRef.current = () => { try { noise.stop(); } catch {} setPlaying(false); };
    setPlaying(true);
  };
  const stop = () => { stopRef.current?.(); };
  useEffect(() => () => stopRef.current?.(), []);
  return (
    <Wrap title="دوبلر وعائي" icon="〰️" tone="from-blue-50 to-white">
      <div className="text-center text-4xl py-2">{playing?<span className="animate-pulse">🔊</span>:'🔇'}</div>
      <Screen>{playing?(weak?'تدفق ضعيف ثلاثي الطور':'تدفق نبضي قوي'):'اضغط للاستماع'}</Screen>
      <button onClick={playing?stop:start} className="w-full py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">{playing?'⏹ إيقاف':'▶ استمع'}</button>
      <ApplyBtn onClick={() => onApply?.({ reading_ar: `Doppler: ${weak?'تدفق ضعيف':'تدفق طبيعي'}` })} />
    </Wrap>
  );
};

// =============== Holter ===============
export const SimHolter: React.FC<SimProps> = ({ ctx, onApply }) => {
  const [hour, setHour] = useState(12);
  const event = hour === 3 || hour === 18;
  return (
    <Wrap title="هولتر 24 ساعة" icon="📼" tone="from-stone-50 to-white">
      <div className="h-16 bg-slate-900 rounded-lg relative overflow-hidden">
        <svg viewBox="0 0 240 60" className="w-full h-full">
          {Array.from({length:240}).map((_,x) => {
            const beat = x % 8 === 0;
            const isEvent = event && x > 100 && x < 140;
            return <line key={x} x1={x} y1={30} x2={x} y2={beat?(isEvent?5:15):28} stroke={isEvent?'#ef4444':'#22d3ee'} strokeWidth="0.6" />;
          })}
        </svg>
      </div>
      <div className="text-[11px] text-center">الساعة {hour}:00 {event && <span className="text-rose-600 font-bold">⚠️ نوبة تسرّع</span>}</div>
      <input type="range" min={0} max={23} value={hour} onChange={e => setHour(+e.target.value)} className="w-full" />
      <div className="text-[10px] text-center text-slate-500">{ctx.category==='cardiology'?'2 نوبة تسارع بطيني خلال اليوم':'لا أحداث مهمة'}</div>
      <ApplyBtn onClick={() => onApply?.({ reading_ar: `Holter: ${ctx.category==='cardiology'?'نوبتان من تسارع بطيني':'إيقاع طبيعي'}` })} />
    </Wrap>
  );
};

// =============== Wound Control Kit (for trauma/laceration) ===============
export const WoundControlKit: React.FC<SimProps> = ({ onApply }) => {
  const steps = [
    { k:'glove', ar:'ارتدِ القفازات', icon:'🧤', warn:'احرص على المعقّمات' },
    { k:'press', ar:'ضغط مباشر بشاش معقّم', icon:'🩹', warn:'لا تتوقّف لرفع الشاش' },
    { k:'elevate', ar:'ارفع الطرف فوق مستوى القلب', icon:'⬆️', warn:'مع الإبقاء على الضغط' },
    { k:'tourniquet', ar:'عاصبة (إذا فشل الضغط)', icon:'🎗️', warn:'لا تتجاوز ساعتين، سجّل الوقت' },
    { k:'dress', ar:'تضميد معقّم وضمادة دائرية', icon:'🩹', warn:'تحقّق من النبض البعيد' },
    { k:'transfer', ar:'تحويل عاجل + IV + إنذار', icon:'🚑', warn:'استدعِ الفريق الجراحي' },
  ];
  const [done, setDone] = useState<string[]>([]);
  const toggle = (k: string) => setDone(d => d.includes(k) ? d.filter(x=>x!==k) : [...d, k]);
  const pct = Math.round((done.length / steps.length) * 100);
  return (
    <Wrap title="🆘 مجموعة إيقاف النزيف" icon="🩸" tone="from-rose-50 to-white">
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-rose-600 transition-all" style={{ width: `${pct}%` }} /></div>
      <div className="space-y-1">
        {steps.map((s,i) => (
          <button key={s.k} onClick={() => toggle(s.k)} className={`w-full p-2 rounded-lg border flex items-start gap-2 text-right ${done.includes(s.k)?'bg-rose-100 border-rose-400':'bg-white'}`}>
            <span className="text-xl">{s.icon}</span>
            <div className="flex-1">
              <div className="text-xs font-bold">{i+1}. {s.ar} {done.includes(s.k) && '✓'}</div>
              <div className="text-[10px] text-amber-700">⚠️ {s.warn}</div>
            </div>
          </button>
        ))}
      </div>
      {pct === 100 && <ApplyBtn onClick={() => onApply?.({ reading_ar: 'تم تنفيذ بروتوكول إيقاف النزيف الكامل: قفازات → ضغط → رفع → عاصبة → تضميد → تحويل', success_score: 95 })} />}
    </Wrap>
  );
};

// =============== Snellen Chart (Visual Acuity) ===============
export const SimSnellen: React.FC<SimProps> = ({ ctx, onApply }) => {
  const impaired = ctx.category === 'ophthalmology' || ctx.category === 'visual';
  const lines = [
    { size: 64, txt: 'E',      acuity: '20/200' },
    { size: 44, txt: 'F P',    acuity: '20/100' },
    { size: 32, txt: 'T O Z',  acuity: '20/70' },
    { size: 24, txt: 'L P E D', acuity: '20/50' },
    { size: 18, txt: 'P E C F D', acuity: '20/40' },
    { size: 14, txt: 'E D F C Z P', acuity: '20/30' },
    { size: 11, txt: 'F E L O P Z D', acuity: '20/20' },
  ];
  const cutoff = impaired ? 3 : 6;
  const acuity = lines[cutoff]?.acuity || '20/20';
  return (
    <Wrap title="مخطط سنيلن لحدة البصر" icon="👁️" tone="from-indigo-50 to-white">
      <div className="bg-white border rounded-lg p-3 text-center font-mono leading-tight">
        {lines.map((l, i) => (
          <div key={i} style={{ fontSize: l.size, opacity: i <= cutoff ? 1 : 0.18 }} className="tracking-widest">
            {l.txt}
          </div>
        ))}
      </div>
      <div className="text-[11px] text-center">حدة البصر المُقاسة: <b className="text-indigo-700">{acuity}</b> {impaired && <span className="text-rose-600">— ضعف بصر</span>}</div>
      <ApplyBtn onClick={() => onApply?.({ reading_ar: `Snellen: حدة بصر ${acuity}${impaired ? ' — يحتاج تصحيحاً' : ''}` })} />
    </Wrap>
  );
};

// =============== Tonometer (IOP) ===============
export const SimTonometer: React.FC<SimProps> = ({ ctx, onApply }) => {
  const [phase, setPhase] = useState<'idle' | 'measuring' | 'done'>('idle');
  const isGlaucoma = ctx.category === 'ophthalmology' && (ctx.severity === 'moderate' || ctx.severity === 'severe' || ctx.severity === 'high');
  const iop = isGlaucoma ? 28 + Math.floor(Math.random() * 8) : 13 + Math.floor(Math.random() * 6);
  const status = iop > 21 ? 'مرتفع — احتمال زرق' : iop < 10 ? 'منخفض' : 'طبيعي';
  const run = () => { setPhase('measuring'); setTimeout(() => setPhase('done'), 1500); };
  return (
    <Wrap title="مقياس ضغط العين" icon="💧" tone="from-blue-50 to-white">
      <div className="h-24 bg-gradient-to-b from-blue-100 to-white rounded-lg flex items-center justify-center text-5xl">
        {phase === 'measuring' ? <span className="animate-pulse">💨</span> : '👁️'}
      </div>
      <Screen>
        {phase === 'idle' && 'وجّه الجهاز نحو العين'}
        {phase === 'measuring' && 'نفخة هوائية… قياس IOP'}
        {phase === 'done' && (<>
          <div className={`text-3xl font-extrabold ${iop > 21 ? 'text-rose-300' : 'text-emerald-300'}`}>{iop}</div>
          <div className="text-xs">mmHg — {status}</div>
        </>)}
      </Screen>
      <button onClick={run} disabled={phase === 'measuring'} className="w-full py-2 rounded-lg bg-blue-600 text-white text-xs font-bold disabled:opacity-50">
        {phase === 'done' ? 'إعادة القياس' : '▶ قس الضغط'}
      </button>
      {phase === 'done' && <ApplyBtn onClick={() => onApply?.({ reading_ar: `IOP: ${iop} mmHg (${status})` })} />}
    </Wrap>
  );
};

// =============== Slit Lamp ===============
export const SimSlitLamp: React.FC<SimProps> = ({ ctx, onApply }) => {
  const [layer, setLayer] = useState<'cornea' | 'iris' | 'lens'>('cornea');
  const findings: Record<typeof layer, string> = {
    cornea: ctx.category === 'ophthalmology' ? 'تآكل سطحي + تسلّل قرني خفيف' : 'قرنية صافية، سطح أملس',
    iris: ctx.category === 'ophthalmology' && ctx.severity === 'severe' ? 'هالات التهابية + synechiae خلفية' : 'قزحية منتظمة الزخرفة',
    lens: ctx.category === 'endocrinology' || (ctx.age_years ?? 0) > 60 ? 'تعتيم نووي مبكر — كتاركت' : 'عدسة شفافة',
  } as any;
  return (
    <Wrap title="المصباح الشقي" icon="🔬" tone="from-cyan-50 to-white">
      <div className="relative h-32 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, #67e8f9 0%, #0e7490 40%, #082f49 100%)' }} />
        <div className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 bg-yellow-200/80 shadow-[0_0_20px_rgba(254,240,138,0.8)]" />
        {layer === 'iris' && <div className="absolute w-16 h-16 rounded-full border-4 border-amber-700/60" />}
        {layer === 'lens' && <div className="absolute w-20 h-20 rounded-full bg-white/10 border border-white/30" />}
      </div>
      <div className="grid grid-cols-3 gap-1">
        {(['cornea', 'iris', 'lens'] as const).map(k => (
          <button key={k} onClick={() => setLayer(k)} className={`py-1 rounded text-[11px] border ${layer === k ? 'bg-cyan-600 text-white' : 'bg-white'}`}>
            {k === 'cornea' ? 'قرنية' : k === 'iris' ? 'قزحية' : 'عدسة'}
          </button>
        ))}
      </div>
      <div className="text-[11px] p-2 bg-white border rounded"><b>الفحص: </b>{findings[layer]}</div>
      <ApplyBtn onClick={() => onApply?.({ reading_ar: `Slit Lamp (${layer}): ${findings[layer]}` })} />
    </Wrap>
  );
};

// =============== Ishihara Color Vision ===============
export const SimIshihara: React.FC<SimProps> = ({ ctx, onApply }) => {
  const plates = [
    { num: '12', dots: ['#dc2626', '#ea580c'] },
    { num: '8',  dots: ['#16a34a', '#65a30d'] },
    { num: '5',  dots: ['#ea580c', '#fb923c'] },
    { num: '74', dots: ['#16a34a', '#84cc16'] },
  ];
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const isColorBlind = ctx.category === 'ophthalmology' || ctx.category === 'visual';
  const plate = plates[idx];
  const submit = (val: string) => {
    const correct = !isColorBlind && val === plate.num;
    setAnswers(a => [...a, correct ? '✓' : '✗']);
    if (idx < plates.length - 1) setIdx(idx + 1);
  };
  const done = answers.length === plates.length;
  const correctCount = answers.filter(a => a === '✓').length;
  return (
    <Wrap title="فحص رؤية الألوان (إيشيهارا)" icon="🎨" tone="from-rose-50 to-white">
      {!done ? (
        <div className="space-y-2">
          <div className="relative h-32 rounded-full bg-amber-50 overflow-hidden mx-auto" style={{ width: 128 }}>
            {Array.from({ length: 90 }).map((_, i) => {
              const a = Math.random() * Math.PI * 2; const r = Math.random() * 56;
              const x = 64 + Math.cos(a) * r; const y = 64 + Math.sin(a) * r;
              const onNum = Math.random() > 0.55;
              return <div key={i} className="absolute rounded-full" style={{
                left: x - 4, top: y - 4, width: 8 + Math.random() * 4, height: 8 + Math.random() * 4,
                background: onNum ? plate.dots[0] : plate.dots[1],
              }} />;
            })}
          </div>
          <div className="text-[11px] text-center text-slate-600">اللوحة {idx + 1}/{plates.length} — ماذا ترى؟</div>
          <div className="grid grid-cols-4 gap-1">
            {['8', '12', '5', '74', '3', '6', '29', 'لا شيء'].map(opt => (
              <button key={opt} onClick={() => submit(opt)} className="py-1.5 rounded border bg-white text-xs font-bold hover:bg-rose-50">{opt}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center space-y-1">
          <div className="text-2xl font-extrabold text-rose-700">{correctCount}/{plates.length}</div>
          <div className="text-xs">{correctCount === plates.length ? 'رؤية ألوان طبيعية' : correctCount >= 2 ? 'ضعف خفيف في تمييز الألوان' : 'عمى ألوان واضح'}</div>
        </div>
      )}
      {done && <ApplyBtn onClick={() => onApply?.({ reading_ar: `Ishihara: ${correctCount}/${plates.length} — ${correctCount === plates.length ? 'طبيعي' : 'خلل في رؤية الألوان'}` })} />}
    </Wrap>
  );
};

// =============== Pupillary Light Reflex ===============
export const SimPupilReflex: React.FC<SimProps> = ({ ctx, onApply }) => {
  const [lightOn, setLightOn] = useState(false);
  const abnormal = (ctx.category === 'neurology' && (ctx.severity === 'high' || ctx.severity === 'severe' || ctx.severity === 'critical'))
    || ctx.category === 'emergency';
  const pupilSize = lightOn ? (abnormal ? 7 : 3) : (abnormal ? 8 : 6);
  return (
    <Wrap title="فحص منعكس الحدقة" icon="🔦" tone="from-amber-50 to-white">
      <div className="relative h-32 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center relative overflow-hidden">
          <div className="rounded-full bg-slate-900 transition-all duration-300" style={{ width: pupilSize * 5, height: pupilSize * 5 }} />
          {lightOn && <div className="absolute inset-0 bg-yellow-200/40 mix-blend-screen animate-pulse" />}
        </div>
        {lightOn && <div className="absolute top-1/2 right-2 w-12 h-1 bg-yellow-300 shadow-[0_0_20px_rgba(254,240,138,1)]" />}
      </div>
      <button onMouseDown={() => setLightOn(true)} onMouseUp={() => setLightOn(false)}
        onTouchStart={() => setLightOn(true)} onTouchEnd={() => setLightOn(false)}
        className="w-full py-2 rounded-lg bg-amber-600 text-white text-xs font-bold select-none">
        💡 اضغط مطوّلاً لتسليط الضوء
      </button>
      <div className="text-[11px] text-center">
        قطر الحدقة: <b>{pupilSize}mm</b> {abnormal ? <span className="text-rose-600">— استجابة بطيئة/شاذة</span> : <span className="text-emerald-600">— تفاعل سريع PERRLA</span>}
      </div>
      <ApplyBtn onClick={() => onApply?.({ reading_ar: `Pupil Reflex: ${abnormal ? 'استجابة شاذة، قد يدلّ على آفة عصبية' : 'PERRLA طبيعي'}` })} />
    </Wrap>
  );
};
