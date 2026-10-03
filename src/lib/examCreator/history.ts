import { supabase } from "@/integrations/supabase/client";
import type { ExamQuestion, GeneratedExam } from "./types";

const db = supabase as any;

export type HistorySource =
  | { kind: "library"; id: string; title: string }
  | { kind: "upload"; name: string; size: number };

/** نسخة خفيفة للحفظ: بلا صور مضمّنة (قد تبلغ ميجابايتات)، مع بقاء مواضع الأشكال. */
export function stripForHistory(exam: GeneratedExam) {
  return {
    title: exam.title,
    meta: exam.meta,
    questions: exam.questions.map((q) => ({
      ...q,
      figure: q.figure ? { id: q.figure.id, fileIndex: q.figure.fileIndex, page: q.figure.page, box: q.figure.box, caption: q.figure.caption, revealsAnswer: q.figure.revealsAnswer, url: q.figure.url, width: q.figure.width, height: q.figure.height } : undefined,
    })),
  };
}

/** يحفظ الامتحان المُنشأ في سجل المنصة. الفشل لا يمنع المستخدم من متابعة عمله. */
export async function saveHistory(exam: GeneratedExam, sources: HistorySource[], request: string, options: Record<string, unknown>): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await db.from("exam_history").insert({
      owner_id: user.id, title: exam.title.slice(0, 300), subject: exam.meta.subject || null, grade: exam.meta.grade || null,
      question_count: exam.questions.length, sources, request: request.trim() || null, options, exam: stripForHistory(exam),
    }).select("id").single();
    if (error) throw error;
    return data.id as string;
  } catch (e) {
    console.warn("saveHistory failed:", e);
    return null;
  }
}

export async function updateHistory(id: string | null, exam: GeneratedExam, onlineExamId?: string) {
  if (!id) return;
  try {
    const patch: Record<string, unknown> = {
      title: exam.title.slice(0, 300), question_count: exam.questions.length, exam: stripForHistory(exam), updated_at: new Date().toISOString(),
    };
    if (onlineExamId) patch.online_exam_id = onlineExamId;
    const { error } = await db.from("exam_history").update(patch).eq("id", id);
    if (error) throw error;
  } catch (e) {
    console.warn("updateHistory failed:", e);
  }
}

// ───────── للأدمن ─────────
export interface AdminHistoryRow {
  kind: string | null;
  id: string; owner_id: string; owner_name: string | null; owner_email: string | null;
  title: string; subject: string | null; grade: string | null; question_count: number;
  sources: HistorySource[]; request: string | null;
  online_exam_id: string | null; online_token: string | null; online_active: boolean | null;
  submissions: number; created_at: string; total_count: number;
}

export async function adminListHistory(limit: number, offset: number): Promise<{ rows: AdminHistoryRow[]; total: number }> {
  const { data, error } = await db.rpc("admin_exam_history", { _limit: limit, _offset: offset });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as AdminHistoryRow[];
  return { rows: rows.map((r) => ({ ...r, submissions: Number(r.submissions) || 0, total_count: Number(r.total_count) || 0 })), total: Number(rows[0]?.total_count) || 0 };
}

/** أسئلة الامتحان: نسخة الرابط الإلكتروني إن وُجدت (فيها روابط الأشكال)، وإلا نسخة السجل. */
export async function adminGetQuestions(row: AdminHistoryRow): Promise<{ title: string; questions: ExamQuestion[] }> {
  if (row.online_exam_id) {
    const { data } = await db.from("online_exams").select("exam").eq("id", row.online_exam_id).maybeSingle();
    if (data?.exam?.questions) return { title: data.exam.title ?? row.title, questions: data.exam.questions };
  }
  const { data, error } = await db.from("exam_history").select("exam").eq("id", row.id).maybeSingle();
  if (error || !data) throw new Error(error?.message ?? "تعذّر تحميل الامتحان");
  return { title: data.exam.title ?? row.title, questions: data.exam.questions ?? [] };
}

export async function adminSetOnlineActive(onlineId: string, active: boolean) {
  const { error } = await db.from("online_exams").update({ is_active: active }).eq("id", onlineId);
  if (error) throw new Error(error.message);
}

export async function adminDeleteExam(row: AdminHistoryRow) {
  if (row.online_exam_id) {
    const { error } = await db.from("online_exams").delete().eq("id", row.online_exam_id);
    if (error) throw new Error(error.message);
  }
  const { error } = await db.from("exam_history").delete().eq("id", row.id);
  if (error) throw new Error(error.message);
}


// ───────── بنوك الأسئلة (تُحفظ في exam_history بـ options.kind = 'bank') ─────────
export interface BankRow { id: string; title: string; question_count: number; created_at: string; updated_at: string }

export async function listMyBanks(): Promise<BankRow[]> {
  const { data, error } = await db.from("exam_history").select("id, title, question_count, created_at, updated_at")
    .filter("options->>kind", "eq", "bank").order("updated_at", { ascending: false }).limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function loadBank(id: string): Promise<GeneratedExam> {
  const { data, error } = await db.from("exam_history").select("exam, title").eq("id", id).maybeSingle();
  if (error || !data) throw new Error(error?.message ?? "تعذّر فتح البنك");
  const e = data.exam;
  // الأشكال المحفوظة روابط تخزين: نعرضها كما لو كانت صورة مضمّنة
  const questions: ExamQuestion[] = (e.questions ?? []).map((q: ExamQuestion) =>
    q.figure?.url && !q.figure.dataUrl ? { ...q, figure: { ...q.figure, dataUrl: q.figure.url } } : q);
  return { title: e.title ?? data.title, questions, meta: e.meta ?? { schoolName: "", teacherName: "", subject: "", grade: "", durationMinutes: 45 } };
}

export async function deleteBank(id: string) {
  const { error } = await db.from("exam_history").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
