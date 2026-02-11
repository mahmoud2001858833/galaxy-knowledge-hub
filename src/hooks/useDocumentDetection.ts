import { useRef, useCallback, useEffect, useState } from 'react';

interface DetectionState {
  detected: boolean;
  stability: number; // 0-100
  message: string;
}

export const useDocumentDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  isActive: boolean,
  onAutoCapture: () => void
) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameRef = useRef<ImageData | null>(null);
  const stableCountRef = useRef(0);
  const cooldownRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [detection, setDetection] = useState<DetectionState>({
    detected: false,
    stability: 0,
    message: 'وجّه الكاميرا نحو الورقة',
  });

  const analyzeFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || cooldownRef.current) return;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    // Use a smaller analysis resolution for performance
    const aw = 320;
    const ah = Math.round((video.videoHeight / video.videoWidth) * aw);
    canvas.width = aw;
    canvas.height = ah;
    ctx.drawImage(video, 0, 0, aw, ah);

    // Analyze center region (where the scan frame is ~85% width, 3:4 aspect)
    const regionW = Math.round(aw * 0.75);
    const regionH = Math.round(regionW * (4 / 3));
    const rx = Math.round((aw - regionW) / 2);
    const ry = Math.round((ah - regionH) / 2);

    if (ry < 0 || rx < 0 || rx + regionW > aw || ry + regionH > ah) return;

    const imageData = ctx.getImageData(rx, ry, regionW, regionH);
    const data = imageData.data;
    const pixelCount = regionW * regionH;

    // 1. Calculate average brightness in the region
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      totalBrightness += (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
    }
    const avgBrightness = totalBrightness / pixelCount;

    // 2. Calculate edge density (simple gradient)
    let edgeCount = 0;
    const threshold = 30;
    for (let y = 1; y < regionH - 1; y++) {
      for (let x = 1; x < regionW - 1; x++) {
        const idx = (y * regionW + x) * 4;
        const idxRight = (y * regionW + x + 1) * 4;
        const idxDown = ((y + 1) * regionW + x) * 4;
        
        const gx = Math.abs(
          (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) -
          (data[idxRight] * 0.299 + data[idxRight + 1] * 0.587 + data[idxRight + 2] * 0.114)
        );
        const gy = Math.abs(
          (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) -
          (data[idxDown] * 0.299 + data[idxDown + 1] * 0.587 + data[idxDown + 2] * 0.114)
        );
        
        if (gx + gy > threshold) edgeCount++;
      }
    }
    const edgeDensity = edgeCount / pixelCount;

    // 3. Check frame stability (compare with previous frame)
    let frameDiff = 1;
    if (prevFrameRef.current && prevFrameRef.current.width === regionW && prevFrameRef.current.height === regionH) {
      const prevData = prevFrameRef.current.data;
      let diffSum = 0;
      for (let i = 0; i < data.length; i += 16) { // sample every 4th pixel for speed
        diffSum += Math.abs(data[i] - prevData[i]);
      }
      frameDiff = diffSum / (data.length / 16) / 255;
    }
    prevFrameRef.current = new ImageData(new Uint8ClampedArray(data), regionW, regionH);

    // Detection logic:
    // - Paper is typically bright (avgBrightness > 120)
    // - Has text/content (edgeDensity > 0.03)
    // - Is stable (frameDiff < 0.02)
    const isBright = avgBrightness > 60;
    const hasContent = edgeDensity > 0.015;
    const isStable = frameDiff < 0.04;
    const isDocDetected = isBright && hasContent;

    if (isDocDetected && isStable) {
      stableCountRef.current = Math.min(stableCountRef.current + 2, 6);
    } else if (isDocDetected) {
      stableCountRef.current = Math.max(stableCountRef.current - 1, 0);
    } else {
      stableCountRef.current = Math.max(stableCountRef.current - 1, 0);
    }

    const stability = Math.round((stableCountRef.current / 4) * 100);

    if (stableCountRef.current >= 4) {
      setDetection({ detected: true, stability: 100, message: '📸 جاري الالتقاط...' });
      // Auto capture
      cooldownRef.current = true;
      stableCountRef.current = 0;
      onAutoCapture();
      // Cooldown 2 seconds before next detection
      setTimeout(() => {
        cooldownRef.current = false;
        prevFrameRef.current = null;
        setDetection({ detected: false, stability: 0, message: 'وجّه الكاميرا نحو الورقة التالية' });
      }, 2000);
    } else if (isDocDetected && isStable) {
      setDetection({ detected: true, stability, message: 'تم اكتشاف ورقة... ثبّت الكاميرا' });
    } else if (isDocDetected) {
      setDetection({ detected: true, stability, message: 'تم اكتشاف ورقة - ثبّت الكاميرا' });
    } else {
      setDetection({ detected: false, stability: 0, message: 'وجّه الكاميرا نحو الورقة' });
    }
  }, [videoRef, onAutoCapture]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(analyzeFrame, 400);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stableCountRef.current = 0;
      prevFrameRef.current = null;
    };
  }, [isActive, analyzeFrame]);

  return detection;
};
