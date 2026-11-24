export type TerminalName = 'positive' | 'negative';

export interface SolvableComponent {
  id: string;
  type: string;
  value?: number;
  isOn?: boolean;
  color?: string;
  label?: string;
  voltageAcross?: number;
  currentThrough?: number;
  chargePercent?: number;
}

export interface SolvableWire {
  id: string;
  startComponentId: string;
  startTerminal: TerminalName;
  endComponentId: string;
  endTerminal: TerminalName;
  current?: number;
}

export interface ComponentResult {
  voltage: number; // Signed voltage V(+) - V(-)
  current: number; // Signed current flowing from (+) to (-) inside passive elements, or delivered out of (+) for battery
  power: number;
  isActive: boolean;
  displayValue?: number; // For ammeter (mA) or voltmeter (V)
  chargePercent?: number; // For capacitor (0..100)
}

export interface CircuitSolution {
  totalVoltage: number;
  totalCurrent: number;
  totalPower: number;
  componentResults: Record<string, ComponentResult>;
  wireCurrents: Record<string, number>; // Signed current: >0 flows start->end, <0 flows end->start
  capacitorVoltages: Record<string, number>;
  hasActiveCapacitor: boolean;
  isShortCircuit: boolean;
}

const G_BATTERY = 100; // R_int = 0.01 Ω
const G_CLOSED_SWITCH = 100; // R_on = 0.01 Ω
const G_AMMETER = 100; // R_amm = 0.01 Ω
const G_VOLTMETER = 1e-7; // R_volt = 10 MΩ
const G_MIN_LEAKAGE = 1e-9; // Prevents singular matrices on floating nodes

const R_BULB = 100; // Ω
const R_LED = 120; // Ω (with 330Ω + 9V -> 20.0 mA exact!)
const R_MOTOR = 50; // Ω

function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = b.length;
  if (n === 0) return [];

  // Deep copy into augmented matrix
  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    // Partial pivoting
    let pivotRow = col;
    let maxAbs = Math.abs(M[col][col]);
    for (let row = col + 1; row < n; row++) {
      const val = Math.abs(M[row][col]);
      if (val > maxAbs) {
        maxAbs = val;
        pivotRow = row;
      }
    }

    if (maxAbs < 1e-15) continue;

    if (pivotRow !== col) {
      const tmp = M[col];
      M[col] = M[pivotRow];
      M[pivotRow] = tmp;
    }

    const pivot = M[col][col];
    for (let row = col + 1; row < n; row++) {
      const factor = M[row][col] / pivot;
      if (factor === 0) continue;
      M[row][col] = 0;
      for (let k = col + 1; k <= n; k++) {
        M[row][k] -= factor * M[col][k];
      }
    }
  }

  const x = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    if (Math.abs(M[i][i]) < 1e-15) {
      x[i] = 0;
      continue;
    }
    let sum = M[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * x[j];
    }
    x[i] = Number.isFinite(sum / M[i][i]) ? sum / M[i][i] : 0;
  }

  return x;
}

const termKey = (compId: string, terminal: TerminalName) => `${compId}:${terminal}`;

/**
 * Solves any arbitrary DC / transient RC circuit topology using Modified Nodal Analysis (MNA)
 * with Backward Euler companion models for capacitors and KCL spanning-tree wire currents.
 */
