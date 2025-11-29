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
    if (!plotRef.current || !data || data.length === 0) return;

    const processedData = data.map(trace => ({
      ...trace,
      opacity: config.opacity,
      colorscale: config.colorscale,
      showscale: true,
      contours: config.contours ? {
        z: {
          show: true,
          usecolormap: true,
          highlightcolor: "#42f462",
          project: { z: true }
        }
      } : undefined,
      ...(config.wireframe && trace.type === 'surface' ? {
        hidesurface: true,
        contours: {
          x: { show: true, color: '#fff', width: 2 },
          y: { show: true, color: '#fff', width: 2 },
          z: { show: true, color: '#fff', width: 2 }
        }
      } : {})
    }));

    const layout = {
      autosize: true,
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      scene: {
        xaxis: {
          visible: config.showAxes,
          showgrid: config.showGrid,
          gridcolor: 'rgba(255,255,255,0.1)',
          title: 'X',
          titlefont: { color: '#fff' },
          tickfont: { color: '#fff' }
        },
        yaxis: {
          visible: config.showAxes,
          showgrid: config.showGrid,
          gridcolor: 'rgba(255,255,255,0.1)',
          title: 'Y',
          titlefont: { color: '#fff' },
          tickfont: { color: '#fff' }
        },
        zaxis: {
          visible: config.showAxes,
          showgrid: config.showGrid,
          gridcolor: 'rgba(255,255,255,0.1)',
          title: 'Z',
          titlefont: { color: '#fff' },
          tickfont: { color: '#fff' }
        },
        bgcolor: 'rgba(0,0,0,0)',
        camera: {
          eye: { x: 1.5, y: 1.5, z: 1.5 }
        }
      },
      margin: { l: 0, r: 0, t: 0, b: 0 },
      font: { family: 'Cairo, sans-serif', color: '#fff' }
    };

    const plotConfig = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['toImage'],
      scrollZoom: true
    };

    Plotly.newPlot(plotRef.current, processedData, layout, plotConfig);

    return () => {
      if (plotRef.current) {
        Plotly.purge(plotRef.current);
      }
    };
  }, [data, config]);

  return (
    <div 
      ref={plotRef} 
      className="w-full h-[500px] rounded-lg border border-border/20 bg-background/5"
    />
  );
};
