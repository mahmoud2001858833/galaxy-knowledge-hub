// تطبيع نص عربي للبحث. نسخة طبق الأصل في supabase/functions/_shared/agent-search.ts — عدّلهما معاً.
const STOP = new Set(["في", "من", "على", "الى", "عن", "ما", "هو", "هي", "هل", "كيف", "ماذا", "لماذا", "متى", "اين", "هذا", "هذه", "ذلك", "تلك", "كان", "كل", "مع", "او", "ثم", "قد", "لا", "نعم", "اشرح", "وضح", "اذكر", "عرف", "the", "and", "for", "what", "how", "why", "is", "are", "of", "to", "in"]);

export function normSearchTokens(s: string): string[] {
  const t = String(s ?? "")
    .normalize("NFKC")
    .replace(/[ً-ْـ]/g, "")
    .replace(/[إأآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
    .toLowerCase();
  const out: string[] = [];
  for (const raw of t.split(/[^\p{L}\p{N}]+/u)) {
    if (!raw) continue;
    const w = raw.length > 3 && raw.startsWith("ال") ? raw.slice(2) : raw;
    if (w.length >= 2) out.push(w);
  }
  return out;
}

/** النص المطبَّع الذي يُخزَّن في الفهرس. */
export const normForIndex = (s: string) => normSearchTokens(s).join(" ");

/** استعلام tsquery (بادئات) من سؤال المستخدم؛ null إن لم يبقَ ما يُبحث به. */
export function buildTsQuery(q: string, max = 12): string | null {
  const toks = [...new Set(normSearchTokens(q).filter((w) => !STOP.has(w)))].slice(0, max);
  return toks.length ? toks.map((w) => `${w}:*`).join(" | ") : null;
}
