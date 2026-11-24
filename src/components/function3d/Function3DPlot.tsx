import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist';

interface Function3DPlotProps {
  data: any[];
  config: {
    showGrid: boolean;
    showAxes: boolean;
    colorscale: string;
    opacity: number;
    wireframe: boolean;
    contours: boolean;
  };
}

export const Function3DPlot = ({ data, config }: Function3DPlotProps) => {
  const plotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = plotRef.current;
    if (!el) return;

    if (!data || data.length === 0) {
      try {
        Plotly.purge(el);
      } catch {
        // ignore if not yet initialized
      }
      return;
    }

    const processedData = data.map((trace) => ({
      ...trace,
      opacity: trace.opacity ?? config.opacity,
      colorscale: config.colorscale,
      showscale: true,
      contours: config.contours
        ? {
            z: {
              show: true,
              usecolormap: true,
              highlightcolor: '#42f462',
              project: { z: true },
            },
          }
        : undefined,
      ...(config.wireframe && trace.type === 'surface'
        ? {
            hidesurface: true,
            contours: {
              x: { show: true, color: '#fff', width: 2 },
              y: { show: true, color: '#fff', width: 2 },
              z: { show: true, color: '#fff', width: 2 },
            },
          }
        : {}),
    }));

    const layout: Partial<Plotly.Layout> = {
      autosize: true,
      uirevision: 'function3d-camera-lock',
      paper_bgcolor: 'rgba(11, 17, 32, 0)',
      plot_bgcolor: 'rgba(11, 17, 32, 0)',
      scene: {
        xaxis: {
          visible: config.showAxes,
          showgrid: config.showGrid,
          gridcolor: 'rgba(255,255,255,0.14)',
          title: { text: 'X', font: { color: '#e2e8f0' } },
          tickfont: { color: '#cbd5e1' },
        },
        yaxis: {
          visible: config.showAxes,
          showgrid: config.showGrid,
          gridcolor: 'rgba(255,255,255,0.14)',
          title: { text: 'Y', font: { color: '#e2e8f0' } },
          tickfont: { color: '#cbd5e1' },
        },
        zaxis: {
          visible: config.showAxes,
          showgrid: config.showGrid,
          gridcolor: 'rgba(255,255,255,0.14)',
          title: { text: 'Z', font: { color: '#e2e8f0' } },
          tickfont: { color: '#cbd5e1' },
        },
        bgcolor: 'rgba(11, 17, 32, 0)',
        camera: {
          eye: { x: 1.5, y: 1.5, z: 1.5 },
        },
      },
      margin: { l: 0, r: 0, t: 0, b: 0 },
      font: { family: 'Cairo, sans-serif', color: '#f8fafc' },
    };

    const plotConfig: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['toImage'],
      scrollZoom: true,
    };

    // Plotly.react reuses the WebGL context smoothly and preserves zoom/rotation via uirevision
    Plotly.react(el, processedData, layout, plotConfig);
  }, [data, config]);

  // Responsive container resize + clean WebGL teardown only on unmount
  useEffect(() => {
    const el = plotRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      try {
        if ((el as any)._fullLayout) {
          Plotly.Plots.resize(el);
        }
      } catch {
        // ignore resize before first plot
      }
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      try {
        Plotly.purge(el);
      } catch {
        // ignore
      }
    };
  }, []);

  return (
    <div
      data-preserve-dark
      className="relative w-full h-[460px] sm:h-[520px] rounded-2xl border border-slate-700/60 overflow-hidden overscroll-contain shadow-xl"
      style={{ backgroundColor: '#0b1120' }}
    >
      <div ref={plotRef} className="w-full h-full" />
      {(!data || data.length === 0) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-slate-300">
          <p className="text-base font-bold text-white">مساحة الرسم ثلاثي الأبعاد جاهزة</p>
          <p className="text-xs text-slate-400 mt-1">
            أدخل دالة رياضية واضغط «إضافة» أو اختر مثالاً جاهزاً لعرضها والتكبير والتدوير بسلاسة.
          </p>
        </div>
      )}
    </div>
  );
};
