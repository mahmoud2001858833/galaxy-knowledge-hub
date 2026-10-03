/** قصّ ذكي للأشكال: دوال نقية على بيانات البكسلات (قابلة للاختبار بلا متصفح). */
export interface Rect { x: number; y: number; w: number; h: number }

/**
 * يجد أصغر مستطيل يحوي كل المحتوى غير الأبيض داخل `data` (RGBA)، بهامش `pad` بكسل.
 * يتجاهل الضجيج الصغير: صفوف/أعمدة فيها أقل من `minInk` بكسلات داكنة لا تُعدّ محتوى.
 * يعيد null إن كانت الصورة بيضاء كلها.
 */
export function contentRect(data: Uint8ClampedArray, w: number, h: number, pad = 6, white = 242, minInk = 2): Rect | null {
  const rowInk = new Uint32Array(h), colInk = new Uint32Array(w);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 3] < 16) continue;
      if (data[i] < white || data[i + 1] < white || data[i + 2] < white) { rowInk[y]++; colInk[x]++; }
    }
  }
  const first = (a: Uint32Array) => a.findIndex((v) => v >= minInk);
  const last = (a: Uint32Array) => { for (let i = a.length - 1; i >= 0; i--) if (a[i] >= minInk) return i; return -1; };
  const y0 = first(rowInk), y1 = last(rowInk), x0 = first(colInk), x1 = last(colInk);
  if (y0 < 0 || x0 < 0 || y1 < y0 || x1 < x0) return null;
  const x = Math.max(0, x0 - pad), y = Math.max(0, y0 - pad);
  return { x, y, w: Math.min(w, x1 + pad + 1) - x, h: Math.min(h, y1 + pad + 1) - y };
}

/** يحوّل صندوقاً نسبياً [ymin,xmin,ymax,xmax] (0..1000) داخل مستطيل `r` إلى مستطيل مطلق. */
export function applyTightBox(r: Rect, box: number[]): Rect {
  const [y0, x0, y1, x1] = box;
  return {
    x: Math.round(r.x + (x0 / 1000) * r.w), y: Math.round(r.y + (y0 / 1000) * r.h),
    w: Math.max(1, Math.round(((x1 - x0) / 1000) * r.w)), h: Math.max(1, Math.round(((y1 - y0) / 1000) * r.h)),
  };
}

/** هل الصندوق المقترح من النموذج معقول (لا يقتطع أقل من 15% ولا يكاد يساوي الكل)؟ */
export function sensibleTightBox(box: number[] | null | undefined): box is number[] {
  if (!box || box.length !== 4) return false;
  const area = ((box[2] - box[0]) * (box[3] - box[1])) / 1_000_000;
  return area >= 0.15 && area <= 0.97;
}

/** يوسّع مستطيلاً بنسبة من حجمه (لإعادة المحاولة عند قطع الشكل)، مقيّداً بحدود الصورة. */
export function expandRect(r: Rect, frac: number, maxW: number, maxH: number): Rect {
  const dx = Math.round(r.w * frac), dy = Math.round(r.h * frac);
  const x = Math.max(0, r.x - dx), y = Math.max(0, r.y - dy);
  return { x, y, w: Math.min(maxW, r.x + r.w + dx) - x, h: Math.min(maxH, r.y + r.h + dy) - y };
}
