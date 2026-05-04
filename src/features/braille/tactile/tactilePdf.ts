import jsPDF from "jspdf";
import type { TactileFigure } from "./tactileTypes";
import { buildTactileSvg } from "./tactileSvg";

async function svgToPng(svg: string, wMm: number, hMm: number, dpi = 300): Promise<string> {
  const pxPerMm = dpi / 25.4;
  const w = Math.round(wMm * pxPerMm);
  const h = Math.round(hMm * pxPerMm);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function tactileToPdf(fig: TactileFigure, filename = "tactile.pdf") {
  const svg = buildTactileSvg(fig);
  const png = await svgToPng(svg, fig.width_mm, fig.height_mm);
  const orientation = fig.width_mm > fig.height_mm ? "landscape" : "portrait";
  const format = fig.paper === "Letter" ? "letter" : (fig.paper.toLowerCase() as "a4" | "a3");
  const doc = new jsPDF({ unit: "mm", format, orientation });

  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 10;
  const maxW = pw - margin * 2;
  const maxH = ph - margin * 2 - 12;
  const ratio = Math.min(maxW / fig.width_mm, maxH / fig.height_mm);
  const dw = fig.width_mm * ratio;
  const dh = fig.height_mm * ratio;
  const dx = (pw - dw) / 2;
  const dy = margin + 8;

  doc.setFont("courier", "bold");
  doc.setFontSize(14);
  doc.text(fig.title || "Tactile Figure", margin, margin + 4);
  doc.addImage(png, "PNG", dx, dy, dw, dh);

  // Legend page
  if (fig.legend && fig.legend.length) {
    doc.addPage();
    doc.setFont("courier", "bold");
    doc.setFontSize(14);
    doc.text("Legend / المفتاح", margin, margin + 4);
    doc.setFont("courier", "normal");
    doc.setFontSize(11);
    let y = margin + 14;
    for (const e of fig.legend) {
      if (y > ph - margin) { doc.addPage(); y = margin + 4; }
      doc.text(`• ${e.id}: ${e.text}`, margin, y);
      y += 6;
      doc.text(e.braille, margin + 6, y);
      y += 8;
    }
  }

  doc.save(filename);
}

export function legendToBrf(fig: TactileFigure): string {
  return fig.legend.map((e) => `${e.id}: ${e.text}\n${e.braille}`).join("\n\n");
}
