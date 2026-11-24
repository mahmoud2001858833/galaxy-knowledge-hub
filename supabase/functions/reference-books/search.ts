// search: بحث في نصوص مكتبة المراجع لأي مستخدم مسجّل.
// الدوال الأخرى على الخادم تستدعي searchReferenceBooks من _shared/reference-knowledge.ts مباشرة دون المرور بهذه الدالة.
import { jsonResponse, requireUser } from "../_shared/exam-common.ts";
import { searchReferenceBooks } from "../_shared/reference-knowledge.ts";

export async function handleSearch(req: Request, body: any): Promise<Response> {
  try {
    if (!(await requireUser(req))) return jsonResponse({ error: "سجّل الدخول أولاً" }, 401);
    const { query, limit } = body;
    const hits = await searchReferenceBooks(String(query ?? ""), Number.isInteger(limit) ? limit : 6);
    return jsonResponse({ results: hits });

  } catch (e: any) {
    console.error("reference-books search error:", e);
    return jsonResponse({ error: e?.message || "حدث خطأ أثناء البحث" }, 500);
  }
}
