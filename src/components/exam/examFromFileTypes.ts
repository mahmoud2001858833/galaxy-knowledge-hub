export type QType = "multiple_choice" | "true_false" | "short_answer" | "essay" | "fill_blank";

export const QTYPE_META: { key: QType; label: string }[] = [
  { key: "multiple_choice", label: "اختيار من متعدد" },
  { key: "true_false", label: "صح / خطأ" },
  { key: "fill_blank", label: "أكمل الفراغ" },
  { key: "short_answer", label: "إجابة قصيرة" },
  { key: "essay", label: "مقالي" },
];

export const DIFFICULTY_AR: Record<string, string> = { easy: "سهل", medium: "متوسط", hard: "صعب" };

export interface ExamQuestion {
  id: number;
  type: QType;
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
  evidence: string;
  location?: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface GeneratedExam {
  title: string;
  questions: ExamQuestion[];
}

export interface ExamFromFileResponse {
  exam: GeneratedExam;
  requested: number;
  delivered: number;
  dropped: number;
  warnings: string[];
}

const LETTERS = ["أ", "ب", "ج", "د"];

export function examToText(exam: GeneratedExam, withAnswers: boolean): string {
  const lines: string[] = [exam.title, ""];
  for (const q of exam.questions) {
    lines.push(`${q.id}) ${q.question}`);
    if (q.type === "multiple_choice" && q.options) {
      q.options.forEach((o, i) => lines.push(`   ${LETTERS[i]}. ${o}`));
    } else if (q.type === "true_false") {
      lines.push("   (   ) صح        (   ) خطأ");
    }
    lines.push("");
  }
  if (withAnswers) {
    lines.push("الإجابات النموذجية", "");
    for (const q of exam.questions) {
      let a = q.answer;
      if (q.type === "multiple_choice" && q.options) {
        const i = q.options.indexOf(q.answer);
        if (i >= 0) a = `${LETTERS[i]}. ${q.answer}`;
      }
      lines.push(`${q.id}) ${a}${q.location ? `  [${q.location}]` : ""}`);
    }
  }
  return lines.join("\n");
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function examToPrintHtml(exam: GeneratedExam, withAnswers: boolean): string {
  const qs = exam.questions
    .map((q) => {
      let body = `<div class="q"><b>${q.id})</b> ${esc(q.question)}`;
      if (q.type === "multiple_choice" && q.options) {
        body += `<ol class="opts">${q.options.map((o, i) => `<li><span>${LETTERS[i]}.</span> ${esc(o)}</li>`).join("")}</ol>`;
      } else if (q.type === "true_false") {
        body += `<div class="tf">( &nbsp; ) صح &emsp; ( &nbsp; ) خطأ</div>`;
      } else if (q.type === "short_answer") {
        body += `<div class="lines"></div>`;
      } else if (q.type === "essay") {
        body += `<div class="lines"></div><div class="lines"></div><div class="lines"></div>`;
      }
      return body + "</div>";
    })
    .join("");

  const ans = withAnswers
    ? `<div class="pb"></div><h2>الإجابات النموذجية</h2>` +
      exam.questions
        .map((q) => {
          let a = q.answer;
          if (q.type === "multiple_choice" && q.options) {
            const i = q.options.indexOf(q.answer);
            if (i >= 0) a = `${LETTERS[i]}. ${q.answer}`;
          }
          return `<div class="a"><b>${q.id})</b> ${esc(a)}${
            q.location ? ` <small>[${esc(q.location)}]</small>` : ""
          }${q.explanation ? `<div class="ex">${esc(q.explanation)}</div>` : ""}</div>`;
        })
        .join("")
    : "";

  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(exam.title)}</title>
<style>
body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;margin:32px;line-height:1.9;color:#111}
h1{text-align:center;font-size:22px;border-bottom:2px solid #111;padding-bottom:8px}
h2{font-size:18px}
.meta{display:flex;justify-content:space-between;margin:12px 0 20px;font-size:14px}
.q{margin:16px 0;page-break-inside:avoid}
.opts{list-style:none;padding:0 18px;margin:6px 0}
.opts span{display:inline-block;width:22px;font-weight:bold}
.tf{padding:4px 18px}
.lines{border-bottom:1px dotted #555;height:26px;margin:2px 18px}
.a{margin:8px 0}.ex{font-size:13px;color:#444;margin-right:18px}
.pb{page-break-before:always}
@media print{body{margin:14mm}}
</style></head><body>
<h1>${esc(exam.title)}</h1>
<div class="meta"><span>اسم الطالب: ....................................</span><span>العلامة: ........ / ${exam.questions.length}</span></div>
${qs}${ans}
<script>window.onload=()=>setTimeout(()=>window.print(),300)</script>
</body></html>`;
}
