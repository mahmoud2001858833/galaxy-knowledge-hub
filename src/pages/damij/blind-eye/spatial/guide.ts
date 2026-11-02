// The guide: talks the user to a target like a person walking next to them.
// First it says where the target is and what to do; then it coaches the turn ("استدر ببطء… قف،
// ممتاز"), the walk ("أحسنت، باقي 3 خطوات"), corrections when they drift, obstacles on the way,
// and the arrival. Almost every sentence comes from a fixed list (GUIDE_PHRASES) so it can be
// prepared ahead in the natural voice and played instantly.

import { angleDiff } from './sensors';
import { STEP_M, directionText, stepsText, type MapObject, type WorldMap } from './worldMap';

type Lang = 'ar' | 'en';

const P = {
  ar: {
    turnRight: 'استدر إلى اليمين ببطء.',
    turnLeft: 'استدر إلى اليسار ببطء.',
    turnBackRight: 'هو خلفك. استدر ببطء من جهة اليمين.',
    turnBackLeft: 'هو خلفك. استدر ببطء من جهة اليسار.',
    keepTurning: 'استمر بالدوران قليلاً.',
    stopFacing: 'قف. ممتاز، الآن هو أمامك مباشرة.',
    walk: 'امشِ للأمام بهدوء.',
    good: ['أحسنت، استمر.', 'ممتاز، تابع.', 'أنت على الطريق الصحيح.'],
    almost: 'قربت جداً.',
    driftRight: 'انحرفت قليلاً، مِل إلى اليمين.',
    driftLeft: 'انحرفت قليلاً، مِل إلى اليسار.',
    pauseTurn: 'توقف لحظة.',
    arrivedAhead: 'وصلت! مدّ يدك للأمام.',
    arrivedRight: 'وصلت! هو على يمينك، مدّ يدك.',
    arrivedLeft: 'وصلت! هو على يسارك، مدّ يدك.',
    withYou: 'أنا معك. امشِ للأمام بهدوء.',
    obstacle: (steps: number, goLeft: boolean) => `انتبه، يوجد عائق بعد ${stepsText(steps * STEP_M, 'ar')}. خذ خطوة إلى ${goLeft ? 'اليسار' : 'اليمين'} ثم تابع.`,
    passed: 'تجاوزت العائق. ارجع إلى طريقك.',
    left: (n: number) => `باقي ${stepsText(n * STEP_M, 'ar')}.`,
  },
  en: {
    turnRight: 'Turn slowly to your right.',
    turnLeft: 'Turn slowly to your left.',
    turnBackRight: "It's behind you. Turn slowly around to the right.",
    turnBackLeft: "It's behind you. Turn slowly around to the left.",
    keepTurning: 'Keep turning a little.',
    stopFacing: "Stop. Great, it's right in front of you now.",
    walk: 'Walk forward calmly.',
    good: ['Well done, keep going.', 'Great, carry on.', "You're on the right track."],
    almost: 'Almost there.',
    driftRight: 'You drifted a little, lean to the right.',
    driftLeft: 'You drifted a little, lean to the left.',
    pauseTurn: 'Stop for a moment.',
    arrivedAhead: "You've arrived! Reach forward.",
    arrivedRight: "You've arrived! It's on your right, reach out.",
    arrivedLeft: "You've arrived! It's on your left, reach out.",
    withYou: "I'm with you. Walk forward calmly.",
    obstacle: (steps: number, goLeft: boolean) => `Careful, there's something in your way in ${stepsText(steps * STEP_M, 'en')}. Take a step to the ${goLeft ? 'left' : 'right'}, then carry on.`,
    passed: "You're past it. Back on your way.",
    left: (n: number) => `${stepsText(n * STEP_M, 'en')} to go.`,
  },
};

/** Every fixed sentence the guide can say (to prepare in the natural voice). */
export function GUIDE_PHRASES(lang: Lang): string[] {
  const p = P[lang];
  const out = [p.turnRight, p.turnLeft, p.turnBackRight, p.turnBackLeft, p.keepTurning, p.stopFacing, p.walk, ...p.good, p.almost,
    p.driftRight, p.driftLeft, p.pauseTurn, p.arrivedAhead, p.arrivedRight, p.arrivedLeft, p.withYou, p.passed];
  for (let n = 1; n <= 12; n++) out.push(p.left(n));
  for (let n = 1; n <= 3; n++) { out.push(p.obstacle(n, true)); out.push(p.obstacle(n, false)); }
  return out;
}

export type GuideUpdate = {
  /** sentences to say now, in order (empty = stay quiet) */
  say: string[];
  urgent?: boolean;
  /** short text for the screen */
  display: string;
  arrived?: boolean;
};

export class Guide {
  private stage: 'turning' | 'walking' = 'turning';
  private lastSaidAt = 0;
  private lastKey = '';
  private lastSteps = Infinity;
  private lastProgressAt = Date.now();
  private goodIdx = 0;
  private warned = new Set<number>();
  private avoiding: number | null = null;
  private lastMoveAt = Date.now();
  private lastStepCount = 0;
  private lastObstacleAt = 0;

  constructor(private target: MapObject, private lang: Lang) {}

