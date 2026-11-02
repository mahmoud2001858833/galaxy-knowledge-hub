// The virtual room map. Objects the camera sees are placed in metres around the user
// (x = east, y = north) from the compass heading at capture time, the object's position in the
// frame, and its distance. Steps move the user; later sightings refine positions, objects that
// should be visible but are not fade out. Guidance is computed from the map, so it stays instant
// while the slower AI keeps the map up to date.

import { angleDiff, norm360 } from './sensors';

const RAD = Math.PI / 180;

export type Kind =
  | 'door' | 'doorway' | 'window' | 'stairs' | 'wall' | 'chair' | 'table' | 'desk' | 'sofa' | 'bed'
  | 'closet' | 'shelf' | 'fridge' | 'stove' | 'counter' | 'sink' | 'toilet' | 'shower' | 'tv'
  | 'computer' | 'plant' | 'lamp' | 'person' | 'pet' | 'bag' | 'box' | 'bin' | 'rug' | 'step'
  | 'pillar' | 'car' | 'elevator' | 'other';

export type MapObject = {
  id: number;
  kind: Kind;
  label: string;
  x: number;
  y: number;
  conf: number;
  seen: number;
  lastSeen: number;
  obstacle: boolean;
  fromAI: boolean;
};

export type Observation = {
  kind: Kind;
  label: string;
  bearing: number; // absolute compass bearing from the camera
  distance: number; // metres
  obstacle: boolean;
  fromAI: boolean;
};

export type CapturePose = { x: number; y: number; heading: number; pitchDown: number | null; hfov: number; vfov: number };

export const STEP_M = 0.65;
const DYNAMIC: Kind[] = ['person', 'pet'];
const STRUCTURAL: Kind[] = ['door', 'doorway', 'window', 'stairs', 'elevator'];

// ------------------------------------------------------------------ camera geometry

/** Field of view of the frame the browser gives us (main phone camera ≈ 66° on the long side). */
export function cameraFov(videoW: number, videoH: number): { hfov: number; vfov: number } {
  const LONG = 66;
  if (!videoW || !videoH) return { hfov: 50, vfov: 66 };
  const shortFov = (2 * Math.atan(Math.tan((LONG / 2) * RAD) * (Math.min(videoW, videoH) / Math.max(videoW, videoH)))) / RAD;
  return videoW >= videoH ? { hfov: LONG, vfov: shortFov } : { hfov: shortFov, vfov: LONG };
}

/** Bearing offset (deg, + = right) of a horizontal frame position 0..1. */
export function offsetFromX(x: number, hfov: number) {
  return Math.atan((x - 0.5) * 2 * Math.tan((hfov / 2) * RAD)) / RAD;
}

/** Distance to the floor point at frame height y (0 top .. 1 bottom); phone ≈ 1.3 m above the floor. */
export function groundDistance(y: number, pitchDown: number | null, vfov: number, camH = 1.3): number | null {
  if (pitchDown == null || y > 0.98) return null; // bottom cut off: the real foot point is lower
  const below = pitchDown + Math.atan((y - 0.5) * 2 * Math.tan((vfov / 2) * RAD)) / RAD;
  if (below < 5) return null;
  return camH / Math.tan(below * RAD);
}

// ------------------------------------------------------------------ labels & matching

