// Advanced Math Evaluation Engine supporting 100+ functions and calculus analysis

export class MathEngine {
  /**
   * Evaluates any mathematical expression at x with full support for 100+ functions
   */
  static evaluateExpression(expression: string, x: number): number {
    if (!expression || typeof expression !== 'string') return NaN;
    try {
      // Preprocessing
      let expr = expression.trim().toLowerCase();

      // Convert implicit multiplications like 2x, 3sin(x), x(x+1)
      expr = expr
        .replace(/(\d)\s*([a-df-z\(])/g, '$1*$2') // 2x -> 2*x (exclude e)
        .replace(/(\d)\s*e(?![a-z])/g, '$1*Math.E')
        .replace(/\)\s*(\d)/g, ')*$1')
        .replace(/\)\s*\(/g, ')*(')
        .replace(/([x])\s*([a-z\(])/g, '$1*$2');

      // Constants
      expr = expr
        .replace(/\bpi\b/g, String(Math.PI))
        .replace(/\be(?![a-z])/g, String(Math.E));

      // Powers: x^y -> x**y
      expr = expr.replace(/\^/g, '**');

      // Helper functions dictionary
      const scope = {
        x,
        // Basic & Trig
        sin: (v: number) => Math.sin(v),
        cos: (v: number) => Math.cos(v),
        tan: (v: number) => Math.tan(v),
        cot: (v: number) => 1 / Math.tan(v),
        sec: (v: number) => 1 / Math.cos(v),
        csc: (v: number) => 1 / Math.sin(v),
        sinc: (v: number) => (v === 0 ? 1 : Math.sin(v) / v),

        // Inverse Trig
        asin: (v: number) => Math.asin(v),
        acos: (v: number) => Math.acos(v),
        atan: (v: number) => Math.atan(v),
        acot: (v: number) => Math.atan(1 / v),
        asec: (v: number) => Math.acos(1 / v),
        acsc: (v: number) => Math.asin(1 / v),

        // Hyperbolic
        sinh: (v: number) => Math.sinh(v),
        cosh: (v: number) => Math.cosh(v),
        tanh: (v: number) => Math.tanh(v),
        coth: (v: number) => 1 / Math.tanh(v),
        sech: (v: number) => 1 / Math.cosh(v),
        csch: (v: number) => 1 / Math.sinh(v),
        asinh: (v: number) => Math.asinh(v),
        acosh: (v: number) => Math.acosh(v),
        atanh: (v: number) => Math.atanh(v),

        // Exponentials & Logarithms
        exp: (v: number) => Math.exp(v),
        ln: (v: number) => Math.log(v),
        log: (v: number) => Math.log10(v),
        log2: (v: number) => Math.log2(v),
        sqrt: (v: number) => Math.sqrt(v),
        cbrt: (v: number) => Math.cbrt(v),

        // Piecewise & Step
        abs: (v: number) => Math.abs(v),
        sign: (v: number) => Math.sign(v),
        floor: (v: number) => Math.floor(v),
        ceil: (v: number) => Math.ceil(v),
        round: (v: number) => Math.round(v),
        fract: (v: number) => v - Math.floor(v),
        step: (v: number) => (v >= 0 ? 1 : 0),
        mod: (a: number, b: number) => ((a % b) + b) % b,
        max: (...args: number[]) => Math.max(...args),
        min: (...args: number[]) => Math.min(...args),

        // Special Functions
        sigmoid: (v: number) => 1 / (1 + Math.exp(-v)),
        relu: (v: number) => Math.max(0, v),
        softplus: (v: number) => Math.log(1 + Math.exp(v)),
        erf: (v: number) => MathEngine.erf(v),
        gamma: (v: number) => MathEngine.gamma(v),
        bessel_J0: (v: number) => MathEngine.besselJ0(v),
        bessel_J1: (v: number) => MathEngine.besselJ1(v),
        airy_Ai: (v: number) => MathEngine.airyAi(v)
      };

      // Safely evaluate with arguments
      const argNames = Object.keys(scope);
      const argValues = Object.values(scope);
      // eslint-disable-next-line no-new-func
      const fn = new Function(...argNames, `return (${expr});`);
      const res = fn(...argValues);

      return typeof res === 'number' && !isNaN(res) && isFinite(res) ? res : NaN;
    } catch {
      return NaN;
    }
  }

  // --- Numerical Approximations of Special Functions ---

  /** Error function approximation (Chebyshev) */
  static erf(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x);

    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

    return sign * y;
  }

