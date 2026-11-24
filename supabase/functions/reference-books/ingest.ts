// ingest: يستقبل مقاطع النص المستخرجة من الكتاب (دفعات) ويغلق المعالجة بنجاح أو بفشل.
import { jsonResponse } from "../_shared/exam-common.ts";
import { getCaller, serviceClient } from "../_shared/reference-books.ts";

const MAX_CHUNKS_PER_CALL = 300;
const METHODS = ["text_layer", "docx", "ocr", "mixed"];

export async function handleIngest(req: Request, body: any): Promise<Response> {
  try {
    const caller = await getCaller(req);
    if (!caller) return jsonResponse({ error: "سجّل الدخول أولاً" }, 401);

    const bookId = String(body?.bookId ?? "");
    const db = serviceClient();
    const { data: book } = await db.from("reference_books").select("id, uploaded_by, status").eq("id", bookId).maybeSingle();
    if (!book) return jsonResponse({ error: "الكتاب غير موجود" }, 404);
    if (book.uploaded_by !== caller.userId && !caller.isLead) return jsonResponse({ error: "غير مسموح" }, 403);
    if (book.status === "ready") return jsonResponse({ error: "اكتملت معالجة هذا الكتاب سابقاً" }, 409);

    if (typeof body.error === "string" && body.error) {
      await db.from("reference_books").update({ status: "failed", error_message: body.error.slice(0, 500) }).eq("id", bookId);
      return jsonResponse({ ok: true });
    }

    const chunks = Array.isArray(body.chunks) ? body.chunks : [];
    if (chunks.length > MAX_CHUNKS_PER_CALL) return jsonResponse({ error: "عدد المقاطع كبير في طلب واحد" }, 400);
    const rows = chunks.map((c: any) => ({
      book_id: bookId,
      chunk_index: Number(c?.chunkIndex),
      page_number: Number.isInteger(c?.pageNumber) && c.pageNumber > 0 ? c.pageNumber : null,
      content: String(c?.content ?? "").replace(/\u0000/g, "").trim(),
    }));
    if (rows.some((r: any) => !Number.isInteger(r.chunk_index) || r.chunk_index < 0 || r.content.length < 1 || r.content.length > 6000)) {
      return jsonResponse({ error: "مقاطع غير صالحة" }, 400);
    }
    if (rows.length) {
      const { error } = await db.from("reference_book_chunks").upsert(rows, { onConflict: "book_id,chunk_index" });
      if (error) throw new Error(`تعذّر حفظ المقاطع: ${error.message}`);
    }

    const patch: Record<string, unknown> = { status: "processing", error_message: null };
    if (typeof body.method === "string" && METHODS.includes(body.method)) patch.extraction_method = body.method;
    if (Number.isInteger(body.totalPages) && body.totalPages > 0) patch.total_pages = body.totalPages;
    if (Number.isInteger(body.processedPages) && body.processedPages >= 0) patch.processed_pages = body.processedPages;

    if (body.done === true) {
      const { data: agg } = await db.from("reference_book_chunks").select("content").eq("book_id", bookId);
      const chars = (agg ?? []).reduce((s: number, r: { content: string }) => s + r.content.length, 0);
      if (chars < 40) {
        await db.from("reference_books").update({ status: "failed", error_message: "لم يُستخرج أي نص مقروء من الملف" }).eq("id", bookId);
        return jsonResponse({ error: "لم يُستخرج أي نص مقروء من الملف" }, 422);
      }
      patch.status = "ready";
      patch.extracted_chars = chars;
      patch.processed_at = new Date().toISOString();
    }
    await db.from("reference_books").update(patch).eq("id", bookId);
    return jsonResponse({ ok: true });

  } catch (e: any) {
    console.error("reference-books ingest error:", e);
    return jsonResponse({ error: e?.message || "حدث خطأ أثناء حفظ النص المستخرج" }, 500);
  }
}
