import { staticFile } from "remotion";
import { D } from "../theme";
import { Reveal, KenBurns } from "./Reveal";
import { FONTS } from "./SlideFrame";
import type { Slide } from "../script";

const { cairo, amiri } = FONTS;

export const SlideBody: React.FC<{ slide: Slide }> = ({ slide }) => {
  switch (slide.layout) {
    case "cover":
      return <Cover slide={slide} />;
    case "problem":
      return <Problem slide={slide} />;
    case "solution":
      return <Solution slide={slide} />;
    case "systems8":
      return <Systems8 slide={slide} />;
    case "compare":
      return <Compare slide={slide} />;
    case "team":
      return <Team slide={slide} />;
    case "finance":
      return <Finance slide={slide} />;
    case "endorse":
      return <Endorse slide={slide} />;
    case "deserve":
      return <Deserve slide={slide} />;
    case "closing":
      return <Closing slide={slide} />;
  }
};

// ----------------- Layouts -----------------

const Cover: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, textAlign: "center" }}>
    {slide.image && (
      <div style={{ position: "absolute", inset: 0, opacity: 0.12 }}>
        <KenBurns src={staticFile(slide.image)} delay={0} duration={550} scaleFrom={1.1} scaleTo={1.22} style={{ width: "100%", height: "100%" }} />
      </div>
    )}
    <Reveal delay={6}>
      <div style={{ fontFamily: amiri, color: slide.accent, fontSize: 16, letterSpacing: 8 }}>{slide.kicker}</div>
    </Reveal>
    <Reveal delay={14}>
      <h1 style={{ fontFamily: cairo, fontSize: 130, fontWeight: 900, color: D.primary, margin: "8px 0", letterSpacing: -2, lineHeight: 1 }}>
        {slide.title}
      </h1>
    </Reveal>
    <Reveal delay={28}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ height: 1, width: 80, background: D.muted }} />
        <div style={{ fontFamily: amiri, fontSize: 24, color: D.fade, letterSpacing: 2 }}>{slide.subtitle}</div>
        <div style={{ height: 1, width: 80, background: D.muted }} />
      </div>
    </Reveal>
  </div>
);

const Title: React.FC<{ slide: Slide; size?: number }> = ({ slide, size = 60 }) => (
  <>
    <Reveal delay={6}>
      <h1 style={{ fontFamily: cairo, fontSize: size, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.1 }}>{slide.title}</h1>
    </Reveal>
    {slide.subtitle && (
      <Reveal delay={18}>
        <div style={{ fontFamily: cairo, fontSize: 22, color: D.fade, marginTop: 12, fontWeight: 400 }}>{slide.subtitle}</div>
      </Reveal>
    )}
  </>
);

const Problem: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "row", gap: 50 }}>
    <div style={{ flex: 1.1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Title slide={slide} size={56} />
      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 32 }}>
        {slide.bullets?.map((b, i) => (
          <Reveal key={i} delay={34 + i * 12}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 18, borderRight: `3px solid ${slide.accent}`, paddingRight: 18 }}>
              <div style={{ fontFamily: cairo, fontSize: 64, fontWeight: 900, color: slide.accent, lineHeight: 1, minWidth: 220 }}>{b.ar}</div>
              <div style={{ fontFamily: cairo, fontSize: 18, color: D.fade, lineHeight: 1.4 }}>{b.note}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
    <div style={{ flex: 0.95, display: "flex", alignItems: "center" }}>
      <Reveal delay={20}>
        <KenBurns
          src={staticFile(slide.image!)}
          delay={20}
          duration={500}
          scaleFrom={1.08}
          scaleTo={1.22}
          style={{ width: 540, height: 420, borderRadius: 10, border: `1px solid ${D.border}` }}
          overlay={`linear-gradient(180deg, transparent 50%, ${D.primary}55)`}
        />
      </Reveal>
    </div>
  </div>
);

