import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

// Parses a target string like "1,200", "$150,000", "+30", "15%", "$200", "50,000"
// Counts the numeric core up, preserves prefix/suffix.
export const CountUp: React.FC<{
  target: string;
  delay?: number;
  duration?: number;
  style?: React.CSSProperties;
}> = ({ target, delay = 12, duration = 32, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const m = target.match(/^([^\d-]*)([-+]?[\d,]+)(.*)$/);
  if (!m) return <span style={style}>{target}</span>;
  const [, prefix, numStr, suffix] = m;
  const targetNum = parseFloat(numStr.replace(/,/g, ""));
  const sp = spring({ frame: frame - delay, fps, config: { damping: 30, stiffness: 90, mass: 0.7 } });
  const t = interpolate(sp, [0, 1], [0, 1]);
  const current = Math.round(targetNum * t);
  const formatted = current.toLocaleString("en-US");
  return <span style={style}>{prefix}{formatted}{suffix}</span>;
};
