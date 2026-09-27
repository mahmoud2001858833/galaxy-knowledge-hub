import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Play, Pause, RotateCcw, Maximize2, Minimize2, 
  Sparkles, BookOpen, Layers, Target, CheckCircle2, 
  ArrowRight, X, Atom, Eye, Magnet, Aperture, Clock, 
  Waves, Bug, Globe, Beaker, Activity, Shapes, Zap, Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { labSound } from '@/utils/labAudio';

export interface SimMeta {
  id: string;
  file: string;
  title: string;
  badge: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  theory: {
    title: string;
    description: string;
    equation?: string;
    points?: string[];
  }[];
  missions: {
    title: string;
    target: string;
    condition: string;
  }[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export const SIMULATION_DATABASE: Record<string, SimMeta> = {
  'build-a-nucleus': {
    id: 'build-a-nucleus',
    file: 'build-a-nucleus.html',
    title: 'بناء النواة الذرية والاستقرار النووي',
    badge: 'الفيزياء النووية 2.0',
    subtitle: 'القوة النووية القوية • أنماط الاضمحلال الإشعاعي (ألفا، بيتا، بوزيترون) • مخطط النويدات ونطاق الاستقرار',
    icon: <Atom className="w-4 h-4 text-white" />,
    gradient: 'from-orange-600 via-rose-600 to-purple-600',
    theory: [
      {
        title: 'القوة النووية القوية والاستقرار',
        description: 'القوة النووية القوية هي قوة تجاذب قصيرة المدى تربط البروتونات والنيوترونات معاً في النواة وتتغلب على التنافر الكولومي الكهروستاتيكي بين البروتونات الموجبة.',
        equation: 'A = Z + N  (العدد الكتلي = البروتونات + النيوترونات)'
      },
      {
        title: 'أنماط الاضمحلال الإشعاعي',
        description: 'عندما تبتعد النواة عن حزام الاستقرار (N/Z ratio)، تضمحل تلقائياً لتصل إلى نويدة أكثر استقراراً:',
        points: [
          'اضمحلال ألفا (α): انبعاث نواة هيليوم (2 بروتون + 2 نيوترون).',
          'اضمحلال بيتا السالبة (β⁻): تحول نيوترون إلى بروتون وانبعاث إلكترون وضديد نيوترينو.',
          'اضمحلال بيتا الموجبة (β⁺): تحول بروتون إلى نيوترون وانبعاث بوزيترون ونيوترينو.'
        ]
      }
    ],
    missions: [
      {
        title: 'بناء نويدة مستقرة خفيفة',
        target: 'أضف 6 بروتونات و6 نيوترونات لتكوين نواة الكربون-12 وتأكد من استقرارها.',
        condition: 'ظهور علامة "مستقرة" وعمر نصف لانهائي.'
      },
      {
        title: 'محاكاة اضمحلال ألفا',
        target: 'ابنِ نواة ثقيلة تتجاوز 82 بروتوناً ولاحظ قابلية انبعاث جسيم ألفا للوصول للاستقرار.',
        condition: 'تفعيل خيار اضمحلال ألفا وانخفاض العدد الكتلي بمقدار 4.'
      }
    ],
    quiz: [
      {
        question: 'ما الجسيم المنبعث من النواة خلال اضمحلال بيتا الموجبة (β⁺)؟',
        options: ['إلكترون سالب', 'بوزيترون موجب الشحنة', 'نيوترون حر', 'بروتون'],
        correctIndex: 1,
        explanation: 'في اضمحلال بيتا الموجبة، يتحول بروتون إلى نيوترون داخل النواة وينبعث بوزيترون موجب الشحنة (e⁺) مع نيوترينو.'
      },
      {
        question: 'أي القوى التالية هي المسؤولة عن تماسك البروتونات معاً داخل النواة رغم تنافر شحناتها؟',
        options: ['القوة الكهرومغناطيسية', 'قوة الجاذبية', 'القوة النووية القوية', 'قوة كوريوليس'],
        correctIndex: 2,
        explanation: 'القوة النووية القوية هي أقوى القوى الأساسية في الكون وتعمل على مسافات دون ذرية لربط الكواركات والنيوكليونات معاً.'
      }
    ]
  },

  'bending-light': {
    id: 'bending-light',
    file: 'bending-light.html',
    title: 'انكسار الضوء وقانون سنيل',
    badge: 'البصريات الموجية 2.0',
    subtitle: 'قانون سنيل (n₁·sin θ₁ = n₂·sin θ₂) • الانعكاس الكلي الداخلي والزاوية الحرجة • تشتت الضوء في المنشورات',
    icon: <Eye className="w-4 h-4 text-white" />,
    gradient: 'from-cyan-600 via-blue-600 to-indigo-600',
    theory: [
      {
        title: 'قانون سنيل في الانكسار',
        description: 'ينص قانون سنيل على أن حاصل ضرب معامل انكسار الوسط الأول في جيب زاوية السقوط يساوي حاصل ضرب معامل انكسار الوسط الثاني في جيب زاوية الانكسار:',
        equation: 'n₁ · sin(θ₁) = n₂ · sin(θ₂)'
      },
      {
        title: 'الانعكاس الكلي الداخلي والزاوية الحرجة',
        description: 'عند انتقال الضوء من وسط أكبر كثافة ضوئية إلى وسط أقل، تنكسر الأشعة مبتعدة عن العمود. عند زاوية سقوط معينة تسمى الزاوية الحرجة (θc)، تنكسر زاوية الخروج بمقدار 90°. أي زيادة عن الزاوية الحرجة تؤدي لانعكاس كلي داخلي 100% دون نفاذ أي ضوء.',
        equation: 'sin(θc) = n₂ / n₁'
      }
    ],
    missions: [
      {
        title: 'قياس معامل انكسار المادة المجهولة',
        target: 'سلط شعاع الليزر بزاوية سقوط 45° على المادة المجهولة، وقس زاوية الانكسار بالمنقلة واحسب معامل الانكسار.',
        condition: 'تطبيق قانون سنيل بدقة واستنتاج قيمة n.'
      },
      {
        title: 'تحقيق الانعكاس الكلي الداخلي',
        target: 'ضع الليزر في الماء أو الزجاج ووجهه نحو الهواء، وزد زاوية السقوط حتى يختفي الشعاع المنكسر تماماً.',
        condition: 'تجاوز الزاوية الحرجة وحدوث انعكاس كلي داخلي تام.'
      }
    ],
    quiz: [
      {
        question: 'متى يحدث الانعكاس الكلي الداخلي للضوء؟',
        options: [
          'فقط عند انتقال الضوء من وسط أقل معامل انكسار إلى وسط أكبر معامل انكسار',
          'عند انتقال الضوء من وسط أكبر معامل انكسار إلى وسط أقل معامل انكسار بزاوية سقوط أكبر من الزاوية الحرجة',
          'عند سقوط الضوء عمودياً على السطح الفاصل',
          'في الفراغ فقط'
        ],
        correctIndex: 1,
        explanation: 'يحدث الانعكاس الكلي عندما ينتقل الضوء من وسط أبطأ (معامل انكسار أعلى كالزجاج أو الماء) إلى وسط أسرع (كهواء) بزاوية أكبر من الزاوية الحرجة.'
      }
    ]
  },

  'faradays-electromagnetic-lab': {
    id: 'faradays-electromagnetic-lab',
    file: 'faradays-electromagnetic-lab.html',
    title: 'مختبر فاراداي للحث الكهرومغناطيسي',
    badge: 'الكهرومغناطيسية 2.0',
    subtitle: 'قانون فاراداي وتغير التدفق المغناطيسي • قانون لينز واتجاه التيار المستحث • المحولات والمولدات الكهربائية',
    icon: <Magnet className="w-4 h-4 text-white" />,
    gradient: 'from-blue-600 via-indigo-600 to-amber-500',
    theory: [
      {
        title: 'قانون فاراداي في الحث الكهرومغناطيسي',
        description: 'تتولد قوة دافعة كهربائية حثية (ε) في أي دائرة مغلقة يتغير فيها التدفق المغناطيسي (Φ) الذي يجتازها عبر الزمن:',
        equation: 'ε = -N · (dΦ / dt)'
      },
      {
        title: 'قانون لينز والاتجاه المعاكس',
        description: 'تشير إشارة السالب في قانون فاراداي إلى قانون لينز: يكون اتجاه التيار الكهربائي الحثي بحيث يعاكس بمجاله المغناطيسي التغير المسبب له في التدفق الأصلي.'
      }
    ],
    missions: [
      {
        title: 'توليد التيار بحركة المغناطيس',
        target: 'حرّك المغناطيس المستقيم بسرعة داخل الملف ولاحظ إضاءة المصباح وانحراف مؤشر الفولتميتر.',
        condition: 'توليد قراءة جهد حثية موجبة وسالبة تتناسب مع سرعة التحريك.'
      },
      {
        title: 'المحول الكهربائي الكهرومغناطيسي',
        target: 'شغّل المغناطيس الكهربائي بالتيار المتناوب (AC) ولاحظ انتقال الطاقة للملف الثانوي دون أي تلامس سلكي.',
        condition: 'إضاءة مصباح الملف الثانوي عبر الحث المتبادل.'
      }
    ],
    quiz: [
      {
        question: 'ما الذي يحدد مقدار القوة الدافعة الكهربائية الحثية المتولدة في الملف حسب قانون فاراداي؟',
        options: [
          'كتلة المغناطيس ولونه فقط',
          'معدل التغير الزمني في التدفق المغناطيسي وعدد لفات الملف',
          'درجة حرارة الغرفة',
          'طول الأسلاك الخارجية فقط'
        ],
        correctIndex: 1,
        explanation: 'وفقاً لقانون فاراداي ε = -N(dΦ/dt)، تتناسب القوة الدافعة الحثية طردياً مع عدد اللفات N والسرعة التي يتغير بها التدفق المغناطيسي.'
      }
    ]
  },

  'geometric-optics-basics': {
    id: 'geometric-optics-basics',
    file: 'geometric-optics-basics.html',
    title: 'أساسيات البصريات الهندسية',
    badge: 'البصريات الهندسية 2.0',
    subtitle: 'معادلة العدسات والمرايا (1/f = 1/do + 1/di) • البؤرة والتكور • الصور الحقيقية والوهمية',
    icon: <Aperture className="w-4 h-4 text-white" />,
    gradient: 'from-teal-600 via-cyan-600 to-sky-600',
    theory: [
      {
        title: 'المعادلة العامة للعدسات والمرايا',
        description: 'تربط هذه المعادلة بين البعد البؤري للعدسة (f)، وبعد الجسم (do)، وبعد الصورة المتكونة (di):',
        equation: '1 / f = 1 / d_o + 1 / d_i'
      },
      {
        title: 'التكبير الخطي (Magnification)',
        description: 'نسبة طول الصورة إلى طول الجسم، أو النسبة السالبة لبعد الصورة إلى بعد الجسم:',
        equation: 'm = h_i / h_o = - d_i / d_o'
      }
    ],
    missions: [
      {
        title: 'تكوين صورة حقيقية مقلوبة بالعدسة المحدبة',
        target: 'ضع الجسم خارج البعد البؤري للعدسة المحدبة ولاحظ تلاقي الأشعة لتكوين صورة حقيقية مقلوبة.',
        condition: 'تكوين صورة واضحة وتأكيد قيم المسافات حسابياً.'
      }
    ],
    quiz: [
      {
        question: 'إذا وُضع جسم بين البؤرة والعدسة المحدبة المجمعة (do < f)، ما طبيعة الصورة المتكونة؟',
        options: [
          'حقيقية مقلوبة ومصغرة',
          'وهمية معتدلة ومكبرة (تعمل كمكبرة)',
          'لا تتكون أي صورة إطلاقاً',
          'صورة مقلوبة في نفس موضع الجسم'
        ],
        correctIndex: 1,
        explanation: 'عندما يكون الجسم أقرب من البعد البؤري لعدسة محدبة، تفترق الأشعة المنكسرة وتلتقي امتداداتها خلف الجسم لتشكل صورة وهمية معتدلة ومكبرة.'
      }
    ]
  },

  'pendulum-lab': {
    id: 'pendulum-lab',
    file: 'pendulum-lab.html',
    title: 'مختبر البندول البسيط والحركة التوافقية',
    badge: 'الميكانيكا الكلاسيكية 2.0',
    subtitle: 'الزمن الدوري للبندول T = 2π√(L/g) • تأثير الكتلة والطول • تسارع الجاذبية في الكواكب المختلفة',
    icon: <Clock className="w-4 h-4 text-white" />,
    gradient: 'from-amber-600 via-orange-600 to-red-600',
    theory: [
      {
        title: 'الزمن الدوري للبندول البسيط',
        description: 'يعتمد زمن دورة اهتزاز البندول الكاملة (T) فقط على طول الخيط (L) وتسارع الجاذبية (g)، ولا يعتمد على كتلة الكرة عند السعات الصغيرة:',
        equation: 'T = 2 · π · √(L / g)'
      }
    ],
    missions: [
      {
        title: 'إثبات استقلال الزمن الدوري عن الكتلة',
        target: 'ثبت طول البندول عند 0.70 م، وغير كتلة الثقل بين 0.1 كغ و 1.5 كغ وقس الزمن الدوري في كل حالة.',
        condition: 'ثبات الزمن الدوري بقيمة تقارب 1.68 ثانية بغض النظر عن الكتلة.'
      }
    ],
    quiz: [
      {
        question: 'إذا أخذنا بندولاً بسيطاً إلى سطح القمر (حيث الجاذبية سدس جاذبية الأرض)، ماذا يحدث لزمنه الدوري؟',
        options: [
          'يقل الزمن الدوري ويتأرجح أسرع',
          'يزداد الزمن الدوري ويتأرجح البندول ببطء شديد',
          'يبقى الزمن الدوري ثابتاً تماماً',
          'يتوقف عن الحركة'
        ],
        correctIndex: 1,
        explanation: 'بما أن T = 2π√(L/g)، فإن نقصان تسارع الجاذبية g يؤدي لزيادة الزمن الدوري T فيتأرجح البندول ببطء ملحوظ.'
      }
    ]
  },

  'wave-interference': {
    id: 'wave-interference',
    file: 'wave-interference.html',
    title: 'تداخل الموجات العامة (ماء، صوت، ضوء)',
    badge: 'الفيزياء الموجية 2.0',
    subtitle: 'التداخل البناء والإتلافي • تجربة الشق المزدوج ليونغ (d·sin θ = mλ) • حيود الموجات ونمط الهدب',
    icon: <Waves className="w-4 h-4 text-white" />,
    gradient: 'from-blue-600 via-cyan-600 to-emerald-600',
    theory: [
      {
        title: 'مبدأ التراكب والتداخل',
        description: 'عند التقاء موجتين متشاكهتين، تنجمع سعاتهما جبرياً:',
        points: [
          'تداخل بناء (Constructive): تلتقي قمة مع قمة فيكون فرق المسار Δr = m·λ وتتضاعف السعة.',
          'تداخل إتلافي (Destructive): تلتقي قمة مع قاع فيكون فرق المسار Δr = (m + 0.5)·λ وتنعدم السعة.'
        ]
      }
    ],
    missions: [
      {
        title: 'رصد خطوط العقد والبطون في موجات الماء',
        target: 'شغّل مصدرين لموجات الماء ولاحظ تشكل خطوط الهدم التام التي لا يتحرك فيها سطح الماء.',
        condition: 'ظهور مناطق التداخل البناء والإتلافي بوضوح.'
      }
    ],
    quiz: [
      {
        question: 'ما الشرط الرياضي لحدوث تداخل بناء تام بين موجتين متشاكهتين؟',
        options: [
          'أن يكون فرق المسار بينهما عدداً صحيحاً من الأطوال الموجية (Δr = mλ)',
          'أن يكون فرق المسار نصف طول موجي فقط',
          'أن تكون إحدى الموجتين أسرع من الأخرى بمرتين',
          'أن تختلف الترددات كلياً'
        ],
        correctIndex: 0,
        explanation: 'التداخل البناء يحدث عندما تلتقي قمة بقمة، وهذا يتحقق عندما يكون فرق المسار مساوياً لمضاعفات صحيحة لطول الموجة (0, λ, 2λ, ...).'
      }
    ]
  },

  'natural-selection': {
    id: 'natural-selection',
    file: 'natural-selection.html',
    title: 'الانتخاب الطبيعي والتكيف الوراثي',
    badge: 'علم الأحياء التطوري 2.0',
    subtitle: 'الطفرات الوراثية السائدة والمتنحية • الضغوط البيئية والمفترسات • بقاء الأصلح وديناميكا العشائر',
    icon: <Bug className="w-4 h-4 text-white" />,
    gradient: 'from-emerald-600 via-green-600 to-lime-600',
    theory: [
      {
        title: 'نظرية الانتخاب الطبيعي لداروين',
        description: 'تتغير ترددات الأليلات والصفات الظاهرية في العشائر الحية عبر الأجيال نتيجة تباين قدرة الأفراد على البقاء والتكاثر في ظل ضغوط بيئية محددة كالمفترسات وتوفر الغذاء.'
      }
    ],
    missions: [
      {
        title: 'محاكاة التمويه البيئي ضد المفترسات',
        target: 'أضف طفرة الفراء البني في بيئة شمسية ذات تلال بنية ثم أطلق الذئاب المفترسة وراقب نسبة الأرانب البيضاء مقابل البنية.',
        condition: 'انخفاض نسبة الأرانب البيضاء بسبب سهولة رصدها وبقاء الأرانب البنية ذات التمويه.'
      }
    ],
    quiz: [
      {
        question: 'ما الذي يحدد ما إذا كانت طفرة وراثية معينة مفيدة أم ضارة للكائن الحي؟',
        options: [
          'البيئة المحيطة والضغوط الانتقائية التي يعيش فيها الكائن',
          'حجم جسم الكائن فقط',
          'رغبة الكائن الحي الواعية',
          'سرعة دوران الأرض'
        ],
        correctIndex: 0,
        explanation: 'قيمة الطفرة نسبية وتعتمد على البيئة؛ فالفراء الأبيض مفيد جداً في الثلج ولكنه قاتل في الصحراء بسبب افتقاده للتمويه أمام المفترسات.'
      }
    ]
  },

  'my-solar-system': {
    id: 'my-solar-system',
    file: 'my-solar-system.html',
    title: 'نظامي الشمسي والجاذبية الكونية',
    badge: 'الفيزياء الفلكية 2.0',
    subtitle: 'قانون نيوتن للجذب العام • قوانين كبلر لحركة الكواكب • مسارات الهروب والاصطدامات المدارية',
    icon: <Globe className="w-4 h-4 text-white" />,
    gradient: 'from-amber-600 via-orange-600 to-indigo-600',
    theory: [
      {
        title: 'قانون نيوتن في الجاذبية الكونية',
        description: 'تتجاذب أي كتلتين بقوة تتناسب طردياً مع حاصل ضرب الكتلتين وعكسياً مع مربع المسافة بين مركزيهما:',
        equation: 'F = G · (m₁ · m₂) / r²'
      }
    ],
    missions: [
      {
        title: 'تصميم مدار كوكبي دائري مستقر',
        target: 'اضبط سرعة الكوكب الأول الابتدائية بشكل عمودي على خط الشمس حتى تحصل على مدار دائري مغلق لا يتغير.',
        condition: 'تحقيق مسار دائري مستقر ومغلق دون السقوط في الشمس.'
      }
    ],
    quiz: [
      {
        question: 'حسب قانون كبلر الثاني، أين يتحرك الكوكب بأقصى سرعة ممكنة في مداره الإهليلجي حول الشمس؟',
        options: [
          'عند نقطة الحضيض (أقرب نقطة للشمس)',
          'عند نقطة الأوج (أبعد نقطة عن الشمس)',
          'السرعة ثابتة في كافة نقاط المدار',
          'عند القطبين فقط'
        ],
        correctIndex: 0,
        explanation: 'وفقاً لقانون كبلر الثاني (المساحات المتساوية في أزمنة متساوية) وحفظ الزخم الزاوي، يتحرك الكوكب بأقصى سرعة عند نقطة الحضيض الأقرب لمركز الجاذبية.'
      }
    ]
  },

  'ph-scale': {
    id: 'ph-scale',
    file: 'ph-scale.html',
    title: 'مقياس الرقم الهيدروجيني (pH) وتوازن المحاليل',
    badge: 'الكيمياء التحليلية 2.0',
    subtitle: 'العلاقة بين [H₃O⁺] و [OH⁻] • مقياس pH اللوغاريتمي • الأحماض والقواعد ومحاليل الحياة اليومية',
    icon: <Beaker className="w-4 h-4 text-white" />,
    gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
    theory: [
      {
        title: 'تعريف الرقم الهيدروجيني (pH)',
        description: 'هو اللوغاريتم السالب للأساس 10 لتركيز أيونات الهيدرونيوم [H₃O⁺] في المحلول:',
        equation: 'pH = - log₁₀ [H₃O⁺]'
      },
      {
        title: 'مقياس الحموضة والقاعدية',
        description: 'عند درجة حرارة 25°C، يكون الماء النقي متعادلاً عند pH = 7. المحاليل الحمضية تمتلك pH < 7، بينما المحاليل القاعدية تمتلك pH > 7.'
      }
    ],
    missions: [
      {
        title: 'فحص حمضية دم الإنسان ومقارنته بالقهوة',
        target: 'اختر الدم من قائمة المحاليل وقس رقمه الهيدروجيني، ثم قارنه بالقهوة ولاحظ الفرق بين القلوية الخفيفة والحمضية.',
        condition: 'قراءة pH دم تساوي 7.40 تقريباً، وقهوة تساوي 5.00 تقريباً.'
      }
    ],
    quiz: [
      {
        question: 'إذا انخفض الرقم الهيدروجيني لمحلول من 6 إلى 4، فكم مرة تضاعف تركيز أيونات [H₃O⁺]؟',
        options: ['مرتان فقط', '10 مرات', '100 مرة (10²)', '1000 مرة'],
        correctIndex: 2,
        explanation: 'بما أن مقياس pH لوغاريتمي، فإن كل وحدة تغير في الرقم الهيدروجيني تمثل تغيراً بعشرة أضعاف في التركيز؛ لذا فإن تغير درجتين يمثل 10² = 100 ضعف.'
      }
    ]
  },

  'neuron': {
    id: 'neuron',
    file: 'neuron.html',
    title: 'العصبون الحيوي ونقل السيال العصبي',
    badge: 'الفسيولوجيا العصبية 2.0',
    subtitle: 'جهد الراحة وجهد الفعل (Action Potential) • قنوات Na⁺ و K⁺ المبوبة كهربائياً • إزالة الاستقطاب وإعادة الاستقطاب',
    icon: <Activity className="w-4 h-4 text-white" />,
    gradient: 'from-purple-600 via-pink-600 to-rose-600',
    theory: [
      {
        title: 'جهد الفعل العصبي (Action Potential)',
        description: 'تغير كهربائي سريع ينتقل على طول غشاء المحور العصبي، يبدأ بإزالة الاستقطاب (Depolarization) بتدفق سريع لأيونات Na⁺ للداخل، يليه إعادة الاستقطاب (Repolarization) بخروج أيونات K⁺ للخارج.'
      }
    ],
    missions: [
      {
        title: 'تحفيز جهد الفعل',
        target: 'اضغط على زر تحفيز العصبون وراقب انطلاق نبضة جهد الفعل على منحنى الجهد (mV) فوق عتبة التنبيه.',
        condition: 'صعود جهد الغشاء من -70 mV إلى +30 mV تقريباً ثم هبوطه.'
      }
    ],
    quiz: [
      {
        question: 'ما القناة الأيونية المسؤولة عن مرحلة الصعود السريع لجهد الغشاء خلال إزالة الاستقطاب في العصبون؟',
        options: [
          'قنوات الصوديوم (Na⁺) المبوبة بفرق الجهد التي تفتح سريعاً وتسمح بدخول الصوديوم',
          'قنوات البوتاسيوم التي تضخ البوتاسيوم للخارج',
          'قنوات الكلور فقط',
          'مضخات الكالسيوم البطيئة'
        ],
        correctIndex: 0,
        explanation: 'عند وصول التنبيه إلى عتبة الإثارة، تفتح قنوات الصوديوم المبوبة بالجهد سريعاً ويتدفق Na⁺ إلى داخل الخلية مع تدرجه الكهربائي والكيميائي.'
      }
    ]
  },

  'quadrilateral': {
    id: 'quadrilateral',
    file: 'quadrilateral.html',
    title: 'الأشكال الرباعية وخواص الهندسة الرياضية',
    badge: 'الهندسة الرياضية 2.0',
    subtitle: 'المربع، المستطيل، المعين، متوازي الأضلاع، وشبه المنحرف • توازي وتعامد الأضلاع • خواص الأقطار والزوايا',
    icon: <Shapes className="w-4 h-4 text-white" />,
    gradient: 'from-indigo-600 via-violet-600 to-purple-600',
    theory: [
      {
        title: 'تصنيف الأشكال الرباعية',
        description: 'مجموع الزوايا الداخلية لأي شكل رباعي يساوي دائماً 360°. يتفرع متوازي الأضلاع إلى مستطيل (زواياه قوائم)، ومعين (أضلاعه متطابقة وأقطاره متعامدة)، ومربع (يجمع خواص المستطيل والمعين معاً).'
      }
    ],
    missions: [
      {
        title: 'تشكيل المعين والتحقق من تعامد أقطاره',
        target: 'حرر الرؤوس لتكوين معين متطابق الأضلاع واعرض الأقطار وتأكد من زاوية تعامدهما 90°.',
        condition: 'تساوي أطوال الأضلاع الأربعة وتعامد القطرين.'
      }
    ],
    quiz: [
      {
        question: 'أي شكل رباعي يتميز بأن أقطاره متطابقة ومتعامدة وتنصف كلاً منهما الآخر؟',
        options: ['المربع', 'متوازي الأضلاع العام', 'شبه المنحرف', 'الدالتون غير المنتظم'],
        correctIndex: 0,
        explanation: 'المربع هو الشكل الرباعي المنتظم الأوحد الذي يجمع بين تطابق الأقطار (خاصية المستطيل) وتعامدها وتنصيفها (خاصية المعين).'
      }
    ]
  },

  'hookes-law': {
    id: 'hookes-law',
    file: 'hookes-law.html',
    title: 'قانون هوك ومرونة الزنبرك',
    badge: 'الميكانيكا والمرونة 2.0',
    subtitle: 'قانون هوك (F = -k·Δx) • طاقة الوضع المرونية Ep = ½k·x² • توصيل الزنبركات على التوالي والتوازي',
    icon: <Activity className="w-4 h-4 text-white" />,
    gradient: 'from-amber-600 via-orange-600 to-yellow-500',
    theory: [
      {
        title: 'قانون هوك في المرونة',
        description: 'قوة الإرجاع التي يبذلها زنبرك مرن تتناسب طردياً مع مقدار استطالته أو انضغاطه (x) وتعاكسه في الاتجاه:',
        equation: 'F_s = - k · x'
      },
      {
        title: 'طاقة الوضع المرونية المختزنة',
        description: 'الشغل المبذول لتمديد أو ضغط الزنبرك يختزن كطاقة وضع مرونية تعطى بالعلاقة:',
        equation: 'E_p = 0.5 · k · x²'
      }
    ],
    missions: [
      {
        title: 'حساب ثابت الزنبرك k',
        target: 'طبق قوة 50 نيوتن وقس الاستطالة، ثم طبق قوة 100 نيوتن وتأكد من ثبات النسبة F/x.',
        condition: 'تطابق النسبة مع قيمة ثابت الزنبرك المعروضة.'
      }
    ],
    quiz: [
      {
        question: 'إذا تضاعفت استطالة زنبرك مرن بمقدار الضعف (من x إلى 2x)، فماذا يحدث لطاقة الوضع المرونية المختزنة فيه؟',
        options: ['تتضاعف مرتين فقط', 'تتضاعف 4 مرات (تتناسب مع مربع الاستطالة)', 'تقل إلى النصف', 'تبقى ثابتة'],
        correctIndex: 1,
        explanation: 'بما أن Ep = 0.5·k·x²، فإن طاقة الوضع تعتمد على مربع الاستطالة، فتتضاعف بمقدار (2)² = 4 أضعاف.'
      }
    ]
  },

  'quantum-measurement': {
    id: 'quantum-measurement',
    file: 'quantum-measurement.html',
    title: 'القياس الكمي وتجربة شتيرن-غيرلاخ',
    badge: 'الفيزياء الكمية المتقدمة 2.0',
    subtitle: 'تكميم عزم الغزل المغناطيسي (Spin) • قياس استقطاب الفوتونات • مبدأ عدم التأكد وتراكب الحالات الكمية',
    icon: <Atom className="w-4 h-4 text-white" />,
    gradient: 'from-violet-600 via-purple-600 to-indigo-600',
    theory: [
      {
        title: 'تجربة شتيرن-غيرلاخ وتكميم الغزل',
        description: 'أثبتت تجربة شتيرن-غيرلاخ (1922) أن الزخم الزاوي الداخلي (الغزل Spin) للجسيمات مكمم؛ فعند مرور ذرات الفضة عبر مجال مغناطيسي غير متجانس، تنقسم الحزمة إلى حزمتين منفصلتين فقط (+½ و -½) ولا يوجد أي توزيع كلاسيكي متصل.'
      }
    ],
    missions: [
      {
        title: 'سلسلة أجهزة شتيرن-غيرلاخ المتتابعة',
        target: 'اضبط جهازين متتابعين على المحور Z، ثم ضع بينهما جهازاً على المحور X ولاحظ إعادة فتح الاحتماليات على المحور Z.',
        condition: 'إثبات عدم التبادلية وانهيار التراكب في ميكانيكا الكم.'
      }
    ],
    quiz: [
      {
        question: 'عند تمرير حزمة من الإلكترونات ذات غزل مقاس مسبقاً على محور Z للأعلى (+½z) عبر جهاز يقيس على محور X، ما احتمالية قياس الغزل للأعلى على محور X؟',
        options: ['100%', '50%', '0%', '25%'],
        correctIndex: 1,
        explanation: 'الحالة |+z⟩ تساوي تراكباً خطياً متساوياً للحالتين |+x⟩ و |-x⟩ بمعامل 1/√2، وبالتالي تكون احتمالية القياس على أي من الاتجاهين |1/√2|² = 50%.'
      }
    ]
  },

  'balloons-and-static-electricity': {
    id: 'balloons-and-static-electricity',
    file: 'balloons-and-static-electricity.html',
    title: 'البالونات والكهرباء الساكنة والشحن بالدلك',
    badge: 'الكهروسكونية 2.0',
    subtitle: 'الشحن بالدلك وانتقال الإلكترونات • قوى التجاذب والتنافر الكهروستاتيكي (قانون كولوم) • الاستقطاب بالحث',
    icon: <Zap className="w-4 h-4 text-white" />,
    gradient: 'from-yellow-500 via-amber-600 to-orange-600',
    theory: [
      {
        title: 'الشحن بالاحتكاك والاستقطاب',
        description: 'عند دلك البالون بالسترة الصوفية، تنتقل الإلكترونات السالبة من السترة إلى البالون فيكتسب البالون شحنة سالبة وتصبح السترة موجبة. وعند تقريب البالون السالب من الجدار المحايد، يتنافر مع إلكترونات سطح الجدار ويزيحها، مما يولد شحنة موجبة مستحثة تسبب التصاق البالون بالجدار.'
      }
    ],
    missions: [
      {
        title: 'شحن البالون وجذبه للسترة',
        target: 'ادلك البالون بالسترة حتى يكتسب شحنات سالبة، ثم اتركه في الفضاء وراقب انجذابه السريع نحو السترة الموجبة.',
        condition: 'حركة البالون تحت تأثير قوة كولوم التجاذبية للشحنات المختلفة.'
      }
    ],
    quiz: [
      {
        question: 'لماذا يلتصق البالون المشحون بشحنة سالبة بجدار متعادل كهربائياً؟',
        options: [
          'لأن الجدار يحتوي على مادة لاصقة كيميائية',
          'بسبب ظاهرة الاستقطاب بالحث، حيث تتنافر إلكترونات الجدار السطحية وتتجاذب الشحنة الموجبة القريبة مع البالون',
          'بسبب قوة الجاذبية الأرضية المعكوسة',
          'لأن البالون يفقد شحنته كلياً داخل الجدار'
        ],
        correctIndex: 1,
        explanation: 'التنافر الكهروستاتيكي يدفع إلكترونات الجدار قليلاً إلى الداخل تاركاً سطح الجدار مستقطباً بشحنة موجبة قريبة تنجذب بشدة لشحنة البالون السالبة.'
      }
    ]
  },

  'projectile-sampling-distributions': {
    id: 'projectile-sampling-distributions',
    file: 'projectile-sampling-distributions.html',
    title: 'المقذوفات وتوزيعات المعاينة الإحصائية',
    badge: 'الإحصاء التطبيقي والفيزياء 2.0',
    subtitle: 'حركة المقذوفات والمدى الأفقي • أخذ العينات العشوائية ومبرهنة النهاية المركزية (CLT) • التوزيع الطبيعي',
    icon: <Target className="w-4 h-4 text-white" />,
    gradient: 'from-rose-600 via-red-600 to-amber-600',
    theory: [
      {
        title: 'مبرهنة النهاية المركزية (Central Limit Theorem)',
        description: 'تنص المبرهنة على أنه مهما كان التوزيع الأصلي لمتغير عشوائي، فإن توزيع متوسطات العينات العشوائية (Sampling Distribution of the Mean) يقترب من التوزيع الطبيعي المنتظم كلما كبر حجم العينة n.'
      }
    ],
    missions: [
      {
        title: 'توليد توزيع طبيعي من إطلاق المقذوفات',
        target: 'أطلق مئات المقذوفات مع وجود تباين عشوائي في السرعة والزاوية ولاحظ تشكل منحنى الجرس الطبيعي للمدى.',
        condition: 'تطابق المدرج التكراري مع منحنى التوزيع الطبيعي القياسي.'
      }
    ],
    quiz: [
      {
        question: 'وفقاً لمبرهنة النهاية المركزية، ماذا يحدث للخطأ المعياري لمتوسط العينة عند زيادة حجم العينة n إلى 4 أضعاف؟',
        options: [
          'يقل إلى النصف (σ / √n)',
          'يتضاعف 4 أضعاف',
          'يبقى ثابتاً تماماً',
          'يصبح صفراً فوراً'
        ],
        correctIndex: 0,
        explanation: 'الخطأ المعياري يعطى بالعلاقة SE = σ / √n، فإذا تضاعف حجم العينة 4 أضعاف، يقسم الانحراف على √4 = 2، أي يقل الخطأ المعياري إلى النصف ويزداد التقدير دقة.'
      }
    ]
  }
};

interface Props {
  simId?: string;
}

const InteractiveSimulationWorkbench: React.FC<Props> = ({ simId: propSimId }) => {
  const params = useParams<{ simId?: string }>();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const currentSimId = propSimId || params.simId || 'build-a-nucleus';
  const sim = SIMULATION_DATABASE[currentSimId] || SIMULATION_DATABASE['build-a-nucleus'];

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'theory' | 'missions' | 'quiz'>('theory');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleResetIframe = () => {
    setIframeKey(prev => prev + 1);
    try { labSound?.click(); } catch(e) {}
  };

  const handleAnswerQuiz = (qIdx: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIdx]: optionIdx }));
    try { labSound?.click(); } catch(e) {}
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    sim.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    if (score === sim.quiz.length) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="h-screen w-screen bg-[#030712] text-slate-100 flex flex-col overflow-hidden select-none" dir="rtl">
      
      {/* Sleek Top Laboratory Workbench Bar */}
      <header className="h-14 bg-slate-950/95 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 backdrop-blur-md">
        
        {/* Right side: Back button & Lab Identity */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/experiments')}
            className="text-slate-300 hover:text-white hover:bg-slate-800/80 gap-1.5 text-xs px-2.5 h-8.5 rounded-xl border border-slate-800"
          >
            <ArrowRight className="w-4 h-4 ml-0.5" />
            <span className="hidden sm:inline">العودة لدليل التجارب</span>
            <span className="sm:hidden">رجوع</span>
          </Button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${sim.gradient} flex items-center justify-center shadow-md shadow-cyan-500/20`}>
              {sim.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xs sm:text-sm text-white tracking-tight">
                  {sim.title}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-800/60 hidden md:inline">
                  {sim.badge}
                </span>
              </div>
              <div className="text-[10.5px] text-slate-400 hidden lg:block">
                {sim.subtitle}
              </div>
            </div>
          </div>
        </div>

        {/* Left side: Quick Workbench Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGuideOpen(true)}
            className="h-8.5 px-3 text-xs gap-1.5 rounded-xl border-cyan-500/30 bg-cyan-950/20 text-cyan-300 hover:bg-cyan-900/40 hover:text-cyan-200"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">دليل ومهمات التجربة</span>
            <span className="sm:hidden">الدليل</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetIframe}
            className="h-8.5 w-8.5 p-0 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            title="إعادة تشغيل التجربة"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFullscreen}
            className="h-8.5 w-8.5 p-0 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </header>

      {/* Main Simulation Viewport (Edge-to-Edge Direct Immersion) */}
      <main className="flex-1 w-full h-[calc(100vh-56px)] bg-black relative overflow-hidden">
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={`/simulations/${sim.file}?initialScreen=1`}
          title={`${sim.title} | منصة ذروة العلم 2.0`}
          className="w-full h-full border-0 block"
          allow="fullscreen; autoplay; clipboard-write"
          loading="eager"
        />
      </main>

      {/* Slide-over Lab Manual Drawer */}
      <AnimatePresence>
        {isGuideOpen && (
          <div className="fixed inset-0 z-50 flex justify-start bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-lg h-full bg-slate-900/98 border-l border-slate-800 shadow-2xl flex flex-col text-right overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${sim.gradient} text-white flex items-center justify-center`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">الدليل العلمي والتحديات المعملية</h3>
                    <p className="text-[11px] text-slate-400">{sim.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGuideOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="grid grid-cols-3 p-2 bg-slate-950/40 border-b border-slate-800 gap-1">
                <button
                  onClick={() => setActiveGuideTab('theory')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    activeGuideTab === 'theory' 
                      ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  الأساس العلمي
                </button>
                <button
                  onClick={() => setActiveGuideTab('missions')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    activeGuideTab === 'missions' 
                      ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  المهمات والتجارب
                </button>
                <button
                  onClick={() => setActiveGuideTab('quiz')}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                    activeGuideTab === 'quiz' 
                      ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  اختبار الفهم
                </button>
              </div>

              {/* Drawer Content Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm text-slate-300">
                {activeGuideTab === 'theory' && (
                  <div className="space-y-4">
                    {sim.theory.map((t, idx) => (
                      <div key={idx} className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-2">
                        <h4 className="text-white font-bold text-xs flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          {t.title}
                        </h4>
                        <p className="text-xs leading-relaxed text-slate-300">
                          {t.description}
                        </p>
                        {t.equation && (
                          <div className="my-2 p-2 rounded-lg bg-slate-950/80 border border-cyan-500/20 font-mono text-xs text-center text-cyan-300" dir="ltr">
                            {t.equation}
                          </div>
                        )}
                        {t.points && (
                          <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-300 mt-2">
                            {t.points.map((pt, pIdx) => (
                              <li key={pIdx}>{pt}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeGuideTab === 'missions' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400">
                      نفّذ التحديات المعملية التالية داخل المحاكاة لإتقان المفاهيم الفيزيائية والكيميائية:
                    </p>
                    {sim.missions.map((m, idx) => (
                      <div key={idx} className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-cyan-400">المهمة {idx + 1}: {m.title}</span>
                          <Target className="w-4 h-4 text-cyan-400" />
                        </div>
                        <p className="text-xs text-slate-300">{m.target}</p>
                        <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80 text-[11px] text-slate-400">
                          <span className="text-cyan-400 font-bold">معيار التحقق: </span>{m.condition}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeGuideTab === 'quiz' && (
                  <div className="space-y-5">
                    {sim.quiz.map((q, qIdx) => (
                      <div key={qIdx} className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl space-y-3">
                        <h4 className="text-xs font-bold text-white">{qIdx + 1}. {q.question}</h4>
                        <div className="space-y-2">
                          {q.options.map((opt, oIdx) => {
                            const isSelected = quizAnswers[qIdx] === oIdx;
                            const isCorrect = q.correctIndex === oIdx;
                            let btnStyle = "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800";
                            if (quizSubmitted) {
                              if (isCorrect) btnStyle = "bg-emerald-950/80 border-emerald-600 text-emerald-200";
                              else if (isSelected) btnStyle = "bg-rose-950/80 border-rose-600 text-rose-200";
                            } else if (isSelected) {
                              btnStyle = "bg-cyan-900/50 border-cyan-500 text-cyan-200";
                            }
                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleAnswerQuiz(qIdx, oIdx)}
                                className={`w-full text-right p-2.5 text-xs rounded-lg border transition-all ${btnStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {quizSubmitted && (
                          <div className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                            <span className="text-cyan-400 font-bold">التفسير العلمي: </span>{q.explanation}
                          </div>
                        )}
                      </div>
                    ))}

                    {!quizSubmitted ? (
                      <Button
                        onClick={handleSubmitQuiz}
                        disabled={Object.keys(quizAnswers).length < sim.quiz.length}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs h-10 rounded-xl"
                      >
                        تسليم الإجابات وتقييم الفهم
                      </Button>
                    ) : (
                      <div className="p-4 bg-cyan-950/40 border border-cyan-600/40 rounded-xl text-center space-y-2">
                        <h4 className="font-bold text-cyan-300">النتيجة: {quizScore} من {sim.quiz.length}</h4>
                        <p className="text-xs text-slate-300">
                          {quizScore === sim.quiz.length 
                            ? 'أداء علمي مذهل! استوعبت المفاهيم العلمية بجدارة فائقة.' 
                            : 'يمكنك مراجعة الأساس العلمي وإعادة التجربة لتحقيق الدرجة الكاملة.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveSimulationWorkbench;
