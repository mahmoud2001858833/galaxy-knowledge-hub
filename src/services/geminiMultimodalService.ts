/**
 * Gemini Multimodal AI Service for Zarwat Al-Elm 2.0
 * Supports:
 * - Multimodal Image OCR & Handwritten Mathematical/Scientific Problem Solving
 * - Voice & Text Educational Socratic Tutoring
 * - AI-Generated Concept Mindmaps (JSON Trees)
 * - AI-Generated Interactive Lesson Decks with Exit Tickets
 */

export interface MindmapTreeNode {
  id: string;
  label: string;
  category: string;
  color: string;
  description?: string;
  formula?: string;
  children?: MindmapTreeNode[];
}

export interface LessonSlideData {
  id: string;
  title: string;
  subtitle?: string;
  type: 'objectives' | 'concept' | 'simulation' | 'misconceptions' | 'exit_ticket';
  content: {
    bullets?: string[];
    keyFormula?: string;
    explanation?: string;
    simulationSlug?: string;
    simulationTitle?: string;
    misconceptions?: { misconception: string; correction: string }[];
    quiz?: {
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }[];
  };
}

class GeminiMultimodalService {
  private primaryApiKey: string;
  private storageKey = 'galaxy_gemini_api_key';
  private activeModel: string = 'gemini-2.5-flash-lite';
  private fallbackModels: string[] = [
    'gemini-2.5-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash'
  ];

  constructor() {
    // Priority: Custom key from localStorage or decoded default key
    try {
      const customKey = localStorage.getItem(this.storageKey);
      if (customKey && customKey.trim()) {
        this.primaryApiKey = customKey.trim();
      } else {
        // Obfuscated production key resolved at browser runtime
        this.primaryApiKey = atob('QVEuQWI4Uk42SkZ4Z0NWSm00MEllNWdPZkxwTkFsV2h2ckg3eUVnT1dKcHZhdTJacnBCNGc=');
      }
    } catch {
      this.primaryApiKey = '';
    }
  }

  public getApiKey(): string {
    return this.primaryApiKey;
  }

  public setApiKey(key: string): void {
    this.primaryApiKey = key.trim();
    try {
      localStorage.setItem(this.storageKey, this.primaryApiKey);
    } catch {}
  }

  /**
   * Universal internal dispatcher with model cascade
   */
  private async dispatchGeminiRequest(payload: any): Promise<string> {
    const modelsToTry = [this.activeModel, ...this.fallbackModels.filter(m => m !== this.activeModel)];
    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.primaryApiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textOutput) {
          throw new Error('لم يتم استلام نص من خادم الذكاء الاصطناعي');
        }

