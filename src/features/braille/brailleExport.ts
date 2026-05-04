// Export Braille text to .brf and .pdf
import jsPDF from "jspdf";

// Map Unicode Braille character (U+2800 + bits) → ASCII Braille (BRF)
// Standard NABCC ASCII-Braille table for the 64 6-dot cells.
const ASCII_BRAILLE = ' A1B\'K2L@CIF/MSP"E3H9O6R^DJG>NTQ,*5<-U8V.%[$+X!&;:4\\0Z7(_?W]#Y)=';

export function brailleToBrf(braille: string): string {
  let out = "";
  for (const ch of braille) {
    const code = ch.codePointAt(0) || 0;
    if (code >= 0x2800 && code <= 0x283F) {
      // 6-dot cells only
      out += ASCII_BRAILLE[code - 0x2800];
    } else if (code >= 0x2840 && code <= 0x28FF) {
      // 8-dot — fallback to closest 6-dot or keep unicode
      out += ASCII_BRAILLE[(code - 0x2800) & 0x3F] || " ";
    } else if (ch === "\n" || ch === "\r" || ch === " " || ch === "\t") {
      out += ch;
    } else {
      out += ch;
    }
  }
  return out;
}

export function downloadText(content: string, filename: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Render Unicode Braille into a printable PDF.
// Uses a Braille-capable font (DejaVu Sans Mono via CDN data URL on demand)
// — falls back to courier which renders some braille glyphs in modern viewers.
export async function brailleToPdf(braille: string, title = "Braille") {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setFont("courier", "normal");
  doc.setFontSize(20);
  // Header (Latin only)
  doc.text(title, 15, 15);
  doc.setFontSize(14);
  const margin = 15;
  const lineHeight = 8;
  let y = 25;
  const pageHeight = doc.internal.pageSize.getHeight();
  const lines = doc.splitTextToSize(braille, doc.internal.pageSize.getWidth() - margin * 2);
  for (const ln of lines) {
    if (y > pageHeight - margin) { doc.addPage(); y = margin; }
    doc.text(ln, margin, y);
    y += lineHeight;
  }
  doc.save(`${title}.pdf`);
}
