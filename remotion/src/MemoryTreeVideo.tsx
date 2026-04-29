import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { flip } from "@remotion/transitions/flip";
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
  const glow = 0.5 + Math.sin(frame / 60) * 0.08;
  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 50% 35%, #FFF6E0 0%, ${CREAM_LIGHT} 35%, ${CREAM} 65%, #E8D9B8 100%),
          linear-gradient(180deg, #F4E8CC 0%, #E2CFA0 100%)
        `,
      }}
    >
      {/* warm spotlight */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, rgba(255,220,140,${glow}) 0%, transparent 55%)`,
          mixBlendMode: "screen",
        }}
      />
      {/* gold grain dots */}
      <AbsoluteFill style={{ opacity: 0.07 }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="dots" width="44" height="44" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill={GOLD} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" transform={`translate(${drift} 0)`} />
        </svg>
      </AbsoluteFill>
      {/* floor shadow */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 220,
          background: "linear-gradient(180deg, transparent 0%, rgba(50,32,18,0.25) 100%)",
        }}
      />
      {/* gold double frame */}
      <div style={{ position: "absolute", inset: 40, border: `2px solid ${GOLD}`, borderRadius: 6 }} />
      <div style={{ position: "absolute", inset: 56, border: `1px solid ${GOLD_LIGHT}`, borderRadius: 4 }} />
      {/* corner ornaments */}
      {[
        { top: 56, left: 56 },
        { top: 56, right: 56 },
        { bottom: 56, left: 56 },
        { bottom: 56, right: 56 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...pos,
            width: 40,
            height: 40,
            border: `2px solid ${GOLD}`,
            transform: "rotate(45deg)",
            background: `radial-gradient(circle, ${GOLD_LIGHT}55, transparent 70%)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// Premium staging backdrop placed BEHIND the tree image
const TreeStage: React.FC<{ scale?: number; intensity?: number }> = ({ scale = 1, intensity = 1 }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 40) * 0.3;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "relative",
          width: 1100 * scale,
          height: 1100 * scale,
          transform: `rotate(${sway}deg)`,
        }}
      >
        {/* radial halo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 50% 45%, rgba(255,220,150,${0.55 * intensity}) 0%, rgba(210,178,110,${0.25 * intensity}) 35%, transparent 65%)`,
            borderRadius: "50%",
            filter: "blur(2px)",
          }}
        />
        {/* light rays */}
        <svg width="100%" height="100%" viewBox="-50 -50 100 100" style={{ position: "absolute", inset: 0, opacity: 0.18 * intensity }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={0}
                y1={0}
                x2={Math.cos(a) * 60}
                y2={Math.sin(a) * 60}
                stroke={GOLD}
                strokeWidth={0.4}
              />
            );
          })}
        </svg>
        {/* concentric rings */}
        {[0.95, 0.78, 0.6].map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: `${(1 - s) * 50}%`,
              border: `1px solid ${GOLD_LIGHT}`,
              borderRadius: "50%",
              opacity: 0.35 - i * 0.08,
            }}
          />
        ))}
      </div>
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

// =============== SCENE 1 — Title (split layout, no overlap) ===============
const Scene1Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Tree appears first, alone & centered, then slides to the right side.
  const treeOp = interpolate(frame, [0, 35], [0, 1], { extrapolateRight: "clamp" });
  const treeShift = spring({ frame: frame - 55, fps, config: { damping: 22, stiffness: 80 } });
  const treeX = interpolate(treeShift, [0, 1], [0, 360]); // moves right
  const treeScale = interpolate(frame, [0, 60, 150], [0.9, 1.02, 1.0]);

  // Title appears AFTER tree has moved aside.
  const titleSpring = spring({ frame: frame - 70, fps, config: { damping: 18, stiffness: 90 } });
  const titleX = interpolate(titleSpring, [0, 1], [-80, 0]);
  const titleOp = interpolate(frame, [70, 100], [0, 1], { extrapolateRight: "clamp" });
  const lineW = interpolate(frame, [95, 145], [0, 520], { extrapolateRight: "clamp" });
  const subOp = interpolate(frame, [110, 140], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <TopBrand />
      {/* Tree on right half */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "85%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `translateX(${treeX}px)`,
          }}
        >
          <TreeStage scale={0.78} intensity={treeOp} />
          <Img
            src={staticFile("images/memory-tree.png")}
            style={{
              opacity: treeOp,
              transform: `scale(${treeScale})`,
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 40px 50px rgba(80,50,20,0.45))",
              position: "relative",
              zIndex: 2,
            }}
          />
        </div>
      </AbsoluteFill>
      {/* Title text — left column only, never crosses center */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 100,
          width: 760,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: "right",
          direction: "rtl",
          opacity: titleOp,
          transform: `translateX(${titleX}px)`,
        }}
      >
        <div
          style={{
            fontFamily: CAIRO,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: 8,
            color: GOLD,
            marginBottom: 18,
          }}
        >
          THE  MEMORY  TREE
        </div>
        <div
          style={{
            fontFamily: AMIRI,
            fontWeight: 700,
            fontSize: 130,
            color: DARK,
            lineHeight: 1.0,
            textShadow: "0 4px 14px rgba(0,0,0,0.18)",
          }}
        >
          شَجَرَة
          <br />
          الذَّاكِرَة
        </div>
        <div
          style={{
            width: lineW,
            height: 3,
            background: `linear-gradient(90deg, ${GOLD}, transparent)`,
            margin: "26px 0",
          }}
        />
        <div
          style={{
            opacity: subOp,
            fontFamily: CAIRO,
            fontSize: 30,
            color: ACCENT,
            fontWeight: 400,
            lineHeight: 1.5,
          }}
        >
          آلة حيّة تُجسِّد الذكاء الاصطناعي
          <br />
          بين يدَي الطفل
        </div>
      </div>
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

