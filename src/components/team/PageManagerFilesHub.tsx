import React, { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Edit3,
  ExternalLink,
  FileText,
  Film,
  FolderOpen,
  Image as ImageIcon,
  Link2,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  PRINCIPAL,
  createPageManagerFile,
  deletePageManagerFile,
  errorMessage,
  formatDate,
  updatePageManagerFile,
  usePageManagerFiles,
  useTeamMembers,
  useTeamRoles,
  type PageManagerFileItem,
  type PageManagerMediaType,
} from './teamApi';
import { PageManagerDayPlan, type PageManagerDayTask } from './PageManagerDayPlan';

const MEDIA_META: Record<
  PageManagerMediaType,
  { label: string; icon: React.ElementType; gradient: string; badge: string }
> = {
  video: {
    label: 'فيديو',
    icon: Film,
    gradient: 'from-rose-500 to-pink-600',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  },
  file: {
    label: 'ملف',
    icon: FileText,
    gradient: 'from-blue-600 to-indigo-600',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
  },
  design: {
    label: 'تصميم / صور',
    icon: ImageIcon,
    gradient: 'from-violet-600 to-purple-600',
    badge: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
  },
  folder: {
    label: 'مجلد Drive',
    icon: FolderOpen,
    gradient: 'from-emerald-600 to-teal-600',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
};

const normalizeUrl = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

/**
 * مكان الملفات (للمدير، المشرف، ومسؤول الصفحة)
 * - مصمم بشكل ممتاز وواضح جداً خاصةً على شاشات الهاتف.
 * - المدير والمشرف يملكان كامل الصلاحية لإعطاء/تعديل/حذف الملفات والفيديوهات مع وصف ورابط Google Drive.
 * - عند النقر على أي ملف أو فيديو، تظهر نافذة تعرض الوصف الكامل ورابط Google Drive للفتح أو النسخ فوراً.
 */
export const PageManagerFilesHub: React.FC<{ readOnly?: boolean }> = ({ readOnly = false }) => {
  const { loading: rolesLoading, userId, roles } = useTeamRoles();
  const { members } = useTeamMembers();
  const { files, loading: filesLoading, reload } = usePageManagerFiles();

  const isPrincipal = roles.includes('principal');
  const isSupervisor = roles.includes('supervisor');
  const isPageManager = roles.includes('page_manager');
  // Strictly ONLY Admin (principal) and Supervisor can upload/edit/delete; Page Manager is always read-only.
  const canManage = !readOnly && (isPrincipal || isSupervisor);
  const canView = isPrincipal || isSupervisor || isPageManager;

  const pageManagers = useMemo(() => members.filter((m) => m.role === 'page_manager'), [members]);
  const meMember = useMemo(() => members.find((m) => m.user_id === userId) ?? null, [members, userId]);

  const [typeFilter, setTypeFilter] = useState<'all' | PageManagerMediaType>('all');
  const [query, setQuery] = useState('');

  // Detail modal (when user clicks a file/video card)
  const [selected, setSelected] = useState<PageManagerFileItem | null>(null);
  const [copied, setCopied] = useState(false);

  // Add / Edit modal (Principal & Supervisor)
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [mediaType, setMediaType] = useState<PageManagerMediaType>('video');
  const [targetUserId, setTargetUserId] = useState<string>('all');
  const [saving, setSaving] = useState(false);
  // Day-by-day view (leads): a new file can be tied to one day's page-manager task.
  const [view, setView] = useState<'days' | 'all'>('days');
  const [linkTo, setLinkTo] = useState<{ taskId: string; forDay: string; label: string } | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return files.filter((f) => {
      if (typeFilter !== 'all' && f.mediaType !== typeFilter) return false;
      if (q && !f.title.toLowerCase().includes(q) && !f.description.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [files, typeFilter, query]);

  const openCreate = () => {
    if (!canManage) {
      toast.error('رفع وإضافة الملفات متاح للأدمن والمشرف فقط');
      return;
    }
    setEditingId(null);
    setLinkTo(null);
    setTitle('');
    setDescription('');
    setDriveUrl('');
    setMediaType('video');
    setTargetUserId('all');
    setEditorOpen(true);
  };

  const openCreateForDay = (task: PageManagerDayTask) => {
    if (!canManage) return;
    const d = new Date(`${task.day}T12:00:00Z`);
    const label = `${d.toLocaleDateString('ar-JO', { weekday: 'long', timeZone: 'UTC' })} ${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
    setEditingId(null);
    setLinkTo({ taskId: task.id, forDay: task.day, label });
    setTitle('');
    setDescription('');
    setDriveUrl('');
    setMediaType('video');
    setTargetUserId(task.assigneeUserId ?? 'all');
    setEditorOpen(true);
  };

  const openEdit = (item: PageManagerFileItem) => {
    if (!canManage) {
      toast.error('تعديل الملفات متاح للأدمن والمشرف فقط');
      return;
    }
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setDriveUrl(item.driveUrl);
    setMediaType(item.mediaType);
    setTargetUserId(item.targetUserId ?? 'all');
    setLinkTo(item.taskId && item.forDay ? { taskId: item.taskId, forDay: item.forDay, label: item.forDay } : null);
    setSelected(null);
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!canManage) {
      toast.error('رفع وتعديل الملفات متاح للأدمن والمشرف فقط');
      return;
    }
    if (!title.trim()) {
      toast.error('اكتب عنوان الملف أو الفيديو');
      return;
    }
    const cleanUrl = normalizeUrl(driveUrl);
    if (!cleanUrl) {
      toast.error('أضف رابط Google Drive للملف أو الفيديو');
      return;
    }
    try {
      new URL(cleanUrl);
    } catch {
      toast.error('الرابط غير صالح، تأكد من نسخ رابط Google Drive بشكل صحيح');
      return;
    }

    setSaving(true);
    try {
      const senderRole: 'principal' | 'supervisor' = isPrincipal ? 'principal' : 'supervisor';
      const senderName = isPrincipal ? PRINCIPAL.name : meMember?.display_name || 'المشرف';
      const payload = {
        title: title.trim(),
        description: description.trim(),
        driveUrl: cleanUrl,
        mediaType,
        targetUserId: targetUserId === 'all' ? null : targetUserId,
        senderName,
        senderRole,
        taskId: linkTo?.taskId ?? null,
        forDay: linkTo?.forDay ?? null,
      };
      if (editingId) {
        await updatePageManagerFile(editingId, payload);
        toast.success('تم تحديث الملف بنجاح');
      } else {
        await createPageManagerFile(payload);
        toast.success('تم إرسال الملف لمسؤول الصفحة بنجاح');
      }
      setEditorOpen(false);
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: PageManagerFileItem) => {
    if (!canManage) {
      toast.error('حذف الملفات متاح للأدمن والمشرف فقط');
      return;
    }
    if (!window.confirm(`هل أنت متأكد من حذف «${item.title}» من مكان الملفات؟`)) return;
    try {
      await deletePageManagerFile(item.id);
      toast.success('تم حذف الملف');
      if (selected?.id === item.id) setSelected(null);
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('تم نسخ رابط Google Drive');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('تعذّر نسخ الرابط');
    }
  };

  if (rolesLoading || filesLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!userId || !canView) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground" dir="rtl">
        مكان الملفات متاح للرئيس والمشرف ومسؤول الصفحة فقط.
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5" dir="rtl">
      {/* Mobile-First Hero Header */}
      <div className="rounded-3xl border border-border bg-gradient-to-l from-blue-600/10 via-indigo-600/5 to-card p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start sm:items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
              <FolderOpen className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-foreground">مكان الملفات والفيديوهات</h2>
                <Badge className="rounded-full bg-blue-600/15 text-blue-700 dark:text-blue-300 border-0 text-xs font-bold">
                  {files.length} ملف
                </Badge>
              </div>
              <p className="mt-0.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {canManage
                  ? 'أرسل الملفات والفيديوهات لمسؤول الصفحة مع الوصف الكامل ورابط Google Drive (متاح للرئيس والمشرف).'
                  : 'اضغط على أي ملف أو فيديو لعرض الوصف الكامل وفتح رابط Google Drive مباشرة.'}
              </p>
            </div>
          </div>

          {canManage ? (
            <Button
              type="button"
              onClick={openCreate}
              className="w-full sm:w-auto h-11 gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-black text-white shadow-md shadow-blue-600/20 hover:from-blue-700 hover:to-indigo-700"
            >
              <Upload className="h-4 w-4" />
              إعطاء ملف أو فيديو جديد
            </Button>
          ) : (
            <Badge variant="secondary" className="w-fit rounded-xl px-3.5 py-2 text-xs font-bold text-muted-foreground">
              للعرض والتحميل فقط · الرفع للأدمن والمشرف
            </Badge>
          )}
        </div>

        {/* Search & Filter Row (touch friendly on mobile) */}
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في الملفات والفيديوهات..."
              className="h-11 rounded-2xl bg-background pr-10 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {([
              ['all', 'الكل'],
              ['video', 'فيديوهات'],
              ['file', 'ملفات'],
              ['design', 'تصاميم'],
              ['folder', 'مجلدات'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTypeFilter(key)}
                className={`h-9 rounded-xl px-3.5 text-xs font-bold transition ${
                  typeFilter === key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-background border border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {canManage && (
        <div className="inline-flex rounded-2xl border border-border bg-card p-1">
          {([
            ['days', 'يوماً بيوم'],
            ['all', 'كل الملفات'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={`h-9 rounded-xl px-4 text-xs font-black transition ${
                view === key ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {canManage && view === 'days' ? (
        <PageManagerDayPlan
          files={files}
          memberName={(uid) => (uid ? members.find((m) => m.user_id === uid)?.display_name ?? null : null)}
          onUpload={openCreateForDay}
          onOpenFile={(f) => {
            setSelected(f);
            setCopied(false);
          }}
        />
      ) : /* Cards Grid (1 col mobile, 2 col tablet, 3 col desktop) */
      filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <FolderOpen className="mb-3 h-12 w-12 text-muted-foreground/40" />
          <p className="text-base font-bold text-foreground">لا توجد ملفات أو فيديوهات بعد</p>
          <p className="mt-1 max-w-md text-xs sm:text-sm text-muted-foreground">
            {canManage
              ? 'اضغط على زر «إعطاء ملف أو فيديو جديد» بالأعلى لإرسال أول ملف أو فيديو لمسؤول الصفحة مع رابط Google Drive.'
              : 'عندما يرسل لك الرئيس أو المشرف ملفات أو فيديوهات ستظهر هنا فوراً.'}
          </p>
          {canManage && (
            <Button onClick={openCreate} className="mt-4 gap-1.5 rounded-2xl">
              <Plus className="h-4 w-4" /> إضافة ملف الآن
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => {
            const meta = MEDIA_META[item.mediaType] ?? MEDIA_META.file;
            const Icon = meta.icon;
            const targetPerson = item.targetUserId
              ? pageManagers.find((m) => m.user_id === item.targetUserId)?.display_name
              : null;

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelected(item);
                  setCopied(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelected(item);
                    setCopied(false);
                  }
                }}
                className="group relative flex cursor-pointer flex-col justify-between rounded-3xl border border-border bg-card p-4 sm:p-5 text-right shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md active:scale-[0.99]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2.5">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-white shadow-sm`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${meta.badge}`}>
                        {meta.label}
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        {item.senderRole === 'principal' ? 'من الرئيس' : 'من المشرف'}
                      </span>
                      {item.forDay && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                          ليوم {Number(item.forDay.slice(8))}/{Number(item.forDay.slice(5, 7))}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="mt-3.5 text-base font-black leading-snug text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>

                  <p className="mt-1.5 line-clamp-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    {item.description || 'اضغط لفتح رابط Google Drive وعرض التفاصيل.'}
                  </p>
                </div>

                <div className="mt-4 space-y-2.5 border-t border-border/70 pt-3">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{formatDate(item.createdAt)}</span>
                    {targetPerson && (
                      <span className="font-semibold text-foreground">إلى: {targetPerson}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500/10 px-3 py-1.5 text-xs font-black text-blue-700 dark:text-blue-300">
                      <Link2 className="h-3.5 w-3.5" />
                      اضغط لعرض الوصف ورابط Drive
                    </span>

                    {canManage && (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-xl text-muted-foreground hover:text-primary"
                          onClick={() => openEdit(item)}
                          title="تعديل"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(item)}
                          title="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Dialog: Shows Full Description + Google Drive Link on Click */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="w-[95vw] max-w-lg rounded-3xl p-5 sm:p-6 text-right" dir="rtl">
          {selected && (() => {
            const meta = MEDIA_META[selected.mediaType] ?? MEDIA_META.file;
            const Icon = meta.icon;
            return (
              <div className="space-y-4">
                <DialogHeader className="text-right space-y-2">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.gradient} text-white shadow-sm`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${meta.badge}`}>
                          {meta.label}
                        </span>
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          أُرسل بواسطة: {selected.senderRole === 'principal' ? 'الرئيس' : 'المشرف'} ({selected.senderName})
                        </span>
                      </div>
                      <DialogTitle className="mt-1 text-lg font-black leading-snug text-foreground">
                        {selected.title}
                      </DialogTitle>
                    </div>
                  </div>
                  <DialogDescription className="text-xs text-muted-foreground">
                    تاريخ الإرسال: {formatDate(selected.createdAt)}
                  </DialogDescription>
                </DialogHeader>

                {/* Description Box */}
                <div className="space-y-1.5">
                  <div className="text-xs font-black text-muted-foreground">الوصف والتعليمات:</div>
                  <div className="max-h-56 overflow-y-auto rounded-2xl border border-border bg-muted/40 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {selected.description || 'لا يوجد وصف إضافي لهذا الملف.'}
                  </div>
                </div>

                {/* Google Drive Link Box (Huge mobile-friendly touch buttons) */}
                <div className="space-y-2.5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-black text-blue-800 dark:text-blue-300">
                    <Sparkles className="h-4 w-4" />
                    رابط Google Drive المباشر
                  </div>
                  <p className="truncate rounded-xl bg-background/80 px-3 py-2 text-xs font-mono text-muted-foreground" dir="ltr">
                    {selected.driveUrl}
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <a
                      href={selected.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-sm font-black text-white shadow-md hover:from-blue-700 hover:to-indigo-700 transition"
                    >
                      <ExternalLink className="h-4 w-4" />
                      فتح في Google Drive
                    </a>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => copyLink(selected.driveUrl)}
                      className="h-12 gap-2 rounded-2xl bg-background text-sm font-bold"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'تم النسخ!' : 'نسخ الرابط'}
                    </Button>
                  </div>
                </div>

                {canManage && (
                  <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => openEdit(selected)} className="gap-1.5 rounded-xl">
                      <Edit3 className="h-3.5 w-3.5" /> تعديل
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(selected)}
                      className="gap-1.5 rounded-xl"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> حذف
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Add / Edit File Dialog (Principal & Supervisor Only) */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="w-[95vw] max-w-lg rounded-3xl p-5 sm:p-6 text-right" dir="rtl">
          <DialogHeader className="text-right">
            <DialogTitle className="text-lg font-black">
              {editingId ? 'تعديل الملف / الفيديو' : 'إعطاء ملف أو فيديو لمسؤول الصفحة'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {linkTo
                ? `هاد الملف لمهمة يوم ${linkTo.label}، وبيظهر لمسؤول الصفحة مربوط بهاد اليوم.`
                : 'أدخل العنوان والوصف ورابط Google Drive، وسيظهر فوراً في مكان الملفات عند مسؤول الصفحة والمشرف.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 pt-1">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">نوع المحتوى</Label>
                <Select value={mediaType} onValueChange={(v) => setMediaType(v as PageManagerMediaType)}>
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">فيديو</SelectItem>
                    <SelectItem value="file">ملف / مستند</SelectItem>
                    <SelectItem value="design">تصميم / صور</SelectItem>
                    <SelectItem value="folder">مجلد Google Drive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">المستلم (مسؤول الصفحة)</Label>
                <Select value={targetUserId} onValueChange={setTargetUserId}>
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع مسؤولي الصفحة</SelectItem>
                    {pageManagers.map((m) => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.display_name || m.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">عنوان الملف أو الفيديو</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: فيديو الإعلان الرسمي للنشر على إنستغرام"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">رابط Google Drive</Label>
              <Input
                dir="ltr"
                type="url"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="h-11 rounded-xl text-left font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">الوصف وتعليمات النشر</Label>
              <Textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب الوصف الكامل للملف أو الفيديو، النص المقترح للنشر، أو أي ملاحظات لمسؤول الصفحة..."
                className="rounded-xl text-sm"
              />
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setEditorOpen(false)} className="h-11 rounded-xl">
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="h-11 gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white hover:from-blue-700 hover:to-indigo-700"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {editingId ? 'حفظ التعديلات' : 'إرسال لمسؤول الصفحة'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PageManagerFilesHub;
