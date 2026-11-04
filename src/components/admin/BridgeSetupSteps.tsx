import React, { useCallback, useEffect, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Circle, Copy, KeyRound, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { callTerminal } from '@/components/terminal/WebTerminal';
import type { BridgeStatus } from '@/components/terminal/useBridgeStatus';

/**
 * Guided setup for the bridge to the principal's computer. Each step checks itself live: the signing
 * secret (web-terminal-exec action setup-status), pairing and online state (bridge_status), and the
 * agents the bridge found on the computer (bridge_devices.info, readable by the principal).
 */

const PROJECT_REF = 'esifpjjehdnpkhyilctv';

export const CopyLine: React.FC<{ text: string }> = ({ text }) => {
  const [done, setDone] = useState(false);
  return (
    <div className="flex items-start gap-2 rounded-xl border border-border bg-muted p-2" dir="ltr">
      <code className="flex-1 whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed">{text}</code>
      <button
        type="button"
        onClick={() =>
          navigator.clipboard.writeText(text).then(() => {
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          })
        }
        className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-foreground"
        aria-label="نسخ"
      >
        {done ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
};

type DeviceInfo = { claude?: string | null; antigravity?: string | null; version?: string; workdir?: string };

export const BridgeSetupSteps: React.FC<{ status: BridgeStatus | null; code: string | null; onPair: () => void; pairing: boolean }> = ({
  status,
  code,
  onPair,
  pairing,
}) => {
  const [secret, setSecret] = useState<boolean | null>(null);
  const [info, setInfo] = useState<DeviceInfo | null>(null);
  const [checking, setChecking] = useState(false);
  const [open, setOpen] = useState<boolean | null>(null);

  const check = useCallback(async () => {
    setChecking(true);
    try {
      const res = await callTerminal({ action: 'setup-status' });
      const body = await res.json().catch(() => ({}));
      setSecret(res.ok ? !!body.master_key : null);
    } catch {
      setSecret(null);
    }
    const { data } = await supabase.from('bridge_devices').select('info').eq('revoked', false).order('last_seen_at', { ascending: false, nullsFirst: false }).limit(1).maybeSingle();
    setInfo((data?.info as DeviceInfo | null) ?? null);
    setChecking(false);
  }, []);

  useEffect(() => {
    check();
  }, [check]);
  // the bridge reports what it found when it connects
  useEffect(() => {
    if (status?.online) check();
  }, [status?.online, check]);

  const paired = !!status && status.paired !== false;
  const online = !!status?.online;
  const cd = status?.workdir ? `cd "${status.workdir}"` : 'cd ~/galaxy-knowledge-hub';

  const steps: { title: string; done: boolean | null; optional?: boolean; body: React.ReactNode }[] = [
    {
      title: 'مفتاح التوقيع في السحابة',
      done: secret,
      body: (
        <>
          <p>مرة واحدة فقط. كل أمر يُرسل لجهازك يُوقَّع بمفتاح مشتق من هذا السر، فلا يقبل الجسر أوامر مزوّرة. في Terminal على جهازك:</p>
          <CopyLine text={`supabase secrets set BRIDGE_MASTER_KEY=$(openssl rand -hex 32) --project-ref ${PROJECT_REF}`} />
          <p className="text-muted-foreground">تغييره لاحقاً يلغي ربط الأجهزة، فتحتاج إلى ربطها من جديد.</p>
        </>
      ),
    },
    {
      title: 'ربط جهازك',
      done: paired,
      body: (
        <>
          <p>اضغط «إنشاء رمز الربط»، ثم انسخ الأمر وشغّله داخل مجلد المشروع. الرمز يظهر مرة واحدة ويحتوي مفاتيح الجهاز، فلا تشاركه.</p>
          {code ? (
            <>
              <CopyLine text={cd} />
              <CopyLine text={`npm run bridge -- pair ${code}`} />
            </>
          ) : (
            <Button size="sm" onClick={onPair} disabled={pairing || secret === false} className="gap-1">
              {pairing ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} إنشاء رمز الربط
            </Button>
          )}
          {secret === false && <p className="text-warning">أكمل الخطوة الأولى أولاً.</p>}
        </>
      ),
    },
    {
      title: 'تشغيل الجسر',
      done: online,
      body: (
        <>
          <p>شغّله واترك النافذة مفتوحة. تتحول هذه الخطوة إلى ✓ وحدها خلال ثوانٍ من اتصاله.</p>
          <CopyLine text="npm run bridge" />
          <p className="text-muted-foreground">إذا لم يتصل، افحص الإعداد دون تغيير شيء:</p>
          <CopyLine text="npm run bridge -- check" />
        </>
      ),
    },
    {
      title: 'الوكلاء على جهازك',
      done: online ? !!(info?.claude || info?.antigravity) : null,
      body: (
        <ul className="space-y-1">
          <li className="flex items-center gap-2">
            {info?.claude ? <Check className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
            Claude Code: {info?.claude ? <code dir="ltr">{info.claude}</code> : 'غير موجود على الجهاز. ثبّت Claude Code وسجّل الدخول فيه مرة واحدة (claude)، ثم أعد تشغيل الجسر'}
          </li>
          <li className="flex items-center gap-2">
            {info?.antigravity ? <Check className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
            Antigravity: {info?.antigravity ? <code dir="ltr">{info.antigravity}</code> : 'غير موجود. ثبّت التطبيق في /Applications وسجّل الدخول فيه'}
          </li>
        </ul>
      ),
    },
    {
      title: 'التشغيل الدائم في الخلفية',
      done: null,
      optional: true,
      body: (
        <>
          <p>حتى يعمل الجسر بعد إعادة تشغيل الماك دون نافذة مفتوحة. بعد تحديث المنصة أعد تشغيله بنفس الأمر.</p>
          <CopyLine text="npm run bridge -- install-service" />
        </>
      ),
    },
  ];

  const required = steps.filter((s) => !s.optional);
  const doneCount = required.filter((s) => s.done).length;
  const current = steps.findIndex((s) => !s.optional && !s.done);
  const allDone = doneCount === required.length;
  const expanded = open ?? !allDone;

  return (
    <div className="rounded-2xl border border-border">
      <button type="button" onClick={() => setOpen(!expanded)} className="flex w-full items-center gap-3 p-3 text-start">
        <span className="text-sm font-bold">خطوات ربط الجسر</span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${allDone ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
          {doneCount}/{required.length}
        </span>
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <span className="block h-full bg-success transition-all" style={{ width: `${(doneCount / required.length) * 100}%` }} />
        </span>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            check();
          }}
          className="rounded-lg p-1 text-muted-foreground hover:text-foreground"
          aria-label="إعادة الفحص"
        >
          <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
        </span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {expanded && (
        <ol className="space-y-2 border-t border-border p-3">
          {steps.map((s, i) => {
            const isCurrent = i === current;
            return (
              <li key={s.title} className={`flex gap-3 rounded-xl p-3 ${isCurrent ? 'bg-primary/5 ring-1 ring-primary/30' : ''}`}>
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                    s.done ? 'bg-success text-white' : isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s.done ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    {s.title}
                    {s.optional && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">اختياري</span>}
                    {s.done === null && !s.optional && <span className="text-[10px] font-normal text-muted-foreground">غير معروف بعد</span>}
                  </div>
                  {(isCurrent || !s.done) && s.body}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};

export default BridgeSetupSteps;
