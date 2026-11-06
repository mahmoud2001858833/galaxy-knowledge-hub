import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Database, FolderGit2, FolderPlus, Github, Loader2, Pencil, Plus, RotateCcw, Trash2, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Projects outside ذروة العلم that the bridge on the principal's computer works on (principal only).
 * A project is created here; the bridge then creates or clones it into ~/zarwa-projects/<slug> and
 * reports back. Grants decide who sees it in /terminal. See supabase/migrations/20261107100000_bridge_projects.sql.
 */

type Project = Tables<'bridge_projects'>;
type Grant = Tables<'bridge_project_grants'>;
type Person = { user_id: string; email: string };

const SLUG = /^[a-z0-9][a-z0-9-]{1,39}$/;
const GITHUB = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const SUPABASE_URL = /^https:\/\/[a-z0-9]{20}\.supabase\.co$/;

const errText = (e: unknown) => (e as { message?: string })?.message ?? String(e);
const cleanRepo = (u: string) => u.trim().replace(/\/+$/, '').replace(/\.git$/, '');
const slugFrom = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

const STATUS: Record<string, { text: string; cls: string }> = {
  pending: { text: 'بانتظار الجسر', cls: 'bg-warning/15 text-warning' },
  setting_up: { text: 'يُجهَّز على الجهاز…', cls: 'bg-primary/10 text-primary' },
  ready: { text: 'جاهز', cls: 'bg-success/15 text-success' },
  error: { text: 'تعذّر التجهيز', cls: 'bg-destructive/10 text-destructive' },
};

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <label className="block space-y-1 text-sm">
    <span className="font-semibold">{label}</span>
    {children}
    {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
  </label>
);

/** Supabase URL + publishable key: the values to save, or an error text. */
const checkDb = (url: string, key: string): { db_url: string | null; db_public_key: string | null } | string => {
  const u = url.trim().replace(/\/+$/, '');
  const k = key.trim();
  if (!u && !k) return { db_url: null, db_public_key: null };
  if (!SUPABASE_URL.test(u)) return 'رابط Supabase يجب أن يكون بالشكل https://xxxx.supabase.co';
  if (!k) return 'أدخل المفتاح العام (publishable / anon) مع الرابط';
  if (k.startsWith('sb_secret_') || /service_role/.test(atobSafe(k.split('.')[1] ?? ''))) return 'هذا مفتاح سري: أدخل المفتاح العام فقط، والسري يبقى على جهازك';
  return { db_url: u, db_public_key: k };
};
function atobSafe(s: string) {
  try {
    return atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  } catch {
    return '';
  }
}

