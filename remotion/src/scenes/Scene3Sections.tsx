import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadOrbitron } from "@remotion/google-fonts/Orbitron";
import { C } from "../theme";

const cairo = loadCairo("normal", { weights: ["700", "900"], subsets: ["arabic"] });
const orbitron = loadOrbitron("normal", { weights: ["700", "900"] });

type Section = {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  color: string;
  color2: string;
  icon: string;
  tools: string[];
};

const sections: Section[] = [
  {
    id: "ai",
    badge: "SECTION 01",
    title: "الذكاء الاصطناعي",
    subtitle: "AI & Machine Learning",
    color: C.primary,
    color2: "#a020f0",
    icon: "◉",
    tools: [
      "المساعد التعليمي الذكي",
      "كشف السرطان بالذكاء الاصطناعي",
      "توليد الصور بالذكاء الاصطناعي",
      "مساعد البرمجة الذكي",
      "🚀 باني المنصات بالـ AI",
      "المساعد الطبي الذكي",
      "💳 الدفع بالوجه - FacePay AI",
      "🌙 لومينا - الذكاء الاصطناعي العربي",
    ],
  },
  {
    id: "inclusive",
    badge: "SECTION 02",
    title: "التعلّم الدامج",
    subtitle: "Inclusive Education",
    color: "#ff5fa2",
    color2: C.primary,
    icon: "✋",
    tools: [
      "مترجم لغة الإشارة الذكي",
      "قاموس لغة الإشارة التفاعلي",
      "دعم أكثر من 26+ إشارة",
      "68+ كلمة وعبارة بالقاموس",
      "نطق صوتي ورسوم توضيحية",
    ],
  },
  {
    id: "simulations",
    badge: "SECTION 03",
    title: "المحاكيات التفاعلية",
    subtitle: "Interactive Simulations Lab",
    color: C.accent,
    color2: "#10b981",
    icon: "⚛",
    tools: [
      "مصادم الهدرونات الكبير",
      "النظام الشمسي 3D",
      "التفاعلات النووية والكيميائية",
      "ميكانيكا الكم والنسبية",
      "مختبر الوراثة و DNA",
      "الجهاز المناعي وجسم الإنسان",
      "+150 محاكاة بدقة احترافية",
    ],
  },
  {
    id: "robotics",
    badge: "SECTION 04",
    title: "الروبوتات والبناء الذكي",
    subtitle: "Robotics & Smart Construction",
    color: "#3b82f6",
    color2: C.accent,
    icon: "⚙",
    tools: [
      "مولّد الروبوتات بالذكاء الاصطناعي",
      "التوأم الرقمي للأردن",
      "التصميم المعماري الذكي",
      "روبوت البناء التفاعلي",
      "التصميم الداخلي التفاعلي",
    ],
  },
  {
    id: "sustainability",
    badge: "SECTION 05",
    title: "التقنيات المستدامة",
    subtitle: "Sustainable Tech",
    color: "#10b981",
    color2: C.accent2,
    icon: "🌿",
    tools: [
      "حاسبة البصمة الكربونية",
      "مشاريع مدرسية بيئية",
      "مشاريع منزلية بيئية",
      "مؤشر الاستدامة الشخصي",
      "خبير إعادة التدوير الذكي",
      "التنبؤ البيئي الذكي",
    ],
  },
];

const SECTION_DURATION = 110; // frames per section

const SectionPanel: React.FC<{ s: Section }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSp = spring({ frame, fps, config: { damping: 16, stiffness: 110 } });
  const exitOp = interpolate(frame, [SECTION_DURATION - 18, SECTION_DURATION], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: exitOp, padding: 80, flexDirection: "row", alignItems: "center", gap: 80 }}>
      {/* Left: title block */}
      <div style={{ flex: 1, maxWidth: 720 }}>
        <div
          style={{
            opacity: interpolate(enterSp, [0, 1], [0, 1]),
            transform: `translateX(${interpolate(enterSp, [0, 1], [-60, 0])}px)`,
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 18,
              background: `linear-gradient(135deg, ${s.color}, ${s.color2})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              boxShadow: `0 10px 40px ${s.color}88`,
            }}
          >
            {s.icon}
          </div>
          <div>
            <div style={{ fontFamily: orbitron.fontFamily, color: s.color, fontSize: 18, letterSpacing: 8, fontWeight: 700 }}>
              {s.badge}
            </div>
            <div style={{ fontFamily: orbitron.fontFamily, color: C.muted, fontSize: 16, letterSpacing: 4, marginTop: 4 }}>
              {s.subtitle}
            </div>
          </div>
        </div>

        <h2
          style={{
            opacity: interpolate(enterSp, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(enterSp, [0, 1], [40, 0])}px)`,
            fontFamily: cairo.fontFamily,
            fontSize: 88,
            fontWeight: 900,
            margin: 0,
            lineHeight: 1.05,
            background: `linear-gradient(135deg, ${C.text}, ${s.color})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {s.title}
        </h2>

        {/* Animated bar */}
        <div
          style={{
            marginTop: 32,
            height: 5,
            width: interpolate(spring({ frame: frame - 14, fps, config: { damping: 18 } }), [0, 1], [0, 360]),
            background: `linear-gradient(90deg, ${s.color}, ${s.color2})`,
            borderRadius: 4,
            boxShadow: `0 0 30px ${s.color}99`,
          }}
        />
      </div>

      {/* Right: tools list */}
      <div style={{ flex: 1, maxWidth: 720 }}>
        {s.tools.map((tool, i) => {
          const delay = 22 + i * 8;
          const sp = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 130 } });
          return (
            <div
              key={i}
              style={{
                opacity: sp,
                transform: `translateX(${interpolate(sp, [0, 1], [60, 0])}px)`,
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "14px 22px",
                marginBottom: 12,
                background: `linear-gradient(90deg, ${s.color}11, transparent)`,
                borderRight: `3px solid ${s.color}`,
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: s.color,
                  boxShadow: `0 0 14px ${s.color}`,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  fontFamily: cairo.fontFamily,
                  fontSize: 26,
                  fontWeight: 700,
                  color: C.text,
                }}
              >
                {tool}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const SectionsHeader: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 18, 40, 58], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: op }}>
      <div style={{ fontFamily: orbitron.fontFamily, color: C.accent, fontSize: 24, letterSpacing: 12, marginBottom: 20 }}>
        FIVE PILLARS
      </div>
      <h1 style={{ fontFamily: cairo.fontFamily, fontSize: 130, fontWeight: 900, color: C.text, margin: 0, textAlign: "center" }}>
        خمسة <span style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>أقسام</span> رئيسية
      </h1>
      <div style={{ fontFamily: cairo.fontFamily, fontSize: 30, color: C.muted, marginTop: 24, fontWeight: 700 }}>
        تجمع أكثر من 200 أداة ضمن منظومة واحدة
      </div>
    </AbsoluteFill>
  );
};

export const Scene3Sections: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={60}>
        <SectionsHeader />
      </Sequence>
      {sections.map((s, i) => (
        <Sequence key={s.id} from={60 + i * SECTION_DURATION} durationInFrames={SECTION_DURATION}>
          <SectionPanel s={s} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const SCENE3_DURATION = 60 + sections.length * SECTION_DURATION; // 60 + 5*110 = 610
