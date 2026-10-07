export interface RecyclingProject {
  name: string; idea: string; materials: string; tools: string; steps: string;
  principle: string; time: string; difficulty: string; safety: string; results: string;
  development: string; sustainability: string; generatedImage?: string;
  category?: string; maintenance?: string; alternatives?: string; qualityCheck?: string;
  materialInventory?: { material: string; massKg: number }[];
}
export const MATERIAL_FACTORS = [
  { id: 'plastic', label: 'بلاستيك', factor: 2.5 },
  { id: 'cardboard', label: 'كرتون / ورق', factor: 0.9 },
  { id: 'aluminum', label: 'ألمنيوم', factor: 8.2 },
  { id: 'steel', label: 'حديد / علب صفيح', factor: 1.8 },
  { id: 'glass', label: 'زجاج', factor: 0.85 },
  { id: 'textile', label: 'قماش', factor: 3.5 },
  { id: 'wood', label: 'خشب', factor: 0.45 },
  { id: 'other', label: 'أخرى / غير معروفة', factor: 0 },
] as const;
export type MaterialId = typeof MATERIAL_FACTORS[number]['id'];
export interface ImpactRow { material: MaterialId; massKg: number }
export interface ImpactInput { rows: ImpactRow[]; replacement: number; processKg: number }
export interface Completion { key: string; name: string; date: string; input: ImpactInput; co2: number; mass: number }
export function calculateProjectImpact(input: ImpactInput) {
  const replacement = Math.max(0, Math.min(100, Number(input.replacement) || 0)) / 100;
  const mass = input.rows.reduce((sum, row) => sum + Math.max(0, Number(row.massKg) || 0), 0);
  const gross = input.rows.reduce((sum, row) => sum + Math.max(0, Number(row.massKg) || 0) * (MATERIAL_FACTORS.find(f => f.id === row.material)?.factor || 0), 0) * replacement;
  const net = gross - Math.max(0, Number(input.processKg) || 0);
  return { mass, gross, net, co2: Math.max(0, net) };
}
export const projectKey = (p: RecyclingProject) => `${p.name.trim()}::${p.idea.trim()}`;
export function initialImpact(p: RecyclingProject): ImpactInput {
  const rows = (p.materialInventory || []).map(r => ({ material: MATERIAL_FACTORS.some(f => f.id === r.material) ? r.material as MaterialId : 'other' as MaterialId, massKg: Math.max(0, Number(r.massKg) || 0) }));
  return { rows: rows.length ? rows : [{ material: 'other', massKg: 0 }], replacement: 50, processKg: 0 };
}
export function readLocal<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
}
export const IMPACT_NOTE = 'تقدير تعليمي، وليس شهادة كربون: الكتلة × معامل إنتاج المادة × نسبة استبدال منتج جديد − انبعاثات التنفيذ. لا تُحتسب فائدة لمجرد إعادة الاستخدام إن لم تُجنّب شراء منتج جديد. المعاملات التقريبية ليست معاملات WARM ولا جرداً محلياً؛ لا تشمل دورة الحياة الكاملة أو النقل أو التخزين الحيوي.';
