// Local lightweight vision: motion + edge density per 3x3 cell + scene-change score
// Runs on main thread with a tiny 96x72 canvas; cheap enough at 12-15 Hz.

export type CellStats = {
  motion: number; // 0..1
  edge: number;   // 0..1
  bright: number; // 0..1
};

export type LocalFrameStats = {
  cells: CellStats[]; // 9 entries TL..BR
  globalMotion: number; // 0..1 avg
  bottomMotion: number; // 0..1 (bottom row average)
  sceneChange: number;  // 0..1 large = scene swapped
  brightness: number;   // 0..1
};

export class LocalVision {
  private W = 96;
  private H = 72;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private prev: Uint8ClampedArray | null = null;
  private lastEdgeMap: Float32Array | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true } as any);
  }

  analyze(video: HTMLVideoElement): LocalFrameStats | null {
    if (!this.ctx || video.readyState < 2) return null;
    this.ctx.drawImage(video, 0, 0, this.W, this.H);
    const img = this.ctx.getImageData(0, 0, this.W, this.H).data;

    // gray buffer
    const gray = new Float32Array(this.W * this.H);
    let brightnessSum = 0;
    for (let i = 0, p = 0; i < img.length; i += 4, p++) {
      const g = (img[i] * 0.299 + img[i+1] * 0.587 + img[i+2] * 0.114);
      gray[p] = g;
      brightnessSum += g;
    }
    const brightness = brightnessSum / (gray.length * 255);

    // Sobel-lite edge magnitude
    const edge = new Float32Array(gray.length);
    for (let y = 1; y < this.H - 1; y++) {
      for (let x = 1; x < this.W - 1; x++) {
        const i = y * this.W + x;
        const gx = gray[i + 1] - gray[i - 1];
        const gy = gray[i + this.W] - gray[i - this.W];
        edge[i] = Math.min(255, Math.abs(gx) + Math.abs(gy));
      }
    }

    // Motion diff vs previous gray
    const motion = new Float32Array(gray.length);
    let globalMotionSum = 0;
    if (this.prev) {
      for (let p = 0; p < gray.length; p++) {
        const d = Math.abs(gray[p] - this.prev[p]);
        motion[p] = d;
        globalMotionSum += d;
      }
    }
    const globalMotion = this.prev ? globalMotionSum / (gray.length * 255) : 0;

    // Cells 3x3
    const cells: CellStats[] = [];
    const cw = Math.floor(this.W / 3);
    const ch = Math.floor(this.H / 3);
    for (let cy = 0; cy < 3; cy++) {
      for (let cx = 0; cx < 3; cx++) {
        let mSum = 0, eSum = 0, bSum = 0, n = 0;
        const x0 = cx * cw, x1 = cx === 2 ? this.W : x0 + cw;
        const y0 = cy * ch, y1 = cy === 2 ? this.H : y0 + ch;
        for (let y = y0; y < y1; y++) {
          for (let x = x0; x < x1; x++) {
            const i = y * this.W + x;
            mSum += motion[i];
            eSum += edge[i];
            bSum += gray[i];
            n++;
          }
        }
        cells.push({
          motion: Math.min(1, mSum / (n * 60)),
          edge: Math.min(1, eSum / (n * 120)),
          bright: bSum / (n * 255),
        });
      }
    }

    // Bottom motion = avg of bottom row cells
    const bottomMotion = (cells[6].motion + cells[7].motion + cells[8].motion) / 3;

    // Scene change: compare current edge histogram with last
    let sceneChange = 0;
    if (this.lastEdgeMap) {
      let diff = 0, prevSum = 0;
      for (let i = 0; i < edge.length; i++) {
        diff += Math.abs(edge[i] - this.lastEdgeMap[i]);
        prevSum += this.lastEdgeMap[i];
      }
      const denom = Math.max(1, prevSum);
      sceneChange = Math.min(1, diff / denom);
    }

    this.prev = new Uint8ClampedArray(gray.length);
    for (let p = 0; p < gray.length; p++) this.prev[p] = gray[p];
    this.lastEdgeMap = edge;

    return { cells, globalMotion, bottomMotion, sceneChange, brightness };
  }

  reset() {
    this.prev = null;
    this.lastEdgeMap = null;
  }
}
