import { supabase } from "@/integrations/supabase/client";
import type { AnalyzeResponse, Catalog, ExamQuestion, GenerateResponse, GeneratedExam, OnlineSettings, QType, UnitInfo } from "./types";
import type { CropVerdict } from "./fileUtils";
import type { FilePayload, PreparedFile } from "./fileUtils";

// الجداول الجديدة غير موجودة في types.ts المولَّد؛ نستعمل عميلاً غير مُنمَّط لها.
const db = supabase as any;

export type ApiErrorCode = "rate_limited" | "timeout" | "auth" | "unavailable" | "invalid" | "no_questions" | "bad_request" | "network" | "aborted" | "internal";

/** خطأ مصنّف من الخادم: يتيح للمنسّق أن يقرر (انتظار، تقسيم، إعادة، إيقاف) بدل التخمين. */
export class ApiError extends Error {
  constructor(message: string, public code: ApiErrorCode, public status = 0, public retryAfter?: number, public diagnostics?: { dropped?: Record<string, number> }) {
    super(message);
  }
}

const CLIENT_TIMEOUT_MS = 125_000;

/** نستعمل fetch مباشرة (لا supabase.functions.invoke) لنحتفظ بالحالة والكود ومهلة الانتظار وتقرير الحذف. */
export async function callFn<T>(name: string, body: unknown, opts: { signal?: AbortSignal; timeoutMs?: number } = {}): Promise<T> {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) throw new ApiError("انتهت الجلسة، سجّل الدخول من جديد", "auth", 401);
  const url = `${(supabase as any).supabaseUrl}/functions/v1/${name}`;
  const key = (supabase as any).supabaseKey as string;

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort("timeout"), opts.timeoutMs ?? CLIENT_TIMEOUT_MS);
  const onAbort = () => ctl.abort("user");
  opts.signal?.addEventListener("abort", onAbort);
  try {
    const r = await fetch(url, {
      method: "POST", signal: ctl.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, apikey: key },
      body: JSON.stringify(body),
    });
    const text = await r.text();
    let j: any = null;
    try { j = JSON.parse(text); } catch { /* ليس JSON: غالباً رد البوابة عند قتل الدالة */ }
    if (r.ok && j && !j.error) return j as T;
    const retryAfter = Number(j?.retryAfter ?? r.headers.get("retry-after")) || undefined;
    const msg = j?.error || (r.status === 504 || r.status === 546 || r.status === 502 ? "انتهت مهلة الخادم قبل اكتمال الدفعة" : `خطأ ${r.status}`);
    let code: ApiErrorCode = j?.code;
    if (!code) {
      code = r.status === 429 ? "rate_limited" : r.status === 401 || r.status === 403 ? "auth"
        : r.status === 400 ? "bad_request" : r.status === 422 ? "no_questions"
        : r.status === 504 || r.status === 546 || r.status === 502 || r.status === 503 || r.status === 500 ? "timeout" : "internal";
    }
    // دالة قُتلت بلا رد JSON (WORKER_LIMIT/timeout) تُعامل كمهلة لتُقسَّم الدفعة
    if (!j && r.status >= 500) code = "timeout";
    throw new ApiError(msg, code, r.status, retryAfter, j?.diagnostics);
  } catch (e: any) {
    if (e instanceof ApiError) throw e;
    if (opts.signal?.aborted) throw new ApiError("أُوقف الطلب", "aborted");
    if (ctl.signal.aborted) throw new ApiError("تأخر الرد أكثر من اللازم", "timeout", 0);
    throw new ApiError("تعذّر الاتصال بالخادم. تحقق من الإنترنت", "network", 0);
  } finally {
    clearTimeout(timer);
    opts.signal?.removeEventListener("abort", onAbort);
  }
}

export const analyzeUnits = (files: PreparedFile[]) =>
  callFn<AnalyzeResponse>("analyze-file-units", { files: files.map((f) => f.payload) });

export interface GenerateParams {
  payloads: FilePayload[];
  units: UnitInfo[];
  counts: Record<QType, number>;
  difficulty: string;
  language: string;
  distribution: string;
  grade: string;
  subject: string;
  request: string;
  includeFigures: boolean;
  includeTables: boolean;
  catalog?: Catalog;
  minFigureQuestions?: number;
  minTableQuestions?: number;
  avoid?: string[];
  focus?: string;
  /** تدقيق كل سؤال مقابل الملف (افتراضي: نعم) */
  verify?: boolean;
}

const unitPayload = (units: UnitInfo[]) => units.map(({ title, summary, fileIndex, pageStart, pageEnd }) => ({ title, summary, fileIndex, pageStart, pageEnd }));