  /** The opening: where it is and the first thing to do. */
  intro(map: WorldMap): string[] {
    const ar = this.lang === 'ar';
    const r = map.rel(this.target);
    const where = ar
      ? `حسناً، سأوصلك إلى ${this.target.label}. هو ${directionText(r.rel, 'ar')}، على بعد ${stepsText(r.dist, 'ar')}.`
      : `Okay, I'll take you to ${this.target.label}. It's ${directionText(r.rel, 'en')}, ${stepsText(r.dist, 'en')} away.`;
    const block = map.blockers(this.target)[0];
    const onWay = block
      ? (ar ? `في الطريق ${block.m.label}، سأنبهك قبله.` : `There's ${block.m.label} on the way; I'll warn you before it.`)
      : '';
    const first = this.firstAction(r.rel);
    if (first === 'walk') this.stage = 'walking';
    this.lastSaidAt = Date.now();
    this.lastKey = first;
    this.lastSteps = Math.round(r.dist / STEP_M);
    this.lastStepCount = map.steps;
    const p = P[this.lang];
    const action = first === 'walk' ? [p.walk] : [this.turnPhrase(r.rel)];
    return [where, onWay, ...action].filter(Boolean);
  }

  private firstAction(rel: number) { return Math.abs(rel) <= 15 ? 'walk' : 'turn'; }

  private turnPhrase(rel: number) {
    const p = P[this.lang];
    if (Math.abs(rel) >= 135) return rel > 0 ? p.turnBackRight : p.turnBackLeft;
    return rel > 0 ? p.turnRight : p.turnLeft;
  }

  /** Called a few times a second. */
  tick(map: WorldMap): GuideUpdate {
    const p = P[this.lang];
    const now = Date.now();
    const r = map.rel(this.target);
    const steps = Math.max(1, Math.round(r.dist / STEP_M));
    if (map.steps !== this.lastStepCount) { this.lastStepCount = map.steps; this.lastMoveAt = now; }
    const since = now - this.lastSaidAt;
    const out = (key: string, say: string[], display: string, extra: Partial<GuideUpdate> = {}): GuideUpdate => {
      this.lastKey = key;
      this.lastSaidAt = now;
      return { say, display, ...extra };
    };
    const quiet = (display: string): GuideUpdate => ({ say: [], display });

    // arrived
    if (r.dist < 0.9) {
      const s = Math.abs(r.rel) <= 45 ? p.arrivedAhead : r.rel > 0 ? p.arrivedRight : p.arrivedLeft;
      return out('arrived', [s], s, { arrived: true });
    }

    // an obstacle on the way, close: say it once, with which way to step
    const block = map.blockers(this.target, 2.2)[0];
    if (block && !this.warned.has(block.m.id) && Math.abs(r.rel) < 40 && now - this.lastObstacleAt > 4000) {
      this.warned.add(block.m.id);
      this.lastObstacleAt = now;
      this.avoiding = block.m.id;
      const s = p.obstacle(Math.max(1, Math.min(3, Math.round(block.along / STEP_M))), block.side >= 0);
      return out('obstacle', [s], s, { urgent: block.along < 1.2 });
    }
    if (this.avoiding != null && !block) {
      this.avoiding = null;
      return out('passed', [p.passed], p.passed);
    }

    if (this.stage === 'turning') {
      if (Math.abs(r.rel) <= 15) {
        this.stage = 'walking';
        this.lastSteps = steps;
        this.lastProgressAt = now;
        return out('facing', [p.stopFacing, p.walk, p.left(Math.min(12, steps))], p.stopFacing);
      }
      const phrase = this.turnPhrase(r.rel);
      // repeat the turn instruction calmly; "keep turning" when they are on the way
      if (since > 3500) return out('turn', [this.lastKey === 'turn' && Math.abs(r.rel) < 60 ? p.keepTurning : phrase], phrase);
      return quiet(phrase);
    }

    // walking
    if (Math.abs(r.rel) > 40) {
      this.stage = 'turning';
      const phrase = this.turnPhrase(r.rel);
      return out('turn', [p.pauseTurn, phrase], phrase);
    }
    if (Math.abs(r.rel) > 18 && since > 3000) {
      const s = r.rel > 0 ? p.driftRight : p.driftLeft;
      return out('drift', [s], s);
    }
    // progress: every step or two, encouragement + what is left
    if (steps < this.lastSteps && (this.lastSteps - steps >= 2 || steps <= 3) && since > 2200) {
      this.lastSteps = steps;
      this.lastProgressAt = now;
      const cheer = steps <= 2 ? p.almost : p.good[this.goodIdx++ % p.good.length];
      return out('progress', [cheer, p.left(Math.min(12, steps))], `${cheer} ${p.left(steps)}`);
    }
    // standing still for a while: reassure
    if (now - this.lastMoveAt > 9000 && since > 9000) {
      return out('reassure', [p.withYou, p.left(Math.min(12, steps))], p.withYou);
    }
    return quiet(`${p.walk} ${p.left(steps)}`);
  }

  /** Relative angle and distance, for the beacon and the screen. */
  where(map: WorldMap) {
    const r = map.rel(this.target);
    return { rel: r.rel, dist: r.dist, clock: r.clock, facing: Math.abs(angleDiff(r.rel, 0)) <= 15 };
  }
}
