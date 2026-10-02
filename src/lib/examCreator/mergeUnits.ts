import type { UnitInfo } from "./types";

/** يعيد ترقيم وحدات ملف إلى فهرسه العام ضمن الامتحان المدمج، ويجعل المعرّفات فريدة. */
export function remapUnits(units: UnitInfo[], globalFileIndex: number): UnitInfo[] {
  return units.map((u, i) => ({ ...u, id: `f${globalFileIndex}-${u.id || `u${i + 1}`}`, fileIndex: globalFileIndex }));
}

/** وحدات الملفات كلها بترتيب الملفات ثم ترتيب الوحدات داخل الملف. */
export function mergeUnitLists(lists: { fileIndex: number; units: UnitInfo[] }[]): UnitInfo[] {
  return [...lists].sort((a, b) => a.fileIndex - b.fileIndex).flatMap((l) => remapUnits(l.units, l.fileIndex));
}

/** يتحقق أن وحدات مخزّنة (jsonb) سليمة الشكل قبل الوثوق بها. */
export function sanitizeCachedUnits(raw: unknown): UnitInfo[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out: UnitInfo[] = [];
  for (const u of raw as any[]) {
    if (!u || typeof u.title !== "string" || !u.title.trim()) return null;
    out.push({
      id: String(u.id ?? ""), title: u.title.slice(0, 200), summary: String(u.summary ?? "").slice(0, 500),
      fileIndex: 0,
      pageStart: Number.isInteger(u.pageStart) && u.pageStart > 0 ? u.pageStart : null,
      pageEnd: Number.isInteger(u.pageEnd) && u.pageEnd > 0 ? u.pageEnd : null,
      hasFigures: !!u.hasFigures, hasTables: !!u.hasTables,
    });
  }
  return out;
}
