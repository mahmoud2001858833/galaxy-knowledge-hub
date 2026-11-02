// Turn-by-turn walking navigation using public OSRM.
// Provides step-by-step Arabic instructions for outdoor destinations.

import { haversine, type LatLng } from './geo';

export type RouteStep = {
  location: LatLng;          // maneuver point
  distance: number;          // meters of THIS step
  instruction: string;       // arabic instruction
  type: string;              // maneuver.type
  modifier?: string;         // maneuver.modifier
  name?: string;             // street name
};

export type Route = {
  totalDistance: number;     // meters
  totalDuration: number;     // seconds
  steps: RouteStep[];
};

const MODIFIER_AR: Record<string, string> = {
  'left': 'يساراً',
  'right': 'يميناً',
  'slight left': 'يساراً قليلاً',
  'slight right': 'يميناً قليلاً',
  'sharp left': 'يساراً حاداً',
  'sharp right': 'يميناً حاداً',
  'straight': 'مباشرة',
  'uturn': 'استدر للخلف',
};

/** What to do AT the maneuver point (said when the user reaches it, or ahead of it with "بعد X متر"). */
function maneuverToAr(type: string, modifier: string | undefined, name: string | undefined): string {
  const street = name && name.trim() ? ` إلى ${name}` : '';
  const mod = modifier ? (MODIFIER_AR[modifier] || modifier) : '';
  switch (type) {
    case 'depart':       return `ابدأ السير${name && name.trim() ? ` في ${name}` : ''}`;
    case 'arrive':       return `وصلت إلى وجهتك`;
    case 'turn':         return modifier === 'uturn' ? 'استدر للخلف' : `انعطف ${mod}${street}`;
    case 'new name':     return `استمر${street}`;
    case 'continue':     return `استمر ${mod || 'مباشرة'}${street}`;
    case 'merge':        return `اندمج ${mod}${street}`;
    case 'on ramp':      return `اسلك المنحدر ${mod}${street}`;
    case 'off ramp':     return `اخرج من المنحدر ${mod}${street}`;
    case 'fork':         return `عند التفرع، خذ ${mod}${street}`;
    case 'roundabout':
    case 'rotary':       return `عند الدوار، تابع ${mod || ''}${street}`;
    case 'roundabout turn': return `عند الدوار، انعطف ${mod}${street}`;
    case 'end of road':  return `في نهاية الطريق انعطف ${mod}${street}`;
    default:             return `${mod || 'استمر'}${street}`;
  }
}

const distAr = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)} كيلومتر` : `${Math.max(5, Math.round(m / 5) * 5)} متر`);

export async function fetchRoute(from: LatLng, to: LatLng): Promise<Route | null> {
  try {
    const url =
      // the public router.project-osrm.org only serves CAR routes whatever the profile says
      `https://routing.openstreetmap.de/routed-foot/route/v1/foot/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}` +
      `?steps=true&overview=false&alternatives=false`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const j = await r.json();
    const route = j?.routes?.[0];
    if (!route) return null;
    const leg = route.legs?.[0];
    if (!leg) return null;
    const steps: RouteStep[] = (leg.steps || []).map((s: any) => {
      const loc: LatLng = {
        lat: s.maneuver?.location?.[1] ?? to.lat,
        lng: s.maneuver?.location?.[0] ?? to.lng,
      };
      return {
        location: loc,
        distance: s.distance ?? 0,
        instruction: maneuverToAr(s.maneuver?.type ?? 'continue', s.maneuver?.modifier, s.name),
        type: s.maneuver?.type ?? 'continue',
        modifier: s.maneuver?.modifier,
        name: s.name,
      };
    });
    return {
      totalDistance: route.distance ?? 0,
      totalDuration: route.duration ?? 0,
      steps,
    };
  } catch {
    return null;
  }
}

export type TurnByTurnState = {
  route: Route;
  currentIdx: number;              // next maneuver the user has not reached yet
  lastSpokenDistanceMark: number;  // meters remaining; we announce every 100m
  preAnnounced: number;            // index of the maneuver already announced ahead of time
};

export function makeNavState(route: Route): TurnByTurnState {
  // step 0 is "depart" at the start point: it is spoken when navigation starts
  return { route, currentIdx: Math.min(1, route.steps.length - 1), lastSpokenDistanceMark: Number.POSITIVE_INFINITY, preAnnounced: -1 };
}

/** First sentence when navigation starts: how to begin and what comes first. */
export function firstInstruction(route: Route): string {
  const s0 = route.steps[0];
  const s1 = route.steps[1];
  if (!s0) return '';
  if (!s1 || s1.type === 'arrive') return `${s0.instruction}، الوجهة بعد ${distAr(s0.distance)}`;
  return `${s0.instruction}، وبعد ${distAr(s0.distance)} ${s1.instruction}`;
}

export type NavTick = {
  speak?: string;            // immediate instruction to speak (if any)
  arrived?: boolean;
  remainingMeters: number;
};

/**
 * Call on every GPS update. Returns optional speech and remaining distance.
 * - Says "بعد 40 متر انعطف يميناً" ahead of a maneuver, then "انعطف يميناً" on reaching it.
 * - Phone GPS is often 10-30 m off: the reach radius follows the reported accuracy, and if the user
 *   is already closer to a later maneuver we skip the ones they passed instead of getting stuck.
 */
export function advanceStep(state: TurnByTurnState, userPos: LatLng, accuracy = 15): NavTick {
  const steps = state.route.steps;
  if (state.currentIdx >= steps.length) return { arrived: true, remainingMeters: 0 };

  // skip maneuvers that were passed without coming close enough (look up to 3 ahead)
  let idx = state.currentIdx;
  let d = haversine(userPos, steps[idx].location);
  for (let j = idx + 1; j < Math.min(steps.length, idx + 4); j++) {
    const dj = haversine(userPos, steps[j].location);
    if (dj < d && dj < 60) { idx = j; d = dj; }
  }
  state.currentIdx = idx;
  const target = steps[idx];
  const reach = Math.max(15, Math.min(35, accuracy));

  // remaining = to the next maneuver + the legs after it (step i's distance is the leg AFTER maneuver i)
  let remaining = d;
  for (let i = idx; i < steps.length; i++) remaining += steps[i].distance;

  if (d < reach) {
    state.currentIdx += 1;
    if (target.type === 'arrive' || state.currentIdx >= steps.length) {
      return { speak: target.instruction, arrived: true, remainingMeters: 0 };
    }
    const next = steps[state.currentIdx];
    const tail = next.type === 'arrive' ? `، الوجهة بعد ${distAr(target.distance)}` : `، ثم بعد ${distAr(target.distance)} ${next.instruction}`;
    state.preAnnounced = target.distance < 50 ? state.currentIdx : state.preAnnounced;
    return { speak: target.instruction + tail, remainingMeters: remaining };
  }

  if (d < 45 && state.preAnnounced !== idx && target.type !== 'arrive') {
    state.preAnnounced = idx;
    return { speak: `بعد ${distAr(d)} ${target.instruction}`, remainingMeters: remaining };
  }

  const bucket = Math.floor(remaining / 100) * 100;
  if (bucket < state.lastSpokenDistanceMark && bucket > 0 && remaining < 2000) {
    state.lastSpokenDistanceMark = bucket;
    return { speak: `باقي ${bucket} متر`, remainingMeters: remaining };
  }
  return { remainingMeters: remaining };
}
