import { D } from "../theme";
import { Reveal, RevealRTL } from "./Reveal";
import { FONTS } from "./SlideFrame";
import { CountUp } from "./CountUp";
import type { Slide } from "../script";

const { cairo, manrope } = FONTS;

export const SlideBody: React.FC<{ slide: Slide }> = ({ slide }) => {
  switch (slide.layout) {
    case "cover": return <Cover slide={slide} />;
    case "featureBullets": return <FeatureBullets slide={slide} />;
    case "sectionsGrid": return <SectionsGrid slide={slide} />;
    case "innovation": return <Innovation slide={slide} />;
    case "qHeader": return <QHeader slide={slide} />;
    case "bigNumber": return <BigNumber slide={slide} />;
    case "fundingList": return <FundingList slide={slide} />;
    case "credibility": return <Credibility slide={slide} />;
    case "endorseList": return <EndorseList slide={slide} />;
    case "closing": return <Closing slide={slide} />;
  }
};

// ---------- Cover ----------
const Cover: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 22, textAlign: "center" }}>
    <RevealRTL delay={4}>
      <div style={{ fontFamily: manrope, fontWeight: 700, color: slide.accent, fontSize: 14, letterSpacing: 10 }}>{slide.kicker}</div>
    </RevealRTL>
    <RevealRTL delay={12} x={180}>
      <h1 style={{ fontFamily: cairo, fontSize: 210, fontWeight: 900, color: D.primary, margin: 0, letterSpacing: -3, lineHeight: 1 }}>
        {slide.title}
      </h1>
    </RevealRTL>
    <RevealRTL delay={28}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ height: 1, width: 100, background: D.muted }} />
        <div style={{ fontFamily: cairo, fontWeight: 400, fontSize: 26, color: D.fade }}>{slide.subtitle}</div>
        <div style={{ height: 1, width: 100, background: D.muted }} />
      </div>
    </RevealRTL>
  </div>
);

// ---------- FeatureBullets (cards distributed in 2 columns, RTL stagger) ----------
const FeatureBullets: React.FC<{ slide: Slide }> = ({ slide }) => {
  const bullets = slide.bullets || [];
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <RevealRTL delay={6}>
        <h1 style={{ fontFamily: cairo, fontSize: 62, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.15, textAlign: "right" }}>
          {slide.title}
        </h1>
      </RevealRTL>
      {slide.subtitle && (
        <RevealRTL delay={14}>
          <div style={{ fontFamily: manrope, fontWeight: 700, fontSize: 20, color: slide.accent, marginTop: 10, letterSpacing: 3, textAlign: "right" }}>
            {slide.subtitle}
          </div>
        </RevealRTL>
      )}
      <div style={{
        marginTop: 36,
        display: "grid",
        gridTemplateColumns: bullets.length > 3 ? "repeat(2, 1fr)" : "1fr",
        gap: 18,
        direction: "rtl",
      }}>
        {bullets.map((b, i) => {
          // alternating slight offset for elegance
          const offsetX = i % 2 === 0 ? 0 : 40;
          return (
            <RevealRTL key={i} delay={26 + i * 9} x={160}>
              <div style={{
                background: D.surface,
                border: `1px solid ${D.border}`,
                borderRight: `4px solid ${slide.accent}`,
                borderRadius: 12,
                padding: "20px 24px",
                marginRight: offsetX,
                boxShadow: "0 6px 18px rgba(14,30,54,0.06)",
                display: "flex",
                alignItems: "center",
                gap: 16,
                minHeight: 78,
              }}>
                <span style={{ color: slide.accent, fontSize: 14, fontWeight: 900 }}>◆</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: cairo, fontSize: 22, color: D.ink, fontWeight: 700, lineHeight: 1.4 }}>{b.ar}</div>
                  {b.en && <div style={{ fontFamily: manrope, fontWeight: 500, fontSize: 12, color: D.muted, marginTop: 3, letterSpacing: 1 }}>{b.en}</div>}
                </div>
              </div>
            </RevealRTL>
          );
        })}
      </div>
    </div>
  );
};

// ---------- BigNumber ----------
const BigNumber: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", textAlign: "right" }}>
    <RevealRTL delay={6}>
      <h1 style={{ fontFamily: cairo, fontSize: 52, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.2 }}>{slide.title}</h1>
    </RevealRTL>
    <RevealRTL delay={16} x={200}>
      <div style={{ marginTop: 22, direction: "ltr" }}>
        <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 220, color: slide.accent, lineHeight: 0.95, letterSpacing: -6 }}>
          <CountUp target={slide.big!} delay={20} />
        </div>
      </div>
    </RevealRTL>
    <RevealRTL delay={50}>
      <div style={{ fontFamily: manrope, fontWeight: 700, fontSize: 22, color: D.fade, letterSpacing: 2, marginTop: 8, direction: "ltr", textAlign: "right" }}>
        {slide.bigCaption}
      </div>
    </RevealRTL>
    {slide.bullets && (
      <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
        {slide.bullets.map((b, i) => (
          <RevealRTL key={i} delay={60 + i * 8}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <div style={{ fontFamily: cairo, fontSize: 20, color: D.ink, fontWeight: 700 }}>{b.ar}</div>
              <span style={{ color: slide.accent, fontSize: 12 }}>◆</span>
            </div>
          </RevealRTL>
        ))}
      </div>
    )}
  </div>
);

