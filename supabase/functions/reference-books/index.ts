// reference-books: دالة واحدة لمكتبة المراجع (حد عدد الدوال في الخطة مستنفد) — تُوجَّه بحقل action:
// upload-url | ingest | ocr | download | delete | search | ask | books | page | text
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, jsonResponse } from "../_shared/exam-common.ts";
import { handleAdmin } from "./admin.ts";
import { handleAsk } from "./ask.ts";
import { handleIngest } from "./ingest.ts";
import { handleBooks, handlePage, handleText } from "./library.ts";
import { handleOcr } from "./ocr.ts";
import { handleSearch } from "./search.ts";
import { handleUploadUrl } from "./upload-url.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json();
    switch (body?.action) {
      case "upload-url": return await handleUploadUrl(req, body);
      case "ingest": return await handleIngest(req, body);
      case "ocr": return await handleOcr(req, body);
      case "download":
      case "delete": return await handleAdmin(req, body);
      case "search": return await handleSearch(req, body);
      case "ask": return await handleAsk(req, body);
      case "books": return await handleBooks(req);
      case "page": return await handlePage(req, body);
      case "text": return await handleText(req, body);
      default: return jsonResponse({ error: "إجراء غير معروف" }, 400);
    }
  } catch (e: any) {
    console.error("reference-books error:", e);
    return jsonResponse({ error: e?.message || "حدث خطأ" }, 500);
  }
});
