function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function toHex(value: number): string {
  return Math.round(value).toString(16).padStart(2, "0");
}

export function lerpColor(from: string, to: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  const r = r1 + (r2 - r1) * t;
  const g = g1 + (g2 - g1) * t;
  const b = b1 + (b2 - b1) * t;
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function lerpPalette(palette: readonly string[], phase: number): string {
  const wrapped = ((phase % 1) + 1) % 1;
  const segment = wrapped * palette.length;
  const index = Math.floor(segment) % palette.length;
  const next = (index + 1) % palette.length;
  const t = segment - Math.floor(segment);
  return lerpColor(palette[index]!, palette[next]!, t);
}
