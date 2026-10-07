// ملف المعلم: يحفظ بيانات الترويسة محلياً لكل مستخدم لتُملأ تلقائياً في كل امتحان جديد.
import type { ExamHeader } from "./types";

export interface TeacherProfile {
  schoolName: string; teacherName: string; subject: string; grade: string; durationMinutes: number;
  header: ExamHeader;
}

/** العام الدراسي الأردني يبدأ في أيلول: من 9 فما فوق = y/y+1، وإلا (y-1)/y. */
export function currentAcademicYear(d = new Date()): string {
  const y = d.getFullYear();
  return d.getMonth() + 1 >= 9 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
}
export function guessSemester(d = new Date()): "الأول" | "الثاني" {
  const m = d.getMonth() + 1;
  return m >= 9 || m === 1 ? "الأول" : "الثاني";
}

export const defaultHeader = (): ExamHeader => ({
  style: "jordan", directorate: "", section: "", semester: guessSemester(), academicYear: currentAcademicYear(),
  examName: "", examDate: "", totalMarks: 0, logoDataUrl: "",
});

const key = (uid?: string | null) => `exam-teacher-profile:${uid || "anon"}`;

export function loadProfile(uid?: string | null): Partial<TeacherProfile> | null {
  try {
    const raw = localStorage.getItem(key(uid));
    return raw ? (JSON.parse(raw) as Partial<TeacherProfile>) : null;
  } catch { return null; }
}

/** نحفظ ما يخص المعلم (لا اسم الامتحان ولا التاريخ ولا العلامة فهي خاصة بكل امتحان). */
export function saveProfile(uid: string | null | undefined, p: TeacherProfile) {
  try {
    const { examName: _n, examDate: _d, totalMarks: _t, ...keep } = p.header;
    localStorage.setItem(key(uid), JSON.stringify({ ...p, header: keep }));
  } catch { /* التخزين غير متاح: لا بأس */ }
}

/** يصغّر شعاراً مرفوعاً إلى ≤ 240px كـ PNG/JPEG لتخفيف الحجم. */
export async function shrinkLogo(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("اختر ملف صورة للشعار");
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("تعذّرت قراءة الصورة")); i.src = url; });
    const k = Math.min(1, 240 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL(file.type === "image/jpeg" ? "image/jpeg" : "image/png", 0.9);
  } finally { URL.revokeObjectURL(url); }
}
