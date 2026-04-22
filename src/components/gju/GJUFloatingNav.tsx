import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Rocket } from 'lucide-react';

/**
 * Floating navigation for GJU mode.
 * Shows ONLY a quick-jump back to the "Future of Technology" hub (/gju-competition).
 * Accessibility panel and Smart Guide are intentionally hidden in GJU mode.
 */
export const GJUFloatingNav: React.FC = () => {
  const location = useLocation();
  const onHub = location.pathname === '/gju-competition';

  return (
    <>
      {/* Future of Technology — quick return to the hub */}
      {!onHub && (
        <Link
          to="/gju-competition"
          title="مستقبل التكنولوجيا"
          aria-label="مستقبل التكنولوجيا"
          className="
            fixed bottom-4 left-4 z-50 h-12 w-12 rounded-full shadow-lg
            flex items-center justify-center
            bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-500
            text-white
            ring-2 ring-white/10 hover:ring-white/30
            transition-all duration-300 hover:scale-110
            hover:shadow-[0_0_24px_rgba(168,85,247,0.55)]
          "
        >
          <Rocket className="h-5 w-5" />
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-500 blur-xl opacity-40 -z-10" />
        </Link>
      )}
    </>
  );
};

export default GJUFloatingNav;
