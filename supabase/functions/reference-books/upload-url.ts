// upload-url: يسجّل كتاباً جديداً ويعيد رابط رفع موقّعاً مباشراً إلى Cloudflare R2 (لفريق رفع الملفات والقيادة).
import { jsonResponse } from "../_shared/exam-common.ts";
import { BOOK_MIME_BY_EXT, getCaller, MAX_BOOK_BYTES, presignR2, serviceClient } from "../_shared/reference-books.ts";

export async function handleUploadUrl(req: Request, body: any): Promise<Response> {
  try {
    const caller = await getCaller(req);
    if (!caller) return jsonResponse({ error: "سجّل الدخول أولاً" }, 401);
    if (!caller.isUploader && !caller.isLead) return jsonResponse({ error: "رفع الكتب لفريق رفع الملفات فقط" }, 403);

    const { filename, sizeBytes, title, grade, subject, semester } = body;
    const meta = [grade, subject, semester].map((v) => String(v ?? "").trim());
    if (meta.some((v) => !v || v.length > 60)) return jsonResponse({ error: "اختر الصف والمادة والفصل" }, 400);
    if (!["الفصل الأول", "الفصل الثاني"].includes(meta[2])) return jsonResponse({ error: "الفصل غير صالح" }, 400);
    const name = String(filename ?? "").trim();
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    const mime = BOOK_MIME_BY_EXT[ext];
    if (!name || !mime) return jsonResponse({ error: "الصيغ المسموحة: PDF وDOCX وصور PNG/JPG/WEBP" }, 400);
    const size = Number(sizeBytes);
    if (!Number.isFinite(size) || size <= 0) return jsonResponse({ error: "حجم الملف غير صالح" }, 400);
    if (size > MAX_BOOK_BYTES) return jsonResponse({ error: "الحد الأقصى لحجم الملف 500 ميجابايت" }, 400);

    const bookTitle = String(title ?? "").trim().slice(0, 300) || name.replace(/\.[^.]+$/, "").slice(0, 300);
    const key = `books/${caller.userId}/${crypto.randomUUID()}.${ext}`;

    const { data, error } = await serviceClient()
      .from("reference_books")
      .insert({
        title: bookTitle, original_filename: name.slice(0, 300), mime_type: mime, size_bytes: Math.floor(size),
        storage_key: key, uploaded_by: caller.userId, grade: meta[0], subject: meta[1], semester: meta[2],
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(`تعذّر تسجيل الكتاب: ${error?.message}`);

    const uploadUrl = await presignR2("PUT", key, 3600);
    return jsonResponse({ bookId: data.id, uploadUrl, mimeType: mime });

  } catch (e: any) {
    console.error("reference-books upload-url error:", e);
    return jsonResponse({ error: e?.message || "حدث خطأ أثناء تجهيز الرفع" }, 500);
  }
}
