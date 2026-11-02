// Turns what the camera saw (AI room mapping or the on-device detector) into map observations,
// using the pose the phone had when the frame was taken.

import type { DetectedObject } from '../localDetector';
import { labelToArabic } from '../localDetector';
import {
  asKind, cocoToKind, groundDistance, kindFromText, kindWord, offsetFromX,
  type CapturePose, type Kind, type Observation,
} from './worldMap';

const RAD = Math.PI / 180;

type AIMapObject = { kind?: string; label?: string; x0?: number; x1?: number; y1?: number; distance_m?: number; obstacle?: boolean };
type AIPointObject = { x?: number; y?: number; w?: number; h?: number; label?: string; proximity?: number; hazard?: string; distance_hint?: string };

const clamp01 = (n: unknown, d = 0.5) => (typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : d);

/** "حوالي مترين" / "2.5 m" / "3 خطوات" -> metres */
function parseDistanceHint(s?: string): number | null {
  if (!s) return null;
  const t = s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
  if (/مترين/.test(t)) return 2;
  if (/خطوتين/.test(t)) return 1.3;
  if (/(متر واحد|^متر|نصف متر)/.test(t)) return /نصف/.test(t) ? 0.5 : 1;
  const m = t.match(/(\d+(?:[.,]\d+)?)/);
  if (!m) return null;
  const n = parseFloat(m[1].replace(',', '.'));
  return /خطو|step/i.test(t) ? n * 0.65 : n;
}

/**
 * Both the room-mapping reply ({place, objects:[{kind,x0,x1,y1,distance_m}]}) and the older
 * obstacle reply ({objects:[{x,y,w,h,label,proximity}]}) are accepted, so this works before and
 * after the vision function is updated.
 */
export function aiToObservations(data: any, pose: CapturePose, lang: string): { obs: Observation[]; place: string } {
  const list: unknown[] = Array.isArray(data?.objects) ? data.objects : [];
  const obs: Observation[] = [];
  for (const raw of list.slice(0, 14)) {
    const o = raw as AIMapObject & AIPointObject;
    let kind: Kind;
    let cx: number;
    let y1: number;
    let dist: number | null;
    if (typeof o.x0 === 'number' && typeof o.x1 === 'number') {
      kind = asKind(o.kind);
      if (kind === 'other') kind = kindFromText(o.label ?? '') ?? 'other';
      cx = (clamp01(o.x0, 0.4) + clamp01(o.x1, 0.6)) / 2;
      y1 = clamp01(o.y1, 0.8);
      dist = typeof o.distance_m === 'number' && o.distance_m > 0 ? o.distance_m : null;
    } else {
      kind = kindFromText(o.label ?? '') ?? 'other';
      const w = clamp01(o.w, 0.2);
      const x = clamp01(o.x, 0.5);
      // older replies give either the left edge or the centre; treat values that leave the frame as centres
      cx = x + w / 2 <= 1 ? x + w / 2 : x;
      y1 = Math.min(1, clamp01(o.y, 0.5) + clamp01(o.h, 0.2) / 2);
      dist = parseDistanceHint(o.distance_hint) ?? (typeof o.proximity === 'number' ? Math.max(0.5, 6 - o.proximity / 18) : null);
    }
    const geo = groundDistance(y1, pose.pitchDown, pose.vfov);
    if (dist == null) dist = geo ?? 2.5;
    else if (geo != null && geo < 8) dist = dist * 0.65 + geo * 0.35;
    const label = (o.label ?? '').toString().slice(0, 40) || kindWord(kind, lang).replace(/^(ال|the )/, '');
    obs.push({
      kind,
      label,
      bearing: pose.heading + offsetFromX(cx, pose.hfov),
      distance: dist,
      obstacle: typeof o.obstacle === 'boolean' ? o.obstacle : !['window', 'wall', 'door', 'doorway', 'tv', 'lamp'].includes(kind),
      fromAI: true,
    });
  }
  const place = typeof data?.place === 'string' ? data.place.slice(0, 40) : '';
  return { obs, place };
}

/** Distance to a detector box: from the object's typical height and from where it meets the floor. */
export function cocoDistance(o: DetectedObject, pose: CapturePose): number | null {
  const k = cocoToKind(o.label);
  if (!k) return null;
  const y1 = o.y + o.h;
  const angH = o.h * pose.vfov * RAD;
  const byHeight = o.y > 0.02 && y1 < 0.98 ? k.height / (2 * Math.tan(Math.max(0.02, angH) / 2)) : null;
  const byFloor = groundDistance(y1, pose.pitchDown, pose.vfov);
  if (byFloor != null && byHeight != null) return (byFloor + byHeight) / 2;
  if (byFloor != null || byHeight != null) return byFloor ?? byHeight;
  // cut off at the bottom and top: it fills the view, so it is very close
  return o.h > 0.85 ? 0.6 : null;
}

/** On-device COCO-SSD boxes -> observations. */
export function cocoToObservations(objs: DetectedObject[], pose: CapturePose, lang: string): Observation[] {
  const out: Observation[] = [];
  for (const o of objs) {
    const k = cocoToKind(o.label);
    if (!k || o.score < 0.5) continue;
    const cx = o.x + o.w / 2;
    const dist = cocoDistance(o, pose);
    if (dist == null) continue;
    out.push({
      kind: k.kind,
      label: lang === 'ar' ? labelToArabic(o.label) : o.label,
      bearing: pose.heading + offsetFromX(cx, pose.hfov),
      distance: dist,
      obstacle: true,
      fromAI: false,
    });
  }
  return out;
}
