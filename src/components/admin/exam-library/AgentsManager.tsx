import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Copy, ExternalLink, FileText, Loader2, Pencil, Plus, RefreshCw, Trash2, UploadCloud, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  agentLink, createAgent, deleteAgent, indexAgent, indexedPageCount, listAgents, updateAgent, uploadAgentFile, type AgentRow,
} from "@/lib/examAgents/agents";
import { LIBRARY_ACCEPT, listLibrary, type LibraryRow } from "@/lib/examCreator/library";

interface Form {
  id?: string; name: string; description: string; subject: string; grade: string; welcome: string; instructions: string;
  fileIds: string[]; isActive: boolean;
}
const EMPTY: Form = { name: "", description: "", subject: "", grade: "", welcome: "", instructions: "", fileIds: [], isActive: true };

export default function AgentsManager() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [agents, setAgents] = useState<AgentRow[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [library, setLibrary] = useState<LibraryRow[]>([]);
  const [err, setErr] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [busyAgent, setBusyAgent] = useState<string | null>(null);

  const load = async () => {
    try {
      const [a, lib] = await Promise.all([listAgents(), listLibrary()]);
      setAgents(a); setLibrary(lib);
      const c: Record<string, number> = {};
      await Promise.all(a.map(async (x) => { c[x.id] = await indexedPageCount(x.id).catch(() => 0); }));
      setCounts(c);
    } catch (e: any) { setErr(e.message); setAgents([]); }
  };
  useEffect(() => { load(); }, []);

  const libMap = new Map(library.map((r) => [r.id, r]));
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));

  const addUploads = async (list: FileList | null) => {
    if (!list?.length || !form) return;
    setBusy(true);
    try {
      for (const f of Array.from(list)) {
        const row = await uploadAgentFile(f, { subject: form.subject, grade: form.grade }, (m) => setMsg(m));
        setLibrary((l) => [row, ...l]);
        setForm((x) => (x ? { ...x, fileIds: [...x.fileIds, row.id] } : x));
      }
    } catch (e: any) { toast({ title: "⚠️ تعذّر رفع الملف", description: e.message, variant: "destructive" }); }
    finally { setBusy(false); setMsg(""); if (fileRef.current) fileRef.current.value = ""; }
  };

  const reindex = async (a: { id: string; file_ids: string[] }) => {
    const rows = a.file_ids.map((id) => libMap.get(id)).filter(Boolean) as LibraryRow[];
    const rep = await indexAgent(a.id, rows, setMsg);
    setCounts((c) => ({ ...c, [a.id]: rep.pages }));
    if (rep.filesWithoutText.length) {
      toast({ title: "ℹ️ ملفات بلا نص قابل للقراءة", description: `${rep.filesWithoutText.join("، ")} — ممسوحة ضوئياً: المحادثة لن ترى محتواها، لكن إنشاء الامتحانات منها يعمل.` });
    }
    return rep;
  };

  const save = async () => {
    if (!form || !form.name.trim()) return;
    setBusy(true);
    try {
      const input = {
        name: form.name.trim(), description: form.description.trim() || null, subject: form.subject.trim() || null, grade: form.grade.trim() || null,
        welcome: form.welcome.trim() || null, instructions: form.instructions.trim() || null, file_ids: form.fileIds, is_active: form.isActive,
      };
      let row: AgentRow;
      const prev = form.id ? agents?.find((x) => x.id === form.id) : undefined;
      if (form.id) { await updateAgent(form.id, input); row = { ...(prev as AgentRow), ...input }; }
      else row = await createAgent(input);
      const filesChanged = !prev || prev.file_ids.join() !== form.fileIds.join();
      if (filesChanged && form.fileIds.length) await reindex(row);
      toast({ title: "✅ تم حفظ الوكيل", description: "انسخ رابطه من البطاقة وشاركه." });
      setForm(null);
      await load();
    } catch (e: any) { toast({ title: "⚠️ تعذّر الحفظ", description: e.message, variant: "destructive" }); }
    finally { setBusy(false); setMsg(""); }
  };

  const copy = async (a: AgentRow) => {
    try { await navigator.clipboard.writeText(agentLink(a.token)); toast({ title: "✅ نُسخ الرابط" }); }
    catch { window.prompt("انسخ الرابط:", agentLink(a.token)); }
  };
  const toggle = async (a: AgentRow, v: boolean) => {
    try { await updateAgent(a.id, { is_active: v }); setAgents((x) => x!.map((y) => (y.id === a.id ? { ...y, is_active: v } : y))); }
    catch (e: any) { toast({ title: "⚠️ تعذّر التحديث", description: e.message, variant: "destructive" }); }
  };
  const remove = async (a: AgentRow) => {
    if (!window.confirm(`حذف الوكيل «${a.name}»؟ سيتوقف رابطه فوراً (ملفاته تبقى في المكتبة).`)) return;
    try { await deleteAgent(a.id); setAgents((x) => x!.filter((y) => y.id !== a.id)); toast({ title: "✅ حُذف الوكيل" }); }
    catch (e: any) { toast({ title: "⚠️ تعذّر الحذف", description: e.message, variant: "destructive" }); }
  };
  const doReindex = async (a: AgentRow) => {
    setBusyAgent(a.id);
    try { const r = await reindex(a); toast({ title: "✅ أُعيدت الفهرسة", description: `${r.pages} صفحة نصية` }); }
    catch (e: any) { toast({ title: "⚠️ تعذّرت الفهرسة", description: e.message, variant: "destructive" }); }
    finally { setBusyAgent(null); setMsg(""); }
  };

  if (agents === null) return <Loader2 className="mx-auto mt-6 h-6 w-6 animate-spin" />;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="max-w-2xl text-sm text-muted-foreground">
          وكيل مختص = محادثة ذكاء اصطناعي بملفاتك أنت فقط (مثلاً: وكيل الرياضيات). يحصل على رابط تشاركه؛ المستخدم المسجّل يحاور الوكيل وينشئ منه امتحانات بكل مزايا المنصة،
          ولا يستطيع رفع أي ملف آخر ولا يُجيب الوكيل من خارج ملفاتك.
        </p>
        <Button onClick={() => setForm({ ...EMPTY })}><Plus className="ml-1 h-4 w-4" />وكيل جديد</Button>
      </div>

      {err && <p className="text-sm text-destructive">{err} — إن ظهر أن الجدول غير موجود فنفّذ هجرة Supabase الجديدة (exam_agents).</p>}
      {agents.length === 0 && !err && <Card className="p-8 text-center text-sm text-muted-foreground">لا وكلاء بعد. أنشئ أول وكيل وارفع له ملفاته.</Card>}

      <div className="grid gap-3 md:grid-cols-2">
        {agents.map((a) => (
          <Card key={a.id} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 font-bold"><Bot className="h-5 w-5 text-primary" />{a.name}</div>
              <div className="flex items-center gap-2 text-xs">{a.is_active ? "فعّال" : "موقوف"}<Switch checked={a.is_active} onCheckedChange={(v) => toggle(a, v)} /></div>
            </div>
            {a.description && <p className="text-xs text-muted-foreground">{a.description}</p>}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {a.subject && <Badge variant="secondary">{a.subject}</Badge>}
              {a.grade && <Badge variant="secondary">{a.grade}</Badge>}
              <Badge variant="outline"><FileText className="ml-1 h-3 w-3" />{a.file_ids.length} ملف</Badge>
              <Badge variant={counts[a.id] ? "outline" : "destructive"}>{counts[a.id] ?? 0} صفحة مفهرسة</Badge>
            </div>
            <div dir="ltr" className="truncate rounded bg-muted px-2 py-1 text-left text-xs">{agentLink(a.token)}</div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => copy(a)}><Copy className="ml-1 h-4 w-4" />نسخ الرابط</Button>
              <Button size="sm" variant="outline" asChild><a href={`/agent/${a.token}`} target="_blank" rel="noreferrer"><ExternalLink className="ml-1 h-4 w-4" />فتح</a></Button>
              <Button size="sm" variant="outline" onClick={() => setForm({
                id: a.id, name: a.name, description: a.description ?? "", subject: a.subject ?? "", grade: a.grade ?? "", welcome: a.welcome ?? "",
                instructions: a.instructions ?? "", fileIds: a.file_ids, isActive: a.is_active,
              })}><Pencil className="ml-1 h-4 w-4" />تعديل</Button>
              <Button size="sm" variant="outline" disabled={busyAgent === a.id} onClick={() => doReindex(a)}>
                {busyAgent === a.id ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : <RefreshCw className="ml-1 h-4 w-4" />}إعادة الفهرسة
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(a)}><Trash2 className="h-4 w-4" /></Button>
            </div>
            {busyAgent === a.id && msg && <p className="text-xs text-muted-foreground">{msg}</p>}
          </Card>
        ))}
      </div>

      <Dialog open={!!form} onOpenChange={(o) => { if (!o && !busy) setForm(null); }}>
        <DialogContent dir="rtl" className="max-h-[90vh] max-w-2xl overflow-y-auto text-right">
          <DialogHeader><DialogTitle>{form?.id ? "تعديل الوكيل" : "وكيل مختص جديد"}</DialogTitle></DialogHeader>
          {form && (
            <div className="space-y-3">
              <Input placeholder="اسم الوكيل (مثل: وكيل الرياضيات — العاشر)" value={form.name} onChange={(e) => set("name", e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="المادة" value={form.subject} onChange={(e) => set("subject", e.target.value)} />
                <Input placeholder="الصف" value={form.grade} onChange={(e) => set("grade", e.target.value)} />
              </div>
              <Textarea placeholder="وصف قصير يظهر للمستخدم" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
              <Textarea placeholder="رسالة الترحيب (اختياري)" rows={2} value={form.welcome} onChange={(e) => set("welcome", e.target.value)} />
              <Textarea placeholder="توجيهات خاصة للوكيل (اختياري) — مثل: اشرح بأسلوب مبسّط، أو لا تحلّ الواجبات مباشرة" rows={3} value={form.instructions} onChange={(e) => set("instructions", e.target.value)} />

              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <Label>ملفات الوكيل (مصدره الوحيد)</Label>
                  <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => fileRef.current?.click()}>
                    <UploadCloud className="ml-1 h-4 w-4" />رفع ملفات جديدة
                  </Button>
                  <input ref={fileRef} type="file" multiple accept={LIBRARY_ACCEPT} className="hidden" onChange={(e) => addUploads(e.target.files)} />
                </div>
                <p className="text-xs text-muted-foreground">الملفات المرفوعة هنا لا تظهر في المكتبة العامة؛ تُتاح لمن يفتح رابط الوكيل فقط. يمكنك أيضاً اختيار ملفات موجودة في المكتبة. حتى 8 ملفات.</p>
                <div className="max-h-52 space-y-1 overflow-y-auto">
                  {library.length === 0 && <p className="text-xs text-muted-foreground">لا ملفات في المكتبة بعد.</p>}
                  {library.map((r) => {
                    const on = form.fileIds.includes(r.id);
                    return (
                      <label key={r.id} className={`flex cursor-pointer items-center gap-2 rounded border px-2 py-1.5 text-sm ${on ? "border-primary bg-primary/5" : ""}`}>
                        <input type="checkbox" checked={on} disabled={busy || (!on && form.fileIds.length >= 8)}
                          onChange={() => set("fileIds", on ? form.fileIds.filter((x) => x !== r.id) : [...form.fileIds, r.id])} />
                        <span className="flex-1 truncate">{r.title}</span>
                        {!r.is_published && <Badge variant="outline" className="text-[10px]">خاص</Badge>}
                      </label>
                    );
                  })}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} />الوكيل فعّال (الرابط يعمل)</label>
              {busy && <p className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{msg || "جارٍ الحفظ..."}</p>}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" disabled={busy} onClick={() => setForm(null)}><X className="ml-1 h-4 w-4" />إلغاء</Button>
            <Button disabled={busy || !form?.name.trim()} onClick={save}>{busy ? <Loader2 className="ml-1 h-4 w-4 animate-spin" /> : null}حفظ وفهرسة الملفات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
