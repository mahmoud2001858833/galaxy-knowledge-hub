// «أخوة التطوع» — public API for the خطى التطوع site (no login).
//
//   POST {action:"submit", ...}        propose an initiative → pending; the principal gets an email with
//                                      approve / reject links (signed). Nobody else is told.
//   POST {action:"status", id, phone}  the organizer checks their request
//   POST {action:"list"}               approved, upcoming initiatives (no phones / emails)
//   POST {action:"join", id, name, phone}
//   GET  ?decide=approve|reject&id=…&t=…   the principal's decision link → small Arabic page
//
// Phones and emails stay here: responses never include them.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const ADMIN_EMAIL = "jowmahmoud6@gmail.com";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const service = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" } });

export const CATEGORIES: Record<string, string> = {
  education: "تعليم وتدريب", environment: "بيئة وتشجير", health: "صحة ورعاية", community: "مجتمع وأسرة",
  tech: "تقنية ورقمنة", relief: "إغاثة وطرود خير", other: "أخرى",
};
export const GOVERNORATES: Record<string, string> = {
  amman: "عمّان", irbid: "إربد", zarqa: "الزرقاء", balqa: "البلقاء", mafraq: "المفرق", jerash: "جرش",
  ajloun: "عجلون", madaba: "مادبا", karak: "الكرك", tafilah: "الطفيلة", maan: "معان", aqaba: "العقبة",
};

const PHONE = /^07[789]\d{7}$/;
const normPhone = (p: unknown) => String(p ?? "").replace(/[\s-]/g, "").replace(/^\+?962/, "0").replace(/^00962/, "0");
const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
const ammanTime = (iso: string) =>
  new Date(iso).toLocaleString("ar-JO", { timeZone: "Asia/Amman", dateStyle: "full", timeStyle: "short" });

