// reference-books-admin: تنزيل الكتاب الأصلي وحذفه (للقيادة فقط) — رابط موقّع مؤقت من R2 أو حذف من R2 وقاعدة البيانات.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonResponse } from "../_shared/exam-common.ts";
import { deleteR2Object, getCaller, presignR2, serviceClient } from "../_shared/reference-books.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const caller = await getCaller(req);
    if (!caller) return jsonResponse({ error: "سجّل الدخول أولاً" }, 401);
    if (!caller.isLead) return jsonResponse({ error: "هذه العملية للقيادة فقط" }, 403);

    const { action, bookId } = await req.json();
    const db = serviceClient();
    const { data: book } = await db
      .from("reference_books").select("id, storage_key, original_filename").eq("id", String(bookId ?? "")).maybeSingle();
    if (!book) return jsonResponse({ error: "الكتاب غير موجود" }, 404);

    if (action === "download") {
      const safeName = encodeURIComponent(book.original_filename);
      const url = await presignR2("GET", book.storage_key, 600, {
        "response-content-disposition": `attachment; filename*=UTF-8''${safeName}`,
      });
      return jsonResponse({ url });
    }
    if (action === "delete") {
      await deleteR2Object(book.storage_key);
      const { error } = await db.from("reference_books").delete().eq("id", book.id);
      if (error) throw new Error(error.message);
      return jsonResponse({ ok: true });
    }
    return jsonResponse({ error: "إجراء غير معروف" }, 400);
  } catch (e: any) {
    console.error("reference-books-admin error:", e);
    return jsonResponse({ error: e?.message || "حدث خطأ" }, 500);
  }
});
