import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * A premium floating dock anchored bottom-end. Its children (Hover-Speak,
 * Smart Guide, …) ride on a spring-eased y offset that follows the scroll
 * direction, so the whole dock breathes with the page instead of feeling
 * pinned. Pointer-events are scoped to children so the dock never blocks
 * the page.
 */
const DamijFloatingDock: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const y = useMotionValue(0);
  const springY = useSpring(y, { stiffness: 120, damping: 22, mass: 0.6 });
  const translateY = useTransform(springY, (v) => `${v}px`);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastScroll = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const cur = window.scrollY;
        const delta = cur - lastScroll;
        lastScroll = cur;
        // Slight float follow + auto-hide on fast scroll down
        const target = Math.max(-12, Math.min(18, delta * 0.6));
        y.set(target);
        // settle back to 0 after a brief pause
        window.clearTimeout((onScroll as any)._t);
        (onScroll as any)._t = window.setTimeout(() => y.set(0), 220);

        setHidden(delta > 14 && cur > 220);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [y]);

  return (
    <motion.div
      data-damij-no-translate
      data-damij-no-speak
      aria-hidden={false}
      className="fixed bottom-24 end-4 z-[60] pointer-events-none flex flex-col items-center gap-2.5"
      style={{ y: translateY }}
      animate={{ opacity: hidden ? 0.35 : 1, scale: hidden ? 0.94 : 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
    >
      {React.Children.map(children, (child) => (
        <div className="w-14 h-14 flex items-center justify-center pointer-events-auto">{child}</div>
      ))}
    </motion.div>
  );
};

export default DamijFloatingDock;
