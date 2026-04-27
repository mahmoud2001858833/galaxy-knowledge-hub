import { useEffect, useRef, useState } from "react";
import { Smartphone, Tablet, Monitor, RefreshCw, Maximize2, Minimize2, ExternalLink, Terminal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Device = "mobile" | "tablet" | "desktop";

const SIZES: Record<Device, { w: number | string; label: string; icon: any }> = {
  mobile: { w: 390, label: "Mobile", icon: Smartphone },
  tablet: { w: 768, label: "Tablet", icon: Tablet },
  desktop: { w: "100%", label: "Desktop", icon: Monitor },
};

interface LogEntry {
  level: "log" | "info" | "warn" | "error";
  args: any[];
  ts: number;
}

export default function LivePreview({ html }: { html: string }) {
  const [device, setDevice] = useState<Device>("desktop");
  const [fullscreen, setFullscreen] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Inject console interceptor + ensure body exists with white background fallback
  const consoleScript = `<script>
        (function(){
          const send = (level, args) => {
            try { parent.postMessage({ __preview_log: true, level, args: args.map(a => {
              try { return typeof a === 'object' ? JSON.stringify(a) : String(a); } catch { return String(a); }
            }) }, '*'); } catch(e){}
          };
          ['log','info','warn','error'].forEach(level => {
            const orig = console[level];
            console[level] = function(...args){ send(level, args); orig.apply(console, args); };
          });
          window.addEventListener('error', e => send('error', [e.message + ' @ ' + e.filename + ':' + e.lineno]));
          window.addEventListener('unhandledrejection', e => send('error', ['Unhandled: ' + (e.reason?.message || e.reason)]));
        })();
        </script>`;

  let instrumentedHtml = "";
  if (html) {
    instrumentedHtml = html;
    // Ensure html has a body close tag — if missing, append fallbacks
    if (instrumentedHtml.includes("</body>")) {
      instrumentedHtml = instrumentedHtml.replace("</body>", `${consoleScript}</body>`);
    } else if (instrumentedHtml.includes("</html>")) {
      instrumentedHtml = instrumentedHtml.replace("</html>", `${consoleScript}</html>`);
    } else {
      instrumentedHtml = instrumentedHtml + consoleScript;
    }
    // Force a white-ish base so transparent generated bodies don't show as black
    if (!/background\s*:/i.test(instrumentedHtml.slice(0, 2000))) {
      instrumentedHtml = instrumentedHtml.replace(
        /<head([^>]*)>/i,
        `<head$1><style>html,body{min-height:100%;background:#ffffff;color:#0f172a;margin:0}</style>`
      );
    }
  }

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.__preview_log) {
        setLogs((prev) => [...prev.slice(-200), { level: e.data.level, args: e.data.args, ts: Date.now() }]);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const reload = () => {
    setLogs([]);
    setIframeKey((k) => k + 1);
  };

  const openInNewTab = () => {
    if (!html) return;
    // Use document.write to avoid blob URL sandbox blank-screen issues
    const w = window.open("", "_blank");
    if (!w) {
      // Popup blocked → fallback to blob URL
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      window.open(URL.createObjectURL(blob), "_blank");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  const errorCount = logs.filter((l) => l.level === "error").length;
  const sizeKb = Math.round(html.length / 1024);

  if (!html) {
    return (
      <div className="rounded-xl bg-black border border-white/10 h-[720px] flex flex-col items-center justify-center text-white/40 text-sm gap-3">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl">👀</div>
        <div>ستظهر معاينة منصتك هنا بعد اكتمال البناء</div>
      </div>
    );
  }

  const containerCls = fullscreen
    ? "fixed inset-0 z-[100] bg-black flex flex-col"
    : "rounded-xl bg-black border border-white/10 overflow-hidden flex flex-col";

  return (
    <div className={containerCls} style={!fullscreen ? { height: 720 } : {}}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/10 bg-[#0b0b1a]">
        <div className="flex gap-1">
          {(Object.keys(SIZES) as Device[]).map((d) => {
            const I = SIZES[d].icon;
            const active = device === d;
            return (
              <button
                key={d}
                onClick={() => setDevice(d)}
                title={SIZES[d].label}
                className={`p-1.5 rounded-md transition ${active ? "bg-cyan-500/20 text-cyan-300" : "text-white/50 hover:text-white hover:bg-white/5"}`}
              >
                <I className="w-3.5 h-3.5" />
              </button>
            );
          })}
          <div className="w-px h-5 bg-white/10 mx-1" />
          <button onClick={reload} title="إعادة تحميل" className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/5">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-white/40">
          <span className="hidden sm:inline">{sizeKb} KB</span>
          <span className="text-emerald-400">●</span>
          <span>جاهز</span>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => setShowConsole((s) => !s)}
            title="Console"
            className={`p-1.5 rounded-md transition relative ${showConsole ? "bg-violet-500/20 text-violet-300" : "text-white/50 hover:text-white hover:bg-white/5"}`}
          >
            <Terminal className="w-3.5 h-3.5" />
            {errorCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                {errorCount > 9 ? "9+" : errorCount}
              </span>
            )}
          </button>
          <button onClick={openInNewTab} title="فتح في تبويب جديد" className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/5">
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setFullscreen((f) => !f)} title="ملء الشاشة" className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/5">
            {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Iframe area */}
      <div className="flex-1 bg-neutral-900 flex items-center justify-center overflow-auto p-2">
        <div
          className="bg-white shadow-2xl transition-all duration-300 rounded-md overflow-hidden"
          style={{
            width: SIZES[device].w,
            maxWidth: "100%",
            height: "100%",
            minHeight: 480,
          }}
        >
          <iframe
            key={iframeKey}
            ref={iframeRef}
            title="preview"
            srcDoc={instrumentedHtml}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
          />
        </div>
      </div>

      {/* Console panel */}
      {showConsole && (
        <div className="border-t border-white/10 bg-[#0b0b1a] flex flex-col" style={{ height: 200 }}>
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10">
            <div className="text-[11px] text-white/60 font-mono">Console ({logs.length})</div>
            <div className="flex gap-1">
              <button onClick={() => setLogs([])} className="text-[10px] text-white/50 hover:text-white px-2 py-0.5 rounded hover:bg-white/5">مسح</button>
              <button onClick={() => setShowConsole(false)} className="text-white/50 hover:text-white p-0.5 rounded hover:bg-white/5">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto font-mono text-[11px] leading-5">
            {logs.length === 0 ? (
              <div className="text-white/30 p-3">لا توجد سجلات</div>
            ) : (
              logs.map((l, i) => (
                <div
                  key={i}
                  className={`px-3 py-1 border-b border-white/5 ${
                    l.level === "error" ? "text-red-300 bg-red-500/5" :
                    l.level === "warn" ? "text-amber-300" :
                    l.level === "info" ? "text-cyan-300" : "text-white/70"
                  }`}
                  dir="ltr"
                >
                  <span className="text-white/30 me-2">{l.level}</span>
                  {l.args.join(" ")}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
