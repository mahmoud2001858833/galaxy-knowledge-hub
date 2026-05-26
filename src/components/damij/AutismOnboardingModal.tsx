import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Baby, Mail, Sparkles } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const schema = z.object({
  child_name: z.string().trim().min(1, 'الرجاء إدخال اسم الطفل').max(60),
  age_years: z.coerce.number().int().min(1, 'العمر مطلوب').max(25),
  parent_email: z.string().trim().email('بريد غير صالح').max(255),
});

interface Props {
  open: boolean;
  onSaved: (profile: { child_name: string; age_years: number; parent_email: string; profile_id?: string }) => void;
}

const AutismOnboardingModal: React.FC<Props> = ({ open, onSaved }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const parsed = schema.safeParse({ child_name: name, age_years: age, parent_email: email });
    if (!parsed.success) {
      const first = parsed.error.errors[0]?.message || 'تأكد من الحقول';
      toast.error(first);
      return;
    }
    setSaving(true);
    let profileId: string | undefined;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('autism_child_profiles').insert({
          user_id: user.id,
          child_name: parsed.data.child_name,
          age_years: parsed.data.age_years,
          parent_email: parsed.data.parent_email,
        }).select('id').maybeSingle();
        profileId = data?.id;
      }
      localStorage.setItem('autism_active_profile', JSON.stringify({
        profile_id: profileId ?? null,
        child_name: parsed.data.child_name,
        age_years: parsed.data.age_years,
        parent_email: parsed.data.parent_email,
      }));
      onSaved({ ...parsed.data, profile_id: profileId });
    } catch (e: any) {
      toast.error(e?.message || 'تعذّر الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          dir="rtl"
        >
          <motion.div
            initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="text-center mb-5">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center mb-3 shadow-lg">
                <Baby className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">لنتعرّف على طفلك أولاً</h2>
              <p className="text-sm text-slate-600 mt-1">سنستخدم اسمه داخل الألعاب لزيادة التفاعل والانتباه ✨</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">اسم الطفل *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-violet-400 outline-none"
                  placeholder="مثال: أحمد" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">العمر بالسنوات *</label>
                <input value={age} onChange={(e) => setAge(e.target.value)} type="number" min={1} max={25}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-violet-400 outline-none"
                  placeholder="مثال: 6" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1"><Mail className="w-3 h-3" /> بريد ولي الأمر *</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" maxLength={255}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-violet-400 outline-none"
                  placeholder="parent@example.com" dir="ltr" />
                <p className="text-[10px] text-slate-500 mt-1">سترسل التقارير اليومية ونتائج كل جلسة على هذا البريد.</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-5 w-full py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
            >
              <Sparkles className="w-5 h-5" /> {saving ? 'جاري الحفظ…' : 'ابدأ الرحلة'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AutismOnboardingModal;
