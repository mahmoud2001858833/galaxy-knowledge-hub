// reference-books-search: بحث في نصوص مكتبة المراجع لأي مستخدم مسجّل.
// الدوال الأخرى على الخادم تستدعي searchReferenceBooks من _shared/reference-knowledge.ts مباشرة دون المرور بهذه الدالة.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonResponse, requireUser } from "../_shared/exam-common.ts";
import { searchReferenceBooks } from "../_shared/reference-knowledge.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    if (!(await requireUser(req))) return jsonResponse({ error: "سجّل الدخول أولاً" }, 401);
    const { query, limit } = await req.json();
    const hits = await searchReferenceBooks(String(query ?? ""), Number.isInteger(limit) ? limit : 6);
    return jsonResponse({ results: hits });
  } catch (e: any) {
    console.error("reference-books-search error:", e);
    return jsonResponse({ error: e?.message || "حدث خطأ أثناء البحث" }, 500);
  }
});