const KIND_WORDS: Record<Kind, { ar: string; en: string; rx: RegExp }> = {
  door: { ar: 'الباب', en: 'the door', rx: /باب|بوابة|بوابه|مدخل|مخرج|door|gate|entrance|exit/i },
  doorway: { ar: 'الممر المفتوح', en: 'the opening', rx: /ممر|فتحة|فتحه|مدخل مفتوح|doorway|opening|hall|corridor/i },
  window: { ar: 'النافذة', en: 'the window', rx: /نافذ|شباك|شبابيك|window/i },
  stairs: { ar: 'الدرج', en: 'the stairs', rx: /درج|سلم|سلالم|stair/i },
  wall: { ar: 'الجدار', en: 'the wall', rx: /جدار|حائط|حيط|wall/i },
  chair: { ar: 'الكرسي', en: 'the chair', rx: /كرسي|كراسي|مقعد|chair|seat|stool/i },
  table: { ar: 'الطاولة', en: 'the table', rx: /طاول|طابل|سفر|table/i },
  desk: { ar: 'المكتب', en: 'the desk', rx: /مكتب|desk/i },
  sofa: { ar: 'الكنبة', en: 'the sofa', rx: /كنب|أريك|اريك|صوف|sofa|couch/i },
  bed: { ar: 'السرير', en: 'the bed', rx: /سرير|تخت|bed/i },
  closet: { ar: 'الخزانة', en: 'the closet', rx: /خزان|دولاب|كبت|closet|wardrobe|cabinet|cupboard/i },
  shelf: { ar: 'الرف', en: 'the shelf', rx: /رف|مكتبة|shelf|bookcase/i },
  fridge: { ar: 'الثلاجة', en: 'the fridge', rx: /ثلاج|براد|فريزر|fridge|refrigerator/i },
  stove: { ar: 'الفرن', en: 'the stove', rx: /فرن|غاز|موقد|بوتاجاز|stove|oven|cooker/i },
  counter: { ar: 'سطح المطبخ', en: 'the counter', rx: /رخام|سطح|كاونتر|مطبخ|counter|kitchen/i },
  sink: { ar: 'المغسلة', en: 'the sink', rx: /مغسل|حوض|مجلى|sink|basin/i },
  toilet: { ar: 'المرحاض', en: 'the toilet', rx: /مرحاض|تواليت|حمام|toilet|wc/i },
  shower: { ar: 'الدش', en: 'the shower', rx: /دش|دوش|بانيو|shower|bath/i },
  tv: { ar: 'التلفاز', en: 'the TV', rx: /تلفز|تلفاز|شاشة|شاشه|tv|television|screen/i },
  computer: { ar: 'الكمبيوتر', en: 'the computer', rx: /كمبيوتر|حاسوب|لابتوب|لاب توب|computer|laptop|pc/i },
  plant: { ar: 'النبتة', en: 'the plant', rx: /نبت|زرع|شجر|ورد|أصيص|plant|tree|flower/i },
  lamp: { ar: 'المصباح', en: 'the lamp', rx: /مصباح|لمبة|لمبه|أباجور|اباجور|lamp|light/i },
  person: { ar: 'الشخص', en: 'the person', rx: /شخص|رجل|امرأة|ولد|بنت|person|man|woman|people/i },
  pet: { ar: 'الحيوان', en: 'the pet', rx: /قط|كلب|حيوان|cat|dog|pet/i },
  bag: { ar: 'الحقيبة', en: 'the bag', rx: /حقيب|شنط|bag|suitcase|backpack/i },
  box: { ar: 'الصندوق', en: 'the box', rx: /صندوق|كرتون|box/i },
  bin: { ar: 'سلة المهملات', en: 'the bin', rx: /سلة|زبال|مهملات|bin|trash/i },
  rug: { ar: 'السجادة', en: 'the rug', rx: /سجاد|بساط|rug|carpet/i },
  step: { ar: 'العتبة', en: 'the step', rx: /عتبة|عتبه|درجة|step|curb/i },
  pillar: { ar: 'العمود', en: 'the pillar', rx: /عمود|pillar|column|pole/i },
  car: { ar: 'السيارة', en: 'the car', rx: /سيار|عربي|car|vehicle/i },
  elevator: { ar: 'المصعد', en: 'the elevator', rx: /مصعد|اسانسير|أسانسير|elevator|lift/i },
  other: { ar: 'الشيء', en: 'the object', rx: /$^/ },
};