// ---------- SectionsGrid ----------
const SectionsGrid: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
    <RevealRTL delay={6}>
      <h1 style={{ fontFamily: cairo, fontSize: 54, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.15, textAlign: "right" }}>
        {slide.title}
      </h1>
    </RevealRTL>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 38, direction: "rtl" }}>
      {slide.bullets?.map((b, i) => (
        <RevealRTL key={i} delay={20 + i * 5} x={120}>
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
        </RevealRTL>
      ))}
    </div>
  </div>
);

// ---------- Innovation ----------
const Innovation: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start" }}>
    <RevealRTL delay={6}>
      <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 16, color: slide.accent, letterSpacing: 6, marginBottom: 22 }}>
        ★ INNOVATION
      </div>
    </RevealRTL>
    <RevealRTL delay={14} x={180}>
      <h1 style={{ fontFamily: cairo, fontSize: 76, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.1, maxWidth: 1500, textAlign: "right" }}>
        {slide.title}
      </h1>
    </RevealRTL>
    {slide.subtitle && (
      <RevealRTL delay={28}>
        <div style={{ fontFamily: manrope, fontWeight: 700, fontSize: 26, color: slide.accent, marginTop: 18, letterSpacing: 2 }}>
          {slide.subtitle}
        </div>
      </RevealRTL>
    )}
    {slide.bullets?.map((b, i) => (
      <RevealRTL key={i} delay={42 + i * 10}>
        <div style={{ marginTop: 22, fontFamily: cairo, fontSize: 28, color: D.fade, fontWeight: 700, borderRight: `3px solid ${slide.accent}`, paddingRight: 18 }}>
          {b.ar}
        </div>
      </RevealRTL>
    ))}
  </div>
);

// ---------- QHeader ----------
const QHeader: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 22 }}>
    <RevealRTL delay={4}>
      <div style={{ fontFamily: manrope, fontWeight: 800, fontSize: 16, color: slide.accent, letterSpacing: 10 }}>
        {slide.kicker}
      </div>
    </RevealRTL>
    <RevealRTL delay={12}>
      <div style={{ width: 80, height: 3, background: slide.accent }} />
    </RevealRTL>
    <RevealRTL delay={18} x={180}>
      <h1 style={{ fontFamily: cairo, fontSize: 92, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.15, maxWidth: 1500 }}>
        {slide.title}
      </h1>
    </RevealRTL>
    <RevealRTL delay={34}>
      <div style={{ fontFamily: manrope, fontWeight: 500, fontSize: 24, color: D.fade, marginTop: 6, letterSpacing: 1 }}>
        {slide.subtitle}
      </div>
    </RevealRTL>
  </div>
);

// ---------- FundingList ----------
const FundingList: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
    <RevealRTL delay={6}>
      <h1 style={{ fontFamily: cairo, fontSize: 58, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.15, textAlign: "right" }}>
        {slide.title}
      </h1>
    </RevealRTL>
    {slide.subtitle && (
      <RevealRTL delay={14}>
        <div style={{ fontFamily: manrope, fontWeight: 700, fontSize: 20, color: slide.accent, marginTop: 10, letterSpacing: 3, textAlign: "right" }}>
          {slide.subtitle}
        </div>
      </RevealRTL>
    )}
    <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12, direction: "rtl" }}>
      {slide.bullets?.map((b, i) => (
        <RevealRTL key={i} delay={24 + i * 8} x={180}>
          <div style={{
            display: "flex", alignItems: "center", gap: 18,
            background: D.surface, border: `1px solid ${D.border}`,
            borderRadius: 10, padding: "16px 22px",
            boxShadow: "0 4px 14px rgba(14,30,54,0.05)",
          }}>
            <div style={{
              minWidth: 44, height: 44, borderRadius: 22,
              background: `${slide.accent}22`, color: slide.accent,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: manrope, fontWeight: 800, fontSize: 18,
            }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: cairo, fontSize: 22, color: D.ink, fontWeight: 700, lineHeight: 1.4 }}>{b.ar}</div>
              {b.en && <div style={{ fontFamily: manrope, fontWeight: 500, fontSize: 12, color: D.muted, marginTop: 2, letterSpacing: 1 }}>{b.en}</div>}
            </div>
          </div>
        </RevealRTL>
      ))}
    </div>
  </div>
);

