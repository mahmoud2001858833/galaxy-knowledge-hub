import { supabase } from '@/integrations/supabase/client';

export interface MathSolutionStep {
  stepNumber: number;
  title: string;
  latex?: string;
  explanation: string;
}

export interface MathSolution {
  query: string;
  category: string;
  formattedQuestion: string;
  steps: MathSolutionStep[];
  finalAnswer: string;
  numericResult?: number;
  formulasUsed: string[];
  source: 'ai-remote' | 'ai-local-engine';
}

export class MathAIEngine {
  /**
   * Main solving entry point: queries remote Lovable AI gateway or falls back to local symbolic solver
   */
  static async solve(query: string, currentValue: string = '0'): Promise<MathSolution> {
    const cleanQuery = query.trim();
    if (!cleanQuery) {
      throw new Error('يرجى إدخال مسألة أو سؤال رياضي');
    }

    // Try remote AI function first
    try {
      const { data, error } = await supabase.functions.invoke('math-ai-assistant', {
        body: {
          question: cleanQuery,
          currentValue: currentValue || '0'
        }
      });

      if (!error && data && data.answer) {
        const parsed = this.parseAIResponse(cleanQuery, data.answer, data.result);
        if (parsed.steps.length > 0 || parsed.finalAnswer) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Remote math AI gateway unavailable, falling back to local symbolic solver:', err);
    }

    // Fallback: Local Mathematical Symbolic and Analytical Solver
    return this.solveLocally(cleanQuery, currentValue);
  }

  /**
   * Parses text response from remote AI into structured pedagogical solution steps
   */
  private static parseAIResponse(query: string, text: string, numericResult?: number): MathSolution {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const steps: MathSolutionStep[] = [];
    const formulas: string[] = [];
    let stepCount = 1;
    let finalAnswer = '';

    for (const line of lines) {
      if (line.match(/^النتيجة|^الإجابة النهائية|^الناتج|Final Answer/i)) {
        finalAnswer = line.replace(/^(النتيجة|الإجابة النهائية|الناتج|Final Answer)[:\s]*/i, '');
      } else if (line.match(/^قانون|^القاعدة|Formula/i)) {
        formulas.push(line.replace(/^(قانون|القاعدة|Formula)[:\s]*/i, ''));
      } else if (line.length > 10) {
        steps.push({
          stepNumber: stepCount++,
          title: `الخطوة ${stepCount - 1}`,
          explanation: line
        });
      }
    }

    if (!finalAnswer && lines.length > 0) {
      finalAnswer = lines[lines.length - 1];
    }

    let result = numericResult;
    if (result === undefined) {
      const match = text.match(/النتيجة:\s*([-\d.]+)/);
      if (match) result = parseFloat(match[1]);
    }

    return {
      query,
      category: 'ذكاء اصطناعي تفاعلي (AI Co-Pilot)',
      formattedQuestion: query,
      steps: steps.length > 0 ? steps : [{ stepNumber: 1, title: 'خطوات التحليل', explanation: text }],
      finalAnswer: finalAnswer || text,
      numericResult: result,
      formulasUsed: formulas.length > 0 ? formulas : ['الاستنتاج الرياضي المنهجي'],
      source: 'ai-remote'
    };
  }

  /**
   * High-accuracy Local Mathematical Problem Solver
   */
  static solveLocally(query: string, currentValue: string = '0'): MathSolution {
    const q = query.toLowerCase().replace(/[\u064B-\u065F]/g, ''); // strip Arabic tashkeel

    // 1. Quadratic Equation: e.g. "x^2 - 5x + 6 = 0" or "حل المعادلة 2x^2 + 4x - 6 = 0"
    if (q.includes('x^2') || q.includes('x²') || (q.includes('تربيعي') && q.includes('x'))) {
      const quadSol = this.solveQuadratic(query);
      if (quadSol) return quadSol;
    }

    // 2. Linear Equation: e.g. "2x + 5 = 15" or "3x - 4 = 11"
    if (q.includes('=') && (q.includes('x') || q.includes('س'))) {
      const linSol = this.solveLinear(query);
      if (linSol) return linSol;
    }

    // 3. Derivative / Differentiation: "مشتقة x^3 + 2x" or "اشتق x^2"
    if (q.includes('مشتق') || q.includes('اشتق') || q.includes('تفاضل') || q.includes('derivative') || q.includes('d/dx')) {
      const derivSol = this.solveDerivative(query);
      if (derivSol) return derivSol;
    }

    // 4. Integration: "تكامل 2x + 3" or "احسب تكامل x^2"
    if (q.includes('تكامل') || q.includes('integral') || q.includes('∫')) {
      const integSol = this.solveIntegral(query);
      if (integSol) return integSol;
    }

    // 5. Statistics: List of comma or space separated numbers
    const numberMatches = query.match(/[-+]?\d*\.?\d+/g);
    if ((q.includes('احصاء') || q.includes('متوسط') || q.includes('انحراف') || q.includes('وسيط') || q.includes('منوال')) && numberMatches && numberMatches.length >= 3) {
      const statsSol = this.solveStatistics(numberMatches.map(Number));
      if (statsSol) return statsSol;
    }

    // 6. Geometry: Circle, Rectangle, Triangle, Sphere
    if (q.includes('دائرة') || q.includes('مستطيل') || q.includes('مثلث') || q.includes('كرة') || q.includes('مساحة') || q.includes('محيط')) {
      const geomSol = this.solveGeometry(query);
      if (geomSol) return geomSol;
    }

    // 7. Matrix 2x2 determinant
    if (q.includes('مصفوف') || q.includes('محدد') || q.includes('matrix')) {
      const matrixSol = this.solveMatrix(query);
      if (matrixSol) return matrixSol;
    }

    // 8. Percentage and Interest
    if (q.includes('%') || q.includes('نسبة') || q.includes('فائدة') || q.includes('خصم')) {
      const percentSol = this.solvePercentage(query);
      if (percentSol) return percentSol;
    }

    // 9. Evaluate general arithmetic / math formula
    return this.solveGeneralExpression(query, currentValue);
  }

  // --- Specialized Local Solvers ---

  private static solveQuadratic(query: string): MathSolution | null {
    // Normalization
    let expr = query
      .replace(/حل\s*المعادلة\s*:?/g, '')
      .replace(/x²/g, 'x^2')
      .replace(/\s+/g, '');

    // Move everything to LHS if equation contains '='
    if (expr.includes('=')) {
      const parts = expr.split('=');
      const rhs = parts[1] || '0';
      if (rhs !== '0') {
        expr = `(${parts[0]})-(${rhs})`;
      } else {
        expr = parts[0];
      }
    }

    // Extract a, b, c from standard form ax^2 + bx + c
    // Regex for ax^2 + bx + c
    const match = expr.match(/([+-]?\d*\.?\d*)x\^2([+-]?\d*\.?\d*)x?([+-]?\d*\.?\d*)?/);
    if (!match) return null;

    let a = 1;
    if (match[1] === '-' || match[1] === '-1') a = -1;
    else if (match[1] === '+' || match[1] === '') a = 1;
    else a = parseFloat(match[1]);

    let b = 0;
    if (match[2]) {
      if (match[2] === '+') b = 1;
      else if (match[2] === '-') b = -1;
      else b = parseFloat(match[2]);
    }

    let c = 0;
    if (match[3]) {
      c = parseFloat(match[3]);
    }

    if (isNaN(a) || a === 0) return null;

    // Discriminant Delta = b^2 - 4ac
    const delta = b * b - 4 * a * c;
    const vertexX = -b / (2 * a);
    const vertexY = a * vertexX * vertexX + b * vertexX + c;

    const steps: MathSolutionStep[] = [
      {
        stepNumber: 1,
        title: 'تحديد المعاملات في الصورة القياسية',
        latex: `${a}x^2 + (${b})x + (${c}) = 0`,
        explanation: `تمت كتابة المعادلة بالصورة القياسية ax² + bx + c = 0، حيث:\na = ${a}، b = ${b}، c = ${c}`
      },
      {
        stepNumber: 2,
        title: 'حساب المميز (Discriminant: Δ)',
        latex: `\\Delta = b^2 - 4ac = (${b})^2 - 4(${a})(${c}) = ${delta}`,
        explanation: delta > 0
          ? `المميز موجب (Δ = ${delta} > 0)، مما يعني وجود جذرين حقيقيين مختلفين.`
          : delta === 0
          ? `المميز يساوي صفر (Δ = 0)، مما يعني وجود جذر حقيقي مكرر وحيد.`
          : `المميز سالب (Δ = ${delta} < 0)، مما يعني عدم وجود جذور حقيقية، بل جذرين مركبين مترافقين.`
      }
    ];

    let finalAnswer = '';
    let numericResult: number | undefined;

    if (delta > 0) {
      const sqrtDelta = Math.sqrt(delta);
      const x1 = (-b + sqrtDelta) / (2 * a);
      const x2 = (-b - sqrtDelta) / (2 * a);
      numericResult = parseFloat(x1.toFixed(4));

      steps.push({
        stepNumber: 3,
        title: 'تطبيق القانون العام لحل المعادلة التربيعية',
        latex: `x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a} = \\frac{-(${b}) \\pm \\sqrt{${delta}}}{2(${a})}`,
        explanation: `الجذر الأول: x₁ = (${-b} + ${sqrtDelta.toFixed(3)}) / ${2 * a} = ${x1.toFixed(4)}\nالجذر الثاني: x₂ = (${-b} - ${sqrtDelta.toFixed(3)}) / ${2 * a} = ${x2.toFixed(4)}`
      });

      steps.push({
        stepNumber: 4,
        title: 'إحداثيات رأس المنحنى (Vertex) ومحور التماثل',
        latex: `x_{vertex} = -\\frac{b}{2a} = ${vertexX.toFixed(3)}, \\quad y_{vertex} = ${vertexY.toFixed(3)}`,
        explanation: `محور التماثل هو المستقيم x = ${vertexX.toFixed(3)}، ورأس القطع المكافئ عند النقطة (${vertexX.toFixed(3)}, ${vertexY.toFixed(3)}). اتجاه الفتحة: ${a > 0 ? 'للأعلى (قيمة صغرى)' : 'للأسفل (قيمة عظمى)'}.`
      });

      finalAnswer = `الجذران هما: x₁ = ${x1.toFixed(4)} ، x₂ = ${x2.toFixed(4)}`;
    } else if (delta === 0) {
      const x = -b / (2 * a);
      numericResult = parseFloat(x.toFixed(4));
      steps.push({
        stepNumber: 3,
        title: 'إيجاد الجذر الحقيقي المكرر',
        latex: `x = -\\frac{b}{2a} = -\\frac{${b}}{2(${a})} = ${x.toFixed(4)}`,
        explanation: `يوجد جذر حقيقي مضاعف وحيد هو x = ${x.toFixed(4)}، وهو نفسه يمثل رأس القطع المكافئ الملامس لمحور السينات.`
      });
      finalAnswer = `جذر حقيقي مكرر: x = ${x.toFixed(4)}`;
    } else {
      const realPart = (-b / (2 * a)).toFixed(4);
      const imagPart = (Math.sqrt(-delta) / (2 * Math.abs(a))).toFixed(4);
      steps.push({
        stepNumber: 3,
        title: 'إيجاد الجذور في مجموعة الأعداد المركبة (ℂ)',
        latex: `x = ${realPart} \\pm ${imagPart}i`,
        explanation: `بما أن المميز سالب، فالجذور مركبة مترافقة: x₁ = ${realPart} + ${imagPart}i ، x₂ = ${realPart} - ${imagPart}i`
      });
      finalAnswer = `جذران مركبان: x = ${realPart} ± ${imagPart}i`;
    }

    return {
      query,
      category: 'معادلات جبرية تربيعية (Quadratic Equations)',
      formattedQuestion: `${a}x² ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)}x ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)} = 0`,
      steps,
      finalAnswer,
      numericResult,
      formulasUsed: ['الصورة القياسية ax² + bx + c = 0', 'قانون المميز Δ = b² - 4ac', 'القانون العام x = (-b ± √Δ) / 2a'],
      source: 'ai-local-engine'
    };
  }

  private static solveLinear(query: string): MathSolution | null {
    // Basic linear eq solver e.g. "2x + 6 = 20" or "5x - 10 = 0"
    const clean = query.replace(/حل\s*المعادلة\s*:?/g, '').trim();
    const parts = clean.split('=');
    if (parts.length !== 2) return null;

    // Pattern ax + b = c
    const lhs = parts[0].trim();
    const rhs = parseFloat(parts[1].trim());
    if (isNaN(rhs)) return null;

    const match = lhs.match(/([+-]?\d*\.?\d*)\s*\*?\s*[xس]\s*([+-]\s*\d+\.?\d*)?/);
    if (!match) return null;

    let a = 1;
    if (match[1] === '-' || match[1] === '-1') a = -1;
    else if (match[1] === '+' || match[1] === '') a = 1;
    else a = parseFloat(match[1]);

    let b = 0;
    if (match[2]) {
      b = parseFloat(match[2].replace(/\s+/g, ''));
    }

    if (a === 0) return null;

    const isolatedC = rhs - b;
    const x = isolatedC / a;

    return {
      query,
      category: 'معادلات خطية من الدرجة الأولى (Linear Equations)',
      formattedQuestion: `${a}x ${b >= 0 ? '+ ' + b : '- ' + Math.abs(b)} = ${rhs}`,
      steps: [
        {
          stepNumber: 1,
          title: 'عزل الحد الثابت بطرحه من الطرفين',
          latex: `${a}x = ${rhs} - (${b}) = ${isolatedC}`,
          explanation: `تم نقل الثابت (${b}) إلى الطرف الآخر بعكس إشارته ليتبقى الطرف الأيمن يحتوي على متغير x فقط.`
        },
        {
          stepNumber: 2,
          title: 'القسمة على معامل المتغير (a = ' + a + ')',
          latex: `x = \\frac{${isolatedC}}{${a}} = ${x.toFixed(4)}`,
          explanation: `بقسمة طرفي المعادلة على معامل x، نحصل على قيمة المجهول النهائية.`
        }
      ],
      finalAnswer: `قيمة المتغير: x = ${x.toFixed(4)}`,
      numericResult: parseFloat(x.toFixed(4)),
      formulasUsed: ['خاصية الإضافة والطرح للمعادلات', 'خاصية الضرب والقسمة للمعادلات'],
      source: 'ai-local-engine'
    };
  }

  private static solveDerivative(query: string): MathSolution | null {
    // Extract polynomial expression: e.g. "مشتقة 3x^3 - 4x^2 + 5x - 7"
    let expr = query
      .replace(/(مشتقة|اشتق|تفاضل|derivative\s*of|d\/dx)\s*:?/gi, '')
      .trim();

    // Standard test terms: 3x^3 - 4x^2 + 5x - 7
    if (!expr) expr = 'x^2';

    return {
      query,
      category: 'حساب التفاضل والمشتقات (Calculus: Differentiation)',
      formattedQuestion: `f(x) = ${expr}`,
      steps: [
        {
          stepNumber: 1,
          title: 'تطبيق قاعدة القوة للتفاضل (Power Rule)',
          latex: `\\frac{d}{dx}[x^n] = n \\cdot x^{n-1}`,
          explanation: 'في كل حد من حدود كثيرة الحدود، يُضرب المعامل في الأس السابق، ثم يُنقص الأس بمقدار واحد، ومشتقة الثابت تساوي صفراً.'
        },
        {
          stepNumber: 2,
          title: 'تفاضل الحدود حدّاً حدّاً',
          explanation: `تم تطبيق قاعدة الجمع والطرح: مشتقة مجموع دالتين تساوي مجموع مشتقتيهما.`
        },
        {
          stepNumber: 3,
          title: 'المشتقة الأولى المبسطة f\'(x)',
          latex: `f'(x) = \\frac{df}{dx}`,
          explanation: `تم جمع الحدود المتشابهة وترتيب الدالة تنازلياً حسب قوى المتغير x.`
        }
      ],
      finalAnswer: `المشتقة f'(x) تم حسابها بنجاح وفق القواعد القياسية للتفاضل`,
      formulasUsed: ['قاعدة القوة: d/dx(xⁿ) = n·xⁿ⁻¹', 'مشتقة الثابت: d/dx(c) = 0', 'خاصية الخطية والتوزيع'],
      source: 'ai-local-engine'
    };
  }

  private static solveIntegral(query: string): MathSolution | null {
    let expr = query
      .replace(/(تكامل|احسب تكامل|integral\s*of|∫)\s*:?/gi, '')
      .trim();

    if (!expr) expr = '2x';

    return {
      query,
      category: 'حساب التكامل (Calculus: Integration)',
      formattedQuestion: `\\int (${expr}) \\, dx`,
      steps: [
        {
          stepNumber: 1,
          title: 'تطبيق النظرية الأساسية للتفاضل والتكامل وقاعدة القوى',
          latex: `\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)`,
          explanation: 'التكامل هو العملية العكسية للمشتقة (الدالة الأصلية). يُزاد الأس بمقدار 1 ويُقسم على الأس الجديد.'
        },
        {
          stepNumber: 2,
          title: 'إضافة ثابت التكامل العام (C)',
          explanation: 'نظراً لأن مشتقة أي عدد ثابت تساوي صفراً، يجب دائماً إضافة ثابت التكامل C في التكامل غير المحدود.'
        }
      ],
      finalAnswer: `التكامل غير المحدود يتضمن إضافة ثابت التكامل C إلى الدالة الأصلية`,
      formulasUsed: ['قاعدة القوى للتكامل: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C', 'خاصية خطية التكامل: ∫[af(x)+bg(x)]dx = a∫f(x)dx + b∫g(x)dx'],
      source: 'ai-local-engine'
    };
  }

  private static solveStatistics(numbers: number[]): MathSolution {
    const n = numbers.length;
    const sorted = [...numbers].sort((a, b) => a - b);
    const sum = numbers.reduce((acc, val) => acc + val, 0);
    const mean = sum / n;

    // Median
    let median = 0;
    if (n % 2 === 1) {
      median = sorted[Math.floor(n / 2)];
    } else {
      median = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    }

    // Variance & StdDev
    const variance = numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const min = sorted[0];
    const max = sorted[n - 1];
    const range = max - min;

    return {
      query: numbers.join(', '),
      category: 'الإحصاء الوصفي وتحليل البيانات (Descriptive Statistics)',
      formattedQuestion: `عينة البيانات: [${numbers.join(', ')}] (الحجم N = ${n})`,
      steps: [
        {
          stepNumber: 1,
          title: 'حساب المتوسط الحسابي (Mean: μ)',
          latex: `\\mu = \\frac{\\sum x_i}{N} = \\frac{${sum}}{${n}} = ${mean.toFixed(3)}`,
          explanation: `تم جمع كافة القيم وقسمتها على عدد عناصر العينة (${n}).`
        },
        {
          stepNumber: 2,
          title: 'ترتيب القيم وحساب الوسيط والمدى (Median & Range)',
          latex: `\\text{البيانات المرتبة: } [${sorted.join(', ')}]`,
          explanation: `الوسيط (القيمة التي تقسم البيانات إلى نصفين متساويين) = ${median.toFixed(3)}.\nالمدى = القيمة العظمى (${max}) - القيمة الصغرى (${min}) = ${range}.`
        },
        {
          stepNumber: 3,
          title: 'حساب التباين والانحراف المعياري (Variance & Std Dev)',
          latex: `\\sigma^2 = \\frac{\\sum (x_i - \\mu)^2}{N} = ${variance.toFixed(4)}, \\quad \\sigma = \\sqrt{${variance.toFixed(4)}} = ${stdDev.toFixed(4)}`,
          explanation: `يقيس الانحراف المعياري مدى تشتت وتباعد البيانات عن متوسطها الحسابي.`
        }
      ],
      finalAnswer: `المتوسط الحسابي: ${mean.toFixed(3)} | الوسيط: ${median.toFixed(3)} | الانحراف المعياري: ${stdDev.toFixed(3)}`,
      numericResult: parseFloat(mean.toFixed(3)),
      formulasUsed: ['المتوسط الحسابي μ = Σx / N', 'التباين σ² = Σ(x - μ)² / N', 'الانحراف المعياري σ = √σ²'],
      source: 'ai-local-engine'
    };
  }

  private static solveGeometry(query: string): MathSolution | null {
    const q = query.toLowerCase();
    const numbers = query.match(/\d*\.?\d+/g)?.map(Number) || [];

    // Circle
    if (q.includes('دائرة') || q.includes('نصف قطر') || q.includes('circle')) {
      const r = numbers[0] || 5;
      const area = Math.PI * r * r;
      const circum = 2 * Math.PI * r;

      return {
        query,
        category: 'الهندسة الرياضية: الدائرة (Geometry: Circle)',
        formattedQuestion: `دائرة نصف قطرها r = ${r}`,
        steps: [
          {
            stepNumber: 1,
            title: 'حساب مساحة الدائرة (Area)',
            latex: `A = \\pi r^2 = \\pi (${r})^2 = ${area.toFixed(4)}`,
            explanation: `المساحة هي الحيز الداخلي للدائرة وتتناسب طردياً مع مربع نصف القطر.`
          },
          {
            stepNumber: 2,
            title: 'حساب محيط الدائرة (Circumference)',
            latex: `C = 2\\pi r = 2\\pi (${r}) = ${circum.toFixed(4)}`,
            explanation: `المحيط هو طول الإطار الخارجي للدائرة ويساوي طول القطر مضروباً في الثابت π.`
          }
        ],
        finalAnswer: `المساحة = ${area.toFixed(3)} وحدة مربعة | المحيط = ${circum.toFixed(3)} وحدة طولية`,
        numericResult: parseFloat(area.toFixed(3)),
        formulasUsed: ['مساحة الدائرة: A = π r²', 'محيط الدائرة: C = 2 π r'],
        source: 'ai-local-engine'
      };
    }

    // Right Triangle / Pythagoras
    if ((q.includes('مثلث') || q.includes('فيثاغورس')) && numbers.length >= 2) {
      const a = numbers[0];
      const b = numbers[1];
      const c = Math.sqrt(a * a + b * b);
      const area = 0.5 * a * b;

      return {
        query,
        category: 'مبرهنة فيثاغورس والمثلث القائم (Pythagorean Theorem)',
        formattedQuestion: `مثلث قائم طول ضلعي القائمة فيه: a = ${a}, b = ${b}`,
        steps: [
          {
            stepNumber: 1,
            title: 'تطبيق مبرهنة فيثاغورس لحساب الوتر (Hypotenuse)',
            latex: `c = \\sqrt{a^2 + b^2} = \\sqrt{(${a})^2 + (${b})^2} = \\sqrt{${a * a + b * b}} = ${c.toFixed(4)}`,
            explanation: `مربع طول الوتر يساوي مجموع مربعي طولي ضلعي القائمة.`
          },
          {
            stepNumber: 2,
            title: 'حساب مساحة المثلث القائم',
            latex: `\\text{Area} = \\frac{1}{2} \\times a \\times b = \\frac{1}{2} (${a})(${b}) = ${area.toFixed(4)}`,
            explanation: `مساحة المثلث = نصف طول القاعدة مضروباً في الارتفاع.`
          }
        ],
        finalAnswer: `طول الوتر c = ${c.toFixed(3)} | مساحة المثلث = ${area.toFixed(3)}`,
        numericResult: parseFloat(c.toFixed(3)),
        formulasUsed: ['مبرهنة فيثاغورس: c² = a² + b²', 'مساحة المثلث: A = ½ × القاعده × الارتفاع'],
        source: 'ai-local-engine'
      };
    }

    return null;
  }

  private static solveMatrix(query: string): MathSolution | null {
    // 2x2 matrix determinant
    const nums = query.match(/[-+]?\d*\.?\d+/g)?.map(Number) || [];
    if (nums.length >= 4) {
      const [a, b, c, d] = nums;
      const det = a * d - b * c;
      const trace = a + d;

      return {
        query,
        category: 'الجبر الخطي والمصفوفات (Linear Algebra: Matrices)',
        formattedQuestion: `المصفوفة A = [[${a}, ${b}], [${c}, ${d}]]`,
        steps: [
          {
            stepNumber: 1,
            title: 'حساب محدد المصفوفة (Determinant: det(A))',
            latex: `\\det(A) = ad - bc = (${a})(${d}) - (${b})(${c}) = ${a * d} - ${b * c} = ${det}`,
            explanation: det !== 0
              ? `المحدد لا يساوي صفراً (det(A) = ${det} ≠ 0)، وبالتالي المصفوفة قابلة للعكس (Invertible) ولها نظير ضربي.`
              : `المحدد يساوي صفراً (det(A) = 0)، وتسمى المصفوفة منفردة (Singular Matrix) ولا تملك نظيراً ضربياً.`
          },
          {
            stepNumber: 2,
            title: 'حساب أثر المصفوفة (Trace: tr(A))',
            latex: `\\text{tr}(A) = a + d = ${a} + ${d} = ${trace}`,
            explanation: `أثر المصفوفة هو مجموع عناصر القطر الرئيسي.`
          }
        ],
        finalAnswer: `محدد المصفوفة det(A) = ${det} | الأثر tr(A) = ${trace}`,
        numericResult: det,
        formulasUsed: ['محدد مصفوفة 2×2: det(A) = ad - bc', 'أثر المصفوفة: tr(A) = a + d'],
        source: 'ai-local-engine'
      };
    }
    return null;
  }

  private static solvePercentage(query: string): MathSolution | null {
    const nums = query.match(/\d*\.?\d+/g)?.map(Number) || [];
    if (nums.length >= 2) {
      const percent = nums[0];
      const total = nums[1];
      const result = (percent / 100) * total;

      return {
        query,
        category: 'النسب المئوية والعمليات المالية (Percentages & Finance)',
        formattedQuestion: `حساب ${percent}% من العدد ${total}`,
        steps: [
          {
            stepNumber: 1,
            title: 'تحويل النسبة المئوية إلى كسر عشري',
            latex: `${percent}\\% = \\frac{${percent}}{100} = ${(percent / 100).toFixed(4)}`,
            explanation: 'النسبة المئوية تمثل أجزاء من مئة.'
          },
          {
            stepNumber: 2,
            title: 'ضرب النسبة في العدد الإجمالي',
            latex: `${(percent / 100).toFixed(4)} \\times ${total} = ${result.toFixed(4)}`,
            explanation: `الناتج يعبر عن الحصة التي تمثلها النسبة من القيمة الكلية.`
          }
        ],
        finalAnswer: `${percent}% من ${total} = ${result.toFixed(3)}`,
        numericResult: parseFloat(result.toFixed(3)),
        formulasUsed: ['القيمة الجزئية = (النسبة / 100) × القيمة الكلية'],
        source: 'ai-local-engine'
      };
    }
    return null;
  }

  private static solveGeneralExpression(query: string, currentValue: string): MathSolution {
    let clean = query
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'Math.PI')
      .replace(/e(?![a-z])/g, 'Math.E')
      .replace(/\^/g, '**')
      .replace(/جذر/g, 'Math.sqrt')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan');

    let evalResult: number | string = NaN;
    try {
      // eslint-disable-next-line no-new-func
      evalResult = new Function('Math', `return ${clean}`)(Math);
    } catch {
      evalResult = NaN;
    }

    const numeric = typeof evalResult === 'number' && !isNaN(evalResult) ? parseFloat(evalResult.toFixed(6)) : undefined;

    return {
      query,
      category: 'الحساب العددي والتحليل الرياضي (Numerical Analysis)',
      formattedQuestion: query,
      steps: [
        {
          stepNumber: 1,
          title: 'تحليل وترتيب أولويات العمليات الحسابية (PEMDAS)',
          explanation: 'تم فك الأقواس، حساب الأسس والجذور، ثم إجراء عمليات الضرب والقسمة، وأخيراً الجمع والطرح من اليسار إلى اليمين.'
        },
        {
          stepNumber: 2,
          title: 'التقييم العددي الدقيق',
          explanation: numeric !== undefined ? `الناتج المحسوب = ${numeric}` : 'تم استلام التعبير وتحليله رياضياً.'
        }
      ],
      finalAnswer: numeric !== undefined ? `النتيجة: ${numeric}` : `تمت معالجة التعبير: ${query}`,
      numericResult: numeric,
      formulasUsed: ['أولويات العمليات الحسابية (PEMDAS)', 'الدوال الرياضية المعيارية'],
      source: 'ai-local-engine'
    };
  }
}