const COCO_KIND: Record<string, { kind: Kind; height: number }> = {
  person: { kind: 'person', height: 1.65 },
  chair: { kind: 'chair', height: 0.9 },
  couch: { kind: 'sofa', height: 0.85 },
  bed: { kind: 'bed', height: 0.6 },
  'dining table': { kind: 'table', height: 0.75 },
  tv: { kind: 'tv', height: 0.6 },
  laptop: { kind: 'computer', height: 0.25 },
  refrigerator: { kind: 'fridge', height: 1.75 },
  oven: { kind: 'stove', height: 0.85 },
  sink: { kind: 'sink', height: 0.25 },
  toilet: { kind: 'toilet', height: 0.75 },
  'potted plant': { kind: 'plant', height: 0.6 },
  bench: { kind: 'chair', height: 0.8 },
  dog: { kind: 'pet', height: 0.5 },
  cat: { kind: 'pet', height: 0.3 },
  suitcase: { kind: 'bag', height: 0.6 },
  backpack: { kind: 'bag', height: 0.45 },
  car: { kind: 'car', height: 1.5 },
  bicycle: { kind: 'other', height: 1.0 },
};

export function cocoToKind(label: string) { return COCO_KIND[label] ?? null; }

export function kindWord(kind: Kind, lang: string) {
  return lang === 'ar' ? KIND_WORDS[kind].ar : KIND_WORDS[kind].en;
}

export function kindFromText(text: string): Kind | null {
  // generic words last: "خزانة جدارية" is a closet, "باب الشرفة" a door
  const order = (Object.keys(KIND_WORDS) as Kind[]).filter((k) => !['other', 'wall', 'counter', 'lamp'].includes(k));
  for (const k of [...order, 'counter', 'lamp', 'wall'] as Kind[]) if (KIND_WORDS[k].rx.test(text)) return k;
  return null;
}

export const asKind = (k: unknown): Kind => (typeof k === 'string' && k in KIND_WORDS ? (k as Kind) : 'other');

const normAr = (s: string) =>
  s.toLowerCase()
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[ًٌٍَُِّْـ]/g, '')
    .replace(/(^|\s)(ال|the\s)/g, '$1').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();

// ------------------------------------------------------------------ the map

let nextId = 1;

export class WorldMap {
  x = 0;
  y = 0;
  heading = 0;
  objects: MapObject[] = [];
  place = '';
  trail: { x: number; y: number }[] = [{ x: 0, y: 0 }];
  steps = 0;

  reset() {
    this.objects = [];
    this.place = '';
    this.trail = [{ x: this.x, y: this.y }];
  }

  pose(hfov: number, vfov: number, pitchDown: number | null): CapturePose {
    return { x: this.x, y: this.y, heading: this.heading, pitchDown, hfov, vfov };
  }

