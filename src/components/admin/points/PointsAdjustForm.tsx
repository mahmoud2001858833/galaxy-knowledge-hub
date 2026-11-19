import React, { useState } from 'react';
import { Loader2, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { errorMessage } from '@/components/team/teamApi';
import { adjustPoints } from './pointsApi';

type Person = { user_id: string; name: string; title: string };

/** Principal-only manual +/- with a mandatory reason (points_adjust RPC). */
export const PointsAdjustForm: React.FC<{ people: Person[]; onDone: () => void }> = ({ people, onDone }) => {
  const [userId, setUserId] = useState('');
  const [sign, setSign] = useState<1 | -1>(1);
  const [amount, setAmount] = useState('10');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const value = Math.abs(Math.round(Number(amount) || 0));
  const ready = !!userId && value > 0 && reason.trim().length >= 3;

  const submit = async () => {
    setBusy(true);
    try {
      await adjustPoints(userId, sign * value, reason.trim());
      toast.success(`${sign > 0 ? 'أُضيفت' : 'خُصمت'} ${value} نقطة`);
      setReason('');
      onDone();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl space-y-4 rounded-3xl border border-border bg-card p-5">
      <h3 className="font-bold">تعديل يدوي للنقاط</h3>
      <div className="space-y-1.5">
        <Label>العضو</Label>
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger>
            <SelectValue placeholder="اختر العضو" />
          </SelectTrigger>
          <SelectContent>
            {people.map((p) => (
              <SelectItem key={p.user_id} value={p.user_id}>
                {p.name} — {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="adjust-amount">النقاط</Label>
        <div className="flex gap-2">
          <div className="flex overflow-hidden rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setSign(1)}
              className={`px-3 ${sign > 0 ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground'}`}
              aria-pressed={sign > 0}
              aria-label="إضافة"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setSign(-1)}
              className={`px-3 ${sign < 0 ? 'bg-destructive text-destructive-foreground' : 'bg-background text-muted-foreground'}`}
              aria-pressed={sign < 0}
              aria-label="خصم"
            >
              <Minus className="h-4 w-4" />
            </button>
          </div>
          <Input id="adjust-amount" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} className="w-28 text-center" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="adjust-reason">السبب (يظهر للعضو في سجله)</Label>
        <Textarea id="adjust-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="مثال: مبادرة ممتازة في حملة المدارس" />
      </div>
      <Button onClick={submit} disabled={!ready || busy} className="gap-2">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {sign > 0 ? `إضافة ${value || ''} نقطة` : `خصم ${value || ''} نقطة`}
      </Button>
    </div>
  );
};

export default PointsAdjustForm;
