import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2, 
  Download, Eye, Crosshair, TrendingUp, Grid, Target
} from 'lucide-react';
import { MathEngine } from './MathEngine';

export interface CurveDefinition {
  id: string;
  expression: string;
  color: string;
  label: string;
  visible: boolean;
}

interface InteractiveCanvasProps {
  curves: CurveDefinition[];
  intersections?: Array<[number, number]>;
  showRoots?: boolean;
  showExtrema?: boolean;
  showTangent?: boolean;
  showIntegral?: boolean;
  integralRange?: [number, number];
  height?: number;
  className?: string;
}

const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  curves,
  intersections = [],
  showRoots = true,
  showExtrema = true,
  showTangent = false,
  showIntegral = false,
  integralRange = [0, 4],
  height = 640,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Viewport bounds in math units
  const [domain, setDomain] = useState<{ xMin: number; xMax: number; yMin: number; yMax: number }>({
    xMin: -12,
    xMax: 12,
    yMin: -8,
    yMax: 8
  });

  // Mouse & HUD interaction
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [cursorMath, setCursorMath] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGridNumbers, setShowGridNumbers] = useState(true);

  // Determine tick interval based on current range
  const getTickInterval = (range: number): number => {
    const rawInterval = range / 12;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawInterval)));
    const normalized = rawInterval / magnitude;
    if (normalized < 1.5) return magnitude;
    if (normalized < 3.5) return 2 * magnitude;
    if (normalized < 7.5) return 5 * magnitude;
    return 10 * magnitude;
  };

  // Convert Math coords to Canvas pixels
  const mathToPixel = useCallback((x: number, y: number, width: number, h: number) => {
    const px = ((x - domain.xMin) / (domain.xMax - domain.xMin)) * width;
    const py = ((domain.yMax - y) / (domain.yMax - domain.yMin)) * h;
    return { px, py };
  }, [domain]);

  // Convert Canvas pixels to Math coords
  const pixelToMath = useCallback((px: number, py: number, width: number, h: number) => {
    const x = domain.xMin + (px / width) * (domain.xMax - domain.xMin);
    const y = domain.yMax - (py / h) * (domain.yMax - domain.yMin);
    return { x, y };
  }, [domain]);

  // Main Render Loop
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const h = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    // Reset transform & scale for retina
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const logicalWidth = width / dpr;
    const logicalHeight = h / dpr;

    // Background gradient (Deep Dark Cyber / Blueprint theme)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, logicalHeight);
    bgGrad.addColorStop(0, '#060a12');
    bgGrad.addColorStop(1, '#0c1322');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);

    const xRange = domain.xMax - domain.xMin;
    const yRange = domain.yMax - domain.yMin;
    const xInterval = getTickInterval(xRange);
    const yInterval = getTickInterval(yRange);

    // 1. Minor Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const minorX = xInterval / 2;
    const minorY = yInterval / 2;

    for (let x = Math.floor(domain.xMin / minorX) * minorX; x <= domain.xMax; x += minorX) {
      const { px } = mathToPixel(x, 0, logicalWidth, logicalHeight);
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, logicalHeight);
      ctx.stroke();
    }
    for (let y = Math.floor(domain.yMin / minorY) * minorY; y <= domain.yMax; y += minorY) {
      const { py } = mathToPixel(0, y, logicalWidth, logicalHeight);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(logicalWidth, py);
      ctx.stroke();
    }

    // 2. Major Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.2;
    for (let x = Math.floor(domain.xMin / xInterval) * xInterval; x <= domain.xMax; x += xInterval) {
      const { px } = mathToPixel(x, 0, logicalWidth, logicalHeight);
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, logicalHeight);
      ctx.stroke();
    }
    for (let y = Math.floor(domain.yMin / yInterval) * yInterval; y <= domain.yMax; y += yInterval) {
      const { py } = mathToPixel(0, y, logicalWidth, logicalHeight);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(logicalWidth, py);
      ctx.stroke();
    }

    // 3. Main Axes (X & Y)
    const origin = mathToPixel(0, 0, logicalWidth, logicalHeight);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)'; // Cyan glowing axes
    ctx.lineWidth = 2;

    // X Axis
    if (origin.py >= 0 && origin.py <= logicalHeight) {
      ctx.beginPath();
      ctx.moveTo(0, origin.py);
      ctx.lineTo(logicalWidth, origin.py);
      ctx.stroke();

      // X Axis arrow
      ctx.beginPath();
      ctx.moveTo(logicalWidth - 10, origin.py - 5);
      ctx.lineTo(logicalWidth, origin.py);
      ctx.lineTo(logicalWidth - 10, origin.py + 5);
      ctx.stroke();
    }

    // Y Axis
    if (origin.px >= 0 && origin.px <= logicalWidth) {
      ctx.beginPath();
      ctx.moveTo(origin.px, 0);
      ctx.lineTo(origin.px, logicalHeight);
      ctx.stroke();

      // Y Axis arrow
      ctx.beginPath();
      ctx.moveTo(origin.px - 5, 10);
      ctx.lineTo(origin.px, 0);
      ctx.lineTo(origin.px + 5, 10);
      ctx.stroke();
    }

    // 4. "الكثييير من الاعداد": Axis Tick Labels on X and Y axes
    if (showGridNumbers) {
      ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, Monaco, monospace';
      ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // X Numbers
      const yAxisY = Math.max(15, Math.min(logicalHeight - 20, origin.py + 6));
      for (let x = Math.floor(domain.xMin / xInterval) * xInterval; x <= domain.xMax; x += xInterval) {
        if (Math.abs(x) < 0.0001) continue; // Skip zero at axis cross
        const { px } = mathToPixel(x, 0, logicalWidth, logicalHeight);
        if (px >= 20 && px <= logicalWidth - 20) {
          const formatted = Number.isInteger(x) ? String(x) : x.toFixed(1);
          ctx.fillText(formatted, px, yAxisY);
          // Tick pip
          ctx.fillRect(px - 1, origin.py - 3, 2, 6);
        }
      }

      // Y Numbers
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const xAxisX = Math.max(35, Math.min(logicalWidth - 10, origin.px - 8));
      for (let y = Math.floor(domain.yMin / yInterval) * yInterval; y <= domain.yMax; y += yInterval) {
        if (Math.abs(y) < 0.0001) continue;
        const { py } = mathToPixel(0, y, logicalWidth, logicalHeight);
        if (py >= 15 && py <= logicalHeight - 15) {
          const formatted = Number.isInteger(y) ? String(y) : y.toFixed(1);
          ctx.fillText(formatted, xAxisX, py);
          // Tick pip
          ctx.fillRect(origin.px - 3, py - 1, 6, 2);
        }
      }

      // Origin (0,0) label
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(34, 211, 238, 0.9)';
      ctx.fillText('(0,0)', origin.px - 6, origin.py + 6);
    }

    // 5. Area Under Curve (Integral Shading) if active
    if (showIntegral && curves[0] && curves[0].visible && integralRange) {
      const [intA, intB] = integralRange;
      const startX = Math.min(intA, intB);
      const endX = Math.max(intA, intB);
      const step = (endX - startX) / 100;

      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.beginPath();
      const pStart = mathToPixel(startX, 0, logicalWidth, logicalHeight);
      ctx.moveTo(pStart.px, pStart.py);

      for (let x = startX; x <= endX; x += step) {
        const y = MathEngine.evaluateExpression(curves[0].expression, x);
        if (!isNaN(y)) {
          const p = mathToPixel(x, y, logicalWidth, logicalHeight);
          ctx.lineTo(p.px, p.py);
        }
      }

      const pEnd = mathToPixel(endX, 0, logicalWidth, logicalHeight);
      ctx.lineTo(pEnd.px, pEnd.py);
      ctx.closePath();
      ctx.fill();

      // Stroke boundary lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      const pA_top = mathToPixel(intA, MathEngine.evaluateExpression(curves[0].expression, intA), logicalWidth, logicalHeight);
      ctx.moveTo(pStart.px, pStart.py);
      ctx.lineTo(pA_top.px, pA_top.py);
      const pB_top = mathToPixel(intB, MathEngine.evaluateExpression(curves[0].expression, intB), logicalWidth, logicalHeight);
      ctx.moveTo(pEnd.px, pEnd.py);
      ctx.lineTo(pB_top.px, pB_top.py);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 6. Draw Curves (High Precision Sampling)
    const pixelStep = 1.5; // Smooth sub-pixel precision
    curves.forEach((curve) => {
      if (!curve.visible || !curve.expression) return;

      ctx.strokeStyle = curve.color;
      ctx.lineWidth = 2.8;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.shadowColor = curve.color;
      ctx.shadowBlur = 8; // Neon glow

      ctx.beginPath();
      let isFirstPoint = true;
      let lastY = NaN;

      for (let px = 0; px <= logicalWidth; px += pixelStep) {
        const { x } = pixelToMath(px, 0, logicalWidth, logicalHeight);
        const y = MathEngine.evaluateExpression(curve.expression, x);

        if (isNaN(y) || Math.abs(y) > 10000) {
          isFirstPoint = true;
          continue;
        }

        // Asymptote jump detection
        if (!isNaN(lastY) && Math.abs(y - lastY) > yRange * 1.5) {
          isFirstPoint = true;
        }

        const { py } = mathToPixel(x, y, logicalWidth, logicalHeight);

        if (isFirstPoint) {
          ctx.moveTo(px, py);
          isFirstPoint = false;
        } else {
          ctx.lineTo(px, py);
        }
        lastY = y;
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      // 7. Critical Points for Curve 1 (Roots & Extrema)
      if (showRoots) {
        const roots = MathEngine.findRoots(curve.expression, [domain.xMin, domain.xMax]);
        roots.forEach((root) => {
          const { px, py } = mathToPixel(root, 0, logicalWidth, logicalHeight);
          if (px >= 0 && px <= logicalWidth && py >= 0 && py <= logicalHeight) {
            // Root indicator dot
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(px, py, 5, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Label
            ctx.font = '10px monospace';
            ctx.fillStyle = '#7dd3fc';
            ctx.textAlign = 'center';
            ctx.fillText(`(${root}, 0)`, px, py - 10);
          }
        });
      }

      if (showExtrema) {
        const extrema = MathEngine.findExtrema(curve.expression, [domain.xMin, domain.xMax]);
        extrema.forEach((ext) => {
          const { px, py } = mathToPixel(ext.x, ext.y, logicalWidth, logicalHeight);
          if (px >= 0 && px <= logicalWidth && py >= 0 && py <= logicalHeight) {
            ctx.fillStyle = ext.type === 'max' ? '#fbbf24' : '#f43f5e';
            ctx.beginPath();
            if (ext.type === 'max') {
              // Upward triangle
              ctx.moveTo(px, py - 6);
              ctx.lineTo(px - 5, py + 4);
              ctx.lineTo(px + 5, py + 4);
            } else {
              // Downward triangle
              ctx.moveTo(px, py + 6);
              ctx.lineTo(px - 5, py - 4);
              ctx.lineTo(px + 5, py - 4);
            }
            ctx.closePath();
            ctx.fill();

            // Coordinates label
            ctx.font = '10px monospace';
            ctx.fillStyle = '#fde68a';
            ctx.textAlign = 'center';
            ctx.fillText(`(${ext.x}, ${ext.y})`, px, ext.type === 'max' ? py - 12 : py + 16);
          }
        });
      }
    });

    // 8. Intersections between curves
    intersections.forEach(([ix, iy]) => {
      const { px, py } = mathToPixel(ix, iy, logicalWidth, logicalHeight);
      if (px >= 0 && px <= logicalWidth && py >= 0 && py <= logicalHeight) {
        // Diamond marker
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(px, py - 6);
        ctx.lineTo(px + 6, py);
        ctx.lineTo(px, py + 6);
        ctx.lineTo(px - 6, py);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.font = '10px monospace';
        ctx.fillStyle = '#6ee7b7';
        ctx.textAlign = 'center';
        ctx.fillText(`(${ix}, ${iy})`, px, py - 12);
      }
    });

    // 9. Interactive Cursor Crosshair & Tangent Line
    if (mousePos && cursorMath) {
      const { x: curPx, y: curPy } = mousePos;

      // Dashed crosshairs
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(curPx, 0);
      ctx.lineTo(curPx, logicalHeight);
      ctx.moveTo(0, curPy);
      ctx.lineTo(logicalWidth, curPy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point on Primary Curve at cursor X
      if (curves[0] && curves[0].visible) {
        const curveY = MathEngine.evaluateExpression(curves[0].expression, cursorMath.x);
        if (!isNaN(curveY)) {
          const { px: ptPx, py: ptPy } = mathToPixel(cursorMath.x, curveY, logicalWidth, logicalHeight);

          // Glowing cursor tracker dot
          ctx.fillStyle = curves[0].color;
          ctx.beginPath();
          ctx.arc(ptPx, ptPy, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Tangent line at cursor
          if (showTangent) {
            const slope = MathEngine.findSlope(curves[0].expression, cursorMath.x);
            if (!isNaN(slope)) {
              const tangentDx = xRange * 0.15;
              const x1 = cursorMath.x - tangentDx;
              const y1 = curveY - slope * tangentDx;
              const x2 = cursorMath.x + tangentDx;
              const y2 = curveY + slope * tangentDx;

              const p1 = mathToPixel(x1, y1, logicalWidth, logicalHeight);
              const p2 = mathToPixel(x2, y2, logicalWidth, logicalHeight);

              ctx.strokeStyle = '#f43f5e';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(p1.px, p1.py);
              ctx.lineTo(p2.px, p2.py);
              ctx.stroke();
            }
          }
        }
      }
    }
  }, [domain, curves, intersections, showRoots, showExtrema, showTangent, showIntegral, integralRange, mousePos, cursorMath, showGridNumbers, mathToPixel, pixelToMath]);

  // Handle Resize and Canvas Setup
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const dpr = window.devicePixelRatio || 1;
      const w = container.clientWidth;
      const h = isFullscreen ? window.innerHeight * 0.85 : height;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      drawGraph();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawGraph, isFullscreen, height]);

  // Redraw on dependencies
  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  // Zoom Handling
  const handleZoom = (factor: number, centerX?: number, centerY?: number) => {
    setDomain((prev) => {
      const xRange = (prev.xMax - prev.xMin) * factor;
      const yRange = (prev.yMax - prev.yMin) * factor;

      const cX = centerX !== undefined ? centerX : (prev.xMin + prev.xMax) / 2;
      const cY = centerY !== undefined ? centerY : (prev.yMin + prev.yMax) / 2;

      const xFraction = (cX - prev.xMin) / (prev.xMax - prev.xMin);
      const yFraction = (cY - prev.yMin) / (prev.yMax - prev.yMin);

      return {
        xMin: cX - xFraction * xRange,
        xMax: cX + (1 - xFraction) * xRange,
        yMin: cY - yFraction * yRange,
        yMax: cY + (1 - yFraction) * yRange
      };
    });
  };

  // Preset Views
  const setPresetView = (preset: 'standard' | 'wide' | 'macro' | 'trig') => {
    switch (preset) {
      case 'standard':
        setDomain({ xMin: -10, xMax: 10, yMin: -7, yMax: 7 });
        break;
      case 'wide':
        setDomain({ xMin: -35, xMax: 35, yMin: -25, yMax: 25 });
        break;
      case 'macro':
        setDomain({ xMin: -3, xMax: 3, yMin: -2.5, yMax: 2.5 });
        break;
      case 'trig':
        setDomain({ xMin: -2 * Math.PI, xMax: 2 * Math.PI, yMin: -2.5, yMax: 2.5 });
        break;
    }
  };

  // Mouse Interaction Events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    setMousePos({ x: px, y: py });
    const mathCoords = pixelToMath(px, py, rect.width, rect.height);
    setCursorMath({ x: parseFloat(mathCoords.x.toFixed(3)), y: parseFloat(mathCoords.y.toFixed(3)) });

    if (isDragging && dragStart) {
      const dxPx = e.clientX - dragStart.x;
      const dyPx = e.clientY - dragStart.y;

      const dxMath = (dxPx / rect.width) * (domain.xMax - domain.xMin);
      const dyMath = (dyPx / rect.height) * (domain.yMax - domain.yMin);

      setDomain((prev) => ({
        xMin: prev.xMin - dxMath,
        xMax: prev.xMax - dxMath,
        yMin: prev.yMin + dyMath,
        yMax: prev.yMax + dyMath
      }));

      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const center = pixelToMath(px, py, rect.width, rect.height);

    const factor = e.deltaY < 0 ? 0.85 : 1.15;
    handleZoom(factor, center.x, center.y);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `graph-visualizer-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Primary curve values at cursor
  const primaryY = cursorMath && curves[0]?.visible 
    ? MathEngine.evaluateExpression(curves[0].expression, cursorMath.x) 
    : NaN;
  const primarySlope = cursorMath && curves[0]?.visible
    ? MathEngine.findSlope(curves[0].expression, cursorMath.x)
    : NaN;

  return (
    <div ref={containerRef} className={`relative rounded-3xl overflow-hidden border border-slate-700/60 shadow-2xl ${className}`}>
      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left: View & Zoom Controls */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-lg pointer-events-auto">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleZoom(0.8)}
            className="w-8 h-8 p-0 text-cyan-300 hover:bg-slate-800"
            title="تكبير (Zoom In)"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleZoom(1.25)}
            className="w-8 h-8 p-0 text-cyan-300 hover:bg-slate-800"
            title="تصغير (Zoom Out)"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPresetView('standard')}
            className="w-8 h-8 p-0 text-cyan-300 hover:bg-slate-800"
            title="إعادة ضبط (Reset to Standard)"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <div className="w-[1px] h-5 bg-slate-700 mx-1" />

          {/* Quick Presets */}
          <button
            onClick={() => setPresetView('standard')}
            className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            ±10
          </button>
          <button
            onClick={() => setPresetView('wide')}
            className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            ±35
          </button>
          <button
            onClick={() => setPresetView('trig')}
            className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            2π
          </button>
        </div>

        {/* Right: Toggles, Fullscreen & Export */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-lg pointer-events-auto">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowGridNumbers(!showGridNumbers)}
            className={`w-8 h-8 p-0 ${showGridNumbers ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-400'}`}
            title="إظهار أرقام المحاور"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            className="w-8 h-8 p-0 text-emerald-400 hover:bg-slate-800"
            title="تصدير الرسم البياني كصورة (PNG)"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-8 h-8 p-0 text-purple-400 hover:bg-slate-800"
            title={isFullscreen ? 'تصغير الشاشة' : 'تكبير ملء الشاشة'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Real-time Floating HUD: Cursor Coordinates & Calculus Readout */}
      {cursorMath && (
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none p-3 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-700/80 shadow-2xl flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-400">الإحداثيات:</span>
            <span className="text-cyan-300 font-bold">X: {cursorMath.x}</span>
            <span className="text-cyan-300 font-bold">Y: {cursorMath.y}</span>
          </div>

          {!isNaN(primaryY) && (
            <div className="flex items-center gap-2 border-r border-slate-700 pr-3">
              <span className="text-slate-400">{curves[0]?.label || 'f(x)'}:</span>
              <span className="text-pink-400 font-bold">{primaryY.toFixed(3)}</span>
            </div>
          )}

          {!isNaN(primarySlope) && (
            <div className="flex items-center gap-2 border-r border-slate-700 pr-3">
              <span className="text-slate-400">ميل المماس f'(x):</span>
              <span className="text-amber-400 font-bold">{primarySlope.toFixed(3)}</span>
            </div>
          )}
        </div>
      )}

      {/* Main High-Performance Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp();
          setMousePos(null);
          setCursorMath(null);
        }}
        onWheel={handleWheel}
        className={`w-full block select-none ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
      />
    </div>
  );
};

export default InteractiveCanvas;
