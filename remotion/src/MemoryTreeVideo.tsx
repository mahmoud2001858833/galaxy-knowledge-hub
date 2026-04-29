import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadCairo } from "@remotion/google-fonts/Cairo";
import { loadFont as loadAmiri } from "@remotion/google-fonts/Amiri";

const { fontFamily: CAIRO } = loadCairo("normal", { weights: ["400", "700", "900"], subsets: ["arabic"] });
const { fontFamily: AMIRI } = loadAmiri("normal", { weights: ["400", "700"], subsets: ["arabic"] });

// Palette
const CREAM = "#F8F1E2";
const CREAM_LIGHT = "#FDF8EB";
const GOLD = "#A88232";
const GOLD_LIGHT = "#D2B26E";
const DARK = "#322012";
const ACCENT = "#8C1E32";

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 80) * 4;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 30%, ${CREAM_LIGHT} 0%, ${CREAM} 50%, #EFE3C8 100%)`,
      }}
    >
      {/* subtle gold grain dots */}
      <AbsoluteFill style={{ opacity: 0.08 }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill={GOLD} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" transform={`translate(${drift} 0)`} />
        </svg>
      </AbsoluteFill>
      {/* gold ornament frame */}
      <div
        style={{
          position: "absolute",
          inset: 40,
          border: `2px solid ${GOLD}`,
          borderRadius: 4,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 56,
          border: `1px solid ${GOLD_LIGHT}`,
          borderRadius: 2,
        }}
      />
    </AbsoluteFill>
  );
};

// Reusable header strip "حديقة الحسن التعليمية"
const TopBrand: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 80,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily: CAIRO,
      fontWeight: 700,
      fontSize: 26,
      letterSpacing: 6,
      color: GOLD,
      direction: "rtl",
    }}
  >
    حــديــقــة   الــحــسـن   الــتــعــلــيــمــيــة
  </div>
);

