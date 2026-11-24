// library: قوائم الكتب الجاهزة ونصوص صفحاتها لأي مستخدم مسجّل (يستعملها منشئ الامتحانات وعارض المصدر).
import { jsonResponse, requireUser } from "../_shared/exam-common.ts";
import { serviceClient } from "../_shared/reference-books.ts";

const MAX_TEXT_CHARS = 580_000;

export async function handleBooks(req: Request): Promise<Response> {
  if (!(await requireUser(req))) return jsonResponse({ error: "سجّل الدخول أولاً" }, 401);
  const { data, error } = await serviceClient()
    .from("reference_books")
    .select("id, title, total_pages, extracted_chars, extraction_method")
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) throw new Error(error.message);
  return jsonResponse({ books: data ?? [] });
}

/** نص صفحة واحدة (أو كل مقاطع الكتاب غير المرقّمة) لعرض مصدر المعلومة. */
export async function handlePage(req: Request, body: any): Promise<Response> {
  if (!(await requireUser(req))) return jsonResponse({ error: "سجّل الدخول أولاً" }, 401);
  const bookId = String(body?.bookId ?? "");
  const page = Number(body?.page);
  if (!Number.isInteger(page) || page < 1) return jsonResponse({ error: "رقم صفحة غير صالح" }, 400);
  const db = serviceClient();
  const { data: book } = await db.from("reference_books").select("title").eq("id", bookId).eq("status", "ready").maybeSingle();
  if (!book) return jsonResponse({ error: "الكتاب غير موجود" }, 404);
  const { data: chunks, error } = await db
    .from("reference_book_chunks").select("content").eq("book_id", bookId).eq("page_number", page).order("chunk_index");
  if (error) throw new Error(error.message);
  return jsonResponse({ bookTitle: book.title, page, text: (chunks ?? []).map((c: { content: string }) => c.content).join("\n\n") });
}

/** نص الكتاب مقسّماً بالصفحات (مع نطاق اختياري) ليستعمله منشئ الامتحانات كمصدر. */
export async function handleText(req: Request, body: any): Promise<Response> {
  if (!(await requireUser(req))) return jsonResponse({ error: "سجّل الدخول أولاً" }, 401);
  const bookId = String(body?.bookId ?? "");
  const from = Number.isInteger(body?.pageStart) ? Math.max(1, body.pageStart) : 1;
  const to = Number.isInteger(body?.pageEnd) ? body.pageEnd : Number.MAX_SAFE_INTEGER;
  const db = serviceClient();
  const { data: book } = await db.from("reference_books").select("title, total_pages").eq("id", bookId).eq("status", "ready").maybeSingle();
  if (!book) return jsonResponse({ error: "الكتاب غير موجود" }, 404);
  const { data: chunks, error } = await db
    .from("reference_book_chunks").select("page_number, content").eq("book_id", bookId).order("chunk_index").limit(20000);
  if (error) throw new Error(error.message);
  const pages = new Map<number, string[]>();
  let chars = 0;
  for (const c of chunks ?? []) {
    const p = c.page_number ?? 0;
    if (p !== 0 && (p < from || p > to)) continue;
    if (chars + c.content.length > MAX_TEXT_CHARS) break;
    chars += c.content.length;
    pages.set(p, [...(pages.get(p) ?? []), c.content]);
  }
  return jsonResponse({
    title: book.title,
    totalPages: book.total_pages,
    truncated: chars >= MAX_TEXT_CHARS,
    pages: [...pages.entries()].map(([page, parts]) => ({ page: page || null, text: parts.join("\n") })),
  });
}
