
// Advanced math evaluation engine
export class MathEngine {
  static evaluateExpression(expression: string, x: number): number {
    try {
      // Replace mathematical constants and functions
      let processedExpression = expression
        .replace(/pi/g, Math.PI.toString())
        .replace(/e(?![a-z])/g, Math.E.toString())
        .replace(/x/g, x.toString())
        .replace(/\^/g, '**')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/asin\(/g, 'Math.asin(')
        .replace(/acos\(/g, 'Math.acos(')
        .replace(/atan\(/g, 'Math.atan(')
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
        .replace(/factorial\(/g, 'this.factorial(');

      // eslint-disable-next-line no-new-func
      return new Function('Math', `return ${processedExpression}`)(Math);
    } catch (error) {
      return NaN;
    }
  }

  static factorial(n: number): number {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  static findIntersections(eq1: string, eq2: string, range: [number, number] = [-10, 10]): Array<[number, number]> {
    const intersections: Array<[number, number]> = [];
    const step = 0.01;
    
    for (let x = range[0]; x <= range[1]; x += step) {
      const y1 = this.evaluateExpression(eq1, x);
      const y2 = this.evaluateExpression(eq2, x);
      
      if (!isNaN(y1) && !isNaN(y2) && Math.abs(y1 - y2) < 0.05) {
        const roundedX = parseFloat(x.toFixed(2));
        const roundedY = parseFloat(y1.toFixed(2));
        
        // Avoid duplicate points
        if (!intersections.some(([ix, iy]) => Math.abs(ix - roundedX) < 0.1 && Math.abs(iy - roundedY) < 0.1)) {
          intersections.push([roundedX, roundedY]);
        }
      }
    }
    
    return intersections;
  }

  static findSlope(equation: string, x: number, h: number = 0.001): number {
    const y1 = this.evaluateExpression(equation, x - h);
    const y2 = this.evaluateExpression(equation, x + h);
    
    if (isNaN(y1) || isNaN(y2)) return NaN;
    
    return (y2 - y1) / (2 * h);
  }

  static analyzeQuadratic(equation: string): {
    vertex: [number, number] | null;
    axis: number | null;
    direction: 'up' | 'down' | null;
    discriminant: number | null;
    roots: number[] | null;
  } {
    // Extract coefficients from ax^2 + bx + c format
    const match = equation.match(/([+-]?\d*\.?\d*)\*?x\^2([+-]?\d*\.?\d*)\*?x?([+-]?\d*\.?\d*)?/);
    
    if (!match) return { vertex: null, axis: null, direction: null, discriminant: null, roots: null };
    
    const a = parseFloat(match[1] || '1');
    const b = parseFloat(match[2] || '0');
    const c = parseFloat(match[3] || '0');
    
    if (a === 0) return { vertex: null, axis: null, direction: null, discriminant: null, roots: null };
    
    // Vertex
    const vertexX = -b / (2 * a);
    const vertexY = this.evaluateExpression(equation, vertexX);
    
    // Discriminant and roots
    const discriminant = b * b - 4 * a * c;
    let roots: number[] | null = null;
    
    if (discriminant >= 0) {
      const root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      const root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
      roots = discriminant === 0 ? [root1] : [root1, root2];
    }
    
    return {
      vertex: [parseFloat(vertexX.toFixed(3)), parseFloat(vertexY.toFixed(3))],
      axis: parseFloat(vertexX.toFixed(3)),
      direction: a > 0 ? 'up' : 'down',
      discriminant: parseFloat(discriminant.toFixed(3)),
      roots: roots?.map(r => parseFloat(r.toFixed(3))) || null
    };
  }

  static solveCubic(equation: string): number[] {
    // Basic cubic solver using numerical methods
    const roots: number[] = [];
    const step = 0.1;
    
    for (let x = -20; x <= 20; x += step) {
      const y1 = this.evaluateExpression(equation, x);
      const y2 = this.evaluateExpression(equation, x + step);
      
      if (!isNaN(y1) && !isNaN(y2)) {
        if ((y1 <= 0 && y2 >= 0) || (y1 >= 0 && y2 <= 0)) {
          // Found a sign change, refine the root
          let left = x;
          let right = x + step;
          
          for (let i = 0; i < 10; i++) {
            const mid = (left + right) / 2;
            const midValue = this.evaluateExpression(equation, mid);
            
            if (Math.abs(midValue) < 0.001) {
              roots.push(parseFloat(mid.toFixed(3)));
              break;
            }
            
            if ((this.evaluateExpression(equation, left) <= 0 && midValue >= 0) ||
                (this.evaluateExpression(equation, left) >= 0 && midValue <= 0)) {
              right = mid;
            } else {
              left = mid;
            }
          }
        }
      }
    }
    
    return roots.filter((root, index, arr) => 
      arr.findIndex(r => Math.abs(r - root) < 0.1) === index
    );
  }
}