// ---------- Credibility (groups: survey, doctors, institutions) ----------
const Credibility: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
    <RevealRTL delay={6}>
      <h1 style={{ fontFamily: cairo, fontSize: 54, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.15, textAlign: "right" }}>
        {slide.title}
      </h1>
    </RevealRTL>
    {slide.subtitle && (
      <RevealRTL delay={14}>
        <div style={{ fontFamily: manrope, fontWeight: 700, fontSize: 18, color: slide.accent, marginTop: 8, letterSpacing: 3, textAlign: "right" }}>
          {slide.subtitle}
        </div>
      </RevealRTL>
    )}
    <div style={{ marginTop: 30, display: "grid", gridTemplateColumns: "1fr 1fr 1.4fr", gap: 18, direction: "rtl" }}>
      {slide.groups?.map((g, gi) => (
        <RevealRTL key={gi} delay={24 + gi * 12} x={160}>
          <div style={{
            background: D.surface, border: `1px solid ${D.border}`,
            borderRight: `4px solid ${slide.accent}`, borderRadius: 12,
            padding: 20, minHeight: 220,
            boxShadow: "0 6px 18px rgba(14,30,54,0.06)",
          }}>
            <div style={{ fontFamily: cairo, fontSize: 18, color: slide.accent, fontWeight: 900, letterSpacing: 1 }}>
              {g.heading}
            </div>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              {g.items.map((it, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                  <span style={{ color: slide.accent, fontSize: 10 }}>◆</span>
                  <div style={{ fontFamily: cairo, fontSize: 18, color: D.ink, fontWeight: 700, lineHeight: 1.45 }}>{it}</div>
                </div>
              ))}
            </div>
          </div>
        </RevealRTL>
      ))}
    </div>
  </div>
);

// ---------- EndorseList (merged endorsements, no images) ----------
const EndorseList: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
    <RevealRTL delay={6}>
      <h1 style={{ fontFamily: cairo, fontSize: 58, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1.15, textAlign: "right" }}>
        {slide.title}
      </h1>
    </RevealRTL>
    {slide.subtitle && (
      <RevealRTL delay={14}>
        <div style={{ fontFamily: manrope, fontWeight: 700, fontSize: 20, color: slide.accent, marginTop: 10, letterSpacing: 4, textAlign: "right" }}>
          {slide.subtitle}
        </div>
      </RevealRTL>
    )}
    <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, direction: "rtl" }}>
      {slide.bullets?.map((b, i) => (
        <RevealRTL key={i} delay={24 + i * 12} x={180}>
          <div style={{
            background: D.surface, border: `1px solid ${D.border}`,
            borderRight: `4px solid ${slide.accent}`, borderRadius: 12,
            padding: "20px 22px",
            boxShadow: "0 6px 18px rgba(14,30,54,0.06)",
            display: "flex", flexDirection: "column", gap: 6,
            minHeight: 100,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: slide.accent, fontSize: 14 }}>★</span>
              <div style={{ fontFamily: cairo, fontSize: 22, color: D.ink, fontWeight: 800, lineHeight: 1.35 }}>{b.ar}</div>
            </div>
            {b.en && <div style={{ fontFamily: manrope, fontWeight: 500, fontSize: 12, color: D.muted, letterSpacing: 1, paddingRight: 24 }}>{b.en}</div>}
          </div>
        </RevealRTL>
      ))}
    </div>
  </div>
);

// ---------- Closing ----------
const Closing: React.FC<{ slide: Slide }> = ({ slide }) => (
  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24, textAlign: "center" }}>
    <RevealRTL delay={6}>
      <div style={{ fontFamily: manrope, fontWeight: 800, color: slide.accent, fontSize: 14, letterSpacing: 10 }}>{slide.kicker}</div>
    </RevealRTL>
    <RevealRTL delay={14} x={200}>
      <h1 style={{ fontFamily: cairo, fontSize: 210, fontWeight: 900, color: D.primary, margin: 0, lineHeight: 1, letterSpacing: -3 }}>
        {slide.title}
      </h1>
    </RevealRTL>
    <RevealRTL delay={30}>
      <div style={{ marginTop: 12, padding: "16px 36px", border: `2px solid ${slide.accent}`, borderRadius: 60, fontFamily: manrope, fontWeight: 800, color: D.primary, fontSize: 20, letterSpacing: 4 }}>
        {slide.subtitle}
      </div>
    </RevealRTL>
    <RevealRTL delay={50}>
      <div style={{ marginTop: 18, fontFamily: cairo, fontSize: 18, color: D.muted, letterSpacing: 3, fontWeight: 700 }}>
        مدرسة عنبة
      </div>
    </RevealRTL>
  </div>
);
