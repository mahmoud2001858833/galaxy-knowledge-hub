// reference-books-upload-url: يسجّل كتاباً جديداً ويعيد رابط رفع موقّعاً مباشراً إلى Cloudflare R2 (لموظفي رفع الملفات والقيادة).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonResponse } from "../_shared/exam-common.ts";
import { BOOK_MIME_BY_EXT, getCaller, MAX_BOOK_BYTES, presignR2, serviceClient } from "../_shared/reference-books.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const caller = await getCaller(req);
    if (!caller) return jsonResponse({ error: "سجّل الدخول أولاً" }, 401);
    if (!caller.isUploader && !caller.isLead) return jsonResponse({ error: "رفع الكتب لفريق رفع الملفات فقط" }, 403);

    const { filename, sizeBytes, title } = await req.json();
    const name = String(filename ?? "").trim();
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    const mime = BOOK_MIME_BY_EXT[ext];
    if (!name || !mime) return jsonResponse({ error: "الصيغ المسموحة: PDF وDOCX وصور PNG/JPG/WEBP" }, 400);
    const size = Number(sizeBytes);
    if (!Number.isFinite(size) || size <= 0) return jsonResponse({ error: "حجم الملف غير صالح" }, 400);
    if (size > MAX_BOOK_BYTES) return jsonResponse({ error: "الحد الأقصى لحجم الملف 100 ميجابايت" }, 400);

    const bookTitle = String(title ?? "").trim().slice(0, 300) || name.replace(/\.[^.]+$/, "").slice(0, 300);
    const key = `books/${caller.userId}/${crypto.randomUUID()}.${ext}`;

    const { data, error } = await serviceClient()
      .from("reference_books")
      .insert({
        title: bookTitle, original_filename: name.slice(0, 300), mime_type: mime, size_bytes: Math.floor(size),
        storage_key: key, uploaded_by: caller.userId,
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(`تعذّر تسجيل الكتاب: ${error?.message}`);

    const uploadUrl = await presignR2("PUT", key, 3600);
    return jsonResponse({ bookId: data.id, uploadUrl, mimeType: mime });
  } catch (e: any) {
    console.error("reference-books-upload-url error:", e);
    return jsonResponse({ error: e?.message || "حدث خطأ أثناء تجهيز الرفع" }, 500);
  }
});
