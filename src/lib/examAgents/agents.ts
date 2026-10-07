import { supabase } from "@/integrations/supabase/client";
import { analyzeUnits, callFn } from "@/lib/examCreator/api";
import { getPdfjs, prepareFile } from "@/lib/examCreator/fileUtils";
import { downloadLibraryFile, insertLibraryRow, uploadToLibrary, type LibraryRow } from "@/lib/examCreator/library";
import type { UnitInfo } from "@/lib/examCreator/types";
import { normForIndex } from "./searchNorm";

const db = supabase as any;

export interface AgentRow {
  id: string; token: string; name: string; description: string | null; subject: string | null; grade: string | null;
  welcome: string | null; instructions: string | null; file_ids: string[]; is_active: boolean; created_at: string; updated_at: string;
}
export interface PublicAgent {
  id: string; name: string; description: string | null; subject: string | null; grade: string | null; welcome: string | null; files: LibraryRow[];
}
export interface ChatMessage { role: "user" | "assistant"; content: string }
export interface ChatReply { reply: string; sources: { file: string; page: number }[]; action: "none" | "create_exam"; examRequest?: string }

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
export const newAgentToken = (len = 12) => Array.from(crypto.getRandomValues(new Uint8Array(len)), (b) => ALPHABET[b % ALPHABET.length]).join("");
export const agentLink = (token: string) => `${window.location.origin}/agent/${token}`;

// ───────── إدارة الوكلاء (أدمن) ─────────
export async function listAgents(): Promise<AgentRow[]> {
  const { data, error } = await db.from("exam_agents").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export type AgentInput = Pick<AgentRow, "name" | "description" | "subject" | "grade" | "welcome" | "instructions" | "file_ids" | "is_active">;

export async function createAgent(a: AgentInput): Promise<AgentRow> {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await db.from("exam_agents").insert({ ...a, token: newAgentToken(), created_by: user?.id ?? null }).select("*").single();
  if (error) throw new Error(error.message);
  return data;
}
export async function updateAgent(id: string, a: Partial<AgentInput>) {
  const { error } = await db.from("exam_agents").update({ ...a, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
}
export async function deleteAgent(id: string) {
  const { error } = await db.from("exam_agents").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ───────── رفع وفهرسة ملفات الوكيل ─────────
/** يرفع ملفاً إلى المكتبة كمسوّدة (لا يظهر في المكتبة العامة) ويقسّمه إلى وحدات؛ يتاح للمستخدمين عبر الوكيل فقط. */
export async function uploadAgentFile(file: File, meta: { subject: string; grade: string }, onMsg: (m: string, pct?: number) => void): Promise<LibraryRow> {
  const path = await uploadToLibrary(file, (p) => onMsg(`رفع «${file.name}» ${p}%`, p));
  let units: UnitInfo[] | null = null, pages: number | null = null;
  try {
    const prep = await prepareFile(file, (m) => onMsg(m));
    onMsg("الذكاء الاصطناعي يقسّم الملف إلى وحدات...");
    const res = await analyzeUnits([prep]);
    units = res.units.map((u) => ({ ...u, fileIndex: 0 }));
    pages = prep.large?.numPages ?? (units.reduce((m, u) => Math.max(m, u.pageEnd ?? 0), 0) || null);
  } catch { /* يُقسَّم عند أول استعمال */ }
  return insertLibraryRow({
    title: file.name.replace(/\.[^.]+$/, ""), description: "", subject: meta.subject, grade: meta.grade,
    file, storage_path: path, page_count: pages, units, is_published: false,
  });
}

/** نص كل صفحة (PDF) أو مقاطع ~2500 حرفاً (Word/نص). الصفحة الخالية (ممسوحة ضوئياً) تُترك فارغة. */
export async function extractPageTexts(file: File, onMsg?: (m: string) => void): Promise<string[]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    const pdfjs = await getPdfjs();
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const out: string[] = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const tc = await page.getTextContent();
      out.push(tc.items.map((it: any) => it.str || "").join(" ").replace(/\s+/g, " ").trim());
      page.cleanup();
      if (p % 25 === 0) onMsg?.(`قراءة نص «${file.name}» (${p}/${doc.numPages})...`);
    }
    await doc.destroy();
    return out;
  }
  let text = "";
  if (name.endsWith(".docx")) {
    const mammoth: any = await import("mammoth");
    text = (await (mammoth.extractRawText ?? mammoth.default.extractRawText)({ arrayBuffer: await file.arrayBuffer() })).value;
  } else if (/\.(txt|md)$/.test(name)) text = await file.text();
  // صور: لا نص يُفهرَس (المحادثة لا ترى صوراً)
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += 2500) chunks.push(text.slice(i, i + 2500).replace(/\s+/g, " ").trim());
  return chunks;
}

export interface IndexReport { pages: number; emptyPages: number; filesWithoutText: string[] }

/** يعيد بناء فهرس الوكيل من ملفاته (يحذف القديم). */
export async function indexAgent(agentId: string, rows: LibraryRow[], onMsg: (m: string) => void): Promise<IndexReport> {
  const { error: delErr } = await db.from("exam_agent_pages").delete().eq("agent_id", agentId);
  if (delErr) throw new Error(delErr.message);
  const rep: IndexReport = { pages: 0, emptyPages: 0, filesWithoutText: [] };
  for (const row of rows) {
    onMsg(`تنزيل «${row.title}»...`);
    const file = await downloadLibraryFile(row, (p) => onMsg(`تنزيل «${row.title}» ${p}%`));
    const texts = await extractPageTexts(file, onMsg);
    const recs: any[] = [];
    texts.forEach((t, i) => {
      if (t.length < 20) { rep.emptyPages++; return; }
      recs.push({ agent_id: agentId, file_id: row.id, page: i + 1, content: t.slice(0, 6000), norm: normForIndex(t.slice(0, 20000)) });
    });
    if (recs.length === 0) rep.filesWithoutText.push(row.title);
    for (let i = 0; i < recs.length; i += 80) {
      onMsg(`حفظ فهرس «${row.title}» (${Math.min(i + 80, recs.length)}/${recs.length})...`);
      const { error } = await db.from("exam_agent_pages").insert(recs.slice(i, i + 80));
      if (error) throw new Error(error.message);
    }
    rep.pages += recs.length;
  }
  return rep;
}

export async function indexedPageCount(agentId: string): Promise<number> {
  const { count, error } = await db.from("exam_agent_pages").select("id", { count: "exact", head: true }).eq("agent_id", agentId);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

// ───────── الاستعمال العام (مستخدم مسجّل) ─────────
export async function getAgentByToken(token: string): Promise<PublicAgent | null> {
  const { data, error } = await db.rpc("get_exam_agent", { p_token: token });
  if (error) throw new Error(error.message);
  return (data as PublicAgent | null) ?? null;
}

export const agentChat = (token: string, messages: ChatMessage[], signal?: AbortSignal) =>
  callFn<ChatReply>("agent-chat", { token, messages }, { signal, timeoutMs: 100_000 });