const Solution: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
    <Title slide={slide} size={58} />
    <div style={{ display: "flex", gap: 50, marginTop: 36, alignItems: "center" }}>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {slide.bullets?.map((b, i) => (
          <Reveal key={i} delay={30 + i * 10}>
            <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderTop: `3px solid ${slide.accent}`, borderRadius: 8, padding: "16px 18px" }}>
              <div style={{ fontFamily: cairo, fontSize: 22, color: D.primary, fontWeight: 900 }}>{b.ar}</div>
              <div style={{ fontFamily: cairo, fontSize: 14, color: D.muted, marginTop: 4 }}>{b.note}</div>
            </div>
          </Reveal>
        ))}
      </div>
      <div style={{ flex: 1 }}>
        <Reveal delay={20}>
          <KenBurns src={staticFile(slide.image!)} delay={20} duration={500} scaleFrom={1.05} scaleTo={1.2}
            style={{ width: "100%", height: 360, borderRadius: 10, border: `1px solid ${D.border}` }}
            overlay={`linear-gradient(160deg, transparent 50%, ${D.primary}66)`} />
        </Reveal>
      </div>
    </div>
  </div>
);

const Systems8: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
    <Title slide={slide} size={58} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 32 }}>
      {slide.bullets?.map((b, i) => (
        <Reveal key={i} delay={28 + i * 7} y={20}>
          <div style={{
            background: D.surface, border: `1px solid ${D.border}`, borderRight: `3px solid ${b.c || slide.accent}`,
            borderRadius: 8, padding: "16px 14px", minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(14,30,54,0.04)",
          }}>
            <div style={{ fontFamily: cairo, fontSize: 19, color: D.ink, fontWeight: 900, marginBottom: 6 }}>{b.ar}</div>
            <div style={{ fontFamily: cairo, fontSize: 13, color: D.muted, lineHeight: 1.35 }}>{b.note}</div>
          </div>
        </Reveal>
      ))}
    </div>
  </div>
);

const Compare: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "row", gap: 50 }}>
    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
      <Reveal delay={18}>
        <KenBurns src={staticFile(slide.image!)} delay={18} duration={480} scaleFrom={1.08} scaleTo={1.2}
          style={{ width: 520, height: 420, borderRadius: 10, border: `1px solid ${D.border}` }}
          overlay={`linear-gradient(180deg, transparent 55%, ${D.primary}55)`} />
      </Reveal>
    </div>
    <div style={{ flex: 1.05, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Title slide={slide} size={48} />
      <div style={{ display: "flex", gap: 14, marginTop: 30 }}>
        {slide.bullets?.map((b, i) => (
          <Reveal key={i} delay={32 + i * 14}>
            <div style={{ background: D.surface, border: `1px solid ${D.border}`, borderBottom: `4px solid ${b.c || slide.accent}`,
              borderRadius: 8, padding: "20px 18px", minWidth: 180, textAlign: "center" }}>
              <div style={{ fontFamily: cairo, fontSize: 48, color: b.c || slide.accent, fontWeight: 900, lineHeight: 1 }}>{b.ar}</div>
              <div style={{ fontFamily: cairo, fontSize: 13, color: D.fade, marginTop: 12, fontWeight: 700, lineHeight: 1.4 }}>{b.note}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </div>
);

const Team: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "row", gap: 50 }}>
    <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
      <Reveal delay={18}>
        <KenBurns src={staticFile(slide.image!)} delay={18} duration={520} scaleFrom={1.08} scaleTo={1.22}
          style={{ width: "100%", height: 440, borderRadius: 10, border: `1px solid ${D.border}` }}
          overlay={`linear-gradient(160deg, transparent 45%, ${D.primary}55)`} />
      </Reveal>
    </div>
    <div style={{ flex: 1.05, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Title slide={slide} size={42} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 26 }}>
        {slide.bullets?.map((b, i) => (
          <Reveal key={i} delay={30 + i * 12}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 18, borderRight: `3px solid ${b.c || slide.accent}`, paddingRight: 16 }}>
              <div style={{ fontFamily: cairo, fontSize: 48, fontWeight: 900, color: b.c || slide.accent, lineHeight: 1, minWidth: 180 }}>{b.ar}</div>
              <div style={{ fontFamily: cairo, fontSize: 15, color: D.fade, lineHeight: 1.4 }}>{b.note}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </div>
);

const Finance: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
    <Title slide={slide} size={54} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 38 }}>
      {slide.bullets?.map((b, i) => (
        <Reveal key={i} delay={30 + i * 12} y={20}>
          <div style={{
            background: D.surface, border: `1px solid ${D.border}`, borderBottom: `4px solid ${b.c || slide.accent}`,
            borderRadius: 10, padding: "22px 20px", minHeight: 160,
            boxShadow: "0 4px 14px rgba(14,30,54,0.05)",
          }}>
            <div style={{ fontFamily: cairo, fontSize: 42, color: b.c || slide.accent, fontWeight: 900, lineHeight: 1 }}>{b.ar}</div>
            <div style={{ fontFamily: cairo, fontSize: 14, color: D.fade, marginTop: 14, fontWeight: 700, lineHeight: 1.5 }}>{b.note}</div>
          </div>
        </Reveal>
      ))}
    </div>
  </div>
);