// =============== SCENE 1 — Title ===============
const Scene1Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const titleY = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const titleYpx = interpolate(titleY, [0, 1], [60, 0]);
  const subOp = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: "clamp" });
  const lineW = interpolate(frame, [40, 90], [0, 800], { extrapolateRight: "clamp" });
  const treeOp = interpolate(frame, [60, 110], [0, 1], { extrapolateRight: "clamp" });
  const treeScale = interpolate(frame, [60, 150], [0.92, 1.0]);

  return (
    <AbsoluteFill>
      <TopBrand />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            opacity: treeOp,
            transform: `scale(${treeScale})`,
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Img
            src={staticFile("images/tree.jpg")}
            style={{ height: "85%", objectFit: "contain", filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.25))" }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 150,
            width: "100%",
            textAlign: "center",
            transform: `translateY(${titleYpx}px)`,
            opacity: interpolate(frame, [0, 20], [0, 1]),
          }}
        >
          <div
            style={{
              fontFamily: AMIRI,
              fontWeight: 700,
              fontSize: 140,
              color: DARK,
              direction: "rtl",
              textShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            شَجَرَة الذَّاكِرَة
          </div>
          <div
            style={{
              width: lineW,
              height: 3,
              background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
              margin: "20px auto",
            }}
          />
          <div
            style={{
              opacity: subOp,
              fontFamily: CAIRO,
              fontSize: 36,
              color: ACCENT,
              direction: "rtl",
              fontWeight: 400,
            }}
          >
            آلة حية تُجسِّد الذكاء الاصطناعي
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =============== SCENE 2 — The Idea ===============
const Scene2Idea: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 20], [0, 1]);
  const lines = [
    "كيف نُري الأطفال ما هو الذكاء الاصطناعي؟",
    "فكرتنا: نحوّله إلى شجرة يستطيعون لمسها.",
    "كل ذكرى = قارورة ملوّنة معلّقة على غصن.",
    "كل سؤال = صبّة ماء تُحرّك دماغ الشجرة.",
  ];
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <TopBrand />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
        <div
          style={{
            fontFamily: CAIRO,
            fontWeight: 900,
            fontSize: 80,
            color: DARK,
            direction: "rtl",
            marginBottom: 20,
          }}
        >
          الفكرة
        </div>
        <div style={{ width: 200, height: 3, background: GOLD, marginBottom: 60 }} />
        <div style={{ direction: "rtl", textAlign: "center", maxWidth: 1500 }}>
          {lines.map((l, i) => {
            const lop = interpolate(frame, [40 + i * 25, 70 + i * 25], [0, 1], { extrapolateRight: "clamp" });
            const lx = interpolate(frame, [40 + i * 25, 70 + i * 25], [60, 0], { extrapolateRight: "clamp" });
            return (
              <div
                key={i}
                style={{
                  opacity: lop,
                  transform: `translateX(${lx}px)`,
                  fontFamily: AMIRI,
                  fontSize: 56,
                  color: i === 0 ? ACCENT : DARK,
                  marginBottom: 30,
                  fontWeight: i === 0 ? 700 : 400,
                }}
              >
                {l}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =============== SCENE 3 — Anatomy / Components ===============
const Scene3Anatomy: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 20], [0, 1]);
  const treeScale = interpolate(frame, [0, 90], [0.95, 1.05]);
  const parts = [
    { t: "الجِذع", d: "خشب الجوز · هيكل الذكاء", color: "#7A4A1F", delay: 30, side: "right", y: 280 },
    { t: "العَجلة المركزية", d: "دماغ الشجرة · يدور مع كل سؤال", color: GOLD, delay: 55, side: "right", y: 480 },
    { t: "القَوارير الملوّنة", d: "كل قارورة = ذكرى مخزّنة", color: "#28a8c9", delay: 80, side: "left", y: 280 },
    { t: "الصَّنابير الثلاثة", d: "ماء الأسئلة · بداية التدريب", color: ACCENT, delay: 105, side: "left", y: 480 },
    { t: "الأجراس النحاسية", d: "صوت الاسترجاع", color: "#C09040", delay: 130, side: "right", y: 680 },
    { t: "الحوض البلوري", d: "مكان مزج الأفكار", color: "#5A8C3C", delay: 155, side: "left", y: 680 },
  ];
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <TopBrand />
      <div
        style={{
          position: "absolute",
          top: 130,
          width: "100%",
          textAlign: "center",
          fontFamily: CAIRO,
          fontWeight: 900,
          fontSize: 60,
          color: DARK,
          direction: "rtl",
        }}
      >
        مكوّنات الشجرة
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Img
          src={staticFile("images/tree.jpg")}
          style={{
            height: "75%",
            objectFit: "contain",
            transform: `scale(${treeScale})`,
            filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.2))",
          }}
        />
      </AbsoluteFill>
      {parts.map((p, i) => {
        const pop = interpolate(frame, [p.delay, p.delay + 20], [0, 1], { extrapolateRight: "clamp" });
        const px = interpolate(frame, [p.delay, p.delay + 25], [p.side === "right" ? -80 : 80, 0], {
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: p.y,
              [p.side]: 80,
              opacity: pop,
              transform: `translateX(${px}px)`,
              direction: "rtl",
              textAlign: p.side === "right" ? "right" : "left",
              background: "rgba(253, 248, 235, 0.92)",
              padding: "16px 24px",
              borderRadius: 10,
              borderRight: p.side === "right" ? `5px solid ${p.color}` : "none",
              borderLeft: p.side === "left" ? `5px solid ${p.color}` : "none",
              boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
              maxWidth: 400,
            }}
          >
            <div style={{ fontFamily: CAIRO, fontWeight: 900, fontSize: 32, color: p.color }}>{p.t}</div>
            <div style={{ fontFamily: CAIRO, fontSize: 20, color: DARK, marginTop: 4 }}>{p.d}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// =============== SCENE 4 — How It Works (Steps) ===============
const Scene4How: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 20], [0, 1]);
  const steps = [
    { n: "١", t: "اسأل", d: "اطرح سؤالاً واسحب الصنبور" },
    { n: "٢", t: "اسقِ", d: "ينزل الماء داخل جذع الشجرة" },
    { n: "٣", t: "تتعلّم", d: "تدور العجلة وتمتلئ قارورة بلون جديد" },
    { n: "٤", t: "تتذكّر", d: "اسحب المقبض، يعود نفس اللون ويرنّ الجرس" },
    { n: "٥", t: "تبتكر", d: "اخلط قارورتين، يولد لون = فكرة جديدة" },
  ];
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <TopBrand />
      <div
        style={{
          position: "absolute",
          top: 130,
          width: "100%",
          textAlign: "center",
          fontFamily: CAIRO,
          fontWeight: 900,
          fontSize: 60,
          color: DARK,
          direction: "rtl",
        }}
      >
        كيف تعمل الشجرة؟
      </div>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 80,
          flexDirection: "row",
          gap: 28,
          direction: "rtl",
        }}
      >
        {steps.map((s, i) => {
          const sop = interpolate(frame, [40 + i * 25, 70 + i * 25], [0, 1], { extrapolateRight: "clamp" });
          const sy = interpolate(frame, [40 + i * 25, 70 + i * 25], [40, 0], { extrapolateRight: "clamp" });
          const pulse = 1 + Math.sin((frame - (40 + i * 25)) / 14) * 0.02;
          return (
            <div
              key={i}
              style={{
                opacity: sop,
                transform: `translateY(${sy}px) scale(${pulse})`,
                width: 290,
                background: CREAM_LIGHT,
                border: `2px solid ${GOLD}`,
                borderRadius: 14,
                padding: "30px 22px",
                textAlign: "center",
                boxShadow: "0 10px 24px rgba(0,0,0,0.15)",
              }}
            >
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${GOLD}, ${GOLD_LIGHT})`,
                  color: CREAM_LIGHT,
                  fontFamily: AMIRI,
                  fontWeight: 700,
                  fontSize: 42,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                {s.n}
              </div>
              <div style={{ fontFamily: CAIRO, fontWeight: 900, fontSize: 32, color: ACCENT }}>{s.t}</div>
              <div style={{ fontFamily: CAIRO, fontSize: 20, color: DARK, marginTop: 10 }}>{s.d}</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =============== SCENE 5..10 — Concept cards (one each) ===============
type ConceptProps = {
  num: string;
  title: string;
  en: string;
  metaphor: string;
  desc: string;
  color: string;
};
const ConceptScene: React.FC<ConceptProps> = ({ num, title, en, metaphor, desc, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardSpring = spring({ frame, fps, config: { damping: 16, stiffness: 110 } });
  const cardScale = interpolate(cardSpring, [0, 1], [0.85, 1]);
  const cardOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const numOp = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: "clamp" });
  const lineW = interpolate(frame, [25, 70], [0, 600], { extrapolateRight: "clamp" });
  const descOp = interpolate(frame, [50, 80], [0, 1], { extrapolateRight: "clamp" });
  const float = Math.sin(frame / 18) * 6;

  return (
    <AbsoluteFill>
      <TopBrand />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            opacity: cardOp,
            transform: `scale(${cardScale}) translateY(${float}px)`,
            width: 1500,
            background: CREAM_LIGHT,
            borderRadius: 24,
            border: `3px solid ${GOLD}`,
            boxShadow: `0 30px 60px rgba(0,0,0,0.25)`,
            overflow: "hidden",
            direction: "rtl",
          }}
        >
          {/* color header bar */}
          <div
            style={{
              background: `linear-gradient(135deg, ${color} 0%, ${color}DD 100%)`,
              padding: "40px 60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: CAIRO, fontSize: 22, color: "#FFFFFF99", letterSpacing: 4 }}>{en}</div>
              <div style={{ fontFamily: AMIRI, fontWeight: 700, fontSize: 80, color: "#fff" }}>{title}</div>
            </div>
            <div
              style={{
                opacity: numOp,
                width: 130,
                height: 130,
                borderRadius: "50%",
                background: CREAM_LIGHT,
                color: color,
                fontFamily: AMIRI,
                fontWeight: 700,
                fontSize: 70,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `4px solid #fff`,
              }}
            >
              {num}
            </div>
          </div>
          {/* body */}
          <div style={{ padding: "50px 60px 60px" }}>
            <div
              style={{
                fontFamily: CAIRO,
                fontWeight: 700,
                fontSize: 36,
                color: ACCENT,
                marginBottom: 8,
              }}
            >
              في الشجرة:
            </div>
            <div
              style={{
                fontFamily: AMIRI,
                fontSize: 44,
                color: DARK,
                lineHeight: 1.5,
                marginBottom: 30,
              }}
            >
              {metaphor}
            </div>
            <div style={{ width: lineW, height: 2, background: color, marginBottom: 30 }} />
            <div
              style={{
                opacity: descOp,
                fontFamily: CAIRO,
                fontSize: 32,
                color: "#5a4530",
                lineHeight: 1.7,
              }}
            >
              {desc}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =============== FINAL SCENE — Summary of all concepts ===============
const SceneSummary: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 25], [0, 1]);
  const concepts = [
    { n: "01", t: "التدريب", c: "#2882B4" },
    { n: "02", t: "التكرار والإتقان", c: "#C83C82" },
    { n: "03", t: "الاسترجاع", c: "#D2A028" },
    { n: "04", t: "الربط والابتكار", c: "#5A8C3C" },
    { n: "05", t: "التحيز والنسيان", c: "#8246A0" },
    { n: "06", t: "الهلوسة", c: "#B43C3C" },
  ];
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <TopBrand />
      <div
        style={{
          position: "absolute",
          top: 130,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: CAIRO, fontWeight: 900, fontSize: 64, color: DARK, direction: "rtl" }}>
          المفاهيم التي جسّدتها الشجرة
        </div>
        <div style={{ width: 240, height: 3, background: GOLD, margin: "16px auto" }} />
      </div>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingTop: 60 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 30,
            width: 1600,
            direction: "rtl",
          }}
        >
          {concepts.map((c, i) => {
            const cop = interpolate(frame, [30 + i * 18, 60 + i * 18], [0, 1], { extrapolateRight: "clamp" });
            const cy = interpolate(frame, [30 + i * 18, 60 + i * 18], [40, 0], { extrapolateRight: "clamp" });
            return (
              <div
                key={i}
                style={{
                  opacity: cop,
                  transform: `translateY(${cy}px)`,
                  background: CREAM_LIGHT,
                  borderRadius: 14,
                  border: `2px solid ${GOLD_LIGHT}`,
                  padding: "30px 26px",
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
                }}
              >
                <div
                  style={{
                    minWidth: 80,
                    height: 80,
                    borderRadius: 12,
                    background: c.c,
                    color: "#fff",
                    fontFamily: AMIRI,
                    fontWeight: 700,
                    fontSize: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {c.n}
                </div>
                <div style={{ fontFamily: CAIRO, fontWeight: 900, fontSize: 36, color: DARK }}>{c.t}</div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 70,
            opacity: interpolate(frame, [180, 220], [0, 1], { extrapolateRight: "clamp" }),
            fontFamily: AMIRI,
            fontWeight: 700,
            fontSize: 56,
            color: ACCENT,
            direction: "rtl",
            textAlign: "center",
          }}
        >
          اسقِ الشجرة بالأسئلة · كرّر السقاية · تُثمر لك ذكاءً
        </div>
        <div
          style={{
            marginTop: 30,
            opacity: interpolate(frame, [210, 250], [0, 1], { extrapolateRight: "clamp" }),
            fontFamily: CAIRO,
            fontSize: 32,
            color: GOLD,
            direction: "rtl",
          }}
        >
          مشروع حديقة الحسن التعليمية
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// =============== Composition ===============
export const DURATIONS = {
  s1: 150, // title 5s
  s2: 210, // idea 7s
  s3: 240, // anatomy 8s
  s4: 240, // how-it-works 8s
  c1: 180, // concept training 6s
  c2: 180,
  c3: 180,
  c4: 180,
  c5: 180,
  c6: 180,
  sum: 300, // summary 10s
};
export const TOTAL =
  DURATIONS.s1 +
  DURATIONS.s2 +
  DURATIONS.s3 +
  DURATIONS.s4 +
  DURATIONS.c1 +
  DURATIONS.c2 +
  DURATIONS.c3 +
  DURATIONS.c4 +
  DURATIONS.c5 +
  DURATIONS.c6 +
  DURATIONS.sum;

const concepts: ConceptProps[] = [
  {
    num: "٠١",
    title: "التدريب",
    en: "TRAINING",
    metaphor: "كل صبّة ماء في الصنبور تُدرِّب الشجرة، تدور العجلة وتُسجَّل ذكرى جديدة.",
    desc: "هكذا يتعلّم الذكاء الاصطناعي: ملايين الأمثلة تدخل إليه فيَكتسب أنماطاً جديدة.",
    color: "#2882B4",
  },
  {
    num: "٠٢",
    title: "التكرار والإتقان",
    en: "REINFORCEMENT",
    metaphor: "كل قارورة من خمس طبقات. كرّر التدريب يمتلئ لونها ويشتدّ تركيزه.",
    desc: "كلما كرّر النموذج المهارة، صار أدق وأسرع. التكرار هو طريق الإتقان عند الآلة كما عند الإنسان.",
    color: "#C83C82",
  },
  {
    num: "٠٣",
    title: "الاسترجاع",
    en: "RECALL",
    metaphor: "اسحب مقبض ذكرى، تنقلب القارورة ويعود الماء بنفس اللون ويرنّ الجرس بنفس النغمة.",
    desc: "حين تسأل الذكاء الاصطناعي، فهو لا يفكر من الصفر، بل يستدعي الأنماط التي تعلّمها سابقاً.",
    color: "#D2A028",
  },
  {
    num: "٠٤",
    title: "الربط والابتكار",
    en: "ASSOCIATION",
    metaphor: "اسحب ذكريتين معاً، يختلط لونيهما في الحوض البلوري فيُولد لون جديد لم يكن موجوداً.",
    desc: "هذا قلب الإبداع الاصطناعي: مزج المعارف القديمة لتوليد فكرة أو صورة أو حلٍّ جديد.",
    color: "#5A8C3C",
  },
  {
    num: "٠٥",
    title: "التحيّز والنسيان",
    en: "BIAS / FORGETTING",
    metaphor: "إن ثقُل فرع مالت الشجرة كلها = تحيّز. وإن أُهملت قارورة بهت لونها = نسيان.",
    desc: "نُعلّم الأطفال أن الذكاء الاصطناعي ليس كاملاً: يتأثّر بالبيانات ويفقد ما لا يُستعمل.",
    color: "#8246A0",
  },
  {
    num: "٠٦",
    title: "الهلوسة",
    en: "HALLUCINATION",
    metaphor: "مقبض الحلم يخلط ثلاث ذكريات عشوائية، فيظهر لون بلا معنى.",
    desc: "أحياناً يخترع الذكاء الاصطناعي معلومات غير صحيحة. الشجرة تُريك ذلك بعينك.",
    color: "#B43C3C",
  },
];

export const MemoryTreeVideo: React.FC = () => {
  let from = 0;
  const seq = (d: number, child: React.ReactNode) => {
    const node = (
      <Sequence from={from} durationInFrames={d} key={from}>
        {child}
      </Sequence>
    );
    from += d;
    return node;
  };

  const items: React.ReactNode[] = [];
  items.push(seq(DURATIONS.s1, <Scene1Title />));
  items.push(seq(DURATIONS.s2, <Scene2Idea />));
  items.push(seq(DURATIONS.s3, <Scene3Anatomy />));
  items.push(seq(DURATIONS.s4, <Scene4How />));
  const cd = [DURATIONS.c1, DURATIONS.c2, DURATIONS.c3, DURATIONS.c4, DURATIONS.c5, DURATIONS.c6];
  concepts.forEach((c, i) => items.push(seq(cd[i], <ConceptScene {...c} />)));
  items.push(seq(DURATIONS.sum, <SceneSummary />));

  return (
    <AbsoluteFill>
      <Background />
      {items}
    </AbsoluteFill>
  );
};
