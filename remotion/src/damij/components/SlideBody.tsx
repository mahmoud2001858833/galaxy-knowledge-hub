import { staticFile } from "remotion";
import { D } from "../theme";
import { Reveal, KenBurns } from "./Reveal";
import { FONTS } from "./SlideFrame";
import { CountUp } from "./CountUp";
import type { Slide } from "../script";

const { cairo, manrope } = FONTS;

export const SlideBody: React.FC<{ slide: Slide }> = ({ slide }) => {
  switch (slide.layout) {
    case "cover": return <Cover slide={slide} />;
    case "section": return <Section slide={slide} />;
    case "sectionsGrid": return <SectionsGrid slide={slide} />;
    case "innovation": return <Innovation slide={slide} />;
    case "qHeader": return <QHeader slide={slide} />;
    case "bigNumber": return <BigNumber slide={slide} />;
    case "endorse": return <Endorse slide={slide} />;
    case "closing": return <Closing slide={slide} />;
  }
};

// ---------- Cover ----------
const Cover: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20, textAlign: "center" }}>
    {slide.image && (
      <div style={{ position: "absolute", inset: 0, opacity: 0.1 }}>
        <KenBurns src={staticFile(slide.image)} delay={0} duration={150} scaleFrom={1.05} scaleTo={1.12} style={{ width: "100%", height: "100%" }} />
      </div>
    )}
    <Reveal delay={6}>
      <div style={{ fontFamily: manrope, fontWeight: 700, color: slide.accent, fontSize: 14, letterSpacing: 10 }}>{slide.kicker}</div>
    </Reveal>
    <Reveal delay={14}>
      <h1 style={{ fontFamily: cairo, fontSize: 200, fontWeight: 900, color: D.primary, margin: 0, letterSpacing: -3, lineHeight: 1 }}>
        {slide.title}
      </h1>
    </Reveal>
    <Reveal delay={28}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ height: 1, width: 100, background: D.muted }} />
        <div style={{ fontFamily: cairo, fontWeight: 400, fontSize: 26, color: D.fade }}>{slide.subtitle}</div>
        <div style={{ height: 1, width: 100, background: D.muted }} />
      </div>
    </Reveal>
  </div>
);

// ---------- Section (icon + title + bullets + image) ----------
const Section: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "row", gap: 60 }}>
    <div style={{ flex: 1.1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      {slide.icon && (
        <Reveal delay={4}>
          <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 18 }}>{slide.icon}</div>
        </Reveal>
      )}
      <Reveal delay={10}>
        <h1 style={{ fontFamily: cairo, fontSize: 64, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.1 }}>
          {slide.title}
        </h1>
      </Reveal>
      {slide.subtitle && (
        <Reveal delay={20}>
          <div style={{ fontFamily: manrope, fontWeight: 500, fontSize: 20, color: slide.accent, marginTop: 12, letterSpacing: 1 }}>
            {slide.subtitle}
          </div>
        </Reveal>
      )}
      <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 14 }}>
        {slide.bullets?.map((b, i) => (
          <Reveal key={i} delay={30 + i * 8}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <span style={{ color: slide.accent, fontWeight: 900, fontSize: 14 }}>◆</span>
              <div>
                <div style={{ fontFamily: cairo, fontSize: 24, color: D.ink, fontWeight: 700, lineHeight: 1.4 }}>{b.ar}</div>
                {b.en && <div style={{ fontFamily: manrope, fontWeight: 500, fontSize: 14, color: D.muted, marginTop: 2 }}>{b.en}</div>}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
    {slide.image && (
      <div style={{ flex: 0.9, display: "flex", alignItems: "center" }}>
        <Reveal delay={16}>
          <KenBurns
            src={staticFile(slide.image)}
            delay={16} duration={140}
            scaleFrom={1.05} scaleTo={1.12}
            style={{ width: "100%", height: 460, borderRadius: 12, border: `1px solid ${D.border}` }}
            overlay={`linear-gradient(180deg, transparent 55%, ${D.primary}55)`}
          />
        </Reveal>
      </div>
    )}
  </div>
);

// ---------- BigNumber ----------
const BigNumber: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", textAlign: "right" }}>
    <Reveal delay={6}>
      <h1 style={{ fontFamily: cairo, fontSize: 50, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.2 }}>{slide.title}</h1>
    </Reveal>
    <Reveal delay={14}>
      <div style={{ marginTop: 24, display: "flex", alignItems: "baseline", gap: 24, direction: "ltr" }}>
        <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 220, color: slide.accent, lineHeight: 0.95, letterSpacing: -6 }}>
          <CountUp target={slide.big!} delay={18} />
        </div>
      </div>
    </Reveal>
    <Reveal delay={48}>
      <div style={{ fontFamily: manrope, fontWeight: 700, fontSize: 22, color: D.fade, letterSpacing: 2, marginTop: 8, direction: "ltr", textAlign: "right" }}>
        {slide.bigCaption}
      </div>
    </Reveal>
    {slide.bullets && (
      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
        {slide.bullets.map((b, i) => (
          <Reveal key={i} delay={56 + i * 8}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <div style={{ fontFamily: cairo, fontSize: 20, color: D.ink, fontWeight: 700 }}>{b.ar}</div>
              <span style={{ color: slide.accent, fontSize: 12 }}>◆</span>
            </div>
          </Reveal>
        ))}
      </div>
    )}
  </div>
);

