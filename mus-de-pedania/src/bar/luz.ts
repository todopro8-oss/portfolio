// Iluminación del bar: penumbra cálida en toda la escena y un único foco dirigido sobre el cartel
// de RASKA (PROMPT_BAR, 7.2). Se aplica a cada capa y a cada objeto al crearlos, con tramado
// ordenado (Bayer 4×4) entre niveles fijos: nada de degradados suaves.

import { Pixeles } from '../render/pixel';

export const ANCHO_BAR = 480;
export const ALTO_BAR = 270;

/** Foco del cartel: vértice en la lámpara del techo y base un poco por debajo del cartel. */
export const FOCO = { x: 240, y: 9, baseY: 158, semiancho: 64 };

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

/** Niveles de luz posibles (multiplicador del color). */
const NIVELES = [0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.12];

/** Cantidad de luz en un punto de la escena (sin cuantizar). */
export function luzEn(x: number, y: number): number {
  // Penumbra general, algo más oscura hacia los bordes (viñeta).
  const dx = (x - 240) / 240;
  const dy = (y - 120) / 150;
  let l = 0.86 - 0.26 * (dx * dx + dy * dy);
  // Cono del foco sobre el cartel.
  if (y > FOCO.y && y < FOCO.baseY + 14) {
    const t = (y - FOCO.y) / (FOCO.baseY - FOCO.y);
    const semi = 6 + t * FOCO.semiancho;
    const d = Math.abs(x - FOCO.x) / semi;
    if (d < 1) l += 0.34 * (1 - d * d) * Math.min(1, 0.55 + t);
  }
  // Charco de luz en el suelo bajo el cartel.
  const ex = (x - 240) / 74;
  const ey = (y - 214) / 14;
  if (ex * ex + ey * ey < 1) l += 0.2 * (1 - (ex * ex + ey * ey));
  // Resplandor del rótulo de neón y del tubo de la barra.
  const nx = (x - 384) / 90;
  const ny = (y - 30) / 60;
  if (nx * nx + ny * ny < 1) l += 0.1 * (1 - (nx * nx + ny * ny));
  return l;
}

/** Nivel cuantizado con tramado para el píxel (x, y). */
function nivel(x: number, y: number): number {
  const l = luzEn(x, y);
  const umbral = BAYER[(y & 3) * 4 + (x & 3)];
  for (let i = 0; i < NIVELES.length - 1; i++) {
    const a = NIVELES[i];
    const b = NIVELES[i + 1];
    if (l < a) return a;
    if (l < b) return (l - a) / (b - a) > umbral ? b : a;
  }
  return NIVELES[NIVELES.length - 1];
}

const SOMBRA = [42, 24, 14]; // marrón muy oscuro: las sombras tiran a cálido
const LUZ = [255, 240, 205];

/** Aplica la luz de la escena a un lienzo colocado en (ox, oy). */
export function iluminar(p: Pixeles, ox: number, oy: number): void {
  const d = p.datos;
  for (let y = 0; y < p.alto; y++)
    for (let x = 0; x < p.ancho; x++) {
      const i = y * p.ancho + x;
      const v = d[i];
      const a = v >>> 24;
      if (a === 0) continue;
      const f = nivel(ox + x, oy + y);
      let r = v & 255;
      let g = (v >>> 8) & 255;
      let b = (v >>> 16) & 255;
      if (f < 1) {
        r = SOMBRA[0] + (r - SOMBRA[0]) * f;
        g = SOMBRA[1] + (g - SOMBRA[1]) * f;
        b = SOMBRA[2] + (b - SOMBRA[2]) * f;
      } else if (f > 1) {
        const k = (f - 1) * 1.6;
        r += (LUZ[0] - r) * k;
        g += (LUZ[1] - g) * k;
        b += (LUZ[2] - b) * k;
      }
      d[i] = ((a << 24) | (Math.round(b) << 16) | (Math.round(g) << 8) | Math.round(r)) >>> 0;
    }
}

/** Silueta de 1 px alrededor de lo opaco de un lienzo (para el resalte al pasar el ratón). */
export function silueta(p: Pixeles, color: string): Pixeles {
  const s = new Pixeles(p.ancho + 2, p.alto + 2);
  s.pegar(p, 1, 1);
  const opaco = s.datos.slice();
  s.contorno(color);
  // Solo el borde: se vacía lo que era del objeto.
  for (let i = 0; i < opaco.length; i++) if (opaco[i] >>> 24 > 0) s.datos[i] = 0;
  return s;
}
