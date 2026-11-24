import React, { useState } from 'react';
import { CheckCircle2, Loader2, Send, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PageShell } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { IDEA_CATEGORIES, IDEA_COMPETITION, ideaCategoryLabel, type IdeaCategory } from '@/config/ideaCompetition';

type Field = 'name' | 'phone' | 'school' | 'category' | 'title' | 'idea';

const ERRORS: Record<string, string> = {
  name: 'اكتب اسمك الكامل',
  phone: 'اكتب رقم هاتف أردني صحيح، مثل 0791234567',
  school: 'اكتب اسم مدرستك',
  category: 'اختار مجال فكرتك',
  title: 'اكتب عنوان قصير لفكرتك',
  idea: 'اشرح فكرتك بجملتين على الأقل',
  limit: 'هاد الرقم سجّل 3 أفكار، وهاد الحد الأقصى',
  busy: 'في ضغط تسجيل هلأ، جرّب بعد شوي',
};

const IdeaCompetition: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [school, setSchool] = useState('');
  const [category, setCategory] = useState<IdeaCategory | null>(null);
  const [title, setTitle] = useState('');
  const [idea, setIdea] = useState('');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ ref: number; title: string; category: IdeaCategory } | null>(null);

  const validate = () => {
    const e: Partial<Record<Field, string>> = {};
    const digits = phone.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/\D/g, '');
    if (name.trim().length < 3) e.name = ERRORS.name;
    if (!/^(0?7[789]\d{7}|9627[789]\d{7})$/.test(digits)) e.phone = ERRORS.phone;
    if (school.trim().length < 3) e.school = ERRORS.school;
    if (!category) e.category = ERRORS.category;
    if (title.trim().length < 3) e.title = ERRORS.title;
    if (idea.trim().length < 20) e.idea = ERRORS.idea;
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) document.getElementById(`f-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return !first;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError('');
    if (!validate() || !category) return;
    setSending(true);
    try {
      const { data, error } = await supabase.rpc('idea_competition_submit' as never, {
        p_name: name,
        p_phone: phone,
        p_school: school,
        p_category: category,
        p_title: title,
        p_idea: idea,
      } as never);
      if (error) throw error;
      const res = data as unknown as { ok: boolean; ref?: number; error?: string };
      if (!res?.ok) {
        const key = res?.error ?? '';
        if (['name', 'phone', 'school', 'category', 'title', 'idea'].includes(key)) {
          setErrors({ [key]: ERRORS[key] });
        } else {
          setFormError(ERRORS[key] ?? 'ما زبط التسجيل، جرّب مرة ثانية');
        }
        return;
      }
      setDone({ ref: res.ref ?? 0, title: title.trim(), category });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setFormError('ما زبط التسجيل، تأكد من الإنترنت وجرّب مرة ثانية');
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setTitle('');
    setIdea('');
    setCategory(null);
    setErrors({});
    setDone(null);
  };

  const err = (f: Field) =>
    errors[f] ? <p className="mt-1.5 text-xs font-bold text-destructive">{errors[f]}</p> : null;

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-xl px-4 py-6 sm:py-10" dir="rtl">
        {/* Hero */}
        <div className="rounded-3xl bg-gradient-to-l from-brand-from to-brand-to p-5 text-primary-foreground shadow-lg sm:p-7">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/15">
              <Trophy className="h-6 w-6" />
            </span>
            <h1 className="text-2xl font-black leading-tight sm:text-3xl">{IDEA_COMPETITION.title}</h1>
          </div>
          <p className="mt-3 text-sm leading-relaxed opacity-95 sm:text-base">{IDEA_COMPETITION.tagline}</p>
          <ol className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-bold sm:text-xs">
            {['اختار المجال', 'اكتب فكرتك', 'استنى النتيجة'].map((s, i) => (
              <li key={s} className="rounded-2xl bg-primary-foreground/15 px-2 py-2.5">
                <span className="block text-base font-black">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>

        {done ? (
          <div className="mt-6 rounded-3xl border border-border bg-card p-6 text-center shadow-sm">
            <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
            <h2 className="mt-3 text-xl font-black text-foreground">وصلتنا فكرتك 🎉</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              «{done.title}» بمجال {ideaCategoryLabel(done.category)}. لجنة المسابقة رح تراجع الأفكار، ومنتواصل معك على رقمك إذا
              فكرتك تأهّلت.
            </p>
            <div className="mx-auto mt-4 w-fit rounded-2xl bg-muted px-5 py-3">
              <div className="text-xs text-muted-foreground">رقم مشاركتك</div>
              <div className="text-2xl font-black tabular-nums text-foreground">#{done.ref}</div>
            </div>
            <Button onClick={reset} variant="outline" className="mt-5 h-12 w-full rounded-2xl text-sm font-bold">
              سجّل فكرة ثانية
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-6 space-y-5">
            {/* Category */}
            <section id="f-category" className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
              <h2 className="text-base font-black text-foreground">١. مجال فكرتك</h2>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {IDEA_CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  const on = category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setCategory(c.id);
                        setErrors((e) => ({ ...e, category: undefined }));
                        // Take them straight to writing the idea.
                        setTimeout(() => {
                          document.getElementById('f-idea-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          document.getElementById('title')?.focus({ preventScroll: true });
                        }, 150);
                      }}
                      className={cn(
                        'flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-2xl border-2 px-2 py-3 text-center transition active:scale-[0.97]',
                        on ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background text-foreground hover:border-primary/40',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-black">{c.label}</span>
                    </button>
                  );
                })}
              </div>
              {category && (
                <p className="mt-2 text-xs text-muted-foreground">
                  أمثلة: {IDEA_CATEGORIES.find((c) => c.id === category)?.hint}
                </p>
              )}
              {err('category')}
            </section>

            {/* Idea */}
            <section id="f-idea-section" className="scroll-mt-20 space-y-4 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
              <h2 className="text-base font-black text-foreground">
                ٢. فكرتك
                {category && (
                  <span className="mr-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {ideaCategoryLabel(category)}
                  </span>
                )}
              </h2>
              <div id="f-title">
                <label htmlFor="title" className="mb-1.5 block text-sm font-bold text-foreground">عنوان الفكرة</label>
                <Input
                  id="title"
                  value={title}
                  maxLength={120}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: حديقة مدرسية بتسقي حالها"
                  className="h-12 rounded-2xl text-base"
                />
                {err('title')}
              </div>
              <div id="f-idea">
                <label htmlFor="idea" className="mb-1.5 block text-sm font-bold text-foreground">اشرح فكرتك</label>
                <Textarea
                  id="idea"
                  rows={5}
                  value={idea}
                  maxLength={3000}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="شو المشكلة؟ وكيف فكرتك بتحلها؟ ومين رح يستفيد؟"
                  className="rounded-2xl text-base leading-relaxed"
                />
                {err('idea')}
              </div>
            </section>

            {/* Contact */}
            <section className="space-y-4 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5">
              <h2 className="text-base font-black text-foreground">٣. معلوماتك</h2>
              <div id="f-name">
                <label htmlFor="name" className="mb-1.5 block text-sm font-bold text-foreground">الاسم الكامل</label>
                <Input
                  id="name"
                  autoComplete="name"
                  value={name}
                  maxLength={80}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 rounded-2xl text-base"
                />
                {err('name')}
              </div>
              <div id="f-phone">
                <label htmlFor="phone" className="mb-1.5 block text-sm font-bold text-foreground">رقم الهاتف</label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  value={phone}
                  maxLength={16}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="h-12 rounded-2xl text-right text-base"
                />
                {err('phone')}
              </div>
              <div id="f-school">
                <label htmlFor="school" className="mb-1.5 block text-sm font-bold text-foreground">المدرسة</label>
                <Input
                  id="school"
                  value={school}
                  maxLength={120}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="مثال: مدرسة المزار الثانوية"
                  className="h-12 rounded-2xl text-base"
                />
                {err('school')}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                رقمك ما بيظهر لحدا، بنستخدمه بس عشان نتواصل معك إذا فكرتك تأهّلت.
              </p>
            </section>

            {formError && (
              <p className="rounded-2xl bg-destructive/10 p-3 text-center text-sm font-bold text-destructive">{formError}</p>
            )}

            <Button
              type="submit"
              disabled={sending}
              className="h-14 w-full gap-2 rounded-2xl bg-gradient-to-l from-brand-from to-brand-to text-base font-black text-primary-foreground shadow-lg"
            >
              {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              سجّل فكرتي
            </Button>
          </form>
        )}
      </div>
    </PageShell>
  );
};

export default IdeaCompetition;