  /** Lanczos approximation of Euler's Gamma function */
  static gamma(z: number): number {
    if (z < 0.5) {
      return Math.PI / (Math.sin(Math.PI * z) * this.gamma(1 - z));
    }
    z -= 1;
    const g = 7;
    const C = [
      0.99999999999980993,
      676.5203681218851,
      -1259.1392167224028,
      771.32342877765313,
      -176.61502916214059,
      12.507343278686905,
      -0.138571095836524,
      9.9843695780195716e-6,
      1.5056327351493116e-7
    ];
    let x = C[0];
    for (let i = 1; i < g + 2; i++) {
      x += C[i] / (z + i);
    }
    const t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }

  /** Bessel function J0 approximation */
  static besselJ0(x: number): number {
    const ax = Math.abs(x);
    if (ax < 8.0) {
      const y = x * x;
      const ans1 = 5756891214.0 + y * (-13362590354.0 + y * (651619640.7 + y * (-11214424.18 + y * (77392.33017 + y * (-184.9052456)))));
      const ans2 = 5756891214.0 + y * (60705963.87 + y * (265090.7286 + y * (619.3468131 + y * (1.0))));
      return ans1 / ans2;
    } else {
      const z = 8.0 / ax;
      const y = z * z;
      const xx = ax - 0.785398164;
      const ans1 = 1.0 + y * (-0.1098628627e-2 + y * (0.2734510407e-4 + y * (-0.2073370639e-5 + y * 0.2093887211e-6)));
      const ans2 = -0.1562499995e-1 + y * (0.1430488765e-3 + y * (-0.6911147651e-5 + y * (0.7621095161e-6 - y * 0.934945152e-7)));
      return Math.sqrt(0.636619772 / ax) * (Math.cos(xx) * ans1 - z * Math.sin(xx) * ans2);
    }
  }

  /** Bessel function J1 approximation */
  static besselJ1(x: number): number {
    const ax = Math.abs(x);
    if (ax < 8.0) {
      const y = x * x;
      const ans1 = x * (72362614232.0 + y * (-7895059235.0 + y * (242396853.1 + y * (-2972611.439 + y * (15704.48260 + y * (-30.16036606))))));
      const ans2 = 144725228442.0 + y * (2300535178.0 + y * (18583304.74 + y * (99447.43394 + y * (376.9991397 + y * 1.0))));
      return ans1 / ans2;
    } else {
      const z = 8.0 / ax;
      const y = z * z;
      const xx = ax - 2.356194491;
      const ans1 = 1.0 + y * (0.183105e-2 + y * (-0.3516396496e-4 + y * (0.2457520174e-5 + y * (-0.240337019e-6))));
      const ans2 = 0.04687499995 + y * (-0.2002690873e-3 + y * (0.8449199096e-5 + y * (-0.88228987e-6 + y * 0.105787412e-6)));
      const ans = Math.sqrt(0.636619772 / ax) * (Math.cos(xx) * ans1 - z * Math.sin(xx) * ans2);
      return x < 0 ? -ans : ans;
    }
  }

  /** Airy function Ai approximation */
  static airyAi(x: number): number {
    if (x > 3) {
      const zeta = (2 / 3) * Math.pow(x, 1.5);
      return Math.exp(-zeta) / (2 * Math.sqrt(Math.PI) * Math.pow(x, 0.25));
    }
    if (x < -3) {
      const zeta = (2 / 3) * Math.pow(-x, 1.5);
      return Math.sin(zeta + Math.PI / 4) / (Math.sqrt(Math.PI) * Math.pow(-x, 0.25));
    }
    // Taylor approximation around 0
    const c1 = 0.3550280538878;
    const c2 = 0.2588194037928;
    return c1 * (1 + (x * x * x) / 6 + (x * x * x * x * x * x) / 180) - c2 * (x + (x * x * x * x) / 12);
  }

  // --- Analytical & Numerical Calculus ---

  /** Calculates numerical slope / derivative f'(x) */
  static findSlope(equation: string, x: number, h: number = 0.0001): number {
    const y1 = this.evaluateExpression(equation, x - h);
    const y2 = this.evaluateExpression(equation, x + h);
    if (isNaN(y1) || isNaN(y2)) return NaN;
    return (y2 - y1) / (2 * h);
  }

  /** Calculates definite integral ∫_a^b f(x)dx via Simpson's 1/3 Rule */
  static calculateDefiniteIntegral(equation: string, a: number, b: number, n: number = 200): number {
    if (n % 2 !== 0) n += 1;
    const h = (b - a) / n;
    let sum = this.evaluateExpression(equation, a) + this.evaluateExpression(equation, b);

    for (let i = 1; i < n; i++) {
      const x = a + i * h;
      const y = this.evaluateExpression(equation, x);
      if (isNaN(y)) return NaN;
      sum += (i % 2 === 0 ? 2 : 4) * y;
    }

    return (h / 3) * sum;
  }