  step(len = STEP_M) {
    this.x += Math.sin(this.heading * RAD) * len;
    this.y += Math.cos(this.heading * RAD) * len;
    this.steps += 1;
    const last = this.trail[this.trail.length - 1];
    if (Math.hypot(this.x - last.x, this.y - last.y) > 0.4) {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 200) this.trail.shift();
    }
  }

  /**
   * Add what one frame showed. `full` = the AI listed everything it saw, so known objects inside
   * the view that were not listed lose confidence (they moved or were wrong).
   * Returns objects that are new on the map.
   */
  observe(pose: CapturePose, obs: Observation[], full: boolean): MapObject[] {
    const now = Date.now();
    const added: MapObject[] = [];
    const matched = new Set<number>();
    const corr: { dx: number; dy: number }[] = [];

    for (const o of obs) {
      const d = Math.max(0.3, Math.min(12, o.distance));
      const px = pose.x + Math.sin(o.bearing * RAD) * d;
      const py = pose.y + Math.cos(o.bearing * RAD) * d;
      const tol = Math.max(0.9, 0.3 * d);
      let best: MapObject | null = null;
      let bestD = Infinity;
      const sameName = normAr(o.label);
      for (const m of this.objects) {
        if (matched.has(m.id) || m.kind !== o.kind) continue;
        const dd = Math.hypot(m.x - px, m.y - py);
        // the AI's distance is the weakest number: the same name nearby is the same object
        const limit = sameName && normAr(m.label) === sameName ? Math.max(1.8, 0.5 * d) : tol;
        if (dd < limit && dd < bestD) { best = m; bestD = dd; }
      }
      const w = (o.fromAI ? 1 : 0.5) / (1 + 0.25 * d);
      if (best) {
        matched.add(best.id);
        // well-known landmarks also correct where we think the user is (drift from step counting)
        if (o.fromAI && best.seen >= 3 && !DYNAMIC.includes(best.kind)) corr.push({ dx: best.x - px, dy: best.y - py });
        const total = best.conf + w;
        best.x = (best.x * best.conf + px * w) / total;
        best.y = (best.y * best.conf + py * w) / total;
        best.conf = Math.min(6, total);
        best.seen += 1;
        best.lastSeen = now;
        if (o.fromAI) { best.label = o.label || best.label; best.fromAI = true; best.obstacle = o.obstacle; }
      } else {
        const m: MapObject = {
          id: nextId++, kind: o.kind, label: o.label, x: px, y: py, conf: w + 0.5, seen: 1, lastSeen: now,
          obstacle: o.obstacle, fromAI: o.fromAI,
        };
        this.objects.push(m);
        matched.add(m.id);
        added.push(m);
      }
    }

    if (corr.length) {
      const dx = corr.reduce((s, c) => s + c.dx, 0) / corr.length;
      const dy = corr.reduce((s, c) => s + c.dy, 0) / corr.length;
      if (Math.hypot(dx, dy) < 1.5) { this.x += dx * 0.25; this.y += dy * 0.25; }
    }

    if (full) {
      for (const m of this.objects) {
        if (matched.has(m.id)) continue;
        const dist = Math.hypot(m.x - pose.x, m.y - pose.y);
        const rel = angleDiff(Math.atan2(m.x - pose.x, m.y - pose.y) / RAD, pose.heading);
        if (dist < 4 && Math.abs(rel) < pose.hfov / 2 - 6) m.conf -= 0.6;
      }
    }
    // people move: forget them quickly; anything that lost all confidence goes
    this.objects = this.objects.filter((m) => m.conf > 0 && !(DYNAMIC.includes(m.kind) && now - m.lastSeen > 5000));
    return added;
  }

  rel(m: { x: number; y: number }) {
    const dx = m.x - this.x;
    const dy = m.y - this.y;
    const dist = Math.hypot(dx, dy);
    const bearing = norm360(Math.atan2(dx, dy) / RAD);
    const rel = angleDiff(bearing, this.heading);
    return { dist, rel, clock: clockOf(rel) };
  }

  /** Best map object for what the user asked for ("الكرسي الأحمر", "the door", a kind). */
  find(query: string, kind?: Kind | null): MapObject | null {
    const q = normAr(query);
    const tokens = q.split(' ').filter((t) => t.length > 1);
    const k = kind ?? kindFromText(query);
    let best: MapObject | null = null;
    let bestScore = 0;
    for (const m of this.objects) {
      if (DYNAMIC.includes(m.kind) && k !== m.kind) continue;
      const label = normAr(m.label);
      let s = 0;
      if (k && m.kind === k) s += 3;
      for (const t of tokens) if (label.includes(t)) s += 2;
      if (s === 0) continue;
      s += Math.min(2, m.seen / 3) - this.rel(m).dist * 0.05;
      if (s > bestScore) { bestScore = s; best = m; }
    }
    return best;
  }

  /** Obstacles on the straight line to the target (or straight ahead when no target). */
  blockers(target: MapObject | null, range = 3): { m: MapObject; along: number; side: number }[] {
    const dir = target ? Math.atan2(target.x - this.x, target.y - this.y) : this.heading * RAD;
    const limit = target ? Math.min(range, this.rel(target).dist - 0.4) : range;
    const ux = Math.sin(dir), uy = Math.cos(dir);
    const out: { m: MapObject; along: number; side: number }[] = [];
    for (const m of this.objects) {
      if (m === target || !m.obstacle || STRUCTURAL.includes(m.kind)) continue;
      const dx = m.x - this.x, dy = m.y - this.y;
      const along = dx * ux + dy * uy;
      const side = dx * uy - dy * ux; // + = right of the line
      if (along > 0.2 && along < limit && Math.abs(side) < 0.6) out.push({ m, along, side });
    }
    return out.sort((a, b) => a.along - b.along);
  }

  /** Known objects sorted by importance for a spoken overview (one per name). */
  highlights(max = 6): MapObject[] {
    const score = (m: MapObject) =>
      (STRUCTURAL.includes(m.kind) ? 3 : 0) + (m.fromAI ? 1 : 0) + Math.min(2, m.seen / 2) - this.rel(m).dist * 0.15;
    const names = new Set<string>();
    return this.objects
      .filter((m) => !DYNAMIC.includes(m.kind))
      .sort((a, b) => score(b) - score(a))
      .filter((m) => { const n = normAr(m.label); if (names.has(n)) return false; names.add(n); return true; })
      .slice(0, max);
  }
}

