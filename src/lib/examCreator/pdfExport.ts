import type { ExamQuestion, GeneratedExam, QType } from "./types";
import { LETTERS, QTYPE_LABEL } from "./types";

// A4 بدقة 96dpi
const PAGE_W = 794;
const PAGE_H = 1123;
const PAD_X = 52;
const PAD_TOP = 40;
const PAD_BOTTOM = 62;
const CONTENT_W = PAGE_W - PAD_X * 2;
const CONTENT_H = PAGE_H - PAD_TOP - PAD_BOTTOM;

const NAVY = "#0f2a4a";
const ACCENT = "#0e7490";
const INK = "#1b2430";
const MUTED = "#5b6676";
const LINE = "#cfd8e3";

const esc = (s: string) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// html2canvas يرسم النص أخفض قليلاً داخل الدوائر؛ نعوّض ذلك في المسار المصوَّر فقط (الطباعة الأصلية دقيقة).
let NATIVE = false;
const nudge = (em: number) => (NATIVE ? "" : `position:relative;top:-${em}em`);

const ORDINALS = ["أولاً", "ثانياً", "ثالثاً", "رابعاً", "خامساً"];

interface Block { html: string; keepWithNext?: boolean; }

function figureHtml(q: ExamQuestion, figNo: number): string {
  const f = q.figure;
  if (!f?.dataUrl || !f.width || !f.height) return "";
  const scale = Math.min(600 / f.width, 280 / f.height, 1.2);
  const w = Math.round(f.width * scale), h = Math.round(f.height * scale);
  // ملاحظة: إطار block بعرض ثابت وبلا خلفية؛ إطار inline-block بخلفية بيضاء يجعل html2canvas يغطي الصورة.
  return `<div style="margin:10px auto 4px;width:${w + 18}px">
    <div style="border:1px solid ${LINE};border-radius:8px;padding:8px;width:${w}px;height:${h}px">
      <img src="${f.dataUrl}" width="${w}" height="${h}" style="width:${w}px;height:${h}px;display:block" />
    </div>
    <div style="font-size:11px;color:${MUTED};margin-top:4px;text-align:center">الشكل (${figNo})${f.caption ? ` — ${esc(f.caption)}` : ""}</div>
  </div>`;
}