const Endorse: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "row", gap: 50 }}>
    <div style={{ flex: 0.85, display: "flex", alignItems: "center" }}>
      <Reveal delay={18}>
        <KenBurns src={staticFile(slide.image!)} delay={18} duration={520} scaleFrom={1.06} scaleTo={1.18}
          style={{ width: "100%", height: 440, borderRadius: 10, border: `1px solid ${D.border}` }}
          overlay={`linear-gradient(170deg, transparent 40%, ${D.primary}66)`} />
      </Reveal>
    </div>
    <div style={{ flex: 1.15, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Title slide={slide} size={46} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
        {slide.bullets?.map((b, i) => (
          <Reveal key={i} delay={28 + i * 9}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "8px 0" }}>
              <span style={{ color: slide.accent, fontSize: 14, fontWeight: 900 }}>◆</span>
              <div style={{ fontFamily: cairo, fontSize: 17, color: D.ink, fontWeight: 700, lineHeight: 1.5 }}>{b.ar}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </div>
);

const Deserve: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
    <Title slide={slide} size={52} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 30 }}>
      {slide.bullets?.map((b, i) => (
        <Reveal key={i} delay={28 + i * 11} y={22}>
          <div style={{
            background: D.surface, border: `1px solid ${D.border}`, borderTop: `4px solid ${b.c || slide.accent}`,
            borderRadius: 10, padding: "22px 20px", minHeight: 170, textAlign: "center",
          }}>
            <div style={{ fontFamily: cairo, fontSize: 56, color: b.c || slide.accent, fontWeight: 900, lineHeight: 1 }}>{b.ar}</div>
            <div style={{ fontFamily: cairo, fontSize: 14, color: D.fade, marginTop: 16, fontWeight: 700, lineHeight: 1.5 }}>{b.note}</div>
          </div>
        </Reveal>
      ))}
    </div>
    {slide.image && (
      <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
        <Reveal delay={70}>
          <div style={{ fontFamily: amiri, fontSize: 16, color: D.muted, letterSpacing: 4, textAlign: "center" }}>
            جـوائـز  سـابـقـة:  الـحـسـن  بـن  طـلال  ·  أنـا  مـوهـوب  ·  أولـمـبـيـاد  الـكـيـمـيـاء  الـوطـنـي
          </div>
        </Reveal>
      </div>
    )}
  </div>
);

const Closing: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 18, textAlign: "center" }}>
    <Reveal delay={6}>
      <div style={{ fontFamily: amiri, color: slide.accent, fontSize: 14, letterSpacing: 8 }}>{slide.kicker}</div>
    </Reveal>
    <Reveal delay={14}>
      <h1 style={{ fontFamily: cairo, fontSize: 78, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.1, maxWidth: 1100 }}>
        {slide.title}
      </h1>
    </Reveal>
    <Reveal delay={28}>
      <div style={{ fontFamily: amiri, fontSize: 26, color: D.fade, marginTop: 12, letterSpacing: 2 }}>{slide.subtitle}</div>
    </Reveal>
    <Reveal delay={42}>
      <div style={{ marginTop: 30, padding: "14px 28px", border: `2px solid ${slide.accent}`, borderRadius: 50, fontFamily: cairo, color: D.primary, fontSize: 16, fontWeight: 700, letterSpacing: 2 }}>
        damij-jo.life
      </div>
    </Reveal>
  </div>
);