export function clockOf(rel: number) {
  const c = Math.round(norm360(rel) / 30) % 12;
  return c === 0 ? 12 : c;
}

// ------------------------------------------------------------------ spoken phrases

const AR_NUM = ['', 'خطوة واحدة', 'خطوتين', '3 خطوات', '4 خطوات', '5 خطوات', '6 خطوات', '7 خطوات', '8 خطوات', '9 خطوات', '10 خطوات'];

export function stepsText(m: number, lang: string) {
  const n = Math.max(1, Math.round(m / STEP_M));
  if (lang === 'ar') return n <= 10 ? AR_NUM[n] : `${n} خطوة`;
  return n === 1 ? 'one step' : `${n} steps`;
}

export function directionText(rel: number, lang: string) {
  const a = Math.abs(rel);
  if (lang === 'ar') {
    if (a <= 20) return 'أمامك';
    if (a >= 150) return 'خلفك';
    if (a < 60) return rel > 0 ? 'أمامك إلى اليمين' : 'أمامك إلى اليسار';
    if (a <= 120) return rel > 0 ? 'على يمينك' : 'على يسارك';
    return rel > 0 ? 'خلفك إلى اليمين' : 'خلفك إلى اليسار';
  }
  if (a <= 20) return 'ahead of you';
  if (a >= 150) return 'behind you';
  if (a < 60) return rel > 0 ? 'ahead to your right' : 'ahead to your left';
  if (a <= 120) return rel > 0 ? 'on your right' : 'on your left';
  return rel > 0 ? 'behind you to the right' : 'behind you to the left';
}

export function describeObject(map: WorldMap, m: MapObject, lang: string) {
  const r = map.rel(m);
  const name = m.label || kindWord(m.kind, lang);
  return lang === 'ar'
    ? `${name} ${directionText(r.rel, lang)}، على بعد ${stepsText(r.dist, lang)}، عند الساعة ${r.clock}`
    : `${name} ${directionText(r.rel, lang)}, ${stepsText(r.dist, lang)} away, at ${r.clock} o'clock`;
}

/** What lies in a given direction (relative degrees), nearest first. */
export function objectsToward(map: WorldMap, rel: number, halfWidth = 20, maxDist = 8): MapObject[] {
  return map.objects
    .filter((m) => !DYNAMIC.includes(m.kind))
    .map((m) => ({ m, r: map.rel(m) }))
    .filter(({ r }) => Math.abs(angleDiff(r.rel, rel)) <= halfWidth && r.dist <= maxDist)
    .sort((a, b) => a.r.dist - b.r.dist)
    .map(({ m }) => m);
}

/**
 * Spoken overview grouped by side, e.g. "أمامك: الكنبة على بعد 3 خطوات، والطاولة. على يمينك: الباب…".
 */
