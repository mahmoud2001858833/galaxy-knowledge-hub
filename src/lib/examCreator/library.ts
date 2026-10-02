import { supabase } from "@/integrations/supabase/client";
import type { UnitInfo } from "./types";

// الجداول الجديدة غير موجودة في types.ts المولَّد
const db = supabase as any;

export interface LibraryRow {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  grade: string | null;
  file_name: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  page_count: number | null;
  units: UnitInfo[] | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const BUCKET = "exam-library";
export const LIBRARY_ACCEPT = ".pdf,.docx,.txt,.md,.png,.jpg,.jpeg,.webp";

/** هل المستخدم الحالي أدمن فعلياً (دور admin في user_roles)؟ الأمان الحقيقي في RLS؛ هذا للواجهة فقط. */
export async function fetchIsAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await db.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
  return !!data;
}

/** للمستخدم العادي: المنشور فقط (RLS)؛ للأدمن: الكل. */
export async function listLibrary(): Promise<LibraryRow[]> {
  const { data, error } = await db.from("exam_library_files").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export function extOf(name: string) {
  return (name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
}

const MIME: Record<string, string> = {
  pdf: "application/pdf", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain", md: "text/markdown", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
};
export const mimeFor = (file: File) => file.type || MIME[extOf(file.name)] || "application/octet-stream";

/** رفع ملف كبير مع نسبة التقدم (XHR). مسار التخزين ASCII فقط لأن مفاتيح التخزين لا تقبل العربية دائماً. */
export async function uploadToLibrary(file: File, onProgress: (pct: number) => void): Promise<string> {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) throw new Error("سجّل الدخول أولاً");
  const path = `${crypto.randomUUID()}.${extOf(file.name)}`;
  const base = (supabase as any).supabaseUrl as string;
  const anon = (supabase as any).supabaseKey as string;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${base}/storage/v1/object/${BUCKET}/${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", anon);
    xhr.setRequestHeader("Content-Type", mimeFor(file));
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let msg = `فشل الرفع (${xhr.status})`;
      try { const j = JSON.parse(xhr.responseText); msg = j.message || j.error || msg; } catch { /* ignore */ }
      if (xhr.status === 413 || /exceed|too large|maximum/i.test(msg)) {
        msg += " — ارفع حد حجم الملف من Supabase: Storage ← Settings ← Global file size limit.";
      } else if (xhr.status === 400 || xhr.status === 403 || /row-level security|unauthorized/i.test(msg)) {
        msg += " — تأكد أن حسابك يملك دور admin في جدول user_roles.";
      }
      reject(new Error(msg));
    };
    xhr.onerror = () => reject(new Error("انقطع الاتصال أثناء الرفع"));
    xhr.send(file);
  });
  return path;
}

export interface NewLibraryRow {
  title: string; description: string; subject: string; grade: string;
  file: File; storage_path: string; page_count: number | null; units: UnitInfo[] | null; is_published: boolean;
}

export async function insertLibraryRow(r: NewLibraryRow): Promise<LibraryRow> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await db.from("exam_library_files").insert({
    title: r.title.trim(), description: r.description.trim() || null, subject: r.subject.trim() || null, grade: r.grade.trim() || null,
    file_name: r.file.name, storage_path: r.storage_path, mime_type: mimeFor(r.file), size_bytes: r.file.size,
    page_count: r.page_count, units: r.units, is_published: r.is_published, created_by: user?.id ?? null,
  }).select("*").single();
  if (error) {
    await supabase.storage.from(BUCKET).remove([r.storage_path]).catch(() => {}); // لا نترك ملفاً يتيماً
    throw new Error(error.message);
  }
  return data;
}

export async function updateLibraryRow(id: string, patch: Partial<Pick<LibraryRow, "title" | "description" | "subject" | "grade" | "is_published" | "units" | "page_count">>) {
  const { error } = await db.from("exam_library_files").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteLibraryRow(row: LibraryRow) {
  const { error } = await db.from("exam_library_files").delete().eq("id", row.id);
  if (error) throw new Error(error.message);
  await supabase.storage.from(BUCKET).remove([row.storage_path]).catch(() => {});
  try { await (await caches.open("exam-library-v1")).delete(cacheKey(row)); } catch { /* ignore */ }
}

const cacheKey = (r: LibraryRow) => `https://exam-library.local/${r.id}/${r.updated_at}/${r.size_bytes}`;

/** تنزيل ملف المكتبة (رابط موقّع قصير العمر) مع نسبة التقدم، ويُخزَّن في ذاكرة المتصفح فلا يُنزَّل ثانيةً. */
export async function downloadLibraryFile(row: LibraryRow, onProgress?: (pct: number) => void): Promise<File> {
  const mk = (blob: Blob) => new File([blob], row.file_name, { type: row.mime_type });
  try {
    const hit = await (await caches.open("exam-library-v1")).match(cacheKey(row));
    if (hit) return mk(await hit.blob());
  } catch { /* لا يوجد Cache API */ }

  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(row.storage_path, 600);
  if (error || !data?.signedUrl) throw new Error(`تعذّر الوصول لملف «${row.title}»: ${error?.message ?? "غير متاح"}`);
  const res = await fetch(data.signedUrl);
  if (!res.ok || !res.body) throw new Error(`تعذّر تنزيل «${row.title}» (${res.status})`);

  const total = Number(res.headers.get("Content-Length")) || row.size_bytes;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    onProgress?.(Math.min(100, Math.round((got / total) * 100)));
  }
  const blob = new Blob(chunks as BlobPart[], { type: row.mime_type });
  try {
    const cache = await caches.open("exam-library-v1");
    await cache.put(cacheKey(row), new Response(blob, { headers: { "Content-Type": row.mime_type } }));
  } catch { /* الحصة ممتلئة: لا بأس */ }
  return mk(blob);
}
