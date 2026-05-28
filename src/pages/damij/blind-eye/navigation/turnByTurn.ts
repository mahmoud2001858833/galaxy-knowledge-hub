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

function maneuverToAr(type: string, modifier: string | undefined, name: string | undefined, distance: number): string {
  const street = name && name.trim() ? ` في ${name}` : '';
  const dist = distance >= 1000 ? `${(distance / 1000).toFixed(1)} كم` : `${Math.round(distance)} متر`;
  const mod = modifier ? (MODIFIER_AR[modifier] || modifier) : '';

  switch (type) {
    case 'depart':       return `ابدأ السير${street}، بعد ${dist}`;
    case 'arrive':       return `وصلت إلى وجهتك`;
    case 'turn':         return `بعد ${dist} انعطف ${mod}${street}`;
    case 'new name':     return `استمر${street} لمسافة ${dist}`;
    case 'continue':     return `استمر ${mod || 'مباشرة'}${street} لمسافة ${dist}`;
    case 'merge':        return `اندمج ${mod}${street}`;
    case 'on ramp':      return `اسلك المنحدر ${mod}${street}`;
    case 'off ramp':     return `اخرج من المنحدر ${mod}${street}`;
    case 'fork':         return `عند التفرع، خذ ${mod}${street}`;
    case 'roundabout':
    case 'rotary':       return `ادخل الدوار واخرج ${mod || ''}${street}`;
    case 'roundabout turn': return `في الدوار، انعطف ${mod}${street}`;
    case 'end of road':  return `في نهاية الطريق انعطف ${mod}${street}`;
    default:             return `بعد ${dist} ${mod || 'استمر'}${street}`;
  }
}

export async function fetchRoute(from: LatLng, to: LatLng): Promise<Route | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/foot/` +
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
        instruction: maneuverToAr(s.maneuver?.type ?? 'continue', s.maneuver?.modifier, s.name, s.distance ?? 0),
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
  currentIdx: number;
  lastSpokenDistanceMark: number; // meters remaining; we announce every 100m
};

export function makeNavState(route: Route): TurnByTurnState {
  return { route, currentIdx: 0, lastSpokenDistanceMark: Number.POSITIVE_INFINITY };
}

export type NavTick = {
  speak?: string;            // immediate instruction to speak (if any)
  arrived?: boolean;
  remainingMeters: number;
};

/**
 * Call on every GPS update. Returns optional speech and remaining distance.
 * - Announces the next maneuver when within ~20m of it.
 * - Announces remaining distance every 100m (not on every update).
 */
export function advanceStep(state: TurnByTurnState, userPos: LatLng): NavTick {
  const steps = state.route.steps;
  if (state.currentIdx >= steps.length) {
    return { arrived: true, remainingMeters: 0 };
  }
  const target = steps[state.currentIdx];
  const distToManeuver = haversine(userPos, target.location);

  // Total remaining: distance to current maneuver + sum of subsequent step distances.
  let remaining = distToManeuver;
  for (let i = state.currentIdx; i < steps.length; i++) remaining += steps[i].distance;

  let speak: string | undefined;

  if (distToManeuver < 18) {
    speak = target.instruction;
    state.currentIdx += 1;
    if (target.type === 'arrive' || state.currentIdx >= steps.length) {
      return { speak, arrived: true, remainingMeters: 0 };
    }
  } else {
    // Periodic remaining-distance announcement every 100m crossed.
    const bucket = Math.floor(remaining / 100) * 100;
    if (bucket < state.lastSpokenDistanceMark && bucket > 0 && remaining < 2000) {
      state.lastSpokenDistanceMark = bucket;
      speak = `باقي ${bucket} متر`;
    }
  }

  return { speak, remainingMeters: remaining };
}
