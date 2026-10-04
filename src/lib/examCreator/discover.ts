// رصد الأشكال والجداول على نوافذ صفحات صغيرة (طلب لكل نافذة) بدل طلب واحد ضخم يتجاوز مهلة الخادم.
import { ApiError, discoverVisuals, type DiscoverResponse } from "./api";
import type { FilePayload } from "./fileUtils";
import type { UnitInfo } from "./types";
import type { PageWindow } from "./workPlan";

const WINDOW_PAGES = 20;
const MAX_WINDOWS = 12;

interface Win { windows: PageWindow[] | null; units: UnitInfo[] }

/** ترتيب يوزّع العيّنة على الكتاب كله ليكون الإيقاف المبكر غير متحيّز لأول صفحاته. */
export function spreadOrder(n: number): number[] {
  if (n <= 2) return Array.from({ length: n }, (_, i) => i);
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  let k = Math.max(1, Math.round(n * 0.618));
  while (gcd(k, n) !== 1) k++;
  return Array.from({ length: n }, (_, i) => (i * k) % n);
}

export function planDiscoveryWindows(units: UnitInfo[], wantFig: boolean, wantTbl: boolean): Win[] {
  const flagged = units.filter((u) => (wantFig && u.hasFigures) || (wantTbl && u.hasTables));
  const use = flagged.length ? flagged : units;
  const out: Win[] = [];
  const byFile = new Map<number, UnitInfo[]>();
  for (const u of use) byFile.set(u.fileIndex, [...(byFile.get(u.fileIndex) ?? []), u]);
  for (const [fileIndex, us] of byFile) {
    if (us.some((u) => !u.pageStart)) { out.push({ windows: null, units: us }); continue; }
    const pages = new Set<number>();
    us.forEach((u) => { for (let p = u.pageStart!; p <= (u.pageEnd ?? u.pageStart!); p++) pages.add(p); });
    const sorted = [...pages].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i += WINDOW_PAGES) {
      const chunk = sorted.slice(i, i + WINDOW_PAGES);
      const lo = chunk[0], hi = chunk[chunk.length - 1];
      out.push({
        windows: [{ fileIndex, pages: chunk }],
        units: us.filter((u) => u.pageStart! <= hi && (u.pageEnd ?? u.pageStart!) >= lo),
      });
    }
  }
  return spreadOrder(out.length).map((i) => out[i]).slice(0, MAX_WINDOWS);
}

export interface DiscoverOpts {
  units: UnitInfo[];
  wantFig: boolean; wantTbl: boolean;
  needFig: number; needTbl: number;
  payloadFor: (w: PageWindow[] | null) => Promise<FilePayload[]>;
  signal?: AbortSignal;
  onStage?: (msg: string) => void;
  call?: typeof discoverVisuals;
  sleep?: (ms: number) => Promise<void>;
  concurrency?: number;
}

export async function discoverChunked(o: DiscoverOpts): Promise<DiscoverResponse & { errors: string[] }> {
  const call = o.call ?? discoverVisuals;
  const sleep = o.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const wins = planDiscoveryWindows(o.units, o.wantFig, o.wantTbl);
  const figs: DiscoverResponse["figures"] = [], tbls: DiscoverResponse["tables"] = [];
  const stats: Record<string, number> = {};
  const errors: string[] = [];
  let next = 0, done = 0, ok = 0;
  const enough = () => (!o.wantFig || figs.length >= o.needFig) && (!o.wantTbl || tbls.length >= o.needTbl);

  const worker = async () => {
    while (!o.signal?.aborted && !enough()) {
      const i = next++;
      if (i >= wins.length) return;
      const w = wins[i];
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const payloads = await o.payloadFor(w.windows);
          const r = await call(payloads, w.units, o.wantFig, o.wantTbl, o.signal);
          ok++;
          figs.push(...r.figures); tbls.push(...r.tables);
          for (const [k, v] of Object.entries(r.stats ?? {})) stats[k] = (stats[k] ?? 0) + v;
          break;
        } catch (e: any) {
          if (o.signal?.aborted) return;
          const msg = e?.message ?? "خطأ";
          if (e instanceof ApiError && e.code === "rate_limited" && attempt === 0) { await sleep(Math.min(60, e.retryAfter ?? 20) * 1000); continue; }
          if (e instanceof ApiError && (e.code === "auth" || e.code === "bad_request")) throw e;
          if (!errors.includes(msg)) errors.push(msg);
          break;
        }
      }
      o.onStage?.(`رصد الأشكال والجداول: ${++done} من ${wins.length} مقطعاً (وُجد ${figs.length} شكل و${tbls.length} جدول)...`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(o.concurrency ?? 2, wins.length || 1) }, worker));

  if (ok === 0 && errors.length) throw new Error(errors[0]);
  return {
    figures: figs.map((f, i) => ({ ...f, id: `F${i + 1}` })),
    tables: tbls.map((t, i) => ({ ...t, id: `T${i + 1}` })),
    stats, errors,
  };
}