        this.activeModel = model; // Cache successful model
        return textOutput;
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini model ${model} failed, trying fallback...`, err?.message);
      }
    }

    throw lastError || new Error('فشلت جميع نماذج الذكاء الاصطناعي في الاستجابة');
  }

  /**
   * 1. Solve Visual / Handwritten Science & Math Problems
   */
  public async solveProblemWithImage(
    base64Data: string,
    mimeType: string,
    userPrompt: string,
    mode: 'socratic' | 'full_solution' = 'full_solution',
    discipline: string = 'علوم ورياضيات'
  ): Promise<string> {
    const socraticInstruction = mode === 'socratic'
      ? `أنت المعلم المرشد السقراطي في منصة "ذروة العلم 2.0" في الأردن. 
         مهمتك: حلل المسألة أو المعادلة أو المخطط الموجود في الصورة. لا تعطه الحل النهائي فوراً، بل:
         1. بين له فكرة المسألة والمفهوم الفيزيائي أو الرياضي الأساسي المعني بها.
         2. استخرج المعطيات والمطلوب بدقة.
         3. وجه له سؤالاً ذكياً أو أشر له إلى القانون المناسب للبدء بالخطوة الأولى لحلها بنفسه.
         4. استخدم أسلوباً تشجيعياً ملهماً بالعربية الفصحى مع التنسيق الأنيق.`
      : `أنت المعلم الأكاديمي الخبير في منصة "ذروة العلم 2.0" المتوافق مع مناهج التوجيهي الأردنية ومسارات BTEC العلمية.
         مهمتك: حل المسألة العلمية/الرياضية المرفقة في الصورة حلاً نموذجياً شاملاً:
         1. استخراج المعطيات والمجاهيل بدقة مع الوحدات الفيزيائية.
         2. كتابة القوانين العلمية المستخدمة بصيغة واضحة وجميلة (LaTeX عند الحاجة).
         3. خطوات الحل الرياضي خطوة بخطوة بالتعويض العددي.
         4. النتيجة النهائية مبرزة بوضوح مع وحدة القياس.
         5. نصيحة ذهبية لمنع الخطأ الشائع في هذا النوع من الأسئلة.`;

    const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `${socraticInstruction}\n\nالتخصص: ${discipline}\nطلب الطالب الإضافي: ${userPrompt || 'يرجى تحليل هذه المسألة'}`
            },
            {
              inlineData: {
                mimeType: mimeType || 'image/png',
                data: cleanBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048
      }
    };

    return await this.dispatchGeminiRequest(payload);
  }

  /**
   * 2. Voice/Text Tutor Socratic Dialogue
   */
  public async askVoiceTutor(
    question: string,
    discipline: string = 'فيزياء',
    contextHistory?: { role: 'user' | 'model'; text: string }[]
  ): Promise<string> {
    const systemPrompt = `أنت "المرشد العلمي الذكي الناطق" في منصة ذروة العلم 2.0 (مدرسة عنبه الثانية الشاملة للبنين - الأردن).
تتحدث باللغة العربية الفصحى السلسة والمشجعة، مخصص للرد الصوتي السريع، إجاباتك علمية دقيقة، مركزة، لا تتجاوز 4 إلى 5 أسطر لكي تكون سهلة وممتعة للاستماع الصوتي.
إذا كان السؤال يتضمن مسألة، اشرح المبدأ الفيزيائي أو الكيميائي أو الرياضي الأساسي بطريقة ملهمة وعميقة. التخصص الحالي: ${discipline}.`;

    const contents: any[] = [
      {
        parts: [{ text: systemPrompt }]
      }
    ];

    if (contextHistory && contextHistory.length > 0) {
      contextHistory.slice(-4).forEach(item => {
        contents.push({
          role: item.role,
          parts: [{ text: item.text }]
        });
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: question }]
    });

    const payload = {
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 800
      }
    };

    return await this.dispatchGeminiRequest(payload);
  }

  /**
   * 3. AI Dynamic Concept Mindmap Generator (Returns JSON Tree)
   */
  public async generateMindmapHierarchy(
    topic: string,
    gradeLevel: string = 'توجيهي علمي',
    discipline: string = 'فيزياء'
  ): Promise<MindmapTreeNode[]> {
    const prompt = `أنت خبير مناهج تعليمية ومصمم خرائط مفاهيمية في منصة ذروة العلم 2.0.
قم بإنشاء خريطة ذهنية مفاهيمية تفاعلية عميقة وشاملة لموضوع: "${topic}"، المرحلة: "${gradeLevel}"، التخصص: "${discipline}".
يجب أن ترجع النتيجة بصيغة JSON حصراً، عبارة عن مصفوفة من الفروع الرئيسية (Array of MindmapTreeNode)، بدون أي نصوص قبل أو بعد كود الـ JSON (Raw JSON only).

الهيكل المطلوب لكل عقدة:
{
  "id": "معرف فريد بالإنجليزية مثل node-1",
  "label": "عنوان المفهوم الرئيسي (مختصر 2-4 كلمات)",
  "category": "تصنيف فرعي",
  "color": "كود لوني هيكس أنيق ومتناسق مثل #38bdf8 أو #a855f7 أو #10b981 أو #f59e0b",
  "description": "شرح علمي دقيق للمفهوم في سطرين",
  "formula": "الصيغة الرياضية أو المعادلة الكيميائية إن وجدت بصيغة نصية واضحة",
  "children": [
    // 2 إلى 4 عقد فرعية بنفس الهيكل
  ]
}

قواعد صارمة:
1. يجب أن تحتوي الخريطة على 4 إلى 6 فروع رئيسية تغطي جوانب المفهوم: (التعريف والمفاهيم الأساسية، القوانين الرياضية والمعادلات، التطبيقات العملية الحياتية، المفاهيم الدقيقة والمغلوطة، مسائل نموذجية).
2. كل فرع رئيسي يجب أن يحتوي على فرعين إلى 3 فروع ثانوية.
3. التصدير يكون JSON صالح فقط قابل لـ JSON.parse.`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 3000
      }
    };

    const rawResponse = await this.dispatchGeminiRequest(payload);
    const cleanedJson = rawResponse
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    try {
      const parsed = JSON.parse(cleanedJson);
      if (Array.isArray(parsed)) return parsed;
      if (parsed.nodes && Array.isArray(parsed.nodes)) return parsed.nodes;
      if (parsed.children && Array.isArray(parsed.children)) return parsed.children;
      return [parsed];
    } catch (parseError) {
      console.error('Failed to parse AI mindmap JSON:', cleanedJson);
      throw new Error('تعذر معالجة بنية الخريطة الذهنية المولدة، يرجى المحاولة مرة أخرى.');
    }
  }

  /**
   * 4. AI Interactive Lesson Deck & Exit Ticket Generator
   */
  public async generateInteractiveLessonDeck(
    topic: string,
    gradeLevel: string = 'توجيهي علمي',
    discipline: string = 'فيزياء'
  ): Promise<{ slides: LessonSlideData[]; suggestedSimulationSlug: string }> {
    const prompt = `أنت خبير التخطيط التعليمي واستراتيجيات التدريس النشط في منصة ذروة العلم 2.0.
قم بإعداد درس تفاعلي متكامل عالي الاحترافية لموضوع: "${topic}"، المرحلة: "${gradeLevel}"، التخصص: "${discipline}".
الدرس مصمم للعرض الصفي والتعلم الذاتي، ومقسم إلى 5 شرائح متتابعة.

أرجع النتيجة حصراً بصيغة كائن JSON صالح، بدون أي مقدمات أو علامات إضافية:
{
  "suggestedSimulationSlug": "اختر أنسب معرف تجربة من الـ 49 تجربة المتاحة بالمنصة مثل: projectile-motion, geometric-optics, build-an-atom, chemical-equilibrium, faraday, wave-interference, hooks-law, nuclear-reactions",
  "slides": [
    {
      "id": "slide-1",
      "title": "عنوان الدرس ونواتج التعلم المستهدفة",
      "subtitle": "التهيئة الحافزة والمقدمة الملهمة",
      "type": "objectives",
      "content": {
        "bullets": ["ناتج تعلم 1", "ناتج تعلم 2", "ناتج تعلم 3"],
        "explanation": "تمهيد وسؤال محفز للتفكير يربط الموضوع بالحياة اليومية"
      }
    },
    {
      "id": "slide-2",
      "title": "البناء المعرفي والقوانين الأساسية",
      "subtitle": "التأصيل العلمي والمعادلات الرياضية",
      "type": "concept",
      "content": {
        "keyFormula": "القانون أو المعادلة الأساسية",
        "bullets": ["شرح الرموز ووحدات القياس", "العلاقات الطردية والعكسية", "شروط تطبيق المبدأ"],
        "explanation": "شرح علمي رصين ومختصر للمفهوم"
      }
    },
    {
      "id": "slide-3",
      "title": "المختبر الافتراضي والمحاكاة التفاعلية 3D",
      "subtitle": "الاستقصاء العملي والتجريب المباشر",
      "type": "simulation",
      "content": {
        "simulationSlug": "slug المحاكاة",
        "simulationTitle": "اسم التجربة التفاعلية المقترحة",
        "explanation": "إرشادات للطلاب حول المتغيرات التي ينبغي تغييرها في المختبر وما يجب ملاحظته"
      }
    },
    {
      "id": "slide-4",
      "title": "مسألة تطبيقية ومفاهيم مغلوطة شائعة",
      "subtitle": "تثبيت المفهوم وتصحيح التصورات",
      "type": "misconceptions",
      "content": {
        "misconceptions": [
          {"misconception": "تصور خاطئ شائع يقع فيه الطلاب عادة", "correction": "التفسير العلمي الصحيح المبرهن"}
        ],
        "explanation": "مثال عملي محلول باختصار"
      }
    },
    {
      "id": "slide-5",
      "title": "تذكرة الخروج التقييمية (Exit Ticket)",
      "subtitle": "قياس نواتج التعلم خلال الـ 5 دقائق الأخيرة",
      "type": "exit_ticket",
      "content": {
        "explanation": "أجب عن الأسئلة السريعة التالية للتحقق من إتقانك لأهداف الحصة:",
        "quiz": [
          {
            "question": "سؤال تقييمي يقيس الفهم العميق للدرس؟",
            "options": ["خيار أ", "خيار ب", "خيار ج", "خيار د"],
            "correctIndex": 0,
            "explanation": "تعليل سبب صحة هذه الإجابة وخطأ الخيارات الأخرى"
          },
          {
            "question": "سؤال تطبيقي أو حسابي مباشر؟",
            "options": ["خيار أ", "خيار ب", "خيار ج", "خيار د"],
            "correctIndex": 1,
            "explanation": "خطوات الحساب باختصار"
          }
        ]
      }
    }
  ]
}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 3500
      }
    };

    const rawResponse = await this.dispatchGeminiRequest(payload);
    const cleanedJson = rawResponse
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    try {
      return JSON.parse(cleanedJson);
    } catch (err) {
      console.error('Failed to parse lesson deck JSON:', cleanedJson);
      throw new Error('تعذر معالجة شرائح الدرس المولدة، يرجى إعادة المحاولة.');
    }
  }

  /**
   * Quick connection tester
   */
  public async testConnection(): Promise<{ ok: boolean; message: string }> {
    try {
      const res = await this.dispatchGeminiRequest({
        contents: [{ parts: [{ text: 'قل كلمة واحدة: متصل' }] }],
        generationConfig: { maxOutputTokens: 10 }
      });
      return { ok: true, message: `متصل بنجاح بنموذج (${this.activeModel})` };
    } catch (e: any) {
      return { ok: false, message: e?.message || 'فشل الاتصال' };
    }
  }
}

export const geminiMultimodalService = new GeminiMultimodalService();
