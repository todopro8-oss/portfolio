// Partes vivas del bar que se dibujan en cada fotograma: la tele (placeholder del bucle de MI PUEBLO
// ES, con líneas de barrido), el neón «DIEGO PÉREZ BAR», los tubos, el polvo en el haz del foco, la
// mosca, el vaho de la cafetera, las luces de la tragaperras y la esquina del cartel que ondea.

import { texto } from '../core/bitmapFont';
import { DERIVADOS as D, PALETA as P, mezclar } from '../data/palette';
import { BARRA_Y, PANTALLA_TV } from './arte';
import { FOCO } from './luz';

function r(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string): void {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

/** Pueblo en la tele: cielo, cerros, casas, campanario, río y un pájaro. Luego, barrido y viñeta. */
export function dibujarTele(ctx: CanvasRenderingContext2D, t: number, destello = 0): void {
  const { x, y, w, h } = PANTALLA_TV;
  const noche = Math.sin(t / 9000) > 0.6;
  // Cielo a bandas
  const cielo = noche ? ['#1B2440', '#232E52', '#2C3A63'] : ['#7AB8E8', '#95C8EE', '#B5DAF2'];
  for (let k = 0; k < 3; k++) r(ctx, x, y + k * 5, w, 5, cielo[k]);
  r(ctx, x, y + 15, w, h - 15, cielo[2]);
  // Nubes o estrellas
  if (noche) for (let k = 0; k < 6; k++) r(ctx, x + ((k * 13 + 5) % w), y + 2 + ((k * 7) % 10), 1, 1, D.blanco);
  else {
    const nx = x + ((t / 300) % (w + 16)) - 10;
    r(ctx, nx, y + 5, 9, 2, D.blanco);
    r(ctx, nx + 2, y + 4, 5, 1, D.blanco);
  }
  // Cerros
  for (let i = 0; i < w; i++) {
    const alto = 9 + Math.round(Math.sin(i / 7) * 3 + Math.sin(i / 3.1) * 1.5);
    r(ctx, x + i, y + h - 14 - alto, 1, alto, noche ? '#1F3A2A' : P.bastos);
  }
  // Casas encaladas con tejado rojo y un campanario
  const casas = [4, 12, 21, 33];
  for (const cx of casas) {
    r(ctx, x + cx, y + h - 20, 7, 6, noche ? '#6E6E68' : '#EDE7D6');
    r(ctx, x + cx - 1, y + h - 22, 9, 2, noche ? '#5A2A20' : '#B5563A');
    r(ctx, x + cx + 2, y + h - 18, 2, 2, noche && (t / 700 + cx) % 3 < 2 ? P.oros : P.tinta);
  }
  r(ctx, x + 27, y + h - 29, 4, 15, noche ? '#6E6E68' : '#DCD3BC');
  r(ctx, x + 26, y + h - 31, 6, 2, noche ? '#5A2A20' : '#B5563A');
  r(ctx, x + 28, y + h - 27, 2, 2, P.tinta);
  // Río con destellos que corren
  r(ctx, x, y + h - 14, w, 5, noche ? '#1B3050' : P.espadas);
  for (let k = 0; k < 5; k++) r(ctx, x + ((k * 11 + t / 120) % w), y + h - 13 + (k % 3), 2, 1, D.espadas_brillo);
  r(ctx, x, y + h - 9, w, 9, noche ? '#243A24' : D.bastos_osc);
  // Pájaro
  const px = x + ((t / 90) % (w + 20)) - 10;
  const py = y + 8 + Math.round(Math.sin(t / 400) * 2);
  if (px > x && px < x + w - 3) {
    r(ctx, px, py, 1, 1, P.tinta);
    r(ctx, px + 2, py, 1, 1, P.tinta);
    r(ctx, px + 1, py + (Math.floor(t / 150) % 2), 1, 1, P.tinta);
  }
  // Líneas de barrido y viñeta: el vídeo parece pixel art
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  for (let k = 0; k < h; k += 2) ctx.fillRect(x, y + k, w, 1);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(x, y, 2, h);
  ctx.fillRect(x + w - 2, y, 2, h);
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y + h - 1, w, 1);
  // Barra de interferencia que sube de vez en cuando
  const barra = (t / 30) % (h * 6);
  if (barra < h) r(ctx, x, y + h - barra, w, 1, 'rgba(255,255,255,0.25)');
  if (destello > 0) {
    ctx.fillStyle = `rgba(255,255,255,${Math.min(1, destello)})`;
    ctx.fillRect(x, y, w, h);
  }
}

