// Advanced 3D function evaluation engine
export class Function3DEngine {
  static evaluateExpression(expression: string, x: number, y?: number, z?: number, t?: number): number {
    try {
      // Replace mathematical constants and functions
      let processedExpression = expression
        .replace(/pi/gi, Math.PI.toString())
        .replace(/e(?![a-z])/gi, Math.E.toString())
        .replace(/\bx\b/g, x.toString())
        .replace(/\by\b/g, (y ?? 0).toString())
        .replace(/\bz\b/g, (z ?? 0).toString())
        .replace(/\bt\b/g, (t ?? 0).toString())
        .replace(/\^/g, '**')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/asin\(/g, 'Math.asin(')
        .replace(/acos\(/g, 'Math.acos(')
        .replace(/atan\(/g, 'Math.atan(')
        .replace(/atan2\(/g, 'Math.atan2(')
        .replace(/sinh\(/g, 'Math.sinh(')
        .replace(/cosh\(/g, 'Math.cosh(')
        .replace(/tanh\(/g, 'Math.tanh(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/exp\(/g, 'Math.exp(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/floor\(/g, 'Math.floor(')
        .replace(/ceil\(/g, 'Math.ceil(')
        .replace(/round\(/g, 'Math.round(')
        .replace(/max\(/g, 'Math.max(')
        .replace(/min\(/g, 'Math.min(')
        .replace(/mod\(/g, '(')
        .replace(/×/g, '*')
        .replace(/÷/g, '/');

      // eslint-disable-next-line no-new-func
      return new Function('Math', `return ${processedExpression}`)(Math);
    } catch (error) {
      return NaN;
    }
  }

  static generate2DData(
    expression: string,
    range: [number, number],
    points: number = 100
  ): { x: number[]; y: number[] } {
    const x: number[] = [];
    const y: number[] = [];
    const [start, end] = range;
    const step = (end - start) / points;

    for (let i = 0; i <= points; i++) {
      const xVal = start + i * step;
      const yVal = this.evaluateExpression(expression, xVal);
      
      if (!isNaN(yVal) && isFinite(yVal)) {
        x.push(xVal);
        y.push(yVal);
      }
    }

    return { x, y };
  }

  static generate3DData(
    expression: string,
    rangeX: [number, number],
    rangeY: [number, number],
    points: number = 50
  ): { x: number[]; y: number[]; z: number[][] } {
    const [xStart, xEnd] = rangeX;
    const [yStart, yEnd] = rangeY;
    const stepX = (xEnd - xStart) / points;
    const stepY = (yEnd - yStart) / points;

    const x: number[] = [];
    const y: number[] = [];
    const z: number[][] = [];

    for (let i = 0; i <= points; i++) {
      x.push(xStart + i * stepX);
    }

    for (let j = 0; j <= points; j++) {
      y.push(yStart + j * stepY);
    }

    for (let j = 0; j <= points; j++) {
      const zRow: number[] = [];
      for (let i = 0; i <= points; i++) {
        const zVal = this.evaluateExpression(expression, x[i], y[j]);
        zRow.push(isNaN(zVal) || !isFinite(zVal) ? 0 : zVal);
      }
      z.push(zRow);
    }

    return { x, y, z };
  }

  static generateParametric3D(
    xExpr: string,
    yExpr: string,
    zExpr: string,
    tRange: [number, number],
    points: number = 200
  ): { x: number[]; y: number[]; z: number[] } {
    const [tStart, tEnd] = tRange;
    const step = (tEnd - tStart) / points;
    
    const x: number[] = [];
    const y: number[] = [];
    const z: number[] = [];

    for (let i = 0; i <= points; i++) {
      const t = tStart + i * step;
      const xVal = this.evaluateExpression(xExpr, 0, 0, 0, t);
      const yVal = this.evaluateExpression(yExpr, 0, 0, 0, t);
      const zVal = this.evaluateExpression(zExpr, 0, 0, 0, t);

      if (!isNaN(xVal) && !isNaN(yVal) && !isNaN(zVal)) {
        x.push(xVal);
        y.push(yVal);
        z.push(zVal);
      }
    }

    return { x, y, z };
  }

  static validateExpression(expression: string): boolean {
    try {
      const testVal = this.evaluateExpression(expression, 0, 0, 0, 0);
      return !isNaN(testVal);
    } catch {
      return false;
    }
  }
}
