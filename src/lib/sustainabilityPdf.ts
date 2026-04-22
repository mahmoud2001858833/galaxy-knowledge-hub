import jsPDF from "jspdf";

export interface PdfSection {
  title: string;
  rows: Array<[string, string | number]>;
}

export interface PdfReportInput {
  title: string;
  subtitle?: string;
  headlineMetric?: { label: string; value: string };
  sections: PdfSection[];
  recommendations?: string[];
  comparison?: Array<{ label: string; value: number; unit?: string }>;
  footer?: string;
}

/**
 * Generates a clean A4 PDF report. Arabic glyphs use a transliteration-friendly
 * fallback (English labels + numeric values) to ensure jsPDF default fonts render correctly.
 * Pass already-prepared English/Arabic-Latin labels in input for best results.
 */
export function generateSustainabilityPdf(input: PdfReportInput, fileName: string) {
  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  const ensureSpace = (h: number) => {
    if (y + h > pageH - margin) {
      pdf.addPage();
      y = margin;
    }
  };

  // Header band
  pdf.setFillColor(16, 185, 129);
  pdf.rect(0, 0, pageW, 28, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.text(input.title, margin, 14);
  if (input.subtitle) {
    pdf.setFontSize(10);
    pdf.text(input.subtitle, margin, 22);
  }
  y = 38;

  pdf.setTextColor(20, 20, 20);

  if (input.headlineMetric) {
    pdf.setFillColor(240, 253, 244);
    pdf.roundedRect(margin, y, pageW - margin * 2, 22, 3, 3, "F");
    pdf.setFontSize(11);
    pdf.setTextColor(75, 85, 99);
    pdf.text(input.headlineMetric.label, margin + 4, y + 8);
    pdf.setFontSize(20);
    pdf.setTextColor(16, 185, 129);
    pdf.text(input.headlineMetric.value, margin + 4, y + 17);
    pdf.setTextColor(20, 20, 20);
    y += 30;
  }

  for (const section of input.sections) {
    ensureSpace(14);
    pdf.setFillColor(243, 244, 246);
    pdf.rect(margin, y, pageW - margin * 2, 8, "F");
    pdf.setFontSize(12);
    pdf.setTextColor(31, 41, 55);
    pdf.text(section.title, margin + 2, y + 6);
    y += 12;

    pdf.setFontSize(10);
    for (const [k, v] of section.rows) {
      ensureSpace(7);
      pdf.setTextColor(75, 85, 99);
      pdf.text(`${k}:`, margin + 2, y);
      pdf.setTextColor(17, 24, 39);
      pdf.text(String(v), margin + 80, y);
      y += 6;
    }
    y += 3;
  }

  if (input.comparison && input.comparison.length) {
    ensureSpace(14);
    pdf.setFillColor(243, 244, 246);
    pdf.rect(margin, y, pageW - margin * 2, 8, "F");
    pdf.setFontSize(12);
    pdf.setTextColor(31, 41, 55);
    pdf.text("Global Comparison", margin + 2, y + 6);
    y += 12;

    const max = Math.max(...input.comparison.map(c => c.value), 1);
    pdf.setFontSize(9);
    for (const c of input.comparison) {
      ensureSpace(8);
      pdf.setTextColor(55, 65, 81);
      pdf.text(c.label, margin + 2, y + 4);
      const barW = ((pageW - margin * 2 - 70) * c.value) / max;
      pdf.setFillColor(59, 130, 246);
      pdf.rect(margin + 60, y + 1, barW, 4, "F");
      pdf.text(`${c.value.toFixed(2)} ${c.unit ?? ""}`, pageW - margin - 28, y + 4);
      y += 7;
    }
    y += 4;
  }

  if (input.recommendations && input.recommendations.length) {
    ensureSpace(14);
    pdf.setFillColor(254, 249, 195);
    pdf.rect(margin, y, pageW - margin * 2, 8, "F");
    pdf.setFontSize(12);
    pdf.setTextColor(120, 53, 15);
    pdf.text("Recommendations", margin + 2, y + 6);
    y += 12;
    pdf.setFontSize(10);
    pdf.setTextColor(31, 41, 55);
    input.recommendations.forEach((r, i) => {
      const lines = pdf.splitTextToSize(`${i + 1}. ${r}`, pageW - margin * 2 - 4);
      ensureSpace(lines.length * 5 + 2);
      pdf.text(lines, margin + 2, y);
      y += lines.length * 5 + 2;
    });
  }

  // Footer
  const total = pdf.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(120, 120, 120);
    pdf.text(
      input.footer || `Generated ${new Date().toLocaleString()}`,
      margin,
      pageH - 8
    );
    pdf.text(`${i} / ${total}`, pageW - margin - 10, pageH - 8);
  }

  pdf.save(fileName);
}

// Global per-capita CO2 averages (tons/year) — Source: World Bank / Our World in Data
export const GLOBAL_CO2_BENCHMARKS = [
  { label: "World Average", value: 4.7, unit: "t CO2/yr" },
  { label: "EU Average", value: 6.2, unit: "t CO2/yr" },
  { label: "USA Average", value: 14.4, unit: "t CO2/yr" },
  { label: "Jordan Average", value: 3.1, unit: "t CO2/yr" },
  { label: "Paris Goal 2030", value: 2.0, unit: "t CO2/yr" },
];