// =============== SCENE 3 — Anatomy / Components (split: tree LEFT, cards RIGHT) ===============
const Scene3Anatomy: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 20], [0, 1]);
  const treeScale = interpolate(frame, [0, 120], [0.96, 1.02]);
  const parts = [
    { t: "الجِذع", d: "خشب الجوز · هيكل الذكاء", color: "#7A4A1F", delay: 30 },
    { t: "العَجلة المركزية", d: "دماغ الشجرة · يدور مع كل سؤال", color: GOLD, delay: 50 },
    { t: "القَوارير الملوّنة", d: "كل قارورة = ذكرى مخزّنة", color: "#28a8c9", delay: 70 },
    { t: "الصَّنابير الثلاثة", d: "ماء الأسئلة · بداية التدريب", color: ACCENT, delay: 90 },
    { t: "الأجراس النحاسية", d: "صوت الاسترجاع", color: "#C09040", delay: 110 },
    { t: "الحوض البلوري", d: "مكان مزج الأفكار", color: "#5A8C3C", delay: 130 },
  ];
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <TopBrand />
      {/* Section title — top center, well above tree zone */}
      <div
        style={{
          position: "absolute",
          top: 130,
          width: "100%",
          textAlign: "center",
          fontFamily: CAIRO,
          fontWeight: 900,
          fontSize: 56,
          color: DARK,
          direction: "rtl",
        }}
      >
        مكوّنات الشجرة
        <div style={{ width: 200, height: 3, background: GOLD, margin: "12px auto 0" }} />
      </div>

      {/* LEFT half: tree only */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 220,
          bottom: 80,
          width: "48%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TreeStage scale={0.7} intensity={1} />
        <Img
          src={staticFile("images/memory-tree.png")}
          style={{
            height: "100%",
            objectFit: "contain",
            transform: `scale(${treeScale})`,
            filter: "drop-shadow(0 30px 40px rgba(80,50,20,0.4))",
            position: "relative",
            zIndex: 2,
          }}
        />
      </div>

      {/* RIGHT half: 6 organized label cards */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 240,
          width: "44%",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          direction: "rtl",
        }}
      >
        {parts.map((p, i) => {
          const pop = interpolate(frame, [p.delay, p.delay + 22], [0, 1], { extrapolateRight: "clamp" });
          const px = interpolate(frame, [p.delay, p.delay + 28], [60, 0], { extrapolateRight: "clamp" });
          return (
            <div
              key={i}
              style={{
                opacity: pop,
                transform: `translateX(${px}px)`,
                background: "rgba(253, 248, 235, 0.96)",
                padding: "20px 22px",
                borderRadius: 12,
                borderRight: `5px solid ${p.color}`,
                boxShadow: "0 8px 22px rgba(0,0,0,0.14)",
                textAlign: "right",
              }}
            >
              <div style={{ fontFamily: CAIRO, fontWeight: 900, fontSize: 28, color: p.color }}>{p.t}</div>
              <div style={{ fontFamily: CAIRO, fontSize: 18, color: DARK, marginTop: 4, lineHeight: 1.5 }}>
                {p.d}
              </div>
            </div>
          );
        })}
      </div>
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