export const generateExam = (p: GenerateParams, signal?: AbortSignal) =>
  callFn<GenerateResponse>("generate-exam-from-file", {
    files: p.payloads,
    units: unitPayload(p.units),
    counts: p.counts,
    difficulty: p.difficulty,
    language: p.language,
    distribution: p.distribution,
    grade: p.grade || undefined,
    subject: p.subject || undefined,
    request: p.request.trim() || undefined,
    includeFigures: p.includeFigures,
    includeTables: p.includeTables,
    catalog: p.catalog,
    minFigureQuestions: p.minFigureQuestions || undefined,
    minTableQuestions: p.minTableQuestions || undefined,
    avoid: p.avoid?.length ? p.avoid : undefined,
    focus: p.focus || undefined,
    verify: p.verify === false ? false : undefined,
  }, { signal });

export interface DiscoverResponse { figures: Catalog["figures"]; tables: Catalog["tables"]; stats: Record<string, number> }

export const discoverVisuals = (payloads: FilePayload[], units: UnitInfo[], includeFigures: boolean, includeTables: boolean, signal?: AbortSignal) =>
  callFn<DiscoverResponse>("discover-visuals", { files: payloads, units: unitPayload(units), includeFigures, includeTables }, { signal });

export const verifyCropsApi = async (items: { id: string; caption: string; base64: string }[]): Promise<CropVerdict[]> =>
  (await callFn<{ results: CropVerdict[] }>("verify-crops", { items })).results;

// ───────── نشر الامتحان الإلكتروني ─────────
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
export function newToken(len = 10) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

const dataUrlToBlob = async (u: string) => (await fetch(u)).blob();

/** يرفع صور الأشكال إلى التخزين ويعيد الأسئلة بروابط بدل الصور المضمّنة. الشكل الناقص يُحذف مع سؤاله. */
export async function uploadFigureImages(questions: ExamQuestion[], folder: string): Promise<ExamQuestion[]> {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user.id;
  if (!uid) throw new Error("سجّل الدخول أولاً");
  const out: ExamQuestion[] = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const copy: ExamQuestion = JSON.parse(JSON.stringify({ ...q, figure: q.figure ? { ...q.figure, dataUrl: undefined } : undefined }));
    if (q.figure?.dataUrl) {
      if (q.figure.url) { copy.figure!.url = q.figure.url; out.push(copy); continue; }
      const path = `${uid}/${folder}/${i + 1}-${newToken(6)}.jpg`;
      const { error } = await supabase.storage.from("exam-figures").upload(path, await dataUrlToBlob(q.figure.dataUrl), { contentType: "image/jpeg", upsert: true });
      if (error) throw new Error(`فشل رفع الشكل في السؤال ${i + 1}: ${error.message}`);
      copy.figure!.url = supabase.storage.from("exam-figures").getPublicUrl(path).data.publicUrl;
    } else if (copy.figure && !copy.figure.url) {
      continue; // شكل فشل قصّه: لا ننشر سؤالاً يشير لصورة غير موجودة
    }
    out.push(copy);
  }
  return out;
}

export async function publishOnlineExam(exam: GeneratedExam, settings: OnlineSettings): Promise<{ id: string; token: string; link: string }> {
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user.id;
  if (!uid) throw new Error("سجّل الدخول لإنشاء رابط الامتحان");

  const token = newToken();
  const questions = (await uploadFigureImages(exam.questions, token)).map((q, i) => ({ ...q, id: i + 1 }));

  const { data, error } = await db.from("online_exams").insert({
    owner_id: uid,
    token,
    title: exam.title,
    subject: exam.meta.subject || null,
    grade: exam.meta.grade || null,
    exam: { title: exam.title, questions, meta: exam.meta },
    settings,
  }).select("id").single();
  if (error) throw new Error(`تعذّر حفظ الامتحان: ${error.message}`);

  return { id: data.id, token, link: `${window.location.origin}/exam/${token}` };
}

export interface MyExamRow {
  id: string; token: string; title: string; is_active: boolean; created_at: string;
  exam: { questions: ExamQuestion[] }; submissions: number;
}

export async function listMyExams(): Promise<MyExamRow[]> {
  const { data, error } = await db.from("online_exams")
    .select("id, token, title, is_active, created_at, exam").order("created_at", { ascending: false }).limit(50);
  if (error) throw new Error(error.message);
  const ids = (data ?? []).map((e: any) => e.id);
  const counts = new Map<string, number>();
  if (ids.length) {
    const { data: subs } = await db.from("online_exam_submissions").select("exam_id").in("exam_id", ids);
    (subs ?? []).forEach((s: any) => counts.set(s.exam_id, (counts.get(s.exam_id) ?? 0) + 1));
  }
  return (data ?? []).map((e: any) => ({ ...e, submissions: counts.get(e.id) ?? 0 }));
}

export async function setExamActive(id: string, active: boolean) {
  const { error } = await db.from("online_exams").update({ is_active: active }).eq("id", id);
  if (error) throw new Error(error.message);
}

export interface SubmissionRow {
  id: string; student_name: string; student_info: { class?: string; id?: string };
  answers: Record<string, string>; auto_score: number; auto_total: number;
  manual_pending: number; time_taken_seconds: number | null; submitted_at: string;
}

export async function listSubmissions(examId: string): Promise<SubmissionRow[]> {
  const { data, error } = await db.from("online_exam_submissions").select("*").eq("exam_id", examId).order("submitted_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}