const NewProjectForm: React.FC<{ onDone: () => void; taken: Set<string> }> = ({ onDone, taken }) => {
  const [source, setSource] = useState<'new' | 'github'>('new');
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [repo, setRepo] = useState('');
  const [description, setDescription] = useState('');
  const [dbUrl, setDbUrl] = useState('');
  const [dbKey, setDbKey] = useState('');
  const [busy, setBusy] = useState(false);

  // the folder name follows the repository name, or the (Latin) project name
  useEffect(() => {
    if (slugTouched) return;
    const fromRepo = cleanRepo(repo).split('/').pop() ?? '';
    setSlug(slugFrom(fromRepo || name));
  }, [repo, name, slugTouched]);

  const save = async () => {
    const repoUrl = repo.trim() ? cleanRepo(repo) : null;
    if (!name.trim()) return toast.error('اكتب اسم المشروع');
    if (!SLUG.test(slug) || slug === 'main') return toast.error('اسم المجلد: حروف إنجليزية صغيرة وأرقام وشرطة (-)، من 2 إلى 40 حرفاً');
    if (taken.has(slug)) return toast.error('يوجد مشروع بهذا الاسم');
    if (source === 'github' && !repoUrl) return toast.error('الصق رابط المستودع');
    if (repoUrl && !GITHUB.test(repoUrl)) return toast.error('الرابط يجب أن يكون https://github.com/<المالك>/<المستودع>');
    const db = checkDb(dbUrl, dbKey);
    if (typeof db === 'string') return toast.error(db);
    setBusy(true);
    const { error } = await supabase.from('bridge_projects').insert({
      slug,
      name: name.trim(),
      description: description.trim() || null,
      source,
      repo_url: repoUrl,
      ...db,
    });
    setBusy(false);
    if (error) return toast.error(errText(error));
    toast.success('أُضيف المشروع؛ الجسر يجهّزه على جهازك الآن');
    onDone();
  };

  return (
    <div className="space-y-4 rounded-2xl border border-primary/30 bg-primary/5 p-4">
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ['new', FolderPlus, 'إنشاء مشروع جديد', 'مجلد جديد فارغ على جهازك، ويمكن ربطه بمستودع GitHub فارغ'],
            ['github', Github, 'ربط مستودع GitHub', 'يُنسخ المستودع الموجود إلى جهازك'],
          ] as const
        ).map(([id, Icon, title, hint]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSource(id)}
            className={`rounded-xl border p-3 text-start transition ${source === id ? 'border-primary bg-background ring-2 ring-primary/30' : 'border-border bg-background/60 hover:border-primary/50'}`}
          >
            <div className="flex items-center gap-2 font-bold">
              <Icon className="h-4 w-4" /> {title}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="اسم المشروع">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً: ذاكرة وطن" dir="auto" />
        </Field>
        <Field label="اسم المجلد على الجهاز" hint={`~/zarwa-projects/${slug || '…'}`}>
          <Input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
            }}
            placeholder="thakirat-watan"
            dir="ltr"
          />
        </Field>
        <Field
          label={source === 'github' ? 'رابط المستودع' : 'رابط مستودع GitHub (اختياري)'}
          hint={source === 'github' ? 'المستودع الخاص يعمل إن كان GitHub مسجَّلاً على جهازك' : 'مستودع فارغ تُرفع إليه التعديلات بعد موافقتك'}
        >
          <Input value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="https://github.com/user/repo" dir="ltr" />
        </Field>
        <Field label="وصف قصير (اختياري)">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} dir="auto" />
        </Field>
      </div>

      <DbFields url={dbUrl} setUrl={setDbUrl} keyValue={dbKey} setKey={setDbKey} />

      <div className="flex gap-2">
        <Button onClick={save} disabled={busy} className="gap-2">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} إضافة المشروع
        </Button>
        <Button variant="ghost" onClick={onDone}>
          إلغاء
        </Button>
      </div>
    </div>
  );
};

const DbFields: React.FC<{ url: string; setUrl: (v: string) => void; keyValue: string; setKey: (v: string) => void }> = ({ url, setUrl, keyValue, setKey }) => (
  <div className="space-y-2 rounded-xl border border-border bg-background p-3">
    <div className="flex items-center gap-2 text-sm font-bold">
      <Database className="h-4 w-4" /> ربط قاعدة بيانات Supabase (اختياري)
    </div>
    <div className="grid gap-3 md:grid-cols-2">
      <Field label="Project URL" hint="من Supabase: Project Settings → API">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://xxxx.supabase.co" dir="ltr" />
      </Field>
      <Field label="المفتاح العام (publishable أو anon)" hint="يُكتب في .env.local داخل مجلد المشروع">
        <Input value={keyValue} onChange={(e) => setKey(e.target.value)} placeholder="sb_publishable_…" dir="ltr" />
      </Field>
    </div>
    <p className="text-xs text-muted-foreground">
      المفاتيح السرية (service role أو كلمة سر القاعدة) لا تُدخل هنا: أضفها بنفسك إلى ملف <code dir="ltr">.env.local</code> في مجلد المشروع على جهازك، فلا تمر بقاعدة بيانات ذروة العلم أبداً.
    </p>
  </div>
);