function tableHtml(q: ExamQuestion): string {
  const t = q.table;
  if (!t) return "";
  const cols = t.headers.length;
  const fs = cols > 6 ? 11 : 13;
  return `<div style="margin:10px 0 4px">
    ${t.caption ? `<div style="font-size:12px;color:${MUTED};margin-bottom:4px;text-align:center">${esc(t.caption)}</div>` : ""}
    <table style="width:100%;border-collapse:collapse;font-size:${fs}px;text-align:center">
      <thead><tr>${t.headers.map((h) => `<th style="background:${NAVY};color:#fff;padding:6px 8px;border:1px solid ${NAVY};font-weight:700">${esc(h)}</th>`).join("")}</tr></thead>
      <tbody>${t.rows.map((r, i) => `<tr>${r.map((c) => `<td style="padding:5px 8px;border:1px solid ${LINE};background:${i % 2 ? "#f4f7fb" : "#fff"}">${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>`;
}

function optionsHtml(options: string[]): string {
  const short = options.every((o) => o.length <= 26);
  const items = options.map((o, i) =>
    `<div style="display:flex;gap:8px;align-items:flex-start;padding:3px 0">
      <span style="flex:none;width:26px;height:26px;border:1.5px solid ${NAVY};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;line-height:1;font-weight:700;color:${NAVY}"><span style="${nudge(0.3)}">${LETTERS[i]}</span></span>
      <span style="flex:1">${esc(o)}</span></div>`).join("");
  return `<div style="margin-top:8px;padding-right:6px;${short ? "display:grid;grid-template-columns:1fr 1fr;column-gap:24px" : ""}">${items}</div>`;
}

function answerArea(q: ExamQuestion): string {
  const line = `<div style="border-bottom:1px dotted #8a97a8;height:28px"></div>`;
  if (q.type === "true_false") {
    return `<div style="margin-top:8px;font-size:14px;padding-right:6px">
      <span style="display:inline-block;width:16px;height:16px;border:1.5px solid ${NAVY};border-radius:3px;vertical-align:middle"></span> صح
      <span style="display:inline-block;width:40px"></span>
      <span style="display:inline-block;width:16px;height:16px;border:1.5px solid ${NAVY};border-radius:3px;vertical-align:middle"></span> خطأ</div>`;
  }
  if (q.type === "short_answer") return `<div style="margin-top:6px">${line}${line}</div>`;
  if (q.type === "essay") return `<div style="margin-top:6px">${line.repeat(5)}</div>`;
  return "";
}

function questionBlock(q: ExamQuestion, no: number, figNo: number): Block {
  return {
    html: `<div style="display:flex;gap:10px;align-items:flex-start">
      <div style="flex:none;width:30px;height:30px;border-radius:50%;background:${NAVY};color:#fff;display:flex;align-items:center;justify-content:center;line-height:1;font-weight:700;font-size:14px;margin-top:1px"><span style="${nudge(0.28)}">${no}</span></div>
      <div style="flex:1;min-width:0">
        <div style="font-size:15px;line-height:1.85;color:${INK};font-weight:600">${esc(q.question)}</div>
        ${tableHtml(q)}${figureHtml(q, figNo)}
        ${q.type === "multiple_choice" && q.options ? optionsHtml(q.options) : ""}
        ${answerArea(q)}
      </div></div>`,
  };
}

function sectionHeading(label: string, count: number, idx: number): Block {
  return {
    keepWithNext: true,
    html: `<div style="display:flex;align-items:center;gap:10px;margin-top:6px">
      <div style="font-size:16px;font-weight:800;color:${NAVY}">${ORDINALS[idx] ?? ""}: ${esc(label)}</div>
      <div style="flex:1;border-bottom:2px solid ${ACCENT}"></div>
      <div style="font-size:12px;color:${MUTED}">${count} ${count === 1 ? "سؤال" : "أسئلة"}</div></div>`,
  };
}

function headerBlock(exam: GeneratedExam, mode: "student" | "key"): Block {
  const m = exam.meta;
  const chips = [
    m.subject && `المادة: ${m.subject}`,
    m.grade && `الصف: ${m.grade}`,
    m.durationMinutes ? `الزمن: ${m.durationMinutes} دقيقة` : "",
    `عدد الأسئلة: ${exam.questions.length}`,
  ].filter(Boolean) as string[];
  return {
    html: `<div style="text-align:center">
      ${m.schoolName ? `<div style="font-size:14px;color:${MUTED};font-weight:600;margin-bottom:4px">${esc(m.schoolName)}</div>` : ""}
      <div style="font-size:26px;font-weight:900;color:${NAVY};line-height:1.5">${esc(exam.title)}${mode === "key" ? " — نموذج الإجابة" : ""}</div>
      <div style="height:3px;background:linear-gradient(90deg,transparent,${ACCENT},transparent);margin:8px 0 10px"></div>
      <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:8px">
        ${chips.map((c) => `<span style="display:inline-block;font-size:12.5px;line-height:1.6;padding:3px 14px 5px;border:1px solid ${LINE};border-radius:999px;color:${INK};background:#f6f9fc">${esc(c)}</span>`).join("")}
      </div>
      ${mode === "student" ? `<div style="display:flex;gap:14px;margin-top:14px;font-size:13px;color:${INK}">
        <div style="flex:3;border-bottom:1px solid ${INK};padding-bottom:3px;text-align:right">اسم الطالب:</div>
        <div style="flex:1.2;border-bottom:1px solid ${INK};padding-bottom:3px;text-align:right">الشعبة:</div>
        <div style="flex:1.2;border-bottom:1px solid ${INK};padding-bottom:3px;text-align:right">التاريخ:</div>
        <div style="flex:1.2;border:1.5px solid ${NAVY};border-radius:6px;padding:2px 8px 4px;line-height:1.6;text-align:center">العلامة: &nbsp;&nbsp;/ ${exam.questions.length}</div></div>` : ""}
      ${m.teacherName ? `<div style="font-size:12px;color:${MUTED};margin-top:8px;text-align:left">إعداد: ${esc(m.teacherName)}</div>` : ""}
    </div>`,
  };
}

function groupByType(qs: ExamQuestion[]): [QType, ExamQuestion[]][] {
  const order: QType[] = ["multiple_choice", "true_false", "fill_blank", "short_answer", "essay"];
  return order.map((t) => [t, qs.filter((q) => q.type === t)] as [QType, ExamQuestion[]]).filter(([, a]) => a.length);
}

function studentBlocks(exam: GeneratedExam): Block[] {
  const blocks: Block[] = [headerBlock(exam, "student")];
  let n = 0, fig = 0;
  groupByType(exam.questions).forEach(([type, qs], si) => {
    blocks.push(sectionHeading(QTYPE_LABEL[type], qs.length, si));
    qs.forEach((q) => {
      n++;
      if (q.figure?.dataUrl) fig++;
      blocks.push(questionBlock(q, n, fig));
    });
  });
  return blocks;
}

function keyBlocks(exam: GeneratedExam): Block[] {
  const blocks: Block[] = [headerBlock(exam, "key")];
  let n = 0;
  groupByType(exam.questions).forEach(([type, qs], si) => {
    blocks.push(sectionHeading(QTYPE_LABEL[type], qs.length, si));
    qs.forEach((q) => {
      n++;
      let ans = q.answer;
      if (q.type === "multiple_choice" && q.options) {
        const i = q.options.indexOf(q.answer);
        if (i >= 0) ans = `${LETTERS[i]}) ${q.answer}`;
      }
      blocks.push({
        html: `<div style="display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:1.8">
          <div style="flex:none;width:26px;height:26px;border-radius:50%;background:${ACCENT};color:#fff;display:flex;align-items:center;justify-content:center;line-height:1;font-weight:700;font-size:13px"><span style="${nudge(0.28)}">${n}</span></div>
          <div style="flex:1;min-width:0">
            <div style="color:${INK};font-weight:700">${esc(ans)}</div>
            ${q.explanation ? `<div style="color:${INK}">${esc(q.explanation)}</div>` : ""}
            <div style="color:${MUTED};font-size:11.5px">${q.location ? `المصدر: ${esc(q.location)} — ` : ""}«${esc(q.evidence)}»</div>
          </div></div>`,
      });
    });
  });
  return blocks;
}

function buildPages(blocks: Block[], root: HTMLElement, pageTitle: string): HTMLElement[] {
  const pages: { page: HTMLElement; content: HTMLElement }[] = [];

  const newPage = () => {
    const page = document.createElement("div");
    page.style.cssText = `width:${PAGE_W}px;height:${PAGE_H}px;position:relative;background:#fff;overflow:hidden;box-sizing:border-box;direction:rtl;text-align:right;font-family:'Cairo','Segoe UI',Tahoma,sans-serif;line-height:1.7;color:${INK}`;
    page.innerHTML = `
      <div style="position:absolute;top:0;left:0;right:0;height:8px;background:linear-gradient(90deg,${NAVY},${ACCENT})"></div>
      <div style="position:absolute;bottom:22px;left:${PAD_X}px;right:${PAD_X}px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid ${LINE};padding-top:8px;font-size:11px;color:${MUTED}">
        <span>${esc(pageTitle)}</span><span data-pageno></span><span>منصة ذروة العلم</span></div>`;
    const content = document.createElement("div");
    content.style.cssText = `position:absolute;top:${PAD_TOP}px;right:${PAD_X}px;width:${CONTENT_W}px;height:${CONTENT_H}px;overflow:hidden`;
    page.appendChild(content);
    root.appendChild(page);
    const rec = { page, content };
    pages.push(rec);
    return rec;
  };

  const wrap = (b: Block) => {
    const el = document.createElement("div");
    el.style.cssText = "margin-bottom:14px";
    el.dataset.keep = b.keepWithNext ? "1" : "";
    el.innerHTML = b.html;
    return el;
  };
  const overflows = (c: HTMLElement) => c.scrollHeight > c.clientHeight + 1;

  let cur = newPage();
  for (const b of blocks) {
    const el = wrap(b);
    cur.content.appendChild(el);
    if (!overflows(cur.content)) continue;

    cur.content.removeChild(el);
    // لا نترك عنوان قسم وحيداً في آخر الصفحة
    const carry: HTMLElement[] = [];
    const last = cur.content.lastElementChild as HTMLElement | null;
    if (last && last.dataset.keep === "1" && cur.content.children.length > 1) {
      cur.content.removeChild(last);
      carry.push(last);
    }
    cur = newPage();
    carry.forEach((c) => cur.content.appendChild(c));
    cur.content.appendChild(el);
    if (overflows(cur.content)) {
      // كتلة أطول من صفحة كاملة (جدول ضخم مثلاً): نصغّرها لتتسع
      const ratio = Math.max(0.5, (cur.content.clientHeight - 4) / el.scrollHeight - (carry.length ? 0.1 : 0));
      (el.style as any).zoom = String(ratio);
    }
  }

  pages.forEach((p, i) => {
    const no = p.page.querySelector("[data-pageno]") as HTMLElement;
    no.textContent = `صفحة ${i + 1} من ${pages.length}`;
  });
  return pages.map((p) => p.page);
}

export type PdfMode = "student" | "key" | "both";

export async function downloadExamPdf(
  exam: GeneratedExam,
  mode: PdfMode,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);

  if ((document as any).fonts?.load) {
    await Promise.all([
      (document as any).fonts.load("400 16px Cairo"),
      (document as any).fonts.load("700 16px Cairo"),
      (document as any).fonts.load("900 16px Cairo"),
    ]).catch(() => {});
    await (document as any).fonts.ready;
  }

  NATIVE = false;
  const root = document.createElement("div");
  root.style.cssText = `position:fixed;top:0;left:-${PAGE_W + 200}px;width:${PAGE_W}px;z-index:-1;pointer-events:none`;
  document.body.appendChild(root);

  try {
    const sets: { blocks: Block[]; title: string }[] = [];
    if (mode !== "key") sets.push({ blocks: studentBlocks(exam), title: exam.title });
    if (mode !== "student") sets.push({ blocks: keyBlocks(exam), title: `${exam.title} — نموذج الإجابة` });

    // لكل مجموعة ترقيم صفحات مستقل
    const pageEls: HTMLElement[] = [];
    for (const s of sets) pageEls.push(...buildPages(s.blocks, root, s.title));

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });
    pdf.setProperties({ title: exam.title, creator: "منصة ذروة العلم" });

    for (let i = 0; i < pageEls.length; i++) {
      await Promise.all(Array.from(pageEls[i].querySelectorAll("img")).map(async (img) => {
        try { await img.decode(); } catch { /* سيُرسم ما أمكن */ }
      }));
      const canvas = await html2canvas(pageEls[i], {
        scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false,
        width: PAGE_W, height: PAGE_H, windowWidth: PAGE_W, scrollX: 0, scrollY: 0,
      });
      if (i > 0) pdf.addPage("a4", "portrait");
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.93), "JPEG", 0, 0, 210, 297, undefined, "FAST");
      onProgress?.(i + 1, pageEls.length);
      await new Promise((r) => setTimeout(r, 0)); // أتح للواجهة أن تتحدث
    }

    const safe = exam.title.replace(/[\\/:*?"<>|]+/g, " ").trim().slice(0, 80) || "exam";
    const suffix = mode === "key" ? " - الإجابات" : mode === "both" ? " - مع الإجابات" : "";
    pdf.save(`${safe}${suffix}.pdf`);
  } finally {
    document.body.removeChild(root);
  }
}


