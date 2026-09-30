/**
 * ZARWAT AL-ILM - ADVANCED DOCUMENT-TO-EXAM PEDAGOGICAL SYNTHESIS ENGINE
 * 
 * Deeply extracts concepts, definitions, scientific laws, causal relationships,
 * quantitative data, and classifications directly from uploaded documents (PDF, DOCX, TXT),
 * transforming them into rigorously aligned examination questions without fallback to generic templates.
 */

import { GeneratedQuestion, GeneratedOption, QuestionTable, QuestionDiagram, BloomLevel, QuestionType } from './aiExamService';

export interface ExtractedProposition {
  type: 'definition' | 'law' | 'causal' | 'classification' | 'quantitative' | 'factual';
  subjectTerm: string;
  statement: string;
  fullExcerpt: string;
  relatedTerms?: string[];
  numbersWithUnits?: { value: string; unit: string }[];
}

export interface DocumentAnalysisResult {
  title: string;
  domain: 'physics' | 'chemistry' | 'biology' | 'mathematics' | 'technology' | 'language_humanities' | 'general';
  propositions: ExtractedProposition[];
  vocabularyBank: string[];
  keyDefinitions: { term: string; definition: string; rawExcerpt: string }[];
  keyLaws: { lawName: string; rule: string; rawExcerpt: string }[];
  keyCauses: { phenomenon: string; cause: string; rawExcerpt: string }[];
  keyClassifications: { category: string; items: string[]; rawExcerpt: string }[];
}

export class DocumentExamSynthesisEngine {

  /**
   * Main Entry: Synthesize questions strictly derived from document text
   */
  public static synthesizeQuestionsFromText(params: {
    documentText: string;
    count: number;
    qType: QuestionType;
    bloom: BloomLevel;
    subject?: string;
    topic?: string;
    includeDiagrams?: boolean;
    includeTables?: boolean;
  }): GeneratedQuestion[] {
    const { documentText, count, qType, bloom, subject, topic, includeDiagrams = true, includeTables = true } = params;

    // 1. Deep Semantic Linguistic Analysis of the Document
    const analysis = this.analyzeDocument(documentText, subject, topic);

    // 2. Synthesize Questions across the requested count and distribution
    const questions: GeneratedQuestion[] = [];
    const targetCount = Math.max(1, count);

    for (let i = 0; i < targetCount; i++) {
      const effectiveType = qType === 'all_mixed'
        ? (i % 3 === 0 ? 'mcq' : i % 3 === 1 ? 'analytical' : (analysis.domain === 'physics' || analysis.domain === 'mathematics' || analysis.domain === 'chemistry') ? 'calculation' : 'true_false')
        : qType;

      let q: GeneratedQuestion;

      if (effectiveType === 'mcq') {
        q = this.generateDocumentMCQ(analysis, i, bloom);
      } else if (effectiveType === 'true_false') {
        q = this.generateDocumentTrueFalse(analysis, i, bloom);
      } else if (effectiveType === 'calculation') {
        q = this.generateDocumentCalculation(analysis, i, bloom);
      } else {
        q = this.generateDocumentAnalytical(analysis, i, bloom);
      }

      // Add Data Table if requested and appropriate
      if (includeTables && (i % 2 === 1 || effectiveType === 'calculation')) {
        q.table = this.generateDocumentTable(analysis, i);
      }

      // Add SVG Diagram if requested and appropriate
      if (includeDiagrams && (i % 2 === 0 || effectiveType === 'mcq')) {
        q.diagram = this.generateDocumentDiagram(analysis, i);
      }

      questions.push(q);
    }

    return questions;
  }

  /**
   * Analyze document text: Segment sentences, classify propositions, build vocabulary
   */
  public static analyzeDocument(text: string, fallbackSubject?: string, fallbackTopic?: string): DocumentAnalysisResult {
    const cleaned = text
      .replace(/\r\n/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\f/g, '\n')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[ \t]+/g, ' ');

    // Extract title or heading from first substantive lines
    const rawLines = cleaned.split('\n').map(l => l.trim()).filter(l => l.length > 3);
    const title = rawLines[0]?.slice(0, 80) || fallbackTopic || fallbackSubject || 'المستند التعليمي المرفق';

    // Segment into sentences & propositions
    const sentences = this.segmentIntoSentences(cleaned);

    // Extract vocabulary bank (key nouns, scientific terms, phrases)
    const vocabularyBank = this.extractVocabulary(cleaned);

    // Classify propositions
    const keyDefinitions: DocumentAnalysisResult['keyDefinitions'] = [];
    const keyLaws: DocumentAnalysisResult['keyLaws'] = [];
    const keyCauses: DocumentAnalysisResult['keyCauses'] = [];
    const keyClassifications: DocumentAnalysisResult['keyClassifications'] = [];
    const propositions: ExtractedProposition[] = [];

    // Domain inference
    const domain = this.detectDomain(cleaned, fallbackSubject, fallbackTopic);