export function solveCircuit(
  components: SolvableComponent[],
  wires: SolvableWire[],
  prevCapacitorVoltages: Record<string, number> = {},
  dt: number = 0.05,
): CircuitSolution {
  const emptyResult: CircuitSolution = {
    totalVoltage: 0,
    totalCurrent: 0,
    totalPower: 0,
    componentResults: {},
    wireCurrents: {},
    capacitorVoltages: { ...prevCapacitorVoltages },
    hasActiveCapacitor: false,
    isShortCircuit: false,
  };

  if (components.length === 0) return emptyResult;

  // 1. Build Union-Find across all terminals connected by wires
  const parent = new Map<string, string>();
  const ensure = (k: string) => {
    if (!parent.has(k)) parent.set(k, k);
  };
  const find = (k: string): string => {
    ensure(k);
    let root = k;
    while (parent.get(root) !== root) {
      root = parent.get(root)!;
    }
    let cur = k;
    while (cur !== root) {
      const next = parent.get(cur)!;
      parent.set(cur, root);
      cur = next;
    }
    return root;
  };
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  const componentMap = new Map<string, SolvableComponent>();
  for (const c of components) {
    componentMap.set(c.id, c);
    ensure(termKey(c.id, 'positive'));
    ensure(termKey(c.id, 'negative'));
  }

  const validWires = wires.filter(
    (w) => componentMap.has(w.startComponentId) && componentMap.has(w.endComponentId),
  );

  for (const w of validWires) {
    union(termKey(w.startComponentId, w.startTerminal), termKey(w.endComponentId, w.endTerminal));
  }

  // Map each root terminal to an integer node ID
  const rootToNode = new Map<string, number>();
  let nodeCount = 0;
  for (const k of parent.keys()) {
    const r = find(k);
    if (!rootToNode.has(r)) {
      rootToNode.set(r, nodeCount++);
    }
  }

  const getNode = (compId: string, terminal: TerminalName) =>
    rootToNode.get(find(termKey(compId, terminal)))!;

  // Choose reference ground node (first battery's negative terminal, or node 0)
  const batteries = components.filter((c) => c.type === 'battery');
  const groundNode = batteries.length > 0 ? getNode(batteries[0].id, 'negative') : 0;

  // Build index mapping for unknown non-ground node voltages
  const nodeToIdx = new Map<number, number>();
  let unknownCount = 0;
  for (let n = 0; n < nodeCount; n++) {
    if (n !== groundNode) {
      nodeToIdx.set(n, unknownCount++);
    }
  }

  const G: number[][] = Array.from({ length: unknownCount }, () => new Array<number>(unknownCount).fill(0));
  const Ivec: number[] = new Array<number>(unknownCount).fill(0);

  // Tiny leakage to ground keeps floating islands nonsingular
  for (let i = 0; i < unknownCount; i++) {
    G[i][i] += G_MIN_LEAKAGE;
  }

  const stampConductance = (nA: number, nB: number, conductance: number) => {
    if (nA === nB || conductance <= 0) return;
    const iA = nodeToIdx.get(nA);
    const iB = nodeToIdx.get(nB);
    if (iA !== undefined) G[iA][iA] += conductance;
    if (iB !== undefined) G[iB][iB] += conductance;
    if (iA !== undefined && iB !== undefined) {
      G[iA][iB] -= conductance;
      G[iB][iA] -= conductance;
    }
  };

  // Current source injecting `current` into nPlus and extracting from nMinus
  const stampCurrentSource = (nPlus: number, nMinus: number, current: number) => {
    const iP = nodeToIdx.get(nPlus);
    const iM = nodeToIdx.get(nMinus);
    if (iP !== undefined) Ivec[iP] += current;
    if (iM !== undefined) Ivec[iM] -= current;
  };

  const safeDt = Math.max(0.005, dt);
  let hasActiveCapacitor = false;

  // 2. Stamp every component into the nodal conductance matrix
  for (const c of components) {
    const nP = getNode(c.id, 'positive');
    const nN = getNode(c.id, 'negative');

    switch (c.type) {
      case 'battery': {
        const vBat = c.value ?? 9;
        stampConductance(nP, nN, G_BATTERY);
        stampCurrentSource(nP, nN, vBat * G_BATTERY);
        break;
      }
      case 'resistor': {
        const r = Math.max(0.1, c.value ?? 100);
        stampConductance(nP, nN, 1 / r);
        break;
      }
      case 'bulb': {
        stampConductance(nP, nN, 1 / R_BULB);
        break;
      }
      case 'led': {
        stampConductance(nP, nN, 1 / R_LED);
        break;
      }
      case 'motor': {
        stampConductance(nP, nN, 1 / R_MOTOR);
        break;
      }
      case 'switch': {
        if (c.isOn) {
          stampConductance(nP, nN, G_CLOSED_SWITCH);
        }
        break;
      }
      case 'ammeter': {
        stampConductance(nP, nN, G_AMMETER);
        break;
      }
      case 'voltmeter': {
        stampConductance(nP, nN, G_VOLTMETER);
        break;
      }
      case 'capacitor': {
        hasActiveCapacitor = true;
        const capacitanceF = Math.max(1, c.value ?? 100) * 1e-6;
        const gEq = capacitanceF / safeDt;
        const vPrev = prevCapacitorVoltages[c.id] ?? 0;
        stampConductance(nP, nN, gEq);
        // Companion Norton current source: I_C = gEq * (V+ - V-) - gEq * V_prev
        stampCurrentSource(nP, nN, gEq * vPrev);
        break;
      }
      default:
        break;
    }
  }

  // 3. Solve G * V = Ivec
  const solvedUnknowns = solveLinearSystem(G, Ivec);
  const nodeVoltages = new Array<number>(nodeCount).fill(0);
  for (const [nodeId, idx] of nodeToIdx.entries()) {
    nodeVoltages[nodeId] = solvedUnknowns[idx];
  }

  // 4. Compute exact branch voltage, current, and power for every component
  const componentResults: Record<string, ComponentResult> = {};
  const capacitorVoltages: Record<string, number> = { ...prevCapacitorVoltages };
  const terminalInjection = new Map<string, number>(); // Net current entering wire network at each terminal

  const addInjection = (compId: string, terminal: TerminalName, currentIntoWire: number) => {
    const key = termKey(compId, terminal);
    terminalInjection.set(key, (terminalInjection.get(key) ?? 0) + currentIntoWire);
  };

  let totalVoltage = 0;
  let totalCurrent = 0;
  let totalPower = 0;
  let isShortCircuit = false;

  const maxBatteryVoltage = batteries.reduce((max, b) => Math.max(max, b.value ?? 9), 0);

  for (const c of components) {
    const nP = getNode(c.id, 'positive');
    const nN = getNode(c.id, 'negative');
    const vDiff = nodeVoltages[nP] - nodeVoltages[nN]; // V(+) - V(-)

    let current = 0; // Passive sign convention: + -> - inside component; for battery: delivered out of +
    let isActive = false;
    let displayValue: number | undefined;
    let chargePercent: number | undefined;

    switch (c.type) {
      case 'battery': {
        const vBat = c.value ?? 9;
        // Current delivered out of (+) terminal into external circuit
        current = (vBat - vDiff) * G_BATTERY;
        if (Math.abs(current) < 1e-6) current = 0;
        isActive = true;
        totalVoltage = Math.max(totalVoltage, vBat);
        if (current > 0) {
          totalCurrent += current;
          totalPower += vBat * current;
        }
        if (Math.abs(current) > 5) {
          isShortCircuit = true;
        }
        // Battery pushes `current` OUT of (+) into wires, and pulls `current` from wires into (-)
        addInjection(c.id, 'positive', current);
        addInjection(c.id, 'negative', -current);
        break;
      }
      case 'resistor': {
        const r = Math.max(0.1, c.value ?? 100);
        current = vDiff / r;
        isActive = Math.abs(current) > 1e-5;
        addInjection(c.id, 'positive', -current);
        addInjection(c.id, 'negative', current);
        break;
      }
      case 'bulb': {
        current = vDiff / R_BULB;
        isActive = Math.abs(current) > 0.002;
        addInjection(c.id, 'positive', -current);
        addInjection(c.id, 'negative', current);
        break;
      }
      case 'led': {
        current = vDiff / R_LED;
        isActive = Math.abs(current) > 0.002;
        addInjection(c.id, 'positive', -current);
        addInjection(c.id, 'negative', current);
        break;
      }
      case 'motor': {
        current = vDiff / R_MOTOR;
        isActive = Math.abs(current) > 0.005;
        addInjection(c.id, 'positive', -current);
        addInjection(c.id, 'negative', current);
        break;
      }
      case 'switch': {
        current = c.isOn ? vDiff * G_CLOSED_SWITCH : 0;
        isActive = Boolean(c.isOn);
        addInjection(c.id, 'positive', -current);
        addInjection(c.id, 'negative', current);
        break;
      }
      case 'ammeter': {
        current = vDiff * G_AMMETER;
        const absCurrent = Math.abs(current) < 1e-6 ? 0 : Math.abs(current);
        displayValue = absCurrent * 1000; // mA
        isActive = absCurrent > 1e-5;
        addInjection(c.id, 'positive', -current);
        addInjection(c.id, 'negative', current);
        break;
      }
      case 'voltmeter': {
        current = vDiff * G_VOLTMETER;
        const absVolt = Math.abs(vDiff) < 1e-4 ? 0 : Math.abs(vDiff);
        displayValue = absVolt; // V
        isActive = absVolt > 1e-3;
        addInjection(c.id, 'positive', -current);
        addInjection(c.id, 'negative', current);
        break;
      }
      case 'capacitor': {
        const capacitanceF = Math.max(1, c.value ?? 100) * 1e-6;
        const gEq = capacitanceF / safeDt;
        const vPrev = prevCapacitorVoltages[c.id] ?? 0;
        current = gEq * (vDiff - vPrev);
        if (Math.abs(current) < 1e-7) current = 0;
        capacitorVoltages[c.id] = Math.abs(vDiff) < 1e-5 ? 0 : vDiff;
        const refV = maxBatteryVoltage > 0 ? maxBatteryVoltage : 9;
        chargePercent = Math.max(0, Math.min(100, (Math.abs(vDiff) / refV) * 100));
        isActive = Math.abs(vDiff) > 0.05 || Math.abs(current) > 1e-5;
        addInjection(c.id, 'positive', -current);
        addInjection(c.id, 'negative', current);
        break;
      }
      default:
        break;
    }

    componentResults[c.id] = {
      voltage: Math.abs(vDiff) < 1e-5 ? 0 : vDiff,
      current: Math.abs(current) < 1e-6 ? 0 : current,
      power: Math.abs(vDiff * current),
      isActive,
      displayValue,
      chargePercent,
    };
  }

  // 5. Compute exact branch current on every individual wire via spanning-tree KCL per electrical node
  const wireCurrents: Record<string, number> = {};
  const adj = new Map<string, Array<{ wireId: string; to: string; forward: boolean }>>();

  for (const w of validWires) {
    const a = termKey(w.startComponentId, w.startTerminal);
    const b = termKey(w.endComponentId, w.endTerminal);
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a)!.push({ wireId: w.id, to: b, forward: true });
    adj.get(b)!.push({ wireId: w.id, to: a, forward: false });
    wireCurrents[w.id] = 0;
  }

  const visited = new Set<string>();
  const dfsCurrent = (u: string): number => {
    visited.add(u);
    let net = terminalInjection.get(u) ?? 0;
    const edges = adj.get(u) ?? [];
    for (const edge of edges) {
      if (visited.has(edge.to)) continue;
      const childNet = dfsCurrent(edge.to);
      // childNet flows from child into u; so flow u -> child is -childNet
      const flowUtoChild = -childNet;
      wireCurrents[edge.wireId] = edge.forward ? flowUtoChild : -flowUtoChild;
      net += childNet;
    }
    return net;
  };

  for (const terminal of adj.keys()) {
    if (!visited.has(terminal)) {
      dfsCurrent(terminal);
    }
  }

  // Clean tiny numerical noise from wire currents
  for (const id of Object.keys(wireCurrents)) {
    if (Math.abs(wireCurrents[id]) < 1e-5) {
      wireCurrents[id] = 0;
    }
  }

  if (Math.abs(totalCurrent) < 1e-5) {
    totalCurrent = 0;
    totalPower = 0;
  }

  return {
    totalVoltage,
    totalCurrent,
    totalPower,
    componentResults,
    wireCurrents,
    capacitorVoltages,
    hasActiveCapacitor,
    isShortCircuit,
  };
}
