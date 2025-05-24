
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, Line, Circle } from 'fabric';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';

interface InteractiveCanvasProps {
  data: Array<{ x: number; y1: number; y2?: number }>;
  intersections: Array<[number, number]>;
  width?: number;
  height?: number;
}

interface ExtendedCanvas extends Canvas {
  isDragging?: boolean;
  lastPosX?: number;
  lastPosY?: number;
}

const InteractiveCanvas = ({ data, intersections, width = 600, height = 400 }: InteractiveCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<ExtendedCanvas | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panMode, setPanMode] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
    }) as ExtendedCanvas;

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, [width, height]);

  useEffect(() => {
    if (!fabricCanvas || !data.length) return;

    // Clear canvas
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = 'rgba(15, 23, 42, 0.8)';

    // Set up coordinate system
    const padding = 40;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    
    const xMin = Math.min(...data.map(d => d.x));
    const xMax = Math.max(...data.map(d => d.x));
    const yMin = Math.min(...data.map(d => Math.min(d.y1, d.y2 || d.y1)));
    const yMax = Math.max(...data.map(d => Math.max(d.y1, d.y2 || d.y1)));

    const xScale = graphWidth / (xMax - xMin);
    const yScale = graphHeight / (yMax - yMin);

    // Draw grid
    const gridSpacing = 20;
    for (let i = 0; i <= width; i += gridSpacing) {
      fabricCanvas.add(new Line([i, 0, i, height], {
        stroke: 'rgba(255, 255, 255, 0.1)',
        strokeWidth: 1,
        selectable: false,
        evented: false
      }));
    }
    for (let i = 0; i <= height; i += gridSpacing) {
      fabricCanvas.add(new Line([0, i, width, i], {
        stroke: 'rgba(255, 255, 255, 0.1)',
        strokeWidth: 1,
        selectable: false,
        evented: false
      }));
    }

    // Draw axes
    const centerX = padding + (0 - xMin) * xScale;
    const centerY = padding + (yMax - 0) * yScale;

    if (centerX >= padding && centerX <= width - padding) {
      fabricCanvas.add(new Line([centerX, padding, centerX, height - padding], {
        stroke: 'rgba(255, 255, 255, 0.3)',
        strokeWidth: 2,
        selectable: false,
        evented: false
      }));
    }

    if (centerY >= padding && centerY <= height - padding) {
      fabricCanvas.add(new Line([padding, centerY, width - padding, centerY], {
        stroke: 'rgba(255, 255, 255, 0.3)',
        strokeWidth: 2,
        selectable: false,
        evented: false
      }));
    }

    // Draw equation 1
    const points1 = data.map(d => ({
      x: padding + (d.x - xMin) * xScale,
      y: padding + (yMax - d.y1) * yScale
    })).filter(p => !isNaN(p.x) && !isNaN(p.y));

    if (points1.length > 1) {
      for (let i = 0; i < points1.length - 1; i++) {
        fabricCanvas.add(new Line([points1[i].x, points1[i].y, points1[i + 1].x, points1[i + 1].y], {
          stroke: '#33C3F0',
          strokeWidth: 3,
          selectable: false,
          evented: false
        }));
      }
    }

    // Draw equation 2 if exists
    if (data[0]?.y2 !== undefined) {
      const points2 = data.map(d => ({
        x: padding + (d.x - xMin) * xScale,
        y: padding + (yMax - (d.y2 || 0)) * yScale
      })).filter(p => !isNaN(p.x) && !isNaN(p.y));

      if (points2.length > 1) {
        for (let i = 0; i < points2.length - 1; i++) {
          fabricCanvas.add(new Line([points2[i].x, points2[i].y, points2[i + 1].x, points2[i + 1].y], {
            stroke: '#9b87f5',
            strokeWidth: 3,
            selectable: false,
            evented: false
          }));
        }
      }
    }

    // Draw intersection points
    intersections.forEach(([x, y]) => {
      const canvasX = padding + (x - xMin) * xScale;
      const canvasY = padding + (yMax - y) * yScale;
      
      if (canvasX >= 0 && canvasX <= width && canvasY >= 0 && canvasY <= height) {
        fabricCanvas.add(new Circle({
          left: canvasX - 6,
          top: canvasY - 6,
          radius: 6,
          fill: '#FFFFFF',
          stroke: '#000000',
          strokeWidth: 2,
          selectable: false,
          evented: false
        }));
      }
    });

    fabricCanvas.renderAll();
  }, [fabricCanvas, data, intersections, width, height]);

  const handleZoomIn = () => {
    if (!fabricCanvas) return;
    const newZoom = Math.min(zoom * 1.2, 5);
    setZoom(newZoom);
    fabricCanvas.setZoom(newZoom);
    fabricCanvas.renderAll();
  };

  const handleZoomOut = () => {
    if (!fabricCanvas) return;
    const newZoom = Math.max(zoom / 1.2, 0.2);
    setZoom(newZoom);
    fabricCanvas.setZoom(newZoom);
    fabricCanvas.renderAll();
  };

  const handleReset = () => {
    if (!fabricCanvas) return;
    setZoom(1);
    fabricCanvas.setZoom(1);
    fabricCanvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    fabricCanvas.renderAll();
  };

  const togglePanMode = () => {
    if (!fabricCanvas) return;
    const newPanMode = !panMode;
    setPanMode(newPanMode);
    
    if (newPanMode) {
      fabricCanvas.isDragging = false;
      fabricCanvas.selection = false;
      fabricCanvas.defaultCursor = 'grab';
    } else {
      fabricCanvas.isDragging = false;
      fabricCanvas.selection = true;
      fabricCanvas.defaultCursor = 'default';
    }
  };

  useEffect(() => {
    if (!fabricCanvas) return;

    const handleMouseDown = (e: any) => {
      if (!panMode) return;
      fabricCanvas.isDragging = true;
      fabricCanvas.selection = false;
      fabricCanvas.lastPosX = e.e.clientX;
      fabricCanvas.lastPosY = e.e.clientY;
      fabricCanvas.defaultCursor = 'grabbing';
    };

    const handleMouseMove = (e: any) => {
      if (!fabricCanvas.isDragging || !panMode) return;
      const vpt = fabricCanvas.viewportTransform;
      if (vpt && fabricCanvas.lastPosX && fabricCanvas.lastPosY) {
        vpt[4] += e.e.clientX - fabricCanvas.lastPosX;
        vpt[5] += e.e.clientY - fabricCanvas.lastPosY;
        fabricCanvas.requestRenderAll();
        fabricCanvas.lastPosX = e.e.clientX;
        fabricCanvas.lastPosY = e.e.clientY;
      }
    };

    const handleMouseUp = () => {
      if (!panMode) return;
      fabricCanvas.isDragging = false;
      fabricCanvas.selection = true;
      fabricCanvas.defaultCursor = 'grab';
    };

    fabricCanvas.on('mouse:down', handleMouseDown);
    fabricCanvas.on('mouse:move', handleMouseMove);
    fabricCanvas.on('mouse:up', handleMouseUp);

    return () => {
      fabricCanvas.off('mouse:down', handleMouseDown);
      fabricCanvas.off('mouse:move', handleMouseMove);
      fabricCanvas.off('mouse:up', handleMouseUp);
    };
  }, [fabricCanvas, panMode]);

  return (
    <div className="relative">
      <div className="absolute top-2 left-2 z-10 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomIn}
          className="bg-blue-900/80 border-blue-500/50 text-white hover:bg-blue-800/80"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomOut}
          className="bg-blue-900/80 border-blue-500/50 text-white hover:bg-blue-800/80"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={togglePanMode}
          className={`border-blue-500/50 text-white hover:bg-blue-800/80 ${
            panMode ? 'bg-blue-600/80' : 'bg-blue-900/80'
          }`}
        >
          <Move className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
          className="bg-blue-900/80 border-blue-500/50 text-white hover:bg-blue-800/80"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
      
      <canvas 
        ref={canvasRef}
        className="border border-purple-500/30 rounded-lg"
      />
    </div>
  );
};

export default InteractiveCanvas;
