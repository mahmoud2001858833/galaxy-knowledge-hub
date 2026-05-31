import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, MapPin, Trash2, Save, Compass, ShieldAlert, Vibrate, Siren, Plus, Star } from 'lucide-react';
import {
  listPlaces, removePlace, savePlace, canonicalizePlaceName,
  getEmergencyPhone, setEmergencyPhone, type SavedPlace,
} from './navigation/savedPlaces';
import { requestCompassPermission } from './navigation/compass';
import { requestMotionPermission } from './navigation/fallDetection';
import { isHapticsEnabled, setHapticsEnabled, haptics } from './haptics';
import { listContacts, addContact, deleteContact, type EmergencyContact } from './emergencyService';
import { toast } from 'sonner';

const FALL_KEY = 'damij.blindEye.fallDetection.v1';

const BlindEyeSettings: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [newName, setNewName] = useState('');
  const [newQuery, setNewQuery] = useState('');
  const [fallOn, setFallOn] = useState<boolean>(() => {
    try { return localStorage.getItem(FALL_KEY) !== '0'; } catch { return true; }
  });
  const [haptOn, setHaptOn] = useState<boolean>(() => isHapticsEnabled());
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [cName, setCName] = useState('');
  const [cPhone, setCPhone] = useState('');

  const reloadContacts = async () => {
    try { setContacts(await listContacts()); } catch {}
  };

  useEffect(() => {
    setPhone(getEmergencyPhone() || '');
    setPlaces(listPlaces());
    reloadContacts();
  }, []);

  const savePhone = () => {
    setEmergencyPhone(phone.trim());
    toast.success('تم حفظ رقم الطوارئ');
  };

  const addPlace = () => {
    if (!newName.trim()) { toast.error('أدخل اسم المكان'); return; }
    savePlace(canonicalizePlaceName(newName.trim()), { query: newQuery.trim() || undefined });
    setNewName(''); setNewQuery('');
    setPlaces(listPlaces());
    toast.success('تم حفظ المكان');
  };

  const captureCurrentAs = (name: string) => {
    if (!navigator.geolocation) { toast.error('لا يدعم المتصفح تحديد الموقع'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        savePlace(name, { coords: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
        setPlaces(listPlaces());
        toast.success(`تم تحديث إحداثيات ${name}`);
      },
      (err) => toast.error(`تعذر تحديد الموقع: ${err.message}`),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const del = (n: string) => { removePlace(n); setPlaces(listPlaces()); };

  const toggleFall = () => {
    const next = !fallOn;
    setFallOn(next);
    try { localStorage.setItem(FALL_KEY, next ? '1' : '0'); } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-black text-white px-6 py-8" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <Link to="/damij/blind-eye" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 text-lg">
          <ArrowRight className="w-6 h-6" /> رجوع
        </Link>

        <h1 className="text-4xl font-black mb-6">إعدادات عين الأعمى</h1>

        {/* Emergency */}
        <section className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold mb-3"><Phone className="w-6 h-6 text-rose-300" /> رقم الطوارئ</h2>
          <p className="text-white/70 text-sm mb-3">يتم الاتصال به عند قول "نجدة" أو عند الكشف عن سقوط.</p>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثال: 00962790000000"
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-lg outline-none focus:border-emerald-400"
            />
            <button onClick={savePhone} className="px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold flex items-center gap-1"><Save className="w-4 h-4" /> حفظ</button>
          </div>
        </section>

        {/* Emergency contacts list (cloud) */}
        <section className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold mb-3"><Siren className="w-6 h-6 text-rose-300" /> جهات اتصال الطوارئ</h2>
          <p className="text-white/70 text-sm mb-3">اضغط مطوّلاً على الزر الأحمر داخل شاشة الإرشاد لإرسال رسالة طوارئ مع موقعك. (يحفظ في حسابك)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            <input value={cName} onChange={(e) => setCName(e.target.value)} placeholder="الاسم (مثل: أبي)"
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-rose-400" />
            <input value={cPhone} onChange={(e) => setCPhone(e.target.value)} placeholder="الرقم (مثال: +962790000000)" type="tel"
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-rose-400" />
          </div>
          <button
            onClick={async () => {
              if (!cName.trim() || !cPhone.trim()) { toast.error('أدخل الاسم والرقم'); return; }
              try {
                await addContact({ name: cName.trim(), phone: cPhone.trim(), is_primary: contacts.length === 0 });
                setCName(''); setCPhone(''); await reloadContacts();
                toast.success('تمت إضافة جهة اتصال');
              } catch (e: any) {
                toast.error(e?.message === 'not_authenticated' ? 'سجّل الدخول أولاً' : 'تعذرت الإضافة');
              }
            }}
            className="px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold inline-flex items-center gap-2 mb-3"
          ><Plus className="w-4 h-4" /> إضافة</button>
          <ul className="space-y-2">
            {contacts.length === 0 && <li className="text-white/50 text-sm">لا توجد جهات طوارئ بعد.</li>}
            {contacts.map((c) => (
              <li key={c.id} className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-3">
                <div className="flex-1">
                  <div className="font-bold text-lg flex items-center gap-2">
                    {c.is_primary && <Star className="w-4 h-4 text-amber-300 fill-amber-300" />}
                    {c.name}
                  </div>
                  <div className="text-xs text-white/60 ltr:font-mono" dir="ltr">{c.phone}</div>
                </div>
                <button onClick={async () => { await deleteContact(c.id); reloadContacts(); }}
                  className="p-2 rounded-lg bg-rose-600/80 hover:bg-rose-500"><Trash2 className="w-4 h-4" /></button>
              </li>
            ))}
          </ul>
        </section>

        {/* Haptics toggle */}
        <section className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold mb-3"><Vibrate className="w-6 h-6 text-fuchsia-300" /> الاهتزاز الاتجاهي</h2>
          <p className="text-white/70 text-sm mb-3">يمين = نبضة قصيرة. يسار = نبضة طويلة. توقف = نبضات سريعة. مفيد في الأماكن الصاخبة.</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { const n = !haptOn; setHaptOn(n); setHapticsEnabled(n); haptics.tap(); }}
              className={`px-5 py-3 rounded-xl font-bold ${haptOn ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-white/10 hover:bg-white/20'}`}>
              {haptOn ? 'مفعّل ✓' : 'معطّل'}
            </button>
            <button onClick={() => haptics.right()} className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20">جرّب يمين</button>
            <button onClick={() => haptics.left()} className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20">جرّب يسار</button>
            <button onClick={() => haptics.stop()} className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20">جرّب توقف</button>
          </div>
        </section>


        {/* Fall detection toggle */}
        <section className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold mb-3"><ShieldAlert className="w-6 h-6 text-amber-300" /> كشف السقوط</h2>
          <p className="text-white/70 text-sm mb-3">يستخدم حساسات الحركة لاكتشاف السقوط ويبدأ عد تنازلي قبل الاتصال بجهة الطوارئ.</p>
          <button
            onClick={toggleFall}
            className={`px-5 py-3 rounded-xl font-bold ${fallOn ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-white/10 hover:bg-white/20'}`}
          >
            {fallOn ? 'مفعّل ✓' : 'معطّل'}
          </button>
          <button
            onClick={async () => {
              const ok = await requestMotionPermission();
              const ok2 = await requestCompassPermission();
              toast[ok && ok2 ? 'success' : 'error'](ok && ok2 ? 'تم منح صلاحيات الحساسات' : 'لم يتم منح بعض الصلاحيات');
            }}
            className="ms-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold inline-flex items-center gap-2"
          >
            <Compass className="w-4 h-4" /> منح صلاحيات الحساسات
          </button>
        </section>

        {/* Saved places */}
        <section className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold mb-3"><MapPin className="w-6 h-6 text-cyan-300" /> الأماكن المحفوظة</h2>
          <p className="text-white/70 text-sm mb-3">قل "وديني عالبيت" أو "خذني إلى المدرسة" لتوجيهك إليها.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="الاسم (مثل: البيت)"
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-400"
            />
            <input
              value={newQuery}
              onChange={(e) => setNewQuery(e.target.value)}
              placeholder="العنوان أو اسم المكان للبحث (اختياري)"
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-400"
            />
          </div>
          <button onClick={addPlace} className="px-4 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold mb-4">إضافة مكان</button>

          <ul className="space-y-2">
            {places.length === 0 && <li className="text-white/50 text-sm">لا توجد أماكن محفوظة بعد.</li>}
            {places.map((p) => (
              <li key={p.name} className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-3">
                <div className="flex-1">
                  <div className="font-bold text-lg">{p.name}</div>
                  <div className="text-xs text-white/60">
                    {p.coords ? `📍 ${p.coords.lat.toFixed(5)}, ${p.coords.lng.toFixed(5)}` : ''}
                    {p.query ? ` • "${p.query}"` : ''}
                  </div>
                </div>
                <button onClick={() => captureCurrentAs(p.name)} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">حدّث الموقع</button>
                <button onClick={() => del(p.name)} className="p-2 rounded-lg bg-rose-600/80 hover:bg-rose-500"><Trash2 className="w-4 h-4" /></button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default BlindEyeSettings;