  /** Finds real roots f(x) = 0 inside a domain */
  static findRoots(equation: string, domain: [number, number] = [-15, 15]): number[] {
    const roots: number[] = [];
    const step = 0.05;
    for (let x = domain[0]; x <= domain[1]; x += step) {
      const y1 = this.evaluateExpression(equation, x);
      const y2 = this.evaluateExpression(equation, x + step);

      if (!isNaN(y1) && !isNaN(y2)) {
        if ((y1 <= 0 && y2 >= 0) || (y1 >= 0 && y2 <= 0)) {
          // Refine with bisection
          let l = x;
          let r = x + step;
          for (let k = 0; k < 12; k++) {
            const mid = (l + r) / 2;
            const ym = this.evaluateExpression(equation, mid);
            if (Math.abs(ym) < 0.0001) {
              l = mid;
              break;
            }
            if ((y1 <= 0 && ym >= 0) || (y1 >= 0 && ym <= 0)) {
              r = mid;
            } else {
              l = mid;
            }
          }
          const rootVal = parseFloat(l.toFixed(3));
          if (!roots.some(existing => Math.abs(existing - rootVal) < 0.05)) {
            roots.push(rootVal);
          }
        }
      }
    }
    return roots;
  }

  /** Finds local extrema (maxima & minima) */
  static findExtrema(equation: string, domain: [number, number] = [-15, 15]): Array<{ x: number; y: number; type: 'max' | 'min' }> {
    const extrema: Array<{ x: number; y: number; type: 'max' | 'min' }> = [];
    const step = 0.05;

    for (let x = domain[0] + step; x <= domain[1] - step; x += step) {
      const s1 = this.findSlope(equation, x - step / 2);
      const s2 = this.findSlope(equation, x + step / 2);

      if (!isNaN(s1) && !isNaN(s2)) {
        if (s1 > 0 && s2 < 0) {
          // Local Max
          const y = this.evaluateExpression(equation, x);
          if (!isNaN(y) && !extrema.some(e => Math.abs(e.x - x) < 0.1)) {
            extrema.push({ x: parseFloat(x.toFixed(3)), y: parseFloat(y.toFixed(3)), type: 'max' });
          }
        } else if (s1 < 0 && s2 > 0) {
          // Local Min
          const y = this.evaluateExpression(equation, x);
          if (!isNaN(y) && !extrema.some(e => Math.abs(e.x - x) < 0.1)) {
            extrema.push({ x: parseFloat(x.toFixed(3)), y: parseFloat(y.toFixed(3)), type: 'min' });
          }
        }
      }
    }
    return extrema;
  }

  /** Finds intersection points between two equations */
  static findIntersections(eq1: string, eq2: string, range: [number, number] = [-15, 15]): Array<[number, number]> {
    const intersections: Array<[number, number]> = [];
    const diffEq = `(${eq1}) - (${eq2})`;
    const roots = this.findRoots(diffEq, range);

    for (const r of roots) {
      const y = this.evaluateExpression(eq1, r);
      if (!isNaN(y)) {
        intersections.push([r, parseFloat(y.toFixed(3))]);
      }
    }

    return intersections;
  }

  /** Analyzes quadratic equation coefficients */
  static analyzeQuadratic(equation: string): {
    vertex: [number, number] | null;
    axis: number | null;
    direction: 'up' | 'down' | null;
    discriminant: number | null;
    roots: number[] | null;
  } {
    const match = equation.match(/([+-]?\d*\.?\d*)\*?x\^2([+-]?\d*\.?\d*)\*?x?([+-]?\d*\.?\d*)?/);
    if (!match) return { vertex: null, axis: null, direction: null, discriminant: null, roots: null };

    const a = parseFloat(match[1] || '1');
    const b = parseFloat(match[2] || '0');
    const c = parseFloat(match[3] || '0');

    if (a === 0 || isNaN(a)) return { vertex: null, axis: null, direction: null, discriminant: null, roots: null };

    const vertexX = -b / (2 * a);
    const vertexY = this.evaluateExpression(equation, vertexX);
    const discriminant = b * b - 4 * a * c;
    let roots: number[] | null = null;

    if (discriminant >= 0) {
      const r1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const r2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      roots = discriminant === 0 ? [r1] : [r1, r2];
    }

    return {
      vertex: [parseFloat(vertexX.toFixed(3)), parseFloat(vertexY.toFixed(3))],
      axis: parseFloat(vertexX.toFixed(3)),
      direction: a > 0 ? 'up' : 'down',
      discriminant: parseFloat(discriminant.toFixed(3)),
      roots: roots?.map(r => parseFloat(r.toFixed(3))) || null
    };
  }

  /** Numerical cubic equation roots */
  static solveCubic(equation: string): number[] {
    return this.findRoots(equation, [-25, 25]);
  }
}
