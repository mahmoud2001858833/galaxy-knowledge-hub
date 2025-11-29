// محرك حساب سلسلة فورييه المتقدم

export class FourierEngine {
  // تحليل وحساب قيمة الدالة
  static evaluateFunction(expression: string, x: number): number {
    try {
      let processed = expression
        .replace(/pi/g, Math.PI.toString())
        .replace(/π/g, Math.PI.toString())
        .replace(/e(?![a-z])/g, Math.E.toString())
        .replace(/\bx\b/g, x.toString())
        .replace(/\^/g, '**')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/exp\(/g, 'Math.exp(')
        .replace(/log\(/g, 'Math.log(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/×/g, '*')
        .replace(/÷/g, '/');

      // eslint-disable-next-line no-new-func
      return new Function('Math', `return ${processed}`)(Math);
    } catch {
      return NaN;
    }
  }

  // معالجة الدوال القطعية
  static evaluatePiecewiseFunction(pieces: Array<{condition: string, expression: string}>, x: number): number {
    for (const piece of pieces) {
      const conditionMet = this.evaluateCondition(piece.condition, x);
      if (conditionMet) {
        return this.evaluateFunction(piece.expression, x);
      }
    }
    return NaN;
  }

  // تقييم الشرط
  static evaluateCondition(condition: string, x: number): boolean {
    try {
      let processed = condition
        .replace(/\bx\b/g, x.toString())
        .replace(/π/g, Math.PI.toString())
        .replace(/pi/g, Math.PI.toString())
        .replace(/≤/g, '<=')
        .replace(/≥/g, '>=')
        .replace(/</g, '<')
        .replace(/>/g, '>');

      // eslint-disable-next-line no-new-func
      return new Function(`return ${processed}`)();
    } catch {
      return false;
    }
  }

  // حساب التكامل العددي باستخدام طريقة سيمبسون (محسّن للأداء)
  static integrate(func: (x: number) => number, a: number, b: number, n: number = 100): number {
    const h = (b - a) / n;
    let sum = func(a) + func(b);

    for (let i = 1; i < n; i++) {
      const x = a + i * h;
      const weight = i % 2 === 0 ? 2 : 4;
      sum += weight * func(x);
    }

    return (h / 3) * sum;
  }

  // حساب المعامل a₀
  static calculateA0(func: (x: number) => number, L: number): number {
    const integrand = (x: number) => func(x);
    return (1 / L) * this.integrate(integrand, -L, L);
  }

  // حساب معاملات aₙ
  static calculateAn(func: (x: number) => number, n: number, L: number): number {
    const integrand = (x: number) => func(x) * Math.cos((n * Math.PI * x) / L);
    return (1 / L) * this.integrate(integrand, -L, L);
  }

  // حساب معاملات bₙ
  static calculateBn(func: (x: number) => number, n: number, L: number): number {
    const integrand = (x: number) => func(x) * Math.sin((n * Math.PI * x) / L);
    return (1 / L) * this.integrate(integrand, -L, L);
  }

  // حساب جميع المعاملات حتى N
  static calculateCoefficients(func: (x: number) => number, N: number, L: number) {
    const a0 = this.calculateA0(func, L);
    const coefficients: Array<{n: number, an: number, bn: number}> = [];

    for (let n = 1; n <= N; n++) {
      const an = this.calculateAn(func, n, L);
      const bn = this.calculateBn(func, n, L);
      coefficients.push({ n, an, bn });
    }

    return { a0, coefficients };
  }

  // توليد قيمة المجموع الجزئي لسلسلة فورييه عند نقطة معينة باستخدام معاملات محسوبة مسبقاً
  static evaluateSeriesAt(
    a0: number,
    coefficients: Array<{n: number, an: number, bn: number}>,
    L: number,
    x: number
  ): number {
    let sum = a0 / 2;

    for (const { n, an, bn } of coefficients) {
      sum += an * Math.cos((n * Math.PI * x) / L);
      sum += bn * Math.sin((n * Math.PI * x) / L);
    }

    return sum;
  }

  // توليد المجموع الجزئي لسلسلة فورييه مع حساب المعاملات داخلياً (للاستخدامات البسيطة فقط)
  static generateFourierApproximation(
    func: (x: number) => number,
    N: number,
    L: number,
    x: number
  ): number {
    const { a0, coefficients } = this.calculateCoefficients(func, N, L);
    return this.evaluateSeriesAt(a0, coefficients, L, x);
  }

  // اكتشاف نقاط عدم الاستمرار
  static detectDiscontinuities(func: (x: number) => number, L: number): number[] {
    const discontinuities: number[] = [];
    const step = 0.01;
    const threshold = 0.5;

    for (let x = -L; x < L; x += step) {
      const y1 = func(x);
      const y2 = func(x + step);
      
      if (!isNaN(y1) && !isNaN(y2) && Math.abs(y2 - y1) > threshold) {
        discontinuities.push(parseFloat(x.toFixed(2)));
      }
    }

    return discontinuities;
  }

  // كشف ظاهرة غيبس
  static detectGibbsPhenomenon(
    original: (x: number) => number,
    approximation: (x: number) => number,
    discontinuities: number[],
    L: number
  ): Array<{x: number, overshoot: number}> {
    const gibbs: Array<{x: number, overshoot: number}> = [];
    const range = 0.5;

    for (const disc of discontinuities) {
      let maxOvershoot = 0;
      let maxX = disc;

      for (let offset = -range; offset <= range; offset += 0.01) {
        const x = disc + offset;
        if (x >= -L && x <= L) {
          const origValue = original(x);
          const approxValue = approximation(x);
          const overshoot = Math.abs(approxValue - origValue);

          if (overshoot > maxOvershoot) {
            maxOvershoot = overshoot;
            maxX = x;
          }
        }
      }

      if (maxOvershoot > 0.1) {
        gibbs.push({ x: parseFloat(maxX.toFixed(2)), overshoot: parseFloat(maxOvershoot.toFixed(3)) });
      }
    }

    return gibbs;
  }

  // توليد نقاط البيانات للرسم (محسّن للأداء)
  static generateDataPoints(
    func: (x: number) => number,
    L: number,
    numPoints: number = 150
  ): Array<{x: number, y: number}> {
    const points: Array<{x: number, y: number}> = [];
    const step = (2 * L) / numPoints;

    for (let i = 0; i <= numPoints; i++) {
      const x = -L + i * step;
      const y = func(x);
      if (!isNaN(y) && isFinite(y) && Math.abs(y) < 1e6) {
        points.push({ x: parseFloat(x.toFixed(3)), y: parseFloat(y.toFixed(3)) });
      }
    }

    return points;
  }

  // إنشاء صيغة سلسلة فورييه الرمزية
  static generateFormulaString(a0: number, coefficients: Array<{n: number, an: number, bn: number}>, maxTerms: number = 5): string {
    let formula = `f(x) ≈ ${(a0/2).toFixed(3)}`;
    let termsShown = 0;

    for (const { n, an, bn } of coefficients) {
      if (termsShown >= maxTerms) {
        formula += ' + ...';
        break;
      }

      if (Math.abs(an) > 0.001) {
        const sign = an > 0 ? '+' : '';
        formula += ` ${sign} ${an.toFixed(3)}cos(${n}πx/L)`;
        termsShown++;
      }

      if (Math.abs(bn) > 0.001) {
        const sign = bn > 0 ? '+' : '';
        formula += ` ${sign} ${bn.toFixed(3)}sin(${n}πx/L)`;
        termsShown++;
      }
    }

    return formula;
  }
}