export function summaryText(map: WorldMap, lang: string, max = 7) {
  const ar = lang === 'ar';
  const items = map.highlights(max);
  if (!items.length) {
    return ar ? 'لم أتعرف على أشياء حولك بعد. قل امسح ثم استدر ببطء.' : "I haven't mapped anything yet. Say scan and turn slowly.";
  }
  const sides: { name: string; test: (r: number) => boolean }[] = ar
    ? [
        { name: 'أمامك', test: (r) => Math.abs(r) <= 45 },
        { name: 'على يمينك', test: (r) => r > 45 && r < 135 },
        { name: 'خلفك', test: (r) => Math.abs(r) >= 135 },
        { name: 'على يسارك', test: (r) => r < -45 && r > -135 },
      ]
    : [
        { name: 'Ahead', test: (r) => Math.abs(r) <= 45 },
        { name: 'On your right', test: (r) => r > 45 && r < 135 },
        { name: 'Behind you', test: (r) => Math.abs(r) >= 135 },
        { name: 'On your left', test: (r) => r < -45 && r > -135 },
      ];
  const parts: string[] = [];
  for (const side of sides) {
    const here = items.filter((m) => side.test(map.rel(m).rel)).sort((a, b) => map.rel(a).dist - map.rel(b).dist);
    if (!here.length) continue;
    const list = here.map((m, i) => {
      const steps = stepsText(map.rel(m).dist, lang);
      return i === 0 ? (ar ? `${m.label} على بعد ${steps}` : `${m.label}, ${steps} away`) : (ar ? `و${m.label} على بعد ${steps}` : `and ${m.label}, ${steps}`);
    });
    parts.push(`${side.name}: ${list.join(ar ? '، ' : ', ')}.`);
  }
  const head = map.place ? (ar ? `أنت في ${map.place}. ` : `You are in ${map.place}. `) : '';
  return head + parts.join(' ');
}

export type Instruction = {
  /** what kind of instruction, used to decide when to speak again */
  key: 'arrived' | 'behind' | 'turn-left' | 'turn-right' | 'slight-left' | 'slight-right' | 'forward' | 'blocked';
  text: string;
  dist: number;
  rel: number;
  arrived: boolean;
};

/** Next instruction toward a map object (turn first, then walk, going around known obstacles). */
export function guidanceTo(map: WorldMap, t: MapObject, lang: string): Instruction {
  const { dist, rel, clock } = map.rel(t);
  const name = t.label || kindWord(t.kind, lang);
  const ar = lang === 'ar';
  const base = { dist, rel, arrived: false };
  if (dist < 0.9) {
    return { ...base, key: 'arrived', arrived: true, text: ar ? `وصلت. ${name} ${directionText(rel, lang)}، مدّ يدك.` : `You have arrived. ${name} is ${directionText(rel, lang)}.` };
  }
  if (Math.abs(rel) >= 135) {
    return { ...base, key: 'behind', text: ar ? `${name} خلفك. استدر ببطء إلى ${rel > 0 ? 'اليمين' : 'اليسار'} حتى أقول لك قف.` : `${name} is behind you. Turn slowly to your ${rel > 0 ? 'right' : 'left'} until I say stop.` };
  }
  if (Math.abs(rel) > 35) {
    return { ...base, key: rel > 0 ? 'turn-right' : 'turn-left', text: ar ? `استدر إلى ${rel > 0 ? 'اليمين' : 'اليسار'}. ${name} عند الساعة ${clock}.` : `Turn ${rel > 0 ? 'right' : 'left'}. ${name} is at ${clock} o'clock.` };
  }
  const blocker = map.blockers(t)[0];
  if (blocker && blocker.along < 2.2) {
    const bname = blocker.m.label || kindWord(blocker.m.kind, lang);
    const go = blocker.side >= 0 ? (ar ? 'اليسار' : 'left') : (ar ? 'اليمين' : 'right');
    return { ...base, key: 'blocked', text: ar ? `انتبه، ${bname} في طريقك بعد ${stepsText(blocker.along, lang)}. التفّ من ${go}.` : `Careful, ${bname} is in your way in ${stepsText(blocker.along, lang)}. Go around on the ${go}.` };
  }
  if (Math.abs(rel) > 15) {
    return { ...base, key: rel > 0 ? 'slight-right' : 'slight-left', text: ar ? `قليلاً إلى ${rel > 0 ? 'اليمين' : 'اليسار'}، ثم تقدم ${stepsText(dist, lang)}.` : `A little to the ${rel > 0 ? 'right' : 'left'}, then ${stepsText(dist, lang)}.` };
  }
  return { ...base, key: 'forward', text: ar ? `تقدم للأمام، ${name} بعد ${stepsText(dist, lang)}.` : `Walk forward, ${name} in ${stepsText(dist, lang)}.` };
}
