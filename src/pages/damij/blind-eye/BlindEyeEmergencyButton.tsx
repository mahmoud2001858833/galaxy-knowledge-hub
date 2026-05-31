import React, { useEffect, useRef, useState } from 'react';
import { Siren } from 'lucide-react';
import { triggerEmergency, getPrimaryContact } from './emergencyService';
import { haptics } from './haptics';
import { toast } from 'sonner';

/**
 * Long-press (3s) anywhere on this floating button to trigger an SMS to the
 * primary emergency contact with the current location.
 */
const BlindEyeEmergencyButton: React.FC = () => {
  const timerRef = useRef<number | null>(null);
  const startedRef = useRef<number>(0);
  const [progress, setProgress] = useState(0);
  const [hasContact, setHasContact] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try { setHasContact(!!(await getPrimaryContact())); }
      catch { setHasContact(false); }
    })();
  }, []);

  const cancel = () => {
    if (timerRef.current) { cancelAnimationFrame(timerRef.current); timerRef.current = null; }
    setProgress(0);
  };

  const tick = () => {
    const dt = (performance.now() - startedRef.current) / 3000;
    if (dt >= 1) {
      setProgress(1);
      cancel();
      fire();
      return;
    }
    setProgress(dt);
    timerRef.current = requestAnimationFrame(tick);
  };

  const begin = () => {
    if (hasContact === false) {
      toast.error('أضف جهة طوارئ من الإعدادات أولاً');
      return;
    }
    startedRef.current = performance.now();
    haptics.tap();
    timerRef.current = requestAnimationFrame(tick);
  };

  const fire = async () => {
    try {
      haptics.alert();
      const c = await triggerEmergency({ mode: 'sms' });
      toast.success(`تم فتح رسالة طوارئ إلى ${c.name}`);
    } catch (e: any) {
      toast.error('تعذر إرسال الطوارئ');
    }
  };

  if (hasContact === false) return null;

  return (
    <button
      type="button"
      aria-label="ضغطة مطوّلة لإرسال نداء طوارئ"
      onPointerDown={begin}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      className="fixed bottom-24 left-4 z-50 w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 shadow-2xl shadow-rose-900/60 flex items-center justify-center text-white border-4 border-rose-300/40 overflow-hidden"
    >
      <span
        className="absolute inset-0 bg-rose-300/40"
        style={{ clipPath: `inset(${(1 - progress) * 100}% 0 0 0)`, transition: progress === 0 ? 'clip-path 200ms' : 'none' }}
      />
      <Siren className="w-8 h-8 relative" />
    </button>
  );
};

export default BlindEyeEmergencyButton;
