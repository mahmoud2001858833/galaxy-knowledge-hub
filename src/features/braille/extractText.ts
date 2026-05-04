// Client-side text extraction from various file types.
// All extraction is local; OCR uses tesseract.js with the page's chosen language.

export type ExtractProgress = (msg: string) => void;

export async function extractFromFile(
  file: File,
  langCode: string,
  onProgress?: ExtractProgress,
): Promise<string> {
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop() || "";

  onProgress?.(`جارٍ استخراج النص من ${file.name}…`);

  if (["txt", "md", "csv", "rtf", "log", "html", "htm", "xml", "json"].includes(ext) || file.type.startsWith("text/")) {
    let txt = await file.text();
    if (ext === "html" || ext === "htm") txt = stripHtml(txt);
    return txt;
  }

  if (ext === "pdf" || file.type === "application/pdf") {
    return await extractPdf(file, onProgress);
  }

  if (ext === "docx") {
    const mammoth = await import("mammoth/mammoth.browser");
    const buf = await file.arrayBuffer();
    const r = await (mammoth as any).extractRawText({ arrayBuffer: buf });
    return r.value || "";
  }

  if (ext === "xlsx" || ext === "xls") {
    const XLSX = await import("xlsx");
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const out: string[] = [];
    for (const sn of wb.SheetNames) {
      out.push(`### ${sn}`);
      out.push(XLSX.utils.sheet_to_csv(wb.Sheets[sn]));
    }
    return out.join("\n");
  }

  if (ext === "pptx") {
    return await extractPptx(file);
  }

  if (file.type.startsWith("image/")) {
    return await extractImage(file, langCode, onProgress);
  }

  throw new Error(`صيغة غير مدعومة: .${ext}`);
}

function stripHtml(html: string): string {
  const noScript = html.replace(/<script[\s\S]*?<\/script>/gi, " ")
                       .replace(/<style[\s\S]*?<\/style>/gi, " ");
  return noScript.replace(/<[^>]+>/g, " ")
                 .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
                 .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
                 .replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

async function extractPdf(file: File, onProgress?: ExtractProgress): Promise<string> {
  const pdfjs: any = await import("pdfjs-dist");
  // Use worker from CDN matching version
  const ver = pdfjs.version || "5.7.284";
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${ver}/build/pdf.worker.min.mjs`;
  const buf = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buf }).promise;
  const out: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    onProgress?.(`PDF — صفحة ${i}/${doc.numPages}`);
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((it: any) => it.str).join(" ");
    out.push(text);
  }
  return out.join("\n\n");
}

async function extractPptx(file: File): Promise<string> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const slideFiles = Object.keys(zip.files)
    .filter(n => /^ppt\/slides\/slide\d+\.xml$/i.test(n))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide(\d+)/)?.[1] || "0", 10);
      const nb = parseInt(b.match(/slide(\d+)/)?.[1] || "0", 10);
      return na - nb;
    });
  const out: string[] = [];
  for (const sf of slideFiles) {
    const xml = await zip.files[sf].async("string");
    // grab text inside <a:t>...</a:t>
    const matches = [...xml.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g)];
    const text = matches.map(m => decodeEntities(m[1])).join(" ");
    if (text.trim()) out.push(text);
  }
  return out.join("\n\n");
}

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
}

async function extractImage(file: File, langCode: string, onProgress?: ExtractProgress): Promise<string> {
  onProgress?.("OCR: تحليل الصورة…");
  const Tesseract = (await import("tesseract.js")).default;
  const tessLang = mapTesseractLang(langCode);
  const url = URL.createObjectURL(file);
  try {
    const r = await Tesseract.recognize(url, tessLang, {
      logger: (m: any) => { if (m?.status && onProgress) onProgress(`OCR: ${m.status} ${(m.progress * 100 | 0)}%`); },
    });
    return r.data.text || "";
  } finally { URL.revokeObjectURL(url); }
}

function mapTesseractLang(code: string): string {
  const base = code.split("-")[0].toLowerCase();
  const map: Record<string, string> = {
    ar: "ara", en: "eng", fr: "fra", es: "spa", de: "deu", it: "ita",
    pt: "por", nl: "nld", ru: "rus", uk: "ukr", pl: "pol", cs: "ces",
    sk: "slk", hu: "hun", ro: "ron", bg: "bul", sr: "srp", hr: "hrv",
    sl: "slv", el: "ell", tr: "tur", he: "heb", fa: "fas", ur: "urd",
    hi: "hin", bn: "ben", th: "tha", vi: "vie", id: "ind", ms: "msa",
    ja: "jpn", ko: "kor", zh: "chi_sim",
  };
  return map[base] || "eng";
}
