// Arte procedural del interior de «Diego Pérez Bar» (480×270, vista frontal de aventura gráfica).
// Capa de fondo (pared, suelo, estanterías…), capa delantera (barra y taburetes) y un sprite por
// cada objeto interactivo, para poder resaltarlo con su silueta. Todo es placeholder dibujado en
// código: en el H7 se sustituye sprite a sprite por el arte de Aseprite.

import { texto } from '../core/bitmapFont';
import { DERIVADOS as D, PALETA as P, mezclar } from '../data/palette';
import { Pixeles } from '../render/pixel';
import { ALTO_BAR, ANCHO_BAR, FOCO, iluminar } from './luz';

export const SUELO_Y = 198;
export const ZOCALO_Y = 150;
export const BARRA_Y = 128;

/** Rojo apagado reservado a RASKA (provisional hasta que Diego pase su identidad). */
export const ROJO_RASKA = '#8C3B36';

function hash2(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Oscurece un rectángulo (sombras de objetos sobre el suelo o la pared), con tramado. */
function sombra(p: Pixeles, x0: number, y0: number, w: number, h: number, f = 0.72, trama = false): void {
  for (let y = Math.max(0, y0); y < Math.min(p.alto, y0 + h); y++)
    for (let x = Math.max(0, x0); x < Math.min(p.ancho, x0 + w); x++) {
      if (trama && (x + y) % 2) continue;
      const i = y * p.ancho + x;
      const v = p.datos[i];
      if (v >>> 24 === 0) continue;
      const r = (v & 255) * f;
      const g = ((v >>> 8) & 255) * f;
      const b = ((v >>> 16) & 255) * f;
      p.datos[i] = ((v & 0xff000000) | (Math.round(b) << 16) | (Math.round(g) << 8) | Math.round(r)) >>> 0;
    }
}

// ---------------------------------------------------------------------------
// Capa de fondo
// ---------------------------------------------------------------------------

function paredYTecho(p: Pixeles): void {
  p.rect(0, 0, ANCHO_BAR, SUELO_Y, P.pared);
  const veta = mezclar(P.pared, P.pared_sombra, 0.35);
  for (let y = 6; y < ZOCALO_Y; y++) for (let x = 0; x < ANCHO_BAR; x++) if (hash2(x, y) < 0.03) p.px(x, y, veta);
  // Manchas de humedad y de años de bar
  for (const [cx, cy, r] of [
    [96, 128, 9],
    [300, 22, 7],
    [178, 64, 5],
  ] as const)
    p.elipse(cx, cy, r, r * 0.7, veta, (x, y) => (x + y) % 2 === 0);
  // Techo: viga de madera
  p.rect(0, 0, ANCHO_BAR, 5, P.madera_osc);
  p.rect(0, 5, ANCHO_BAR, 1, P.negro);
  for (let x = 0; x < ANCHO_BAR; x += 60) p.rect(x, 0, 2, 5, D.madera_muy_osc);
}

function zocalo(p: Pixeles): void {
  for (let y = ZOCALO_Y + 3; y < SUELO_Y - 4; y++)
    for (let x = 0; x < ANCHO_BAR; x++) {
      const tx = Math.floor(x / 8);
      const ty = Math.floor((y - ZOCALO_Y - 3) / 8);
      const lx = x % 8;
      const ly = (y - ZOCALO_Y - 3) % 8;
      let c: string = (tx + ty) % 2 === 0 ? P.azulejo : P.azulejo_osc;
      if (lx === 7 || ly === 7) c = P.pared_sombra;
      else if ((lx === 1 && ly >= 1 && ly <= 2) || (ly === 1 && lx >= 1 && lx <= 2)) c = P.azulejo_brillo;
      p.px(x, y, c);
    }
  p.rect(0, ZOCALO_Y, ANCHO_BAR, 1, P.azulejo_osc);
  p.rect(0, ZOCALO_Y + 1, ANCHO_BAR, 1, P.azulejo_brillo);
  p.rect(0, ZOCALO_Y + 2, ANCHO_BAR, 1, P.azulejo_osc);
  // Rodapié
  p.rect(0, SUELO_Y - 4, ANCHO_BAR, 4, D.madera_muy_osc);
  p.rect(0, SUELO_Y - 4, ANCHO_BAR, 1, P.madera_osc);
}

/** Baldosa hidráulica en perspectiva: crema, terracota y gris, con junta oscura. */
function suelo(p: Pixeles): void {
  const horizonte = 108;
  const CREMA = '#CFC2A2';
  const TERRACOTA = '#9A5A3A';
  const GRIS = '#4A4A48';
  const JUNTA = '#3A2E26';
  for (let y = SUELO_Y; y < ALTO_BAR; y++) {
    const d = y - horizonte;
    const z = 1100 / d;
    for (let x = 0; x < ANCHO_BAR; x++) {
      const u = ((x - 240) / d) * 4;
      const fu = u - Math.floor(u);
      const fz = z - Math.floor(z);
      let c = CREMA;
      const m = Math.abs(fu - 0.5) + Math.abs(fz - 0.5);
      const esquina = Math.min(
        Math.hypot(fu, fz),
        Math.hypot(1 - fu, fz),
        Math.hypot(fu, 1 - fz),
        Math.hypot(1 - fu, 1 - fz),
      );
      if (esquina < 0.3) c = GRIS;
      else if (m < 0.2) c = TERRACOTA;
      else if (m > 0.3 && m < 0.36) c = TERRACOTA;
      if (fu < 0.05 || fz < 0.07) c = JUNTA;
      p.px(x, y, c);
    }
  }
}

function marcoPuerta(p: Pixeles): void {
  p.rect(4, 76, 48, SUELO_Y - 76, P.negro);
  p.rect(5, 77, 46, SUELO_Y - 77, P.madera_osc);
  // Campanilla sobre la puerta
  p.rect(27, 70, 2, 4, D.gris);
  p.elipse(28, 75, 3, 2.5, D.oros_osc);
  p.elipse(28, 74.5, 2, 1.8, P.oros);
}

function soporteTele(p: Pixeles): void {
  p.rect(44, 60, 8, 3, D.gris);
  p.rect(46, 63, 4, 8, D.gris);
  p.rect(42, 70, 12, 3, P.negro);
  p.rect(43, 70, 10, 2, D.gris);
}

function reloj(p: Pixeles): void {
  const cx = 104;
  const cy = 28;
  p.elipse(cx, cy, 8, 8, P.negro);
  p.elipse(cx, cy, 7, 7, P.madera);
  p.elipse(cx, cy, 5.5, 5.5, P.papel);
  for (let k = 0; k < 12; k += 3) {
    const a = (k / 12) * Math.PI * 2;
    p.px(cx + Math.sin(a) * 4.5, cy - Math.cos(a) * 4.5, P.tinta);
  }
}

/** Calendario de un taller inventado (sin marcas reales). */
function calendario(p: Pixeles): void {
  const x = 126;
  const y = 30;
  p.rect(x + 12, y - 3, 2, 3, D.gris);
  p.rect(x, y, 28, 40, P.negro);
  p.rect(x + 1, y + 1, 26, 38, P.papel);
  // Dibujo: un neumático y una llave inglesa
  p.elipse(x + 9, y + 10, 6, 6, P.tinta);
  p.elipse(x + 9, y + 10, 3, 3, D.gris);
  p.elipse(x + 9, y + 10, 1.2, 1.2, D.gris_claro);
  p.linea(x + 16, y + 15, x + 23, y + 6, D.gris);
  p.linea(x + 17, y + 15, x + 24, y + 6, D.gris_claro);
  p.rect(x + 1, y + 18, 26, 3, P.copas);
  p.rect(x + 4, y + 19, 12, 1, P.papel);
  // Cuadrícula de días
  for (let f = 0; f < 4; f++)
    for (let c = 0; c < 7; c++) p.px(x + 3 + c * 3.4, y + 24 + f * 4, f === 2 && c === 4 ? P.copas : D.gris);
  p.elipse(x + 16.6, y + 32, 2.5, 2, P.copas, (xx, yy) => (xx + yy) % 2 === 0);
}

function tuboFluorescente(p: Pixeles): void {
  p.rect(96, 5, 82, 3, D.gris);
  p.rect(96, 8, 82, 1, P.negro);
  p.rect(97, 6, 2, 5, P.negro);
  p.rect(175, 6, 2, 5, P.negro);
}

function lamparaFoco(p: Pixeles): void {
  // Foco de carril sobre el cartel
  p.rect(FOCO.x - 10, 5, 20, 2, P.negro);
  p.poligono(
    [
      [FOCO.x - 5, 6],
      [FOCO.x + 5, 6],
      [FOCO.x + 7, 12],
      [FOCO.x - 7, 12],
    ],
    P.negro,
  );
  p.poligono(
    [
      [FOCO.x - 4, 6],
      [FOCO.x + 4, 6],
      [FOCO.x + 6, 11],
      [FOCO.x - 6, 11],
    ],
    D.gris,
  );
  p.rect(FOCO.x - 5, 11, 10, 1, P.fluorescente);
}

function perchero(p: Pixeles): void {
  const x = 81;
  p.rect(x - 1, 92, 3, SUELO_Y - 94, P.negro);
  p.rect(x, 92, 1, SUELO_Y - 94, P.madera_clara);
  p.elipse(x + 0.5, 91, 3, 2.5, P.negro);
  p.elipse(x + 0.5, 91, 2, 1.5, P.madera_clara);
  // Ganchos
  p.linea(x - 1, 96, x - 9, 93, P.negro);
  p.linea(x + 1, 96, x + 11, 93, P.negro);
  p.px(x - 9, 92, P.negro);
  p.px(x + 11, 92, P.negro);
  // Patas
  p.linea(x, SUELO_Y - 6, x - 10, SUELO_Y + 2, P.negro);
  p.linea(x + 1, SUELO_Y - 6, x + 11, SUELO_Y + 2, P.negro);
  p.linea(x, SUELO_Y - 6, x, SUELO_Y + 4, P.negro);
  p.linea(x - 1, SUELO_Y - 5, x - 9, SUELO_Y + 1, P.madera_clara);
  p.linea(x + 2, SUELO_Y - 5, x + 10, SUELO_Y + 1, P.madera_clara);
}

/** Revistero de madera con revistas de títulos inventados (PUNKETA va aparte: es un objeto). */
function revistero(p: Pixeles): void {
  const x = 116;
  const w = 60;
  p.rect(x, 104, w, SUELO_Y - 104, P.negro);
  p.rect(x + 1, 105, w - 2, SUELO_Y - 106, P.madera_osc);
  p.rect(x + 1, 105, 3, SUELO_Y - 106, P.madera);
  p.rect(x + w - 4, 105, 3, SUELO_Y - 106, P.madera);
  const portadas = [
    ['#2F58A8', '#EAEAE0'],
    ['#3E7C2C', '#E2B227'],
    ['#E2B227', '#1A1410'],
    ['#6E6E68', '#F1E6C8'],
    ['#5B3A78', '#EAEAE0'],
    ['#B3262E', '#F1E6C8'],
    ['#F1E6C8', '#2F58A8'],
    ['#1F5C4A', '#F6DC7A'],
  ];
  const balda = (yb: number, anchoRev: number, altoRev: number, xs: number[], k0: number) => {
    xs.forEach((rx, k) => {
      const [fondo, rotulo] = portadas[(k + k0) % portadas.length];
      const ry = yb - altoRev;
      p.rect(rx, ry, anchoRev, altoRev, P.negro);
      p.rect(rx + 1, ry + 1, anchoRev - 2, altoRev - 2, fondo);
      p.rect(rx + 2, ry + 2, anchoRev - 4, 3, rotulo);
      p.rect(rx + 3, ry + 8, anchoRev - 6, altoRev - 12, mezclar(fondo, rotulo, 0.35));
    });
    // Listón de la balda
    p.rect(x + 1, yb, w - 2, 3, P.madera_clara);
    p.rect(x + 1, yb + 3, w - 2, 1, P.negro);
  };
  balda(124, 14, 18, [x + 5, x + 22, x + 39], 0);
  balda(150, 14, 22, [x + 4, x + 42], 3); // en medio, PUNKETA
  balda(178, 16, 22, [x + 5, x + 23, x + 40], 5);
  // Base
  p.rect(x + 1, 182, w - 2, SUELO_Y - 183, P.madera);
}

function sombraCartel(p: Pixeles): void {
  sombra(p, 191, 21, 104, 134, 0.6, true);
}

/** Barra por detrás: panel, espejo, baldas con botellas y el hueco del rótulo de neón. */
function contrabarra(p: Pixeles): void {
  const x0 = 318;
  const x1 = 448;
  p.rect(x0, 20, x1 - x0, BARRA_Y - 20, P.negro);
  p.rect(x0 + 1, 21, x1 - x0 - 2, BARRA_Y - 21, P.madera_osc);
  // Espejo tras las botellas
  p.rect(x0 + 6, 24, x1 - x0 - 12, 38, '#2C3A40');
  for (let k = 0; k < 6; k++) p.linea(x0 + 14 + k * 20, 60, x0 + 26 + k * 20, 26, '#3F5159');
  // Baldas
  const baldas = [42, 64];
  for (const by of baldas) {
    p.rect(x0 + 2, by, x1 - x0 - 4, 2, P.madera_clara);
    p.rect(x0 + 2, by + 2, x1 - x0 - 4, 1, D.madera_muy_osc);
  }
  const colores = [
    P.bastos,
    D.copas_osc,
    P.oros,
    D.espadas_osc,
    P.papel,
    D.bastos_osc,
    D.gris,
    P.madera_clara,
    D.oros_osc,
  ];
  // Balda de arriba: botellas (a la derecha va la radio)
  for (let k = 0; k < 15; k++) {
    const bx = x0 + 6 + k * 6;
    if (bx > 410) break;
    const c = colores[k % colores.length];
    const alto = 9 + (k % 3) * 2;
    p.rect(bx, 42 - alto, 4, alto, c);
    p.rect(bx + 1, 42 - alto - 3, 2, 3, c);
    p.rect(bx + 1, 42 - alto - 4, 2, 1, P.negro);
    p.px(bx, 42 - alto + 2, D.blanco);
    p.rect(bx, 42 - alto + 4, 4, 3, k % 2 ? P.papel : D.gris_claro);
  }
  // Balda de abajo: vasos, copas y alguna botella
  for (let k = 0; k < 18; k++) {
    const bx = x0 + 5 + k * 7;
    if (k % 4 === 3) {
      const c = colores[(k * 5) % colores.length];
      p.rect(bx, 52, 4, 12, c);
      p.rect(bx + 1, 49, 2, 3, c);
      p.px(bx, 54, D.blanco);
    } else {
      p.rect(bx, 57, 5, 7, D.gris_claro);
      p.rect(bx + 1, 58, 3, 5, '#9FB5BA');
      p.rect(bx, 57, 5, 1, D.blanco);
    }
  }
  // Tubo de luz sobre la barra
  p.rect(x0 + 20, 74, 90, 2, D.gris);
}

function servilletasSuelo(p: Pixeles): void {
  for (const [x, y] of [
    [300, 206],
    [308, 211],
    [262, 224],
    [196, 203],
  ] as const) {
    p.rect(x, y, 4, 3, D.blanco);
    p.px(x + 1, y + 1, D.gris_claro);
    p.px(x + 3, y, D.gris_claro);
  }
  // Palillos
  p.linea(290, 214, 294, 213, P.barniz);
  p.linea(214, 208, 217, 210, P.barniz);
}

let fondo: HTMLCanvasElement | null = null;

export function capaFondo(): HTMLCanvasElement {
  if (fondo) return fondo;
  const p = new Pixeles(ANCHO_BAR, ALTO_BAR);
  paredYTecho(p);
  zocalo(p);
  suelo(p);
  marcoPuerta(p);
  soporteTele(p);
  reloj(p);
  calendario(p);
  tuboFluorescente(p);
  lamparaFoco(p);
  sombraCartel(p);
  perchero(p);
  revistero(p);
  contrabarra(p);
  servilletasSuelo(p);
  // Sombras sobre el suelo: barra, revistero, perchero y mesa de mus
  sombra(p, 312, SUELO_Y, 140, 8, 0.7);
  sombra(p, 112, SUELO_Y, 68, 5, 0.75);
  sombra(p, 70, SUELO_Y, 24, 3, 0.8);
  sombra(p, 330, 212, 150, 20, 0.8, true);
  iluminar(p, 0, 0);
  fondo = p.aCanvas();
  return fondo;
}

// ---------------------------------------------------------------------------
// Capa delantera: la barra (tapa a Diego de cintura para abajo) y los taburetes
// ---------------------------------------------------------------------------

function barra(p: Pixeles): void {
  const x0 = 316;
  const x1 = 446;
  // Tapa
  p.rect(x0 - 2, BARRA_Y, x1 - x0 + 4, 6, P.negro);
  p.rect(x0 - 1, BARRA_Y, x1 - x0 + 2, 4, P.barniz);
  p.rect(x0 - 1, BARRA_Y, x1 - x0 + 2, 1, D.oros_brillo);
  // Frente de madera con cuarterones
  p.rect(x0, BARRA_Y + 5, x1 - x0, SUELO_Y - 4 - BARRA_Y - 5, P.madera);
  p.rect(x0, BARRA_Y + 5, 1, SUELO_Y - BARRA_Y - 9, P.negro);
  p.rect(x1 - 1, BARRA_Y + 5, 1, SUELO_Y - BARRA_Y - 9, P.negro);
  for (let bx = x0 + 6; bx < x1 - 12; bx += 21) {
    p.rect(bx, BARRA_Y + 12, 16, 36, P.madera_osc);
    p.rect(bx + 1, BARRA_Y + 13, 14, 34, P.madera_clara);
    p.rect(bx + 1, BARRA_Y + 13, 14, 1, P.barniz);
  }
  // Reposapiés de latón
  p.rect(x0 + 2, 184, x1 - x0 - 4, 2, D.oros_osc);
  p.rect(x0 + 2, 184, x1 - x0 - 4, 1, P.oros);
  for (let bx = x0 + 10; bx < x1; bx += 40) p.rect(bx, 186, 1, 6, D.oros_osc);
  p.rect(x0, SUELO_Y - 6, x1 - x0, 2, D.madera_muy_osc);
  // Sobre la barra: palillero, servilletero, vitrina con tortilla y grifo de cerveza
  p.rect(326, BARRA_Y - 6, 4, 6, P.negro);
  p.rect(327, BARRA_Y - 5, 2, 5, P.madera_clara);
  p.px(327, BARRA_Y - 8, P.barniz);
  p.px(328, BARRA_Y - 7, P.barniz);
  p.rect(336, BARRA_Y - 7, 9, 7, D.gris);
  p.rect(337, BARRA_Y - 9, 7, 3, D.blanco);
  p.rect(337, BARRA_Y - 6, 7, 5, D.gris_claro);
  // Vitrina
  p.rect(352, BARRA_Y - 14, 26, 14, P.negro);
  p.rect(353, BARRA_Y - 13, 24, 13, '#A8C4C8');
  p.rect(353, BARRA_Y - 13, 24, 1, D.blanco);
  p.elipse(365, BARRA_Y - 4, 8, 2.5, D.blanco);
  p.elipse(365, BARRA_Y - 5, 6, 2.5, P.oros);
  p.px(362, BARRA_Y - 6, D.oros_osc);
  p.px(367, BARRA_Y - 5, D.oros_osc);
  p.linea(355, BARRA_Y - 12, 357, BARRA_Y - 10, D.blanco);
  // Grifo
  p.rect(408, BARRA_Y - 18, 3, 18, D.gris_claro);
  p.rect(405, BARRA_Y - 20, 9, 3, P.negro);
  p.rect(406, BARRA_Y - 26, 7, 6, P.oros);
  p.rect(406, BARRA_Y - 26, 7, 1, D.oros_brillo);
  p.rect(410, BARRA_Y - 16, 4, 2, D.gris);
  // Cafetera
  p.rect(420, BARRA_Y - 22, 24, 22, P.negro);
  p.rect(421, BARRA_Y - 21, 22, 20, D.gris_claro);
  p.rect(421, BARRA_Y - 21, 22, 4, P.copas);
  p.rect(424, BARRA_Y - 12, 4, 4, P.tinta);
  p.rect(436, BARRA_Y - 12, 4, 4, P.tinta);
  p.rect(425, BARRA_Y - 4, 3, 3, P.papel);
  p.px(431, BARRA_Y - 15, P.bastos);
}

function taburete(p: Pixeles, cx: number): void {
  p.rect(cx - 1, 160, 3, 34, P.negro);
  p.rect(cx, 160, 1, 34, D.gris_claro);
  p.elipse(cx + 0.5, 179, 7, 2, P.negro, (_x, y) => y >= 178);
  p.elipse(cx + 0.5, 194, 8, 2.5, P.negro);
  p.elipse(cx + 0.5, 193.5, 7, 1.8, D.gris);
  p.elipse(cx + 0.5, 157, 10, 4, P.negro);
  p.elipse(cx + 0.5, 156.5, 9, 3, '#3E5E3A');
  p.elipse(cx - 2, 155.5, 4, 1.2, '#6F9A62');
}

let delante: HTMLCanvasElement | null = null;

export function capaDelante(): HTMLCanvasElement {
  if (delante) return delante;
  const p = new Pixeles(ANCHO_BAR, ALTO_BAR);
  barra(p);
  for (const cx of [332, 372, 412]) taburete(p, cx);
  iluminar(p, 0, 0);
  delante = p.aCanvas();
  return delante;
}

// ---------------------------------------------------------------------------
// Objetos interactivos (un sprite cada uno, sin iluminar: la escena los ilumina en su sitio)
// ---------------------------------------------------------------------------

/** Pantalla de la tele en coordenadas de escena (el vídeo se dibuja en vivo). */
export const PANTALLA_TV = { x: 20, y: 16, w: 48, h: 38 };

export function spriteTele(): Pixeles {
  const p = new Pixeles(70, 58);
  // Antena de cuernos
  p.linea(34, 8, 24, 0, P.negro);
  p.linea(36, 8, 46, 1, P.negro);
  p.elipse(35, 8, 3, 2, P.negro);
  // Carcasa de madera
  p.rect(0, 8, 70, 50, P.negro);
  p.rect(1, 9, 68, 48, P.madera);
  p.rect(1, 9, 68, 1, P.madera_clara);
  p.rect(1, 56, 68, 1, P.madera_osc);
  // Marco de la pantalla
  p.rect(4, 12, 52, 42, P.negro);
  p.rect(5, 13, 50, 40, '#2A2A2A');
  p.rect(6, 14, 48, 38, '#1D2622');
  for (const [x, y] of [
    [6, 14],
    [53, 14],
    [6, 51],
    [53, 51],
  ])
    p.px(x, y, '#2A2A2A');
  // Mandos y altavoz
  p.rect(58, 12, 9, 42, P.madera_osc);
  for (const cy of [18, 30]) {
    p.elipse(62.5, cy, 3.5, 3.5, P.negro);
    p.elipse(62.5, cy, 2.5, 2.5, D.gris_claro);
    p.px(62, cy - 2, P.tinta);
  }
  for (let y = 38; y < 52; y += 2) p.rect(59, y, 7, 1, D.madera_muy_osc);
  p.px(62, 36, P.copas);
  return p;
}

export function spritePerchaA(): Pixeles {
  // Abrigo negro de R3UP con la etiqueta del monograma.
  const p = new Pixeles(24, 58);
  p.linea(12, 0, 12, 3, D.gris_claro);
  p.px(11, 0, D.gris_claro);
  p.linea(3, 7, 12, 3, P.madera_clara);
  p.linea(21, 7, 12, 3, P.madera_clara);
  const negro = '#24242A';
  const gris = '#3A3A44';
  p.poligono(
    [
      [3, 7],
      [21, 7],
      [23, 56],
      [1, 56],
    ],
    P.negro,
  );
  p.poligono(
    [
      [4, 8],
      [20, 8],
      [22, 55],
      [2, 55],
    ],
    negro,
  );
  // Solapas y cierre
  p.linea(8, 8, 12, 24, gris);
  p.linea(16, 8, 12, 24, gris);
  p.linea(12, 24, 12, 54, P.negro);
  p.px(10, 30, gris);
  p.px(10, 38, gris);
  // Mangas
  p.rect(2, 12, 3, 34, P.negro);
  p.rect(19, 12, 3, 34, P.negro);
  p.rect(3, 12, 1, 33, gris);
  // Etiqueta roja del monograma
  p.rect(15, 14, 4, 3, P.copas);
  p.px(16, 15, P.papel);
  // Bolsillos
  p.rect(5, 40, 5, 1, gris);
  p.rect(14, 40, 5, 1, gris);
  return p;
}

export function spritePerchaB(): Pixeles {
  // Camiseta serigrafiada de SPIFY AF.
  const p = new Pixeles(28, 36);
  p.linea(14, 0, 14, 3, D.gris_claro);
  p.px(13, 0, D.gris_claro);
  p.linea(4, 7, 14, 3, P.madera_clara);
  p.linea(24, 7, 14, 3, P.madera_clara);
  const blanco = '#E9E4D8';
  p.poligono(
    [
      [6, 6],
      [22, 6],
      [28, 11],
      [25, 17],
      [22, 15],
      [22, 35],
      [6, 35],
      [6, 15],
      [3, 17],
      [0, 11],
    ],
    P.negro,
  );
  p.poligono(
    [
      [7, 7],
      [21, 7],
      [26, 11],
      [24, 15],
      [21, 13],
      [21, 34],
      [7, 34],
      [7, 13],
      [4, 15],
      [2, 11],
    ],
    blanco,
  );
  p.rect(11, 7, 6, 2, D.papel_sombra);
  // Estampado: bloque negro con trazos rojos
  p.rect(9, 14, 10, 12, P.tinta);
  p.linea(10, 24, 17, 16, P.copas);
  p.linea(10, 22, 15, 16, P.copas);
  p.rect(11, 17, 2, 2, blanco);
  p.rect(9, 28, 10, 1, P.tinta);
  return p;
}

export function spritePunketa(): Pixeles {
  const p = new Pixeles(18, 24);
  p.rect(0, 0, 18, 24, P.negro);
  p.rect(1, 1, 16, 22, '#C2307A');
  p.poligono(
    [
      [1, 16],
      [17, 6],
      [17, 11],
      [1, 21],
    ],
    '#E6D93A',
  );
  p.rect(1, 1, 16, 5, P.tinta);
  for (let k = 0; k < 7; k++) p.px(3 + k * 2, 3, '#E6D93A');
  p.rect(4, 8, 6, 6, P.tinta);
  p.rect(5, 9, 4, 4, '#E08BB8');
  return p;
}

/** Cartel de RASKA. Placeholder «respetuoso»: pimienta que huye de una gota de jabón, trazos a mano. */
export function spriteRaska(): Pixeles {
  const W = 104;
  const H = 134;
  const p = new Pixeles(W, H);
  const papel = '#ECE4D0';
  // Bordes algo rotos
  p.rect(0, 0, W, H, P.negro);
  p.rect(1, 1, W - 2, H - 2, papel);
  for (let k = 0; k < 40; k++) {
    const t = hash2(k, 5);
    const lado = k % 4;
    const pos = Math.floor(t * (lado % 2 ? H : W));
    if (lado === 0) p.borrar(pos, 0);
    else if (lado === 1) p.borrar(W - 1, pos);
    else if (lado === 2) p.borrar(pos, H - 1);
    else p.borrar(0, pos);
  }
  // Pimienta en agua con una gota de jabón: hueco limpio en el centro y motas que se alejan.
  const cx = 52;
  const cy = 66;
  for (let k = 0; k < 900; k++) {
    const a = hash2(k, 1) * Math.PI * 2;
    const r = 17 + Math.pow(hash2(k, 2), 0.55) * 34;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r * 0.95;
    if (x < 3 || x > W - 4 || y < 26 || y > 108) continue;
    p.px(x, y, hash2(k, 3) < 0.18 ? ROJO_RASKA : P.tinta);
    if (hash2(k, 4) < 0.2) p.px(x + 1, y, P.tinta);
  }
  // Borde de la gota
  for (let k = 0; k < 60; k++) {
    const a = (k / 60) * Math.PI * 2;
    p.px(cx + Math.cos(a) * 16, cy + Math.sin(a) * 15, k % 3 ? P.tinta : ROJO_RASKA);
  }
  // Trazos manuales en rojo apagado
  for (let s = 0; s < 3; s++) {
    let x = 12 + s * 30;
    let y = 104 - s * 3;
    for (let k = 0; k < 26; k++) {
      p.rect(x, y, 2, 2, ROJO_RASKA);
      x += 1 + hash2(s, k) * 1.4;
      y -= (hash2(k, s) - 0.35) * 2.2;
    }
  }
  // Franja inferior para el texto
  p.rect(6, 109, W - 12, 1, P.tinta);
  return p;
}

/** Textos del cartel (se dibujan sobre el sprite ya iluminado). */
export function textosRaska(ctx: CanvasRenderingContext2D, titulo: string, subtitulo: string): void {
  texto(ctx, titulo, 52, 8, P.tinta, { negrita: true, escala: 2, alinear: 'centro' });
  texto(ctx, subtitulo, 52, 114, ROJO_RASKA, { alinear: 'centro' });
  // Pegatina de tiza «NUEVO» en la esquina
  ctx.fillStyle = P.negro;
  ctx.fillRect(62, 123, 38, 10);
  ctx.fillStyle = P.tiza;
  ctx.fillRect(63, 124, 36, 8);
  texto(ctx, 'NUEVO', 81, 125, P.tinta, { alinear: 'centro' });
  // Chincheta
  ctx.fillStyle = P.negro;
  ctx.fillRect(50, 1, 5, 4);
  ctx.fillStyle = P.oros;
  ctx.fillRect(51, 1, 3, 3);
  ctx.fillStyle = D.oros_brillo;
  ctx.fillRect(51, 1, 1, 1);
}

export function spriteTelefono(): Pixeles {
  const p = new Pixeles(22, 36);
  const cuerpo = '#3C4A44';
  p.rect(4, 0, 18, 32, P.negro);
  p.rect(5, 1, 16, 30, cuerpo);
  p.rect(5, 1, 16, 1, '#5E7068');
  // Ranura de monedas y teclado
  p.rect(16, 4, 3, 1, P.oros);
  for (let f = 0; f < 4; f++) for (let c = 0; c < 3; c++) p.px(9 + c * 3, 10 + f * 3, D.gris_claro);
  p.rect(8, 24, 10, 4, D.tele_osc);
  p.rect(9, 25, 3, 1, P.neon);
  // Auricular colgado a la izquierda
  p.rect(0, 3, 5, 22, P.negro);
  p.rect(1, 4, 3, 20, P.tinta);
  p.rect(0, 3, 6, 3, P.negro);
  p.rect(0, 22, 6, 3, P.negro);
  // Cable en espiral
  for (let y = 25; y < 35; y += 2) p.px(2 + ((y / 2) % 2), y, P.negro);
  return p;
}

export function spriteRadio(): Pixeles {
  const p = new Pixeles(26, 14);
  p.rect(0, 2, 26, 12, P.negro);
  p.rect(1, 3, 24, 10, '#8A5A30');
  p.rect(1, 3, 24, 1, P.madera_clara);
  // Altavoz
  for (let y = 5; y < 12; y += 2) p.rect(3, y, 9, 1, P.madera_osc);
  // Dial
  p.rect(14, 5, 9, 4, P.papel);
  p.px(18, 6, P.copas);
  p.elipse(16, 11, 1.5, 1.5, P.tinta);
  p.elipse(21, 11, 1.5, 1.5, P.tinta);
  // Asa y antena
  p.rect(6, 0, 14, 1, P.negro);
  p.rect(6, 0, 1, 3, P.negro);
  p.rect(19, 0, 1, 3, P.negro);
  return p;
}

export function spritePizarra(): Pixeles {
  const p = new Pixeles(50, 40);
  p.rect(0, 0, 50, 40, P.negro);
  p.rect(1, 1, 48, 38, P.madera);
  p.rect(1, 1, 48, 1, P.madera_clara);
  p.rect(3, 3, 44, 34, P.pizarra);
  for (let k = 0; k < 50; k++) p.px(4 + hash2(k, 9) * 42, 4 + hash2(k, 8) * 32, D.pizarra_clara);
  return p;
}

export function textosPizarra(ctx: CanvasRenderingContext2D): void {
  texto(ctx, 'MENÚ', 25, 5, P.tiza, { alinear: 'centro', variante: 'tiza' });
  texto(ctx, 'DEL DÍA', 25, 14, P.tiza, { alinear: 'centro', variante: 'tiza' });
  ctx.fillStyle = P.tiza_sombra;
  for (let k = 0; k < 3; k++) ctx.fillRect(8, 25 + k * 4, 18 + ((k * 7) % 12), 1);
  ctx.fillRect(36, 25, 6, 1);
  ctx.fillRect(36, 29, 6, 1);
}

export function spriteTragaperras(): Pixeles {
  const p = new Pixeles(32, 102);
  // Mueble
  p.rect(0, 0, 30, 102, P.negro);
  p.rect(1, 1, 28, 100, '#5B3A78');
  p.rect(1, 1, 28, 2, '#8A66A8');
  // Caja de luces arriba
  p.rect(3, 4, 24, 14, P.negro);
  p.rect(4, 5, 22, 12, P.oros);
  // Ventana de los rodillos
  p.rect(3, 24, 24, 16, P.negro);
  p.rect(4, 25, 22, 14, P.papel);
  p.rect(10, 25, 1, 14, P.negro);
  p.rect(17, 25, 1, 14, P.negro);
  // Botones y ranura
  p.rect(5, 46, 5, 3, P.copas);
  p.rect(12, 46, 5, 3, P.bastos);
  p.rect(19, 46, 5, 3, P.oros);
  p.rect(12, 54, 6, 2, P.tinta);
  // Bandeja
  p.rect(4, 82, 22, 8, P.negro);
  p.rect(5, 83, 20, 6, D.gris);
  // Palanca
  p.rect(29, 34, 2, 16, D.gris_claro);
  p.elipse(30.5, 32, 2, 2, P.copas);
  return p;
}

export function spriteMesa(): Pixeles {
  // Mesa de mus en primer plano: tapete verde, baraja, cuenco de piedras y dos sillas.
  const W = 150;
  const H = 70;
  const p = new Pixeles(W, H);
  // Silla izquierda (respaldo, en primer plano)
  const silla = (x: number) => {
    p.rect(x, 34, 3, 36, P.negro);
    p.rect(x + 17, 34, 3, 36, P.negro);
    p.rect(x, 34, 20, 4, P.negro);
    p.rect(x + 1, 35, 18, 2, P.madera_clara);
    p.rect(x + 1, 44, 18, 3, P.negro);
    p.rect(x + 1, 45, 18, 1, P.madera);
    p.rect(x + 1, 38, 1, 32, P.madera);
    p.rect(x + 18, 38, 1, 32, P.madera);
  };
  // Tablero en perspectiva
  const top = 10;
  const bottom = 52;
  for (let y = top; y <= bottom; y++) {
    const t = (y - top) / (bottom - top);
    const xa = Math.round(20 - t * 18);
    for (let x = xa; x < W; x++) p.px(x, y, P.negro);
  }
  for (let y = top + 1; y <= bottom - 3; y++) {
    const t = (y - top) / (bottom - top);
    const xa = Math.round(21 - t * 18);
    for (let x = xa; x < W; x++) p.px(x, y, P.madera);
  }
  for (let y = top + 4; y <= bottom - 7; y++) {
    const t = (y - top) / (bottom - top);
    const xa = Math.round(25 - t * 18);
    for (let x = xa; x < W - 2; x++) p.px(x, y, (x + y) % 7 === 0 ? D.bastos_osc : '#2F5E28');
  }
  p.rect(2, bottom - 2, W - 2, 2, P.madera_osc);
  // Patas
  p.rect(6, bottom, 4, H - bottom, P.negro);
  p.rect(7, bottom, 2, H - bottom, P.madera_osc);
  // Baraja (dorsos granates) y cartas sueltas
  p.rect(48, 18, 12, 9, P.negro);
  p.rect(49, 18, 10, 7, D.copas_osc);
  p.rect(49, 18, 10, 1, P.copas);
  p.rect(50, 20, 8, 3, P.copas);
  for (const [x, y] of [
    [66, 28],
    [72, 27],
  ]) {
    p.rect(x, y, 7, 10, P.negro);
    p.rect(x + 1, y + 1, 5, 8, D.blanco);
    p.px(x + 3, y + 4, P.oros);
  }
  // Cuenco de piedras
  p.elipse(100, 26, 11, 5, P.negro);
  p.elipse(100, 25.5, 10, 4, D.copas_osc);
  p.elipse(100, 24.5, 8, 2.5, P.copas);
  for (let k = 0; k < 7; k++) p.px(94 + k * 2, 24 + (k % 2), D.gris_claro);
  for (const [x, y] of [
    [116, 32],
    [120, 30],
    [85, 34],
  ])
    p.rect(x, y, 2, 2, D.gris_claro);
  silla(24);
  silla(118);
  return p;
}

export function spritePuerta(): Pixeles {
  const W = 40;
  const H = 118;
  const p = new Pixeles(W, H);
  p.rect(0, 0, W, H, P.madera);
  p.rect(W - 2, 0, 2, H, D.madera_muy_osc);
  // Cristal: la calle de noche
  p.rect(4, 5, W - 9, 38, P.negro);
  p.rect(5, 6, W - 11, 36, '#1B2440');
  p.rect(5, 26, W - 11, 16, '#232A3C');
  p.rect(8, 18, 8, 24, '#101624');
  p.rect(18, 22, 10, 20, '#101624');
  for (const [x, y] of [
    [10, 22],
    [13, 28],
    [21, 26],
    [24, 32],
  ])
    p.rect(x, y, 2, 2, '#E2B227');
  p.elipse(26, 12, 4, 4, '#3A3A2A', (x, y) => (x + y) % 2 === 0);
  p.rect(25, 10, 3, 3, '#F6DC7A');
  p.rect(5, 6, 1, 36, '#2C3654');
  // Cartel colgado (se ve del revés desde dentro)
  p.linea(12, 6, 16, 12, D.gris);
  p.linea(24, 6, 20, 12, D.gris);
  p.rect(11, 12, 14, 6, P.papel);
  p.rect(12, 14, 12, 2, P.bastos);
  // Cuarterones
  for (const y of [50, 82]) {
    p.rect(4, y, W - 9, 26, P.madera_osc);
    p.rect(5, y + 1, W - 11, 24, P.madera_clara);
    p.rect(5, y + 1, W - 11, 1, P.barniz);
  }
  // Pomo
  p.rect(W - 8, 64, 3, 4, P.oros);
  p.px(W - 8, 64, D.oros_brillo);
  return p;
}