// ---------- SectionsGrid (8 systems) ----------
const SectionsGrid: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
    <Reveal delay={6}>
      <h1 style={{ fontFamily: cairo, fontSize: 54, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.15 }}>{slide.title}</h1>
    </Reveal>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 38 }}>
      {slide.bullets?.map((b, i) => (
        <Reveal key={i} delay={20 + i * 5} y={18}>
          <div style={{
            background: D.surface, border: `1px solid ${D.border}`,
            borderRight: `3px solid ${slide.accent}`, borderRadius: 10,
            padding: "22px 18px", minHeight: 110,
            display: "flex", flexDirection: "column", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(14,30,54,0.05)",
          }}>
            <div style={{ fontFamily: cairo, fontSize: 22, color: D.ink, fontWeight: 900 }}>{b.ar}</div>
            <div style={{ fontFamily: manrope, fontWeight: 500, fontSize: 12, color: D.muted, marginTop: 6, letterSpacing: 1 }}>{b.en}</div>
          </div>
        </Reveal>
      ))}
    </div>
  </div>
);

// ---------- Innovation ----------
const Innovation: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start" }}>
    <Reveal delay={6}>
      <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 16, color: slide.accent, letterSpacing: 6, marginBottom: 24 }}>
        ★ INNOVATION
      </div>
    </Reveal>
    <Reveal delay={14}>
      <h1 style={{ fontFamily: cairo, fontSize: 72, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.1, maxWidth: 1400 }}>
        {slide.title}
      </h1>
    </Reveal>
    {slide.subtitle && (
      <Reveal delay={26}>
        <div style={{ fontFamily: manrope, fontWeight: 700, fontSize: 26, color: slide.accent, marginTop: 18, letterSpacing: 2 }}>
          {slide.subtitle}
        </div>
      </Reveal>
    )}
    {slide.bullets?.map((b, i) => (
      <Reveal key={i} delay={40 + i * 10}>
        <div style={{ marginTop: 22, fontFamily: cairo, fontSize: 26, color: D.fade, fontWeight: 700, borderRight: `3px solid ${slide.accent}`, paddingRight: 18 }}>
          {b.ar}
        </div>
      </Reveal>
    ))}
  </div>
);

// ---------- QHeader (question divider) ----------
const QHeader: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 22 }}>
    <Reveal delay={4}>
      <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 16, color: slide.accent, letterSpacing: 10 }}>
        {slide.kicker}
      </div>
    </Reveal>
    <Reveal delay={12}>
      <div style={{ width: 80, height: 3, background: slide.accent }} />
    </Reveal>
    <Reveal delay={18}>
      <h1 style={{ fontFamily: cairo, fontSize: 88, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.15, maxWidth: 1400 }}>
        {slide.title}
      </h1>
    </Reveal>
    <Reveal delay={32}>
      <div style={{ fontFamily: manrope, fontWeight: 500, fontSize: 24, color: D.fade, marginTop: 8, letterSpacing: 1 }}>
        {slide.subtitle}
      </div>
    </Reveal>
  </div>
);

// ---------- Endorse ----------
const Endorse: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "row", gap: 60 }}>
    {slide.image && (
      <div style={{ flex: 0.9, display: "flex", alignItems: "center" }}>
        <Reveal delay={10}>
          <KenBurns src={staticFile(slide.image)} delay={10} duration={140} scaleFrom={1.05} scaleTo={1.12}
            style={{ width: "100%", height: 460, borderRadius: 12, border: `1px solid ${D.border}` }}
            overlay={`linear-gradient(160deg, transparent 45%, ${D.primary}66)`} />
        </Reveal>
      </div>
    )}
    <div style={{ flex: 1.1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Reveal delay={6}>
        <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 14, color: slide.accent, letterSpacing: 8, marginBottom: 18 }}>
          ★ {slide.kicker}
        </div>
      </Reveal>
      <Reveal delay={16}>
        <h1 style={{ fontFamily: cairo, fontSize: 56, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.2 }}>
          {slide.title}
        </h1>
      </Reveal>
      <Reveal delay={30}>
        <div style={{ fontFamily: manrope, fontWeight: 500, fontSize: 22, color: D.fade, marginTop: 18, letterSpacing: 1 }}>
          {slide.subtitle}
        </div>
      </Reveal>
    </div>
  </div>
);

// ---------- Closing ----------
const Closing: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24, textAlign: "center" }}>
    <Reveal delay={6}>
      <div style={{ fontFamily: manrope, fontWeight: 800, color: slide.accent, fontSize: 14, letterSpacing: 10 }}>{slide.kicker}</div>
    </Reveal>
    <Reveal delay={14}>
      <h1 style={{ fontFamily: cairo, fontSize: 200, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1, letterSpacing: -3 }}>
        {slide.title}
      </h1>
    </Reveal>
    <Reveal delay={30}>
      <div style={{ marginTop: 16, padding: "16px 36px", border: `2px solid ${slide.accent}`, borderRadius: 60, fontFamily: manrope, fontWeight: 800, color: D.primary, fontSize: 20, letterSpacing: 4 }}>
        {slide.subtitle}
      </div>
    </Reveal>
    <Reveal delay={50}>
      <div style={{ marginTop: 18, fontFamily: cairo, fontSize: 16, color: D.muted, letterSpacing: 2 }}>
        تم إنشاء المنصة بواسطة مدرسة عنبه الثانية الشاملة للبنين
      </div>
    </Reveal>
  </div>
);