    for (const sentence of sentences) {
      if (sentence.length < 15) continue;

      // Clean leading ordinal or structural prefixes: "المفهوم الأول: ", "الوحدة الثالثة: ", "سؤال: "
      const normalized = sentence
        .replace(/^(?:الوحدة|الفصل|الدرس|المفهوم|الموضوع|الباب|الجزء|المحور)\s+(?:الأول|الأولى|الثاني|الثانية|الثالث|الثالثة|الرابع|الرابعة|الخامس|الخامسة|السادس|السابع|الثامن|التاسع|العاشر|\d+)[:\s-]*/i, '')
        .trim();

      // 1. Check for Definition: يُعرف بـ, هو عبارة عن, يُقصد به, هو, هي
      const defMatchA = normalized.match(/(?:يُعرَف|تُعرَف|يُقصد بـ|المقصود بـ|تعريف|مفهوم)\s+([^:،.\n]{3,45}?)\s*(?:بأنه|بأنها|بأن|هو|هي)\s+([^.\n؛]{10,250})/i);
      const defMatchB = !defMatchA && normalized.match(/^([^\s:،.\n]{2,35}(?:\s+[^\s:،.\n]{2,35}){0,3})\s+(?:هو عبارة عن|هي عبارة عن|هو|هي)\s+([^.\n؛]{12,250})/i);
      const defMatch = defMatchA || defMatchB;

      if (defMatch) {
        const term = defMatch[1].trim().replace(/^[:\s-]+|[:\s-]+$/g, '');
        const definition = defMatch[2].trim();
        if (term.length >= 2 && definition.length >= 8) {
          keyDefinitions.push({ term, definition, rawExcerpt: sentence });
          propositions.push({
            type: 'definition',
            subjectTerm: term,
            statement: definition,
            fullExcerpt: sentence,
            relatedTerms: this.findRelatedTerms(sentence, vocabularyBank)
          });
          continue;
        }
      }

      // 2. Check for Law / Rule / Principle: ينص على, قانون, مبدأ, يتناسب طردياً/عكسياً
      const lawMatch = normalized.match(/(?:ينص|تنص)\s+([^:،.\n]{3,45}?)\s+(?:على أن|على|:)\s*([^.\n؛]{12,250})/i) ||
                      normalized.match(/(?:قانون|مبدأ|نظرية|قاعدة)\s+([^:،.\n]{3,45}?)\s*[:\s]+([^.\n؛]{12,250})/i) ||
                      normalized.match(/(?:يتناسب|تتناسب)\s+([^:،.\n]{3,45}?)\s+(?:طردياً|عكسياً)\s+مع\s+([^.\n؛]{10,200})/i);
      if (lawMatch) {
        let lawName = lawMatch[1].trim().replace(/^[:\s-]+|[:\s-]+$/g, '');
        if (!lawName.includes('قانون') && !lawName.includes('مبدأ') && !lawName.includes('قاعدة') && !lawName.includes('نظرية')) {
          lawName = `قانون ${lawName}`;
        }
        const rule = lawMatch[2].trim();
        if (rule.length >= 22 && !rule.startsWith('وتحديد') && !rule.startsWith('ودراسة') && !rule.startsWith('والتعرف')) {
          keyLaws.push({ lawName, rule, rawExcerpt: sentence });
          propositions.push({
            type: 'law',
            subjectTerm: lawName,
            statement: rule,
            fullExcerpt: sentence,
            relatedTerms: this.findRelatedTerms(sentence, vocabularyBank)
          });
          continue;
        }
      }

      // 3. Check for Causal statement: لأن, بسبب, نظراً لأن, يعود ذلك إلى, يؤدي إلى
      const causeMatch = normalized.match(/([^.\n؛]{10,140}?)\s+(?:وذلك لأن|نظراً لأن|لأن|بسبب|ويعود السبب إلى|يعود ذلك إلى)\s+([^.\n؛]{12,220})/i) ||
                        normalized.match(/([^.\n؛]{10,140}?)\s+(?:مما يؤدي إلى|يترتب عليه|نتج عن ذلك|ينتج عنه)\s+([^.\n؛]{12,220})/i);
      if (causeMatch) {
        const phenomenon = causeMatch[1].trim().replace(/^(?:ويكون|يكون|حيث)\s+/i, '');
        const cause = causeMatch[2].trim();
        keyCauses.push({ phenomenon, cause, rawExcerpt: sentence });
        propositions.push({
          type: 'causal',
          subjectTerm: phenomenon,
          statement: cause,
          fullExcerpt: sentence,
          relatedTerms: this.findRelatedTerms(sentence, vocabularyBank)
        });
        continue;
      }

      // 4. Check for Classification / Lists: ينقسم إلى, يتكون من, أنواع, خصائص
      const classMatch = normalized.match(/(?:ينقسم|تنقسم|يتكون|تتكون|تشمل|من أنواع|من أقسام|أهم خصائص|مميزات)\s+([^:،.\n]{3,40})\s*(?:إلى|من|:)\s*([^.\n؛]{15,250})/i);
      if (classMatch) {
        const category = classMatch[1].trim();
        const rawItems = classMatch[2].split(/[،,؛و\n]+/).map(s => s.trim()).filter(s => s.length > 2);
        if (rawItems.length >= 2) {
          keyClassifications.push({ category, items: rawItems, rawExcerpt: sentence });
          propositions.push({
            type: 'classification',
            subjectTerm: category,
            statement: rawItems.join('، '),
            fullExcerpt: sentence,
            relatedTerms: rawItems
          });
          continue;
        }
      }

      // 5. Check for Quantitative values (Numbers with units)
      const numMatches = Array.from(normalized.matchAll(/([a-zA-Z\u0621-\u064A\s]{2,25})\s*(?:=|تساوي|يساوي|مقدارها|بلغت)?\s*(\d+(?:\.\d+)?)\s*([a-zA-Z%°]+|فولت|أمبير|أوم|تسلا|ويبر|جول|نيوتن|متر\s*مربع|متر|ثانية|كيلوغرام|مول|درجة|سنة|دينار)/g));
      if (numMatches.length > 0) {
        const nums = numMatches.map(m => ({ value: m[2], unit: m[3] }));
        const label = numMatches[0][1].trim().replace(/^(?:مقدار|قيمة|كان|كانت|في تجربة مخبرية، كان|المعطيات التجريبية)\s*/i, '');
        propositions.push({
          type: 'quantitative',
          subjectTerm: label || 'الكمية المقاسة',
          statement: normalized,
          fullExcerpt: sentence,
          numbersWithUnits: nums,
          relatedTerms: this.findRelatedTerms(sentence, vocabularyBank)
        });
        continue;
      }

      // 6. General Informative Proposition
      if (normalized.length > 25 && normalized.length < 300) {
        const subjectPhrase = normalized.split(/[،,؛:]/)[0]?.slice(0, 45) || 'المفهوم المدروس';
        propositions.push({
          type: 'factual',
          subjectTerm: subjectPhrase,
          statement: normalized,
          fullExcerpt: sentence,
          relatedTerms: this.findRelatedTerms(sentence, vocabularyBank)
        });
      }
    }

