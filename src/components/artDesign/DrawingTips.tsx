import { motion } from "framer-motion";
import { Lightbulb, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface Tip {
  title: string;
  icon: string;
  details: string;
}

const tips: Tip[] = [
  {
    title: "ارسم كل يوم لتحسين مهاراتك",
    icon: "🎨",
    details: "الممارسة اليومية هي المفتاح لتطوير مهاراتك. حتى 15 دقيقة يومياً ستحدث فرقاً كبيراً مع الوقت. حاول رسم أشياء مختلفة كل يوم.",
  },
  {
    title: "لا تخف من الأخطاء - كل خطأ يعلمك شيئاً",
    icon: "💡",
    details: "الأخطاء جزء طبيعي من التعلم. كل فنان عظيم مر بمرحلة التجربة والخطأ. استخدم الأخطاء كفرصة للتعلم والتحسين.",
  },
  {
    title: "استخدم الضوء والظل لإظهار العمق",
    icon: "☀️",
    details: "الظلال والإضاءة تضيف بُعداً ثلاثياً لرسوماتك. تعلم كيف يتفاعل الضوء مع الأسطح المختلفة وكيف تتشكل الظلال.",
  },
  {
    title: "تعلم المنظور قبل التركيز على التفاصيل",
    icon: "📐",
    details: "فهم المنظور الأساسي سيجعل رسوماتك أكثر واقعية. ابدأ بتعلم نقاط التلاشي والخطوط الأفقية قبل الانتقال للتفاصيل المعقدة.",
  },
  {
    title: "ارسم من الحياة وليس من الذاكرة فقط",
    icon: "👁️",
    details: "الرسم من الطبيعة يساعدك على ملاحظة التفاصيل الدقيقة التي قد تفوتها من الذاكرة. راقب الأشياء حولك وحاول رسمها.",
  },
  {
    title: "جرب مواد مختلفة لتجد أسلوبك",
    icon: "✏️",
    details: "لا تقتصر على أداة واحدة. جرب الأقلام، الفحم، الألوان المائية، والأكريليك. كل وسيط له خصائصه الفريدة.",
  },
  {
    title: "ادرس الفنانين العظماء وتعلم تقنياتهم",
    icon: "🎭",
    details: "انظر إلى أعمال الفنانين المشهورين وحاول فهم تقنياتهم. لكن لا تنسخهم - استخدمهم كمصدر إلهام لتطوير أسلوبك الخاص.",
  },
  {
    title: "خذ فترات راحة لرؤية عملك بعيون جديدة",
    icon: "⏸️",
    details: "الابتعاد عن العمل لبعض الوقت يساعدك على رؤية الأخطاء والتحسينات الممكنة. عد بعيون منتعشة.",
  },
  {
    title: "استخدم الألوان بتناسق وهدف",
    icon: "🌈",
    details: "تعلم نظرية الألوان وكيف تتفاعل الألوان مع بعضها. الألوان المتكاملة والمتناسقة تخلق تأثيراً بصرياً قوياً.",
  },
  {
    title: "درّب يدك بخطوط حرة وسريعة",
    icon: "✋",
    details: "تمارين الإحماء بالخطوط السريعة تحسن التحكم في اليد والثقة بالضربات. جرب رسم دوائر وخطوط متموجة قبل البدء.",
  },
  {
    title: "ركز على التكوين قبل التلوين",
    icon: "🖼️",
    details: "التكوين الجيد هو أساس العمل الفني الناجح. خطط لترتيب العناصر قبل البدء بإضافة الألوان والتفاصيل.",
  },
  {
    title: "احتفظ بدفتر رسم لتتبع تطورك",
    icon: "📓",
    details: "دفتر الرسم هو مختبرك الشخصي. سجل أفكارك، تجاربك، وتطورك بمرور الوقت. ستشعر بالإنجاز عند مراجعته.",
  },
  {
    title: "تعلم رؤية الأشكال والظلال وليس التفاصيل",
    icon: "👀",
    details: "بدلاً من التركيز على التفاصيل الصغيرة، تعلم رؤية الأشكال الأساسية والكتل الضوئية. هذا يساعد في بناء أساس قوي.",
  },
  {
    title: "لا تعتمد على الأدوات الباهظة - المهارة أهم",
    icon: "💰",
    details: "الأدوات الجيدة مفيدة، لكن المهارة أهم بكثير. ابدأ بأدوات بسيطة وطور مهاراتك قبل الاستثمار في معدات باهظة.",
  },
  {
    title: "تعلم مزج الألوان بنفسك",
    icon: "🎨",
    details: "فهم كيفية مزج الألوان يمنحك تحكماً أكبر في لوحتك. تدرب على إنشاء درجات ألوان متعددة من ألوان أساسية قليلة.",
  },
  {
    title: "استخدم الممحاة كأداة رسم وليس للتصحيح فقط",
    icon: "🧹",
    details: "الممحاة ليست فقط لإزالة الأخطاء، بل يمكن استخدامها لإنشاء إضاءات وتأثيرات خاصة في رسوماتك.",
  },
  {
    title: "ارسم تحت إضاءة طبيعية عندما يمكنك",
    icon: "☀️",
    details: "الضوء الطبيعي يظهر الألوان الحقيقية ويساعدك على رؤية التفاصيل بشكل أفضل. حاول العمل بالقرب من نافذة.",
  },
  {
    title: "شارك عملك واقبل الملاحظات بصدر رحب",
    icon: "💬",
    details: "النقد البنّاء من الآخرين يساعدك على النمو. انضم لمجتمعات فنية واستمع لآراء المحترفين والهواة.",
  },
  {
    title: "ارسم ما تحبه وليس ما يتوقعه الآخرون",
    icon: "❤️",
    details: "الشغف هو وقود الإبداع. ارسم المواضيع التي تحبها وتهتم بها، فهذا سيظهر في جودة عملك وسيجعل التعلم ممتعاً.",
  },
  {
    title: "كن صبوراً - الفن يحتاج وقتاً وتكراراً",
    icon: "⏳",
    details: "التطور الفني لا يحدث بين ليلة وضحاها. استمر في الممارسة والتعلم، وستلاحظ التحسن التدريجي مع مرور الوقت.",
  },
];

const DrawingTips = () => {
  const [openTips, setOpenTips] = useState<Set<number>>(new Set());

  const toggleTip = (index: number) => {
    setOpenTips((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            20 نصيحة ذهبية للرسم
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            نصائح عملية لتحسين مهاراتك الفنية من المبتدئ إلى المحترف
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {tips.map((tip, index) => (
            <Collapsible
              key={index}
              open={openTips.has(index)}
              onOpenChange={() => toggleTip(index)}
            >
              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{tip.icon}</span>
                      <span className="font-semibold text-right">{tip.title}</span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        openTips.has(index) ? "transform rotate-180" : ""
                      }`}
                    />
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{tip.details}</p>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DrawingTips;