// =============== CHAPTER DIVIDER ===============
const ChapterDivider: React.FC<{ kicker: string; title: string; subtitle: string }> = ({
  kicker,
  title,
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 18, stiffness: 110 } });
  const titleY = interpolate(sp, [0, 1], [50, 0]);
  const op = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const lineW = interpolate(frame, [12, 50], [0, 700], { extrapolateRight: "clamp" });
  const subOp = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [80, 100], [1, 0.94], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: op, transform: `scale(${exit})` }}>
      <TopBrand />
      {/* Decorative gold ring */}
      <div
        style={{
          position: "absolute",
          width: 720,
          height: 720,
          borderRadius: "50%",
          border: `1px solid ${GOLD_LIGHT}`,
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 560,
          height: 560,
          borderRadius: "50%",
          border: `1px solid ${GOLD}`,
          opacity: 0.35,
        }}
      />
      <div style={{ textAlign: "center", direction: "rtl", zIndex: 2 }}>
        <div
          style={{
            fontFamily: CAIRO,
            color: GOLD,
            fontSize: 28,
            letterSpacing: 14,
            marginBottom: 30,
            fontWeight: 700,
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            transform: `translateY(${titleY}px)`,
            fontFamily: AMIRI,
            fontWeight: 700,
            fontSize: 130,
            color: DARK,
            lineHeight: 1.05,
            textShadow: "0 4px 16px rgba(0,0,0,0.18)",
          }}
        >
          {title}
        </div>
        <div
          style={{
            width: lineW,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
            margin: "26px auto",
          }}
        />
        <div
          style={{
            opacity: subOp,
            fontFamily: CAIRO,
            fontSize: 34,
            color: ACCENT,
            fontWeight: 400,
          }}
        >
          {subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// =============== Composition ===============
export const DURATIONS = {
  d_open: 90,    // افتتاحية divider 3s
  s1: 150,       // title
  s2: 210,       // idea
  d_how: 90,     // آلية التطبيق divider
  s3: 240,       // anatomy
  s4: 240,       // how-it-works
  c1: 180, c2: 180, c3: 180, c4: 180, c5: 180, c6: 180,
  d_end: 90,     // الخاتمة divider
  sum: 300,
};

const TRANSITION_FRAMES = 22;
// TransitionSeries: total = sum(durations) - transitions*(N-1)
const SEGMENTS = [
  DURATIONS.d_open,
  DURATIONS.s1,
  DURATIONS.s2,
  DURATIONS.d_how,
  DURATIONS.s3,
  DURATIONS.s4,
  DURATIONS.c1, DURATIONS.c2, DURATIONS.c3, DURATIONS.c4, DURATIONS.c5, DURATIONS.c6,
  DURATIONS.d_end,
  DURATIONS.sum,
];
export const TOTAL =
  SEGMENTS.reduce((a, b) => a + b, 0) - TRANSITION_FRAMES * (SEGMENTS.length - 1);

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

// Helper: cinematic, content-aware transitions
const makeTransition = (i: number) => {
  const presentations = [
    fade(),                                  // 0 → 1   chapter1 → title
    slide({ direction: "from-right" }),      // 1 → 2   title → idea
    fade(),                                  // 2 → 3   idea → chapter2
    clockWipe({ width: 1920, height: 1080 }),// 3 → 4   chapter2 → anatomy
    wipe({ direction: "from-bottom-right" }),// 4 → 5   anatomy → how
    flip(),                                  // 5 → 6   how → c1
    slide({ direction: "from-right" }),      // 6 → 7   c1 → c2
    slide({ direction: "from-right" }),      // 7 → 8
    slide({ direction: "from-right" }),      // 8 → 9
    slide({ direction: "from-right" }),      // 9 → 10
    slide({ direction: "from-right" }),      // 10 → 11
    fade(),                                  // 11 → 12  c6 → chapter3
    clockWipe({ width: 1920, height: 1080 }),// 12 → 13  chapter3 → summary
  ];
  return presentations[i] ?? fade();
};

export const MemoryTreeVideo: React.FC = () => {
  const scenes: { d: number; node: React.ReactNode }[] = [
    {
      d: DURATIONS.d_open,
      node: (
        <ChapterDivider
          kicker="CHAPTER  ·  ١"
          title="افتتاحية"
          subtitle="مشروع حديقة الحسن التعليمية"
        />
      ),
    },
    { d: DURATIONS.s1, node: <Scene1Title /> },
    { d: DURATIONS.s2, node: <Scene2Idea /> },
    {
      d: DURATIONS.d_how,
      node: (
        <ChapterDivider
          kicker="CHAPTER  ·  ٢"
          title="آليّة التطبيق"
          subtitle="كيف صُنعت الشجرة وكيف تشتغل"
        />
      ),
    },
    { d: DURATIONS.s3, node: <Scene3Anatomy /> },
    { d: DURATIONS.s4, node: <Scene4How /> },
    ...concepts.map((c, i) => ({
      d: [DURATIONS.c1, DURATIONS.c2, DURATIONS.c3, DURATIONS.c4, DURATIONS.c5, DURATIONS.c6][i],
      node: <ConceptScene {...c} />,
    })),
    {
      d: DURATIONS.d_end,
      node: (
        <ChapterDivider
          kicker="CHAPTER  ·  ٣"
          title="خلاصة الرحلة"
          subtitle="ست مفاهيم تجسّدت في غصن واحد"
        />
      ),
    },
    { d: DURATIONS.sum, node: <SceneSummary /> },
  ];

  return (
    <AbsoluteFill>
      <Background />
      {/* Background music spans entire video */}
      <Audio src={staticFile("audio/bg-music.mp3")} volume={0.85} />
      <TransitionSeries>
        {scenes.map((s, i) => {
          const items: React.ReactNode[] = [
            <TransitionSeries.Sequence key={`s-${i}`} durationInFrames={s.d}>
              {s.node}
            </TransitionSeries.Sequence>,
          ];
          if (i < scenes.length - 1) {
            items.push(
              <TransitionSeries.Transition
                key={`t-${i}`}
                presentation={makeTransition(i)}
                timing={springTiming({
                  config: { damping: 200, stiffness: 100 },
                  durationInFrames: TRANSITION_FRAMES,
                })}
              />
            );
          }
          return items;
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
