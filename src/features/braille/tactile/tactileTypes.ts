export type PaperSize = "A4" | "A3" | "Letter";

export interface TactileLabel {
  id: string;
  text: string;
  braille: string;
  position: [number, number]; // mm
  leader_to?: [number, number] | null;
}

export interface TactileElement {
  kind: "circle" | "polygon" | "polyline" | "path" | "line" | "point" | "text";
  coords: number[]; // see schema below per kind, in mm
  label_id?: string | null;
  stroke_mm?: number;
  dashed?: boolean;
  fill?: boolean;
  text?: string;
}

export interface TactileLegendEntry {
  id: string;
  text: string;
  braille: string;
  notes?: string;
}

export interface TactileFigure {
  title: string;
  description: string;
  paper: PaperSize;
  width_mm: number;
  height_mm: number;
  elements: TactileElement[];
  labels: TactileLabel[];
  legend: TactileLegendEntry[];
  safety_notes?: string;
}

export interface DescribeResult {
  figure_type: string;
  description: string;
  decoded_labels: { braille: string; text: string }[];
  narration: string;
  sign_keywords?: string[];
}

export const PAPER_DIMS: Record<PaperSize, { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  A3: { w: 297, h: 420 },
  Letter: { w: 216, h: 279 },
};