// ───────── طباعة المتصفح الأصلية: PDF متجهي بنص قابل للتحديد ─────────
export function buildPrintHtml(exam: GeneratedExam, mode: PdfMode): string {
  NATIVE = true;
  try {
    const parts: string[] = [];
    const render = (blocks: Block[], pageBreakBefore: boolean) =>
      blocks.map((b, i) =>
        `<div class="blk${b.keepWithNext ? " keep" : ""}${pageBreakBefore && i === 0 ? " pb" : ""}">${b.html}</div>`).join("");
    if (mode !== "key") parts.push(render(studentBlocks(exam), false));
    if (mode !== "student") parts.push(render(keyBlocks(exam), mode === "both"));
    return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<title>${esc(exam.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
@page{size:A4;margin:14mm 12mm 18mm;@bottom-center{content:"صفحة " counter(page) " من " counter(pages);font:10px Cairo,sans-serif;color:${MUTED}}}
*{box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;direction:rtl;text-align:right;font-family:'Cairo','Segoe UI',Tahoma,sans-serif;line-height:1.7;color:${INK}}
.blk{break-inside:avoid;margin-bottom:14px}.keep{break-after:avoid}.pb{break-before:page}
img{max-width:100%}
</style></head><body>${parts.join("")}
<script>(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){setTimeout(function(){window.print()},500)})</script>
</body></html>`;
  } finally {
    NATIVE = false;
  }
}

/** يجب استدعاؤها مباشرة من نقرة المستخدم (قبل أي await) حتى لا تحجب المتصفحات النافذة. */
export function openPrintWindow(exam: GeneratedExam, mode: PdfMode): boolean {
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.open();
  w.document.write(buildPrintHtml(exam, mode));
  w.document.close();
  return true;
}
