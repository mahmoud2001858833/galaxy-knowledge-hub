import type { TactileFigure, TactileElement } from "./tactileTypes";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function elToSvg(el: TactileElement, strokeMm: number): string {
  const sw = el.stroke_mm ?? strokeMm;
  const dash = el.dashed ? `stroke-dasharray="${sw * 3} ${sw * 2}"` : "";
  const fill = el.fill ? "black" : "none";
  const c = el.coords;
  switch (el.kind) {
    case "circle":
      return `<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" fill="${fill}" stroke="black" stroke-width="${sw}" ${dash}/>`;
    case "line":
      return `<line x1="${c[0]}" y1="${c[1]}" x2="${c[2]}" y2="${c[3]}" stroke="black" stroke-width="${sw}" ${dash}/>`;
    case "polygon": {
      const pts: string[] = [];
      for (let i = 0; i + 1 < c.length; i += 2) pts.push(`${c[i]},${c[i + 1]}`);
      return `<polygon points="${pts.join(" ")}" fill="${fill}" stroke="black" stroke-width="${sw}" ${dash} stroke-linejoin="round"/>`;
    }
    case "polyline": {
      const pts: string[] = [];
      for (let i = 0; i + 1 < c.length; i += 2) pts.push(`${c[i]},${c[i + 1]}`);
      return `<polyline points="${pts.join(" ")}" fill="none" stroke="black" stroke-width="${sw}" ${dash} stroke-linejoin="round" stroke-linecap="round"/>`;
    }
    case "path":
      return `<path d="${esc(el.text || "")}" fill="${fill}" stroke="black" stroke-width="${sw}" ${dash} stroke-linejoin="round" stroke-linecap="round"/>`;
    case "point":
      return `<circle cx="${c[0]}" cy="${c[1]}" r="${sw * 1.6}" fill="black"/>`;
    case "text":
      return `<text x="${c[0]}" y="${c[1]}" font-size="${(c[2] || 6)}" font-family="'Noto Sans', sans-serif" fill="black">${esc(el.text || "")}</text>`;
    default:
      return "";
  }
}

export function buildTactileSvg(fig: TactileFigure): string {
  const stroke = 0.6; // mm — strong tactile line
  const w = fig.width_mm, h = fig.height_mm;
  const body = fig.elements.map((e) => elToSvg(e, stroke)).join("\n");

  const labels = fig.labels
    .map((l) => {
      const [x, y] = l.position;
      const lead = l.leader_to
        ? `<line x1="${l.leader_to[0]}" y1="${l.leader_to[1]}" x2="${x}" y2="${y}" stroke="black" stroke-width="0.4"/>`
        : "";
      return `${lead}<text x="${x}" y="${y}" font-size="6" font-family="'Noto Sans Braille', 'DejaVu Sans', monospace" fill="black">${esc(l.braille)}</text>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}mm" height="${h}mm">
  <rect width="${w}" height="${h}" fill="white"/>
  <g>
    ${body}
    ${labels}
  </g>
</svg>`;
}

export function downloadSvg(svg: string, filename: string) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
