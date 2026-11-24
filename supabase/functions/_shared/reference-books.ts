// أدوات مشتركة لمكتبة المراجع: عميل الخدمة، هوية المستدعي وأدواره، تواقيع Cloudflare R2، والبحث للذكاء الاصطناعي.
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";

export const MAX_BOOK_BYTES = 100 * 1024 * 1024;
export const BOOK_MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export const serviceClient = (): SupabaseClient =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

export interface Caller { userId: string; isLead: boolean; isUploader: boolean }

/** يتحقق من الجلسة ثم يسأل قاعدة البيانات (بصلاحيات المستخدم نفسه) عن أدواره. null إن لم يكن مسجّلاً. */
export async function getCaller(req: Request): Promise<Caller | null> {
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const url = Deno.env.get("SUPABASE_URL")!;
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient = createClient(url, anon, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });
  const { data: u, error } = await userClient.auth.getUser(auth.slice(7));
  if (error || !u?.user?.id) return null;
  const [lead, uploader] = await Promise.all([
    userClient.rpc("team_is_lead"),
    userClient.rpc("team_has_role", { p_role: "file_manager" }),
  ]);
  return { userId: u.user.id, isLead: lead.data === true, isUploader: uploader.data === true };
}

function r2Config() {
  // أسرار R2 تُنسخ كثيراً مع مسافة أو سطر جديد زائد فيفسد التوقيع، فننظّفها.
  const env = (k: string) => (Deno.env.get(k) ?? "").replace(/\s+/g, "");
  const accountId = env("R2_ACCOUNT_ID");
  const accessKeyId = env("R2_ACCESS_KEY_ID");
  const secretAccessKey = env("R2_SECRET_ACCESS_KEY");
  const bucket = env("R2_BUCKET_NAME");
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("تخزين Cloudflare R2 غير مُعدّ بعد: أضف R2_ACCOUNT_ID وR2_ACCESS_KEY_ID وR2_SECRET_ACCESS_KEY وR2_BUCKET_NAME في أسرار دوال Supabase");
  }
  const client = new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto" });
  const base = `https://${accountId}.r2.cloudflarestorage.com/${bucket}`;
  return { client, base };
}

const encodeKey = (key: string) => key.split("/").map(encodeURIComponent).join("/");

/** رابط موقَّع مؤقت (PUT للرفع أو GET للتنزيل) مباشرة مع R2. */
export async function presignR2(method: "PUT" | "GET", key: string, expiresSec: number, extraQuery: Record<string, string> = {}): Promise<string> {
  const { client, base } = r2Config();
  const u = new URL(`${base}/${encodeKey(key)}`);
  u.searchParams.set("X-Amz-Expires", String(expiresSec));
  for (const [k, v] of Object.entries(extraQuery)) u.searchParams.set(k, v);
  const signed = await client.sign(new Request(u, { method }), { aws: { signQuery: true } });
  return signed.url;
}

export async function deleteR2Object(key: string): Promise<void> {
  const { client, base } = r2Config();
  const r = await client.fetch(`${base}/${encodeKey(key)}`, { method: "DELETE" });
  if (!r.ok && r.status !== 404) throw new Error(`تعذّر حذف الملف من التخزين (${r.status})`);
}