const ProjectRow: React.FC<{ p: Project; grants: Grant[]; people: Person[]; reload: () => void }> = ({ p, grants, people, reload }) => {
  const [editDb, setEditDb] = useState(false);
  const [dbUrl, setDbUrl] = useState(p.db_url ?? '');
  const [dbKey, setDbKey] = useState(p.db_public_key ?? '');
  const [showPeople, setShowPeople] = useState(false);
  const st = STATUS[p.status] ?? { text: p.status, cls: '' };
  const granted = new Set(grants.filter((g) => g.project_id === p.id).map((g) => g.user_id));

  const toggle = async (userId: string) => {
    const { error } = granted.has(userId)
      ? await supabase.from('bridge_project_grants').delete().eq('project_id', p.id).eq('user_id', userId)
      : await supabase.from('bridge_project_grants').insert({ project_id: p.id, user_id: userId });
    if (error) toast.error(errText(error));
    reload();
  };
  const saveDb = async () => {
    const db = checkDb(dbUrl, dbKey);
    if (typeof db === 'string') return toast.error(db);
    const { error } = await supabase.from('bridge_projects').update(db).eq('id', p.id);
    if (error) return toast.error(errText(error));
    toast.success('حُفظ؛ الجسر يحدّث .env.local');
    setEditDb(false);
    reload();
  };
  const retry = async () => {
    const { error } = await supabase.from('bridge_projects').update({ status: 'pending' }).eq('id', p.id);
    if (error) toast.error(errText(error));
    reload();
  };
  const remove = async () => {
    if (!window.confirm(`حذف «${p.name}» من المنصة؟ لن يستطيع أحد العمل عليه من الطرفية. المجلد على جهازك يبقى كما هو.`)) return;
    const { error } = await supabase.from('bridge_projects').delete().eq('id', p.id);
    if (error) toast.error(errText(error));
    reload();
  };

  return (
    <li className="space-y-3 rounded-2xl border border-border p-4">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          {p.source === 'github' ? <Github className="h-5 w-5" /> : <FolderGit2 className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold" dir="auto">
              {p.name}
            </span>
            <code dir="ltr" className="rounded bg-muted px-1.5 py-0.5 text-xs">
              {p.slug}
            </code>
            <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${st.cls}`}>
              {(p.status === 'pending' || p.status === 'setting_up') && <Loader2 className="h-3 w-3 animate-spin" />}
              {p.status === 'ready' && <CheckCircle2 className="h-3 w-3" />}
              {p.status === 'error' && <AlertTriangle className="h-3 w-3" />}
              {st.text}
            </span>
          </div>
          {p.description && <div className="text-xs text-muted-foreground">{p.description}</div>}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" dir="ltr">
            {p.local_path && <span>{p.local_path}</span>}
            {p.repo_url && (
              <a href={p.repo_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                {p.repo_url.replace('https://github.com/', '')}
              </a>
            )}
            {p.db_url && (
              <span className="flex items-center gap-1">
                <Database className="h-3 w-3" /> {p.db_url.replace('https://', '')}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowPeople((v) => !v)}>
            <Users className="h-3.5 w-3.5" /> الصلاحيات ({granted.size})
          </Button>
          <Button size="sm" variant="outline" className="gap-1" onClick={() => setEditDb((v) => !v)}>
            <Pencil className="h-3.5 w-3.5" /> القاعدة
          </Button>
          {p.status === 'error' && (
            <Button size="sm" variant="outline" className="gap-1" onClick={retry}>
              <RotateCcw className="h-3.5 w-3.5" /> إعادة المحاولة
            </Button>
          )}
          <Button size="sm" variant="ghost" className="text-destructive" onClick={remove} aria-label="حذف المشروع">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {p.status_detail && (
        <pre dir="ltr" className={`max-h-40 overflow-auto whitespace-pre-wrap rounded-lg p-2 text-[11px] ${p.status === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-muted/50 text-muted-foreground'}`}>
          {p.status_detail}
        </pre>
      )}

      {editDb && (
        <div className="space-y-2">
          <DbFields url={dbUrl} setUrl={setDbUrl} keyValue={dbKey} setKey={setDbKey} />
          <div className="flex gap-2">
            <Button size="sm" onClick={saveDb}>
              حفظ
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditDb(false)}>
              إلغاء
            </Button>
          </div>
        </div>
      )}

      {showPeople && (
        <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-3">
          <div className="text-xs text-muted-foreground">
            من تختاره يرى هذا المشروع في الطرفية ويعمل عليه بنفس صلاحياته وحصصه (Claude / Antigravity)، وكل تعديل يصلك طلب موافقة.
          </div>
          {people.length === 0 ? (
            <div className="text-sm text-muted-foreground">لا يوجد مستخدمون بصلاحية طرفية بعد.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {people.map((u) => {
                const on = granted.has(u.user_id);
                return (
                  <button
                    key={u.user_id}
                    type="button"
                    onClick={() => toggle(u.user_id)}
                    dir="ltr"
                    className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition ${on ? 'border-primary bg-primary/10 font-bold text-primary' : 'border-border hover:border-primary/50'}`}
                  >
                    {on ? <CheckCircle2 className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5 opacity-40" />}
                    {u.email}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </li>
  );
};

export const BridgeProjectsCard: React.FC = () => {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [adding, setAdding] = useState(false);
  const [missing, setMissing] = useState(false);

  const load = useCallback(async () => {
    const [p, g, q] = await Promise.all([
      supabase.from('bridge_projects').select('*').order('created_at'),
      supabase.from('bridge_project_grants').select('*'),
      supabase.from('usage_quotas').select('user_id, email').order('email'),
    ]);
    // the migration is not applied yet
    if (p.error && /bridge_projects/.test(p.error.message)) setMissing(true);
    setProjects(p.data ?? []);
    setGrants(g.data ?? []);
    setPeople((q.data ?? []).filter((u): u is Person => !!u.user_id));
  }, []);

  useEffect(() => {
    load();
    const ch = supabase
      .channel('admin-bridge-projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bridge_projects' }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [load]);

  const taken = useMemo(() => new Set((projects ?? []).map((p) => p.slug)), [projects]);

  return (
    <section className="space-y-4 rounded-3xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-from to-brand-to text-white">
          <FolderGit2 className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="font-bold">المشاريع الخارجية</div>
          <div className="text-xs text-muted-foreground">
            منصات خارج ذروة العلم يعمل عليها الجسر في جهازك (<code dir="ltr">~/zarwa-projects</code>). أنت تنشئها وتربطها وتحدد من يعمل عليها، وكل تعديل يمر بموافقتك.
          </div>
        </div>
        {!adding && !missing && (
          <Button onClick={() => setAdding(true)} className="gap-2">
            <Plus className="h-4 w-4" /> مشروع جديد
          </Button>
        )}
      </div>

      {missing && (
        <div className="rounded-xl bg-warning/10 p-3 text-sm text-warning">
          ميزة المشاريع تحتاج تطبيق ترحيل قاعدة البيانات أولاً (<code dir="ltr">supabase db push --linked</code>).
        </div>
      )}

      {adding && (
        <NewProjectForm
          taken={taken}
          onDone={() => {
            setAdding(false);
            load();
          }}
        />
      )}

      {projects === null ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : projects.length === 0 ? (
        !adding && !missing && <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">لا مشاريع خارجية بعد. اضغط «مشروع جديد» لإنشاء مشروع أو ربط مستودع GitHub.</div>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <ProjectRow key={p.id} p={p} grants={grants} people={people} reload={load} />
          ))}
        </ul>
      )}
    </section>
  );
};
