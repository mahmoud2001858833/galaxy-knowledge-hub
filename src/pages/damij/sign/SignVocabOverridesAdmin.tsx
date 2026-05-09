import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, RotateCw, Trash2, Loader2, Search, Wand2, RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DAMIJ_LANGS } from '@/features/damij/i18n/types';
import {
  ENGLISH_BASE, broadcastVocabInvalidation, bumpServerVocabVersion,
} from '@/features/sign-language/useGestureVocab';
import {
  GESTURE_VOCABULARY, type SystemVocab, type GestureId,
} from '@/features/sign-language/gestureVocab';
import { SIGN_SYSTEM_PRIMARY_LANG } from '@/features/sign-language/signSystems';

// All gesture ids in a stable order.
const GESTURE_IDS = Object.keys(ENGLISH_BASE) as GestureId[];

const baseVocabFor = (langCode: string): SystemVocab => {
  // Prefer hand-curated sign system that matches this spoken language.
  const sys = Object.entries(SIGN_SYSTEM_PRIMARY_LANG).find(
    ([, m]) => m.code.split('-')[0] === langCode,
  )?.[0];
  if (sys && GESTURE_VOCABULARY[sys]) return GESTURE_VOCABULARY[sys];
  return ENGLISH_BASE;
};

const SignVocabOverridesAdmin: React.FC = () => {
  const { toast } = useToast();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lang, setLang] = useState<string>('ar');
  const [langQuery, setLangQuery] = useState('');
  const [vocab, setVocab] = useState<SystemVocab>(() => baseVocabFor('ar'));
  const [original, setOriginal] = useState<SystemVocab>(() => baseVocabFor('ar'));
  const [hasOverride, setHasOverride] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsAdmin(false); setAuthChecked(true); return; }
      const { data } = await supabase.rpc('has_admin_teacher_access', { _user_id: user.id });
      setIsAdmin(!!data);
      setAuthChecked(true);
    })();
  }, []);

  const filteredLangs = useMemo(() => {
    const q = langQuery.trim().toLowerCase();
    if (!q) return DAMIJ_LANGS;
    return DAMIJ_LANGS.filter(l =>
      l.code.toLowerCase().includes(q) ||
      l.english.toLowerCase().includes(q) ||
      l.name.toLowerCase().includes(q),
    );
  }, [langQuery]);

  // Load override for selected language (or fallback baseline).
  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from('sign_vocab_overrides')
        .select('vocab, notes')
        .eq('lang_code', lang)
        .maybeSingle();
      if (!alive) return;
      if (error) {
        toast({ title: 'فشل تحميل القاموس', description: error.message, variant: 'destructive' });
      }
      const base = baseVocabFor(lang);
      if (data?.vocab) {
        const merged = { ...base, ...(data.vocab as Partial<SystemVocab>) } as SystemVocab;
        setVocab(merged); setOriginal(merged); setHasOverride(true);
        setNotes(data.notes || '');
      } else {
        setVocab(base); setOriginal(base); setHasOverride(false); setNotes('');
      }
      setLoading(false);
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const dirty = useMemo(
    () => GESTURE_IDS.some(id =>
      vocab[id].text !== original[id].text || vocab[id].description !== original[id].description),
    [vocab, original],
  );

  const update = (id: GestureId, field: 'text' | 'description', value: string) => {
    setVocab(v => ({ ...v, [id]: { ...v[id], [field]: value } }));
  };

  const resetOne = (id: GestureId) => {
    const base = baseVocabFor(lang)[id];
    setVocab(v => ({ ...v, [id]: { ...v[id], text: base.text, description: base.description } }));
  };

  const fillFromAI = async () => {
    setAiBusy(true);
    try {
      const texts: string[] = [];
      GESTURE_IDS.forEach(id => { texts.push(ENGLISH_BASE[id].text); texts.push(ENGLISH_BASE[id].description); });
      const { data, error } = await supabase.functions.invoke('damij-translate', {
        body: { texts, target: lang, source: 'en' },
      });
      if (error) throw error;
      const map: Record<string, string> = data?.translations || {};
      const next: SystemVocab = { ...vocab };
      GESTURE_IDS.forEach(id => {
        next[id] = {
          ...next[id],
          text: map[ENGLISH_BASE[id].text] || next[id].text,
          description: map[ENGLISH_BASE[id].description] || next[id].description,
        };
      });
      setVocab(next);
      toast({ title: 'تم ملء القاموس بالترجمة الذكية. راجع وعدّل قبل الحفظ.' });
    } catch (e: any) {
      toast({ title: 'فشل الترجمة', description: e.message, variant: 'destructive' });
    } finally { setAiBusy(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = {
        lang_code: lang,
        vocab: vocab as any,
        notes: notes.trim() || null,
        updated_by: user?.id || null,
      };
      const { error } = await supabase.from('sign_vocab_overrides').upsert(payload, { onConflict: 'lang_code' });
      if (error) throw error;
      // Bump server version → every client refetches; broadcast for current tabs.
      await bumpServerVocabVersion();
      broadcastVocabInvalidation(lang);
      setOriginal(vocab); setHasOverride(true);
      toast({ title: 'تم حفظ القاموس اليدوي', description: `لغة: ${lang} — سيتم تحديث جميع الأجهزة تلقائيًا.` });
    } catch (e: any) {
      toast({ title: 'فشل الحفظ', description: e.message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`حذف القاموس اليدوي للغة «${lang}»؟ سيعود الموقع لاستخدام الترجمة الذكية.`)) return;
    const { error } = await supabase.from('sign_vocab_overrides').delete().eq('lang_code', lang);
    if (error) {
      toast({ title: 'فشل الحذف', description: error.message, variant: 'destructive' });
      return;
    }
    await bumpServerVocabVersion();
    broadcastVocabInvalidation(lang);
    const base = baseVocabFor(lang);
    setVocab(base); setOriginal(base); setHasOverride(false); setNotes('');
    toast({ title: 'تم الحذف. سيعود الموقع للترجمة الذكية.' });
  };

  if (!authChecked) {
    return (
      <div className="px-6 pt-16 text-center text-muted-foreground" dir="rtl">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="px-6 pt-16 max-w-2xl mx-auto text-center" dir="rtl">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">غير مصرح</h1>
        <p className="text-muted-foreground mb-6">هذه الشاشة متاحة فقط للمشرفين والمسؤولين.</p>
        <Link to="/damij/sign" className="text-[hsl(var(--damij-primary))] underline">رجوع لمترجم الإشارة</Link>
      </div>
    );
  }

  return (
    <div className="px-6 pt-8 pb-16 max-w-6xl mx-auto" dir="rtl">
      <Link to="/damij/sign" className="inline-flex items-center gap-2 text-[hsl(var(--damij-primary))] mb-6 hover:gap-3 transition-all">
        <ArrowLeft className="w-4 h-4" /> رجوع لمترجم الإشارة
      </Link>

      <h1 className="text-3xl font-extrabold text-[hsl(var(--damij-primary))] mb-2">
        قواميس الإشارات اليدوية — لوحة المراجعة
      </h1>
      <p className="text-[hsl(var(--damij-text))]/70 mb-6">
        عدّل ترجمات مفردات الإشارة لكل لغة. القواميس اليدوية تتغلب على الترجمة الذكية ويتم تحديثها على كل الأجهزة فور الحفظ.
      </p>

      {/* Language picker */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="w-4 h-4" /> اختر اللغة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input value={langQuery} onChange={e => setLangQuery(e.target.value)}
            placeholder="ابحث بالاسم الإنجليزي/المحلي أو رمز اللغة (مثال: fr, French, Français)..." />
          <div className="flex flex-wrap gap-1.5 mt-3 max-h-44 overflow-auto">
            {filteredLangs.map(l => (
              <Button key={l.code} size="sm" type="button"
                variant={lang === l.code ? 'default' : 'outline'}
                onClick={() => setLang(l.code)}
                className="text-xs h-7">
                <span className="ml-1">{l.flag}</span>
                {l.english} <span className="opacity-60 mx-1">·</span> {l.code}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Badge variant={hasOverride ? 'default' : 'secondary'}>
              {hasOverride ? 'يوجد قاموس يدوي' : 'لا يوجد قاموس يدوي — يتم استخدام الترجمة الذكية'}
            </Badge>
            <Badge variant="outline">{GESTURE_IDS.length} مفردة</Badge>
            {dirty && <Badge variant="destructive">تغييرات غير محفوظة</Badge>}
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={fillFromAI} disabled={aiBusy || loading}>
              {aiBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin ml-1" /> : <Wand2 className="w-3.5 h-3.5 ml-1" />}
              تعبئة بالترجمة الذكية
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setVocab(original); }} disabled={!dirty}>
              <RotateCw className="w-3.5 h-3.5 ml-1" /> تراجع
            </Button>
            {hasOverride && (
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-rose-600">
                <Trash2 className="w-3.5 h-3.5 ml-1" /> حذف القاموس اليدوي
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving || !dirty}
              className="bg-[hsl(var(--damij-primary))] text-white">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin ml-1" /> : <Save className="w-3.5 h-3.5 ml-1" />}
              حفظ ودفع للأجهزة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-sm">ملاحظات داخلية (اختياري)</CardTitle></CardHeader>
        <CardContent>
          <Textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="مثال: تمت المراجعة من قبل مترجم لغة الإشارة الفلانية بتاريخ ..." />
        </CardContent>
      </Card>

      {/* Editor grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin ml-2" /> جاري التحميل...
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {GESTURE_IDS.map(id => {
            const baseEn = ENGLISH_BASE[id];
            const cur = vocab[id];
            const changed = original[id].text !== cur.text || original[id].description !== cur.description;
            return (
              <Card key={id} className={changed ? 'border-amber-400' : ''}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{baseEn.emoji}</span>
                    <code className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">{id}</code>
                    <span className="text-[11px] text-muted-foreground truncate">EN: {baseEn.text} — {baseEn.description}</span>
                    <Button size="icon" variant="ghost" className="h-6 w-6 mr-auto"
                      onClick={() => resetOne(id)} title="استعادة الافتراضي">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground">الكلمة</label>
                    <Input value={cur.text} onChange={e => update(id, 'text', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground">الوصف</label>
                    <Input value={cur.description} onChange={e => update(id, 'description', e.target.value)} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SignVocabOverridesAdmin;