// ---------------------------------------------------------------- signed decision links
async function sign(id: string, decision: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(SERVICE_KEY), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`volunteer:${id}:${decision}`));
  return btoa(String.fromCharCode(...new Uint8Array(mac))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
const decideLink = async (id: string, d: "approve" | "reject") =>
  `${SUPABASE_URL}/functions/v1/volunteer-initiatives?decide=${d}&id=${id}&t=${await sign(id, d)}`;

async function sendEmail(to: string, subject: string, html: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return false;
  const from = Deno.env.get("TEAM_EMAIL_FROM") ?? "ذروة العلم <onboarding@resend.dev>";
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  if (!r.ok) console.error("resend", r.status, (await r.text()).slice(0, 200));
  return r.ok;
}

const page = (title: string, body: string) =>
  new Response(
    `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title>
<style>body{font-family:system-ui,-apple-system,'Segoe UI',Tahoma,sans-serif;background:#f5f5f4;color:#0f172a;margin:0;display:grid;place-items:center;min-height:100vh}
main{background:#fff;border:1px solid #e7e5e4;border-radius:16px;padding:32px;max-width:440px;margin:16px;line-height:1.8}h1{font-size:22px;margin:0 0 8px}p{margin:0;color:#475569}</style></head>
<body><main><h1>${esc(title)}</h1><p>${body}</p></main></body></html>`,
    { headers: { ...CORS, "Content-Type": "text/html; charset=utf-8" } },
  );

// ---------------------------------------------------------------- actions
type Row = Record<string, any>;
const publicView = (r: Row, joined: number) => ({
  id: r.id, title: r.title, summary: r.summary,
  category: r.category, category_label: CATEGORIES[r.category] ?? r.category,
  governorate: r.governorate, governorate_label: GOVERNORATES[r.governorate] ?? r.governorate,
  location: r.location, starts_at: r.starts_at, ends_at: r.ends_at,
  capacity: r.capacity, joined, seats_left: Math.max(0, r.capacity - joined),
  organizer_name: r.organizer_name,
});

async function submit(b: Row) {
  if (str(b.website, 200)) return json({ ok: true, id: crypto.randomUUID(), status: "pending" }); // honeypot
  const phone = normPhone(b.organizer_phone);
  const email = str(b.organizer_email, 200) || null;
  const row = {
    title: str(b.title, 120), summary: str(b.summary, 1500), category: str(b.category, 20),
    governorate: str(b.governorate, 20), location: str(b.location, 200),
    starts_at: b.starts_at, ends_at: b.ends_at || null, capacity: Number(b.capacity),
    organizer_name: str(b.organizer_name, 80), organizer_phone: phone, organizer_email: email,
  };
  const errors: Record<string, string> = {};
  if (row.title.length < 3) errors.title = "اكتب عنواناً من 3 أحرف على الأقل.";
  if (row.summary.length < 20) errors.summary = "صف المبادرة في 20 حرفاً على الأقل.";
  if (!CATEGORIES[row.category]) errors.category = "اختر مجال المبادرة.";
  if (!GOVERNORATES[row.governorate]) errors.governorate = "اختر المحافظة.";
  if (row.location.length < 3) errors.location = "اكتب مكان المبادرة.";
  const start = Date.parse(String(row.starts_at ?? ""));
  if (!Number.isFinite(start) || start < Date.now() + 60 * 60_000) errors.starts_at = "الموعد يجب أن يكون بعد ساعة على الأقل من الآن.";
  if (row.ends_at && !(Date.parse(String(row.ends_at)) > start)) errors.ends_at = "وقت الانتهاء يجب أن يكون بعد البداية.";
  if (!Number.isInteger(row.capacity) || row.capacity < 1 || row.capacity > 500) errors.capacity = "عدد المشاركين من 1 إلى 500.";
  if (row.organizer_name.length < 2) errors.organizer_name = "اكتب اسمك.";
  if (!PHONE.test(phone)) errors.organizer_phone = "رقم أردني صحيح يبدأ بـ 077 أو 078 أو 079 (10 أرقام).";
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.organizer_email = "البريد الإلكتروني غير صحيح.";
  if (Object.keys(errors).length) return json({ ok: false, errors }, 400);

  // abuse limits: 3 open requests per phone, 30 new requests per hour overall
  const { count: mine } = await service.from("volunteer_initiatives").select("id", { count: "exact", head: true })
    .eq("organizer_phone", phone).eq("status", "pending");
  if ((mine ?? 0) >= 3) return json({ ok: false, error: "عندك 3 طلبات قيد المراجعة. انتظر الرد عليها أولاً." }, 429);
  const { count: hour } = await service.from("volunteer_initiatives").select("id", { count: "exact", head: true })
    .gte("created_at", new Date(Date.now() - 3600_000).toISOString());
  if ((hour ?? 0) >= 30) return json({ ok: false, error: "ضغط كبير على الطلبات الآن. حاول بعد قليل." }, 429);

  const { data, error } = await service.from("volunteer_initiatives").insert(row).select("*").single();
  if (error) {
    console.error("insert", error);
    return json({ ok: false, error: "تعذّر حفظ الطلب. تأكد من البيانات وحاول مجدداً." }, 400);
  }
  const r = data as Row;
  const [yes, no] = await Promise.all([decideLink(r.id, "approve"), decideLink(r.id, "reject")]);
  await sendEmail(ADMIN_EMAIL, `طلب مبادرة تطوعية: ${r.title}`, `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.8;color:#0f172a">
<h2 style="margin:0 0 8px">طلب مبادرة جديدة — أخوة التطوع</h2>
<p><b>${esc(r.title)}</b> · ${esc(CATEGORIES[r.category])} · ${esc(GOVERNORATES[r.governorate])}</p>
<p>${esc(r.summary).replace(/\n/g, "<br>")}</p>
<p><b>المكان:</b> ${esc(r.location)}<br><b>الموعد:</b> ${esc(ammanTime(r.starts_at))}${r.ends_at ? ` حتى ${esc(ammanTime(r.ends_at))}` : ""}<br><b>العدد المطلوب:</b> ${r.capacity}</p>
<p><b>صاحب المبادرة:</b> ${esc(r.organizer_name)} · <span dir="ltr">${esc(r.organizer_phone)}</span>${r.organizer_email ? ` · ${esc(r.organizer_email)}` : ""}</p>
<p style="margin-top:20px"><a href="${yes}" style="background:#047857;color:#fff;padding:10px 22px;border-radius:10px;text-decoration:none;font-weight:bold">موافقة ونشر</a>
&nbsp; <a href="${no}" style="background:#b91c1c;color:#fff;padding:10px 22px;border-radius:10px;text-decoration:none;font-weight:bold">رفض</a></p>
</div>`);
  return json({ ok: true, id: r.id, status: "pending" });
}

async function status(b: Row) {
  const { data } = await service.from("volunteer_initiatives").select("id,title,status,decision_note,organizer_phone,starts_at")
    .eq("id", str(b.id, 40)).maybeSingle();
  if (!data || (data as Row).organizer_phone !== normPhone(b.phone)) return json({ ok: false, error: "لم نجد طلباً بهذا الرقم." }, 404);
  const d = data as Row;
  return json({ ok: true, id: d.id, title: d.title, status: d.status, note: d.decision_note, starts_at: d.starts_at });
}

async function list() {
  const { data, error } = await service.from("volunteer_initiatives").select("*").eq("status", "approved")
    .gte("starts_at", new Date(Date.now() - 12 * 3600_000).toISOString()).order("starts_at").limit(100);
  if (error) return json({ ok: false, error: "تعذّر تحميل المبادرات." }, 500);
  const rows = (data ?? []) as Row[];
  const counts = new Map<string, number>();
  if (rows.length) {
    const { data: parts } = await service.from("volunteer_initiative_participants").select("initiative_id").in("initiative_id", rows.map((r) => r.id));
    for (const p of (parts ?? []) as Row[]) counts.set(p.initiative_id, (counts.get(p.initiative_id) ?? 0) + 1);
  }
  return json({ ok: true, initiatives: rows.map((r) => publicView(r, counts.get(r.id) ?? 0)) });
}

async function join(b: Row) {
  const phone = normPhone(b.phone);
  const name = str(b.name, 80);
  if (name.length < 2) return json({ ok: false, error: "اكتب اسمك." }, 400);
  if (!PHONE.test(phone)) return json({ ok: false, error: "رقم أردني صحيح يبدأ بـ 077 أو 078 أو 079." }, 400);
  const { data, error } = await service.rpc("volunteer_initiative_join", { p_id: str(b.id, 40), p_name: name, p_phone: phone });
  if (error) return json({ ok: false, error: "تعذّر التسجيل. حاول مجدداً." }, 500);
  const msg: Record<string, [number, string]> = {
    joined: [200, "تم تسجيلك! سيتواصل معك صاحب المبادرة قبل الموعد."],
    already: [200, "أنت مسجّل في هذه المبادرة مسبقاً."],
    full: [409, "اكتمل العدد في هذه المبادرة."],
    ended: [409, "انتهى موعد هذه المبادرة."],
    not_found: [404, "المبادرة غير متاحة."],
  };
  const [code, text] = msg[String(data)] ?? [500, "حدث خطأ."];
  return json({ ok: code === 200, result: data, message: text }, code);
}

async function decide(url: URL) {
  const id = url.searchParams.get("id") ?? "";
  const d = url.searchParams.get("decide");
  const t = url.searchParams.get("t") ?? "";
  if ((d !== "approve" && d !== "reject") || !/^[0-9a-f-]{36}$/.test(id) || t !== (await sign(id, d))) {
    return page("رابط غير صالح", "هذا الرابط غير صحيح أو تم تعديله.");
  }
  const next = d === "approve" ? "approved" : "rejected";
  const { data } = await service.from("volunteer_initiatives").update({ status: next, decided_at: new Date().toISOString() })
    .eq("id", id).eq("status", "pending").select("*").maybeSingle();
  if (!data) {
    const { data: cur } = await service.from("volunteer_initiatives").select("title,status").eq("id", id).maybeSingle();
    if (!cur) return page("غير موجود", "لم نجد هذه المبادرة.");
    const label = { approved: "موافَق عليها", rejected: "مرفوضة", cancelled: "ملغاة", pending: "قيد المراجعة" }[(cur as Row).status as string];
    return page("تم القرار مسبقاً", `«${esc((cur as Row).title)}» ${label} من قبل.`);
  }
  const r = data as Row;
  if (r.organizer_email) {
    await sendEmail(r.organizer_email, next === "approved" ? `تمت الموافقة على مبادرتك: ${r.title}` : `بخصوص مبادرتك: ${r.title}`,
      `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.8">${
        next === "approved"
          ? `<p>أهلاً ${esc(r.organizer_name)}، تمت الموافقة على مبادرتك «${esc(r.title)}» وصارت ظاهرة للناس للمشاركة.</p>`
          : `<p>أهلاً ${esc(r.organizer_name)}، نعتذر، لم تتم الموافقة على مبادرتك «${esc(r.title)}» هذه المرة.</p>`
      }</div>`);
  }
  return next === "approved"
    ? page("تمت الموافقة ✓", `«${esc(r.title)}» صارت منشورة، والناس تقدر تشارك فيها الآن.`)
    : page("تم الرفض", `«${esc(r.title)}» لن تظهر للناس.`);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const url = new URL(req.url);
  try {
    if (req.method === "GET" && url.searchParams.has("decide")) return await decide(url);
    if (req.method !== "POST") return json({ ok: false, error: "method" }, 405);
    const b = (await req.json().catch(() => ({}))) as Row;
    switch (b.action) {
      case "submit": return await submit(b);
      case "status": return await status(b);
      case "list": return await list();
      case "join": return await join(b);
      default: return json({ ok: false, error: "unknown action" }, 400);
    }
  } catch (e) {
    console.error(e);
    return json({ ok: false, error: "خطأ غير متوقع." }, 500);
  }
});