/** Rótulo de neón con ciclo de paleta: las letras se encienden en ola y a veces parpadean. */
export function dibujarNeon(ctx: CanvasRenderingContext2D, t: number): void {
  const letras = 'DIEGO PÉREZ BAR';
  const x0 = 384 - Math.round((letras.length * 6 - 1) / 2);
  const y0 = 10;
  const fase = Math.floor(t / 130) % 40;
  [...letras].forEach((ch, i) => {
    if (ch === ' ') return;
    let encendida = true;
    if (fase < letras.length) encendida = i <= fase;
    else if (fase >= 30 && fase < 34) encendida = fase % 2 === 0;
    const col = encendida ? (i < 11 ? P.neon : '#FF9FCB') : mezclar(P.neon, P.madera_osc, 0.75);
    if (encendida) texto(ctx, ch, x0 + i * 6 + 1, y0 + 1, mezclar(col, P.pared, 0.6));
    texto(ctx, ch, x0 + i * 6, y0, col);
  });
}

export function dibujarTubos(ctx: CanvasRenderingContext2D, t: number): void {
  const periodo = t % 23000;
  const parpadeo = periodo > 22300 && Math.floor(periodo / 70) % 3 === 0;
  r(ctx, 99, 7, 76, 1, parpadeo ? D.gris_claro : P.fluorescente);
  r(ctx, 340, 74, 86, 1, P.fluorescente);
}

/** Motas de polvo que flotan en el haz del foco. */
export function dibujarPolvo(ctx: CanvasRenderingContext2D, t: number): void {
  for (let k = 0; k < 16; k++) {
    const fy = ((k * 37 + t / (60 + (k % 5) * 12)) % 140) / 140;
    const y = FOCO.y + 8 + fy * (FOCO.baseY - FOCO.y - 10);
    const semi = 6 + ((y - FOCO.y) / (FOCO.baseY - FOCO.y)) * FOCO.semiancho;
    const x = FOCO.x + Math.sin(t / 1500 + k * 1.7) * semi * 0.8;
    if ((Math.floor(t / 90) + k) % 5 === 0) continue;
    r(ctx, x, y, 1, 1, k % 3 ? '#FFF4D8' : '#F6DC7A');
  }
}

export function dibujarMosca(ctx: CanvasRenderingContext2D, t: number): void {
  const x = FOCO.x + Math.sin(t / 170) * 12 + Math.sin(t / 53) * 2;
  const y = FOCO.y + 12 + Math.cos(t / 230) * 5;
  r(ctx, x, y, 1, 1, P.tinta);
  if (Math.floor(t / 40) % 2) r(ctx, x - 1, y - 1, 1, 1, D.gris_claro);
}

export function dibujarVaho(ctx: CanvasRenderingContext2D, t: number): void {
  for (let k = 0; k < 4; k++) {
    const f = (((t / 900 + k / 4) % 1) + 1) % 1;
    const x = 430 + Math.sin(f * 6 + k) * 2;
    const y = BARRA_Y - 24 - f * 22;
    if (f < 0.85) r(ctx, x, y, 1, 1, 'rgba(234,234,224,0.7)');
  }
}

/** Luces de la caja superior de la tragaperras (ciclo de paleta). */
export function dibujarLucesTragaperras(ctx: CanvasRenderingContext2D, t: number, x: number, y: number): void {
  const colores = [P.copas, P.oros, P.neon, D.bastos_brillo];
  const fase = Math.floor(t / 160);
  for (let k = 0; k < 6; k++) r(ctx, x + 6 + k * 3, y + 7, 2, 2, colores[(k + fase) % colores.length]);
  for (let k = 0; k < 6; k++) r(ctx, x + 6 + k * 3, y + 13, 2, 2, colores[(k + fase + 2) % colores.length]);
}

/** Esquina inferior del cartel que ondea con la corriente de la puerta. */
export function dibujarEsquinaCartel(ctx: CanvasRenderingContext2D, t: number, x: number, y: number): void {
  const d = [1, 2, 3, 2][Math.floor(t / 700) % 4];
  for (let k = 0; k < d; k++) r(ctx, x - d + k, y - 1 - k, d - k, 1, '#CFC6B0');
  r(ctx, x - d, y - 1, 1, 1, P.tinta);
}