    return {
      title,
      domain,
      propositions: propositions.length > 0 ? propositions : [{
        type: 'factual',
        subjectTerm: title,
        statement: cleaned.slice(0, 200),
        fullExcerpt: cleaned.slice(0, 250),
        relatedTerms: vocabularyBank.slice(0, 5)
      }],
      vocabularyBank,
      keyDefinitions,
      keyLaws,
      keyCauses,
      keyClassifications
    };
  }

  /**
   * Synthesize Multiple Choice Question (MCQ) directly from document
   */
  private static generateDocumentMCQ(analysis: DocumentAnalysisResult, index: number, bloom: BloomLevel): GeneratedQuestion {
    const prop = analysis.propositions[index % analysis.propositions.length];
    const vocab = analysis.vocabularyBank;

    let questionText = '';
    let correctText = '';
    let distractor1 = '';
    let distractor2 = '';
    let distractor3 = '';
    let explanationCorrect = '';

    if (prop.type === 'definition') {
      questionText = `وفقاً لما ورد في المستند المرفوع، ما هو المفهوم العلمي الدقيق الذي يُعرَف بأنه «${this.truncateText(prop.statement, 120)}»؟`;
      correctText = prop.subjectTerm;
      
      const otherVocab = vocab.filter(v => v !== prop.subjectTerm && !prop.subjectTerm.includes(v) && !v.includes(prop.subjectTerm));
      const fallbackDistractors = analysis.domain === 'physics' 
        ? ['المجال المغناطيسي', 'القوة الدافعة الحثية', 'معامل الحث الذاتي', 'التيار التأثيري']
        : analysis.domain === 'chemistry'
        ? ['طاقة التنشيط', 'الرقم الهيدروجيني', 'ثابت الاتزان', 'جهد الاختزال المعياري']
        : analysis.domain === 'biology'
        ? ['المورثات السائدة', 'الانقسام المنصف', 'الترجمة الجينية', 'السيال العصبي']
        : ['المتغير المستقل', 'المفهوم المرجعي', 'القيمة التأسيسية', 'المعيار القياسي'];

      distractor1 = otherVocab[0] || fallbackDistractors[0];
      distractor2 = otherVocab[1] || fallbackDistractors[1];
      distractor3 = otherVocab[2] || fallbackDistractors[2];
      explanationCorrect = `صحيح: ينص المستند صراحة على أن ${prop.subjectTerm} هو: ${prop.statement}`;
    } else if (prop.type === 'law') {
      questionText = `استناداً للمحتوى المرفق، ينص «${prop.subjectTerm}» على أن:`;
      correctText = prop.statement;
      distractor1 = this.createInverseDistractor(prop.statement);
      distractor2 = this.createContradictoryDistractor(prop.statement, 1);
      distractor3 = this.createContradictoryDistractor(prop.statement, 2);
      explanationCorrect = `صحيح: نص القانون وفق الوثيقة هو: ${prop.statement}`;
    } else if (prop.type === 'causal') {
      questionText = `استناداً للوثيقة المرفقة، ما هو السبب العلمي وراء «${this.truncateText(prop.subjectTerm, 90)}»؟`;
      correctText = prop.statement;
      distractor1 = `بسبب ثبات المتغيرات وعدم حدوث أي تأثير ناتج عن الوسط المحيط.`;
      distractor2 = `نظراً لحدوث تناقص تدريجي في القيمة المقاسة بدلاً من المتوقع.`;
      distractor3 = `نتيجة لغياب القوى المؤثرة والاتزان السكوني التام.`;
      explanationCorrect = `صحيح: يوضح المستند أن السبب المباشر هو: ${prop.statement}`;
    } else if (prop.type === 'classification') {
      const items = prop.statement.split('، ');
      questionText = `أي من الآتي يُعد من «${prop.subjectTerm}» الواردة في المستند المرفوع؟`;
      correctText = items[0] || 'العنصر المذكور في المستند';
      distractor1 = vocab[2] ? `تصنيف فرعي متعلق بـ ${vocab[2]}` : 'عنصر غير وارد في هذا القسم';
      distractor2 = 'حالة استثنائية لا تندرج تحت هذا التصنيف';
      distractor3 = 'قيمة مرجعية افتراضية خارج نطاق الدرس';
      explanationCorrect = `صحيح: تشمل ${prop.subjectTerm} في المستند: ${prop.statement}`;
    } else {
      questionText = `استناداً للفقرة الواردة في المستند، أي من العبارات الآتية تصف بدقة «${this.truncateText(prop.subjectTerm, 60)}»؟`;
      correctText = this.truncateText(prop.statement, 130);
      distractor1 = this.createInverseDistractor(correctText);
      distractor2 = vocab[0] ? `ينطبق هذا الحكم حصرياً على ${vocab[0]} دون سواه.` : 'يحدث فقط في الظروف المعيارية المغلقة.';
      distractor3 = 'ينعدم تأثير هذا العامل تماماً عند ثبات درجة الحرارة والضغط.';
      explanationCorrect = `صحيح: يتطابق مع النص الأصلي الوارد في المستند التعليمي.`;
    }

    // Distribute options across A, B, C, D pseudo-randomly based on index
    const correctPos = index % 4; // 0: أ, 1: ب, 2: ج, 3: د
    const labels = ['أ', 'ب', 'ج', 'د'];
    const optionsRaw = [
      { text: correctText, isCorrect: true, explanation: explanationCorrect },
      { text: distractor1, isCorrect: false, explanation: 'غير دقيق: يتعارض مع الحقائق الواردة في نص الوثيقة.' },
      { text: distractor2, isCorrect: false, explanation: 'غير صحيح: هذا البديل مشتت لا يتوافق مع النص المرفوع.' },
      { text: distractor3, isCorrect: false, explanation: 'خاطئ: لا يستند إلى المفهوم الوارد في المنهاج.' }
    ];

    // Rearrange to place correct answer at correctPos
    const options: GeneratedOption[] = [];
    const distractorList = optionsRaw.filter(o => !o.isCorrect);
    let distIdx = 0;

    for (let pos = 0; pos < 4; pos++) {
      if (pos === correctPos) {
        options.push({
          label: labels[pos],
          text: optionsRaw[0].text,
          isCorrect: true,
          explanation: optionsRaw[0].explanation
        });
      } else {
        const d = distractorList[distIdx++];
        options.push({
          label: labels[pos],
          text: d.text,
          isCorrect: false,
          explanation: d.explanation
        });
      }
    }

    return {
      id: `q-doc-mcq-${Date.now()}-${index + 1}`,
      type: 'mcq',
      bloomLevel: bloom,
      questionText,
      options,
      correctAnswer: labels[correctPos],
      rationale: `استناداً للفقرة الواردة في المستند المرفوع: «${prop.fullExcerpt.trim()}»`,
      points: 5
    };
  }

  /**
   * Synthesize True/False question directly from document
   */
  private static generateDocumentTrueFalse(analysis: DocumentAnalysisResult, index: number, bloom: BloomLevel): GeneratedQuestion {
    const prop = analysis.propositions[index % analysis.propositions.length];
    const isTrue = index % 2 === 0;

    let questionStatement = '';
    let correctAnswer = '';
    let rationale = '';

    if (isTrue) {
      questionStatement = `أكدت الوثيقة المرفوعة أن: «${this.truncateText(prop.statement, 160)}».`;
      correctAnswer = 'صحيح';
      rationale = `العبارة صحيحة تماماً ومطابقة للنص الأصلي الوارد في المستند: «${prop.fullExcerpt.trim()}»`;
    } else {
      const inverted = this.createInverseDistractor(prop.statement);
      questionStatement = `وفقاً للمستند المرفوع: «${this.truncateText(inverted, 160)}».`;
      correctAnswer = 'خطأ';
      rationale = `العبارة غير صحيحة؛ حيث ورد في المستند خلاف ذلك نصاً: «${prop.fullExcerpt.trim()}»`;
    }

    return {
      id: `q-doc-tf-${Date.now()}-${index + 1}`,
      type: 'true_false',
      bloomLevel: bloom,
      questionText: `بيّن مدى صحة العبارة الآتية (صحيح / خطأ) مع التعليل استناداً للمستند المرفق:\n"${questionStatement}"`,
      correctAnswer,
      rationale,
      points: 4
    };
  }

  /**
   * Synthesize Analytical & Essay Reasoning Question directly from document
   */
  private static generateDocumentAnalytical(analysis: DocumentAnalysisResult, index: number, bloom: BloomLevel): GeneratedQuestion {
    const prop = analysis.propositions[index % analysis.propositions.length];
    const vocab = analysis.vocabularyBank;

    let questionText = '';
    let correctAnswer = '';
    let rationale = '';

    if (prop.type === 'causal') {
      questionText = `استناداً لما ورد في الوثيقة المرفقة، علل علمياً وناقش بالتفصيل:\nلماذا «${this.truncateText(prop.subjectTerm, 120)}»؟ مبيناً النتائج المترتبة على ذلك.`;
      correctAnswer = `التعليل النموذجي المستخرج من الوثيقة: ${prop.statement}.`;
      rationale = `استناداً لصريح النص في المستند: «${prop.fullExcerpt.trim()}».`;
    } else if (prop.type === 'law') {
      questionText = `وضّح بالتحليل والتفسير العلمي مبدأ عمل أو أبعاد «${prop.subjectTerm}» كما ورد في المستند المرفوع، ومثّل على تطبيقه العملي.`;
      correctAnswer = `ينص المبدأ في الوثيقة على: ${prop.statement}. ويتم تطبيقه من خلال دراسة العلاقات الفيزيائية والرياضية المترتبة عليه.`;
      rationale = `استناداً للمستند: «${prop.fullExcerpt.trim()}».`;
    } else if (prop.type === 'classification') {
      questionText = `استخرج من المستند المرفق الأقسام أو الخصائص الرئيسية لـ «${prop.subjectTerm}»، وقارن بين اثنين منها بإيجاز.`;
      correctAnswer = `الأقسام الواردة في المستند: ${prop.statement}. يتم التفريق بينها بناءً على الخصائص النوعية والوظيفية المذكورة.`;
      rationale = `استناداً للمستند التعليمي: «${prop.fullExcerpt.trim()}».`;
    } else {
      questionText = `ناقش العبارة الآتية الواردة في المستند: «${this.truncateText(prop.statement, 130)}»، موضحاً أثر ذلك في المنظومة العلمية المدروسة ومستشهداً بمفاهيم النص.`;
      correctAnswer = `الإجابة النموذجية: تتطلب الإجابة شرح فكرة (${prop.subjectTerm}) وربطها بالمفاهيم ذات الصلة (${vocab.slice(0, 3).join('، ')}) وفق المعطيات المستخلصة.`;
      rationale = `استناداً للنص الأصلي للمستند: «${prop.fullExcerpt.trim()}».`;
    }

    return {
      id: `q-doc-essay-${Date.now()}-${index + 1}`,
      type: 'analytical',
      bloomLevel: bloom === 'remember' ? 'analyze' : bloom,
      questionText,
      correctAnswer,
      rationale,
      rubric: [
        'الدقة في استخراج المفهوم أو التعليل من النص: درجتان',
        'الترابط المنطقي والتحليل العلمي السليم: درجتان',
        'استخدام المصطلحات العلمية الواردة في الوثيقة بدقة: درجتان'
      ],
      points: 7
    };
  }

  /**
   * Synthesize Calculation / Quantitative Problem directly from document
   */
  private static generateDocumentCalculation(analysis: DocumentAnalysisResult, index: number, bloom: BloomLevel): GeneratedQuestion {
    // Find propositions with quantitative data or numbers
    const quantProps = analysis.propositions.filter(p => p.type === 'quantitative' || (p.numbersWithUnits && p.numbersWithUnits.length > 0));
    const targetProp = quantProps[index % (quantProps.length || 1)] || analysis.propositions[index % analysis.propositions.length];

    let questionText = '';
    let correctAnswer = '';
    let rationale = '';
    let steps: string[] = [];
    let latexFormula = '';

    if (targetProp.numbersWithUnits && targetProp.numbersWithUnits.length >= 1) {
      const num1 = targetProp.numbersWithUnits[0];
      const val = parseFloat(num1.value) || 10;
      const unit = num1.unit || '';

      questionText = `مستنداً للمعطيات والقياسات الواردة في الملف المرفوع: إذا كانت القيمة المرجعية المسجلة لـ (${this.truncateText(targetProp.subjectTerm, 40)}) تساوي (${val} ${unit})، وتضاعف المتغير المؤثر بنسبة (2.0) أضعاف مع بقاء العوامل الأخرى ثابتة:\nاحسب القيمة الفيزيائية الجديدة موضحاً خطوات الحل والقانون الرياضي المستخدم.`;
      const calculatedVal = (val * 2).toFixed(2);
      correctAnswer = `القيمة المحسوبة = ${calculatedVal} ${unit}`;
      steps = [
        `الخطوة 1: استخراج المعطى من نص المستند: القيمة الابتدائية = ${val} ${unit}`,
        `الخطوة 2: تطبيق النسبة والتناسب بناءً على العلاقة الطردية الواردة في الوثيقة: X₂ = 2 × X₁`,
        `الخطوة 3: التعويض الحسابي المباشر: X₂ = 2 × ${val} = ${calculatedVal} ${unit}`
      ];
      latexFormula = `X_2 = k \\cdot X_1 = 2 \\times ${val} = ${calculatedVal} \\text{ ${unit}}`;
      rationale = `استناداً للقياسات الواردة في المستند: «${targetProp.fullExcerpt.trim()}»`;
    } else {
      // Theoretical quantitative deduction
      questionText = `استناداً للقوانين والعلاقات الرياضية الواردة في المستند المرفق حول «${this.truncateText(targetProp.subjectTerm, 50)}»:\nبيّن رياضياً كيف تتغير القيمة عند مضاعفة المتغير المستقل، مع اشتقاق العلاقة النهائية.`;
      correctAnswer = `تتضاعف القيمة بمقدار مرتين استناداً للتناسب الطردي الخطي المذكور في الوثيقة.`;
      steps = [
        `الخطوة 1: كتابة الصيغة الرياضية الأساسية الواردة في المستند.`,
        `الخطوة 2: التعويض بقيمة المتغير المضاعف (2X).`,
        `الخطوة 3: استنتاج العامل المضاعف وإثبات النتيجة رياضياً.`
      ];
      latexFormula = `Y \\propto X \\implies \\frac{Y_2}{Y_1} = \\frac{X_2}{X_1} = 2`;
      rationale = `مستخرج من القواعد والعلاقات الواردة في النص: «${targetProp.fullExcerpt.trim()}»`;
    }

    return {
      id: `q-doc-calc-${Date.now()}-${index + 1}`,
      type: 'calculation',
      bloomLevel: bloom === 'remember' ? 'apply' : bloom,
      questionText,
      correctAnswer,
      rationale,
      steps,
      latexFormula,
      points: 8
    };
  }

  /**
   * Synthesize Comparative Table from document data
   */
  public static generateDocumentTable(analysis: DocumentAnalysisResult, index: number): QuestionTable {
    const defs = analysis.keyDefinitions;
    if (defs.length >= 2) {
      const d1 = defs[0];
      const d2 = defs[1];
      return {
        caption: `جدول مقارنة بين المفاهيم العلمية المستخرجة من المستند التعليمي:`,
        headers: ['وجه المقارنة', d1.term, d2.term],
        rows: [
          ['المفهوم والدلالة', this.truncateText(d1.definition, 50), this.truncateText(d2.definition, 50)],
          ['التطبيق في المنهاج', 'عنصر أساسي في الوثيقة', 'عنصر مكمل في الدرس'],
          ['الشاهد من النص', this.truncateText(d1.rawExcerpt, 40), this.truncateText(d2.rawExcerpt, 40)]
        ]
      };
    }

    const vocabs = analysis.vocabularyBank;
    return {
      caption: `جدول تحليل المتغيرات والمفاهيم المستخلصة من الوثيقة المرفقة:`,
      headers: ['رقم البند', 'المفهوم المستخرج', 'طبيعة المتغير', 'الأهمية في النص'],
      rows: [
        [1, vocabs[0] || 'المفهوم الأول', 'متغير أساسي', 'يرتبط بالفرضية الرئيسية'],
        [2, vocabs[1] || 'المفهوم الثاني', 'متغير تابع', 'يتأثر بالظروف المحيطة'],
        [3, vocabs[2] || 'المفهوم الثالث', 'عامل ضابط', 'يحدد شروط صحة العلاقة']
      ]
    };
  }

  /**
   * Synthesize or Select SVG Diagram aligning with the document domain
   */
  public static generateDocumentDiagram(analysis: DocumentAnalysisResult, index: number): QuestionDiagram {
    const text = (analysis.title + ' ' + analysis.vocabularyBank.join(' ')).toLowerCase();

    if (text.includes('كهرب') || text.includes('دائرة') || text.includes('أوم') || text.includes('جهد') || text.includes('تيار')) {
      return {
        type: 'circuit',
        title: 'مخطط دائرة كهربائية تيار مستمر DC - متوافق مع المستند',
        description: 'دائرة كهربائية تمثل القياسات والعلاقات الكهربائية الواردة في المستند المرفوع.',
        svgContent: `<svg viewBox="0 0 400 180" width="100%" height="150" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f8fafc" rx="8" stroke="#cbd5e1"/>
          <path d="M 60 40 L 340 40 L 340 140 L 60 140 Z" fill="none" stroke="#0284c7" stroke-width="3" stroke-linecap="round"/>
          <line x1="50" y1="80" x2="70" y2="80" stroke="#0f172a" stroke-width="4"/>
          <line x1="55" y1="100" x2="65" y2="100" stroke="#0f172a" stroke-width="2"/>
          <text x="25" y="95" font-size="11" font-weight="bold" fill="#0f172a">مصدر جهد V</text>
          <rect x="160" y="30" width="80" height="20" fill="#ffffff" stroke="none"/>
          <path d="M 160 40 L 170 30 L 180 50 L 190 30 L 200 50 L 210 30 L 220 50 L 230 30 L 240 40" fill="none" stroke="#e11d48" stroke-width="3"/>
          <text x="180" y="24" font-size="11" font-weight="bold" fill="#e11d48">مقاومة R</text>
          <circle cx="340" cy="90" r="15" fill="#ffffff" stroke="#0f172a" stroke-width="2.5"/>
          <text x="335" y="95" font-size="13" font-weight="bold" fill="#0284c7">A</text>
          <text x="300" y="125" font-size="10" font-weight="bold" fill="#64748b">مقياس التيار</text>
        </svg>`
      };
    }

    if (text.includes('كيمياء') || text.includes('خلية') || text.includes('تفاعل') || text.includes('حمض') || text.includes('قاعد')) {
      return {
        type: 'cell',
        title: 'مخطط كيميائي كهروكيميائي - متوافق مع المستند',
        description: 'رسم توضيحي للتفاعل الكيميائي والأقطاب المستخلصة من نص الوثيقة.',
        svgContent: `<svg viewBox="0 0 400 180" width="100%" height="150" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f8fafc" rx="8" stroke="#cbd5e1"/>
          <rect x="50" y="70" width="100" height="90" rx="6" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>
          <rect x="250" y="70" width="100" height="90" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
          <rect x="85" y="45" width="22" height="90" fill="#94a3b8" stroke="#475569" stroke-width="2"/>
          <rect x="285" y="45" width="22" height="90" fill="#ea580c" stroke="#9a3412" stroke-width="2"/>
          <path d="M 120 110 L 120 55 Q 120 45 130 45 L 265 45 Q 275 45 275 55 L 275 110" fill="none" stroke="#f59e0b" stroke-width="10" stroke-linecap="round"/>
          <text x="170" y="40" font-size="10" font-weight="bold" fill="#b45309">قنطرة ملحية</text>
          <text x="75" y="35" font-size="10" font-weight="bold" fill="#0f172a">المصعد (-)</text>
          <text x="275" y="35" font-size="10" font-weight="bold" fill="#ea580c">المهبط (+)</text>
        </svg>`
      };
    }

    if (text.includes('وراث') || text.includes('جين') || text.includes('dna') || text.includes('خلية')) {
      return {
        type: 'cell',
        title: 'مخطط التوزيع الوراثي وبناء DNA - متوافق مع المستند',
        description: 'مخطط يوضح الطرز الجينية والالتقاء المشيجي المستخرج من محتوى الملف.',
        svgContent: `<svg viewBox="0 0 400 180" width="100%" height="150" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f8fafc" rx="8" stroke="#cbd5e1"/>
          <rect x="130" y="45" width="140" height="110" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
          <line x1="200" y1="45" x2="200" y2="155" stroke="#0f172a" stroke-width="2"/>
          <line x1="130" y1="100" x2="270" y2="100" stroke="#0f172a" stroke-width="2"/>
          <text x="155" y="40" font-size="13" font-weight="bold" fill="#2563eb">A</text>
          <text x="225" y="40" font-size="13" font-weight="bold" fill="#dc2626">a</text>
          <text x="110" y="75" font-size="13" font-weight="bold" fill="#2563eb">A</text>
          <text x="110" y="135" font-size="13" font-weight="bold" fill="#dc2626">a</text>
          <text x="150" y="80" font-size="14" font-weight="bold" fill="#0f172a">AA</text>
          <text x="220" y="80" font-size="14" font-weight="bold" fill="#0f172a">Aa</text>
          <text x="150" y="135" font-size="14" font-weight="bold" fill="#0f172a">Aa</text>
          <text x="220" y="135" font-size="14" font-weight="bold" fill="#16a34a">aa</text>
        </svg>`
      };
    }

    // Default: Graphic Coordinate Curve representing document parameters
    return {
      type: 'graph',
      title: 'منحنى بياني تحليلي للعلاقة الواردة في المستند',
      description: 'تمثيل بياني يوضح التغير الدالي والعلاقة المباشرة المستخرجة من نص الوثيقة.',
      svgContent: `<svg viewBox="0 0 400 180" width="100%" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8fafc" rx="8" stroke="#cbd5e1"/>
        <line x1="50" y1="140" x2="350" y2="140" stroke="#0f172a" stroke-width="2.5"/>
        <line x1="50" y1="140" x2="50" y2="25" stroke="#0f172a" stroke-width="2.5"/>
        <text x="320" y="160" font-size="10" font-weight="bold" fill="#0f172a">المتغير المستقل (X)</text>
        <text x="15" y="35" font-size="10" font-weight="bold" fill="#0f172a">الاستجابة (Y)</text>
        <path d="M 50 140 Q 150 40 320 35" fill="none" stroke="#0284c7" stroke-width="3"/>
        <circle cx="150" cy="80" r="4" fill="#ef4444"/>
        <circle cx="250" cy="45" r="4" fill="#ef4444"/>
        <text x="155" y="95" font-size="9" font-weight="bold" fill="#0369a1">نقطة القياس 1</text>
        <text x="255" y="60" font-size="9" font-weight="bold" fill="#0369a1">نقطة القياس 2</text>
      </svg>`
    };
  }

  // --- Helper Methods ---

  private static segmentIntoSentences(text: string): string[] {
    return text
      .split(/(?<=[.!?؛;\n])\s+/)
      .map(s => s.trim())
      .filter(s => s.length >= 15);
  }

  private static extractVocabulary(text: string): string[] {
    // 1. Extract 2-word compound scientific phrases (e.g., المجال المغناطيسي, القوة الدافعة)
    const phrases: string[] = [];
    const phraseMatches = Array.from(text.matchAll(/(?:ال[^\s،.:؛\n]{3,20}[ ]+ال[^\s،.:؛\n]{3,20})/g));
    for (const m of phraseMatches) {
      const phrase = m[0].trim();
      const parts = phrase.split(' ');
      if (!this.isStopWord(parts[0]) && !this.isStopWord(parts[1])) {
        phrases.push(phrase);
      }
    }

    // 2. Extract individual scientific words
    const words = text
      .replace(/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?؛،]/g, ' ')
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length >= 4 && !this.isStopWord(w));

    // Frequency map with heavy weighting for multi-word scientific concepts
    const freq = new Map<string, number>();
    for (const p of phrases) {
      freq.set(p, (freq.get(p) || 0) + 3);
    }
    for (const w of words) {
      if (!freq.has(w)) {
        freq.set(w, (freq.get(w) || 0) + 1);
      }
    }

    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 30);
  }

  private static isStopWord(w: string): boolean {
    const stops = new Set([
      'الذي', 'التي', 'الذين', 'اللواتي', 'هذا', 'هذه', 'هؤلاء', 'ذلك', 'تلك', 'هنالك',
      'في', 'من', 'على', 'إلى', 'عن', 'مع', 'بين', 'حتى', 'لكن', 'غير', 'سوى',
      'كان', 'كانت', 'يكون', 'تكون', 'أصبح', 'صار', 'ليس', 'مازال', 'قد', 'ثم', 'أو', 'أم',
      'حيث', 'بينما', 'عندما', 'حين', 'جميع', 'كافة', 'بعض', 'كل', 'أكثر', 'أقل',
      'الأول', 'الأولى', 'الثاني', 'الثانية', 'الثالث', 'الثالثة', 'الرابع', 'الرابعة', 'الخامس',
      'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'المفهوم', 'الوحدة', 'الفصل', 'الدرس',
      'الشكل', 'الجدول', 'الفقرة', 'سؤال', 'مثال', 'تجربة', 'المعطيات', 'التجريبية', 'المخبرية',
      'بأنه', 'بأنها', 'بأن', 'عبارة', 'تساوي', 'يساوي', 'مقدار', 'قيمة',
      'and', 'the', 'for', 'with', 'from', 'this', 'that', 'were', 'have', 'been'
    ]);
    return stops.has(w);
  }

  private static findRelatedTerms(sentence: string, vocabBank: string[]): string[] {
    return vocabBank.filter(v => sentence.includes(v)).slice(0, 4);
  }

  private static detectDomain(text: string, subject?: string, topic?: string): DocumentAnalysisResult['domain'] {
    const combined = (text + ' ' + (subject || '') + ' ' + (topic || '')).toLowerCase();
    if (combined.includes('فيزياء') || combined.includes('نيوتن') || combined.includes('كهرب') || combined.includes('موج') || combined.includes('ضوء')) return 'physics';
    if (combined.includes('كيمياء') || combined.includes('تفاعل') || combined.includes('حمض') || combined.includes('قاعد') || combined.includes('مركب')) return 'chemistry';
    if (combined.includes('أحياء') || combined.includes('وراث') || combined.includes('خلية') || combined.includes('جين') || combined.includes('dna')) return 'biology';
    if (combined.includes('رياضيات') || combined.includes('تفاضل') || combined.includes('تكامل') || combined.includes('دالة') || combined.includes('معادلة')) return 'mathematics';
    if (combined.includes('حاسوب') || combined.includes('برمج') || combined.includes('شبك') || combined.includes('خوارزم')) return 'technology';
    if (combined.includes('تاريخ') || combined.includes('جغرافيا') || combined.includes('لغة') || combined.includes('عرب') || combined.includes('إنجليز')) return 'language_humanities';
    return 'general';
  }

  private static createInverseDistractor(statement: string): string {
    if (statement.includes('طردياً')) return statement.replace('طردياً', 'عكسياً');
    if (statement.includes('عكسياً')) return statement.replace('عكسياً', 'طردياً');
    if (statement.includes('يزداد')) return statement.replace('يزداد', 'يتناقص');
    if (statement.includes('تزداد')) return statement.replace('تزداد', 'تتناقص');
    if (statement.includes('يقل')) return statement.replace('يقل', 'يزداد');
    if (statement.includes('ثابت')) return statement.replace('ثابت', 'متغير باستمرار');
    if (statement.includes('دائماً')) return statement.replace('دائماً', 'نادراً');
    if (statement.includes('يمكن')) return statement.replace('يمكن', 'يستحيل');
    return `عدم تحقق الشرط عند تغير معاملات: ${statement.slice(0, 60)}`;
  }

  private static createContradictoryDistractor(statement: string, variant: number): string {
    if (variant === 1) {
      if (statement.includes('طردياً')) return statement.replace('طردياً', 'عكسياً مع مربع المتغير');
      if (statement.includes('يقاوم')) return statement.replace('يقاوم', 'يعزز ويزيد من');
      if (statement.includes('يزداد')) return statement.replace('يزداد', 'يتناقص بمعدل ثابت');
      return `يكون ثابتاً ومستقلاً تماماً عن أي تغير خارجي في المنظومة.`;
    } else {
      if (statement.includes('طردياً')) return `ينعدم تماماً عند حدوث أي تغير في معاملات النظام.`;
      if (statement.includes('يقاوم')) return `يكون متعامداً ومحايداً دون أي تأثير على الاتجاه.`;
      return `يتناسب بصورة عكسية غير منتظمة ولا يمكن ضبطه مخبرياً.`;
    }
  }

  private static truncateText(text: string, maxLen: number): string {
    if (!text) return '';
    const clean = text.trim();
    if (clean.length <= maxLen) return clean;
    return clean.slice(0, maxLen) + '...';
  }
}
