import type { FilePayload, PreparedFile } from "./fileUtils";
import { slicePdf } from "./pdfSlice";
import type { PageWindow } from "./workPlan";

const PLACEHOLDER = "(هذا الملف غير مستخدم في هذه الدفعة وقد حُذف محتواه عمداً لتخفيف الحجم؛ تجاهله تماماً ولا تسأل عنه.)";

/**
 * يبني ملفات الطلب: الصفحات المطلوبة فقط من كل PDF (بجودتها الأصلية) مع خريطة لأرقام الأصل،
 * والملفات غير المستخدمة تُستبدل بنص قصير، وما تعذّر قصّه يعود إلى حمولته الكاملة.
 * يحافظ على ترتيب الملفات لأن أرقام الملفات داخل الطلب تشير إلى مواضعها.
 */
export function makePayloadFor(prepared: PreparedFile[], base: FilePayload[]) {
  const cache = new Map<string, FilePayload>();
  const LIMIT = 12;

  const sliced = async (i: number, pages: number[]): Promise<FilePayload> => {
    const key = `${i}:${pages.join(",")}`;
    const hit = cache.get(key);
    if (hit) return hit;
    const p = prepared[i];
    const out = (p.kind === "pdf" ? await slicePdf(p.source, p.name, pages) : null) ?? base[i];
    cache.set(key, out);
    if (cache.size > LIMIT) cache.delete(cache.keys().next().value as string);
    return out;
  };

  return async (windows: PageWindow[] | null): Promise<FilePayload[]> => {
    if (!windows) return base;
    const out: FilePayload[] = [];
    for (let i = 0; i < base.length; i++) {
      const w = windows.find((x) => x.fileIndex === i);
      if (!w) out.push({ name: base[i].name, text: PLACEHOLDER.padEnd(90, " ") });
      else out.push(await sliced(i, w.pages));
    }
    return out;
  };
}
