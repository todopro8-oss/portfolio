// Diego, el camarero (PROMPT_BAR, sección 9). Placeholder procedural de cintura para arriba
// (44×64) hasta que lleguen sus fotos de referencia. Trajina detrás de la barra, mira hacia el
// cursor, saluda, señala lo que se ha pulsado y habla.

import { DERIVADOS as D, PALETA as P, mezclar } from '../data/palette';
import { Pixeles } from '../render/pixel';
import { iluminar } from './luz';

export const DIEGO_W = 44;
export const DIEGO_H = 64;
/** Posición en la escena: la barra (y = 128) le tapa por debajo. */
export const DIEGO_X = 372;
export const DIEGO_Y = 64;

export type TareaDiego = 'quieto' | 'limpiar' | 'secar' | 'cana' | 'saludar' | 'senalar' | 'hablar';

const PIEL = mezclar(P.piel_1, P.piel_2, 0.35);
const PIEL_S = mezclar(P.piel_2, P.piel_3, 0.25);
const PELO = '#1C1511';
const PELO_L = '#3D2A1E';
const CAMISETA = '#2A2C33';
const DELANTAL = '#E6DAC0';
const DELANTAL_S = '#BFAF8C';

interface Pose {
  tarea: TareaDiego;
  /** Fotograma de la animación (0-1). */
  f: number;
  /** Mirada: -1 izquierda, 0 frente, 1 derecha. */
  mirada: -1 | 0 | 1;
  parpadeo: boolean;
  /** Boca: 0 cerrada, 1 entreabierta, 2 abierta. */
  boca: 0 | 1 | 2;
  /** Hacia dónde señala (-1 izquierda, 1 derecha). */
  lado: -1 | 1;
}

function dibujar(pose: Pose): Pixeles {
  const p = new Pixeles(DIEGO_W, DIEGO_H);
  const cx = 22;
  const respira = pose.tarea === 'quieto' || pose.tarea === 'hablar' ? pose.f : 0;
  // --- Torso: camiseta oscura y delantal de peto ---
  const ty = 30 + respira;
  p.elipse(cx, ty + 30, 17, 30, P.negro);
  p.elipse(cx, ty + 30, 16, 29, CAMISETA);
  p.rect(cx - 9, ty + 6, 18, 40, P.negro);
  p.rect(cx - 8, ty + 7, 16, 40, DELANTAL);
  p.rect(cx - 8, ty + 7, 1, 40, DELANTAL_S);
  p.rect(cx - 2, ty + 14, 5, 4, DELANTAL_S); // bolsillo
  p.linea(cx - 8, ty + 7, cx - 5, ty - 1, DELANTAL_S); // tiras al cuello
  p.linea(cx + 7, ty + 7, cx + 4, ty - 1, DELANTAL_S);
  // --- Cuello y cabeza ---
  const hx = cx + pose.mirada;
  p.rect(hx - 3, 23, 7, 8, PIEL_S);
  p.elipse(hx, 15, 8, 10, P.negro);
  p.elipse(hx, 15, 7, 9, PIEL);
  // Orejas
  p.rect(hx - 8, 14, 2, 4, PIEL_S);
  p.rect(hx + 7, 14, 2, 4, PIEL_S);
  // Pelo rizado y oscuro, con volumen arriba
  p.elipse(hx, 7, 9, 6, PELO, (_x, y) => y <= 9);
  for (let k = 0; k < 14; k++) {
    const a = Math.PI + (k / 13) * Math.PI;
    const rx = hx + Math.cos(a) * 8.5;
    const ry = 7 + Math.sin(a) * 6;
    p.elipse(rx, ry, 2.2, 2, PELO);
    if (k % 3 === 0) p.px(rx, ry - 1, PELO_L);
  }
  p.rect(hx - 8, 8, 2, 5, PELO);
  p.rect(hx + 7, 8, 2, 5, PELO);
  p.px(hx - 3, 5, PELO_L);
  p.px(hx + 2, 4, PELO_L);
  p.px(hx + 4, 6, PELO_L);
  // Cejas
  const ojo = pose.mirada;
  p.rect(hx - 5, 12, 4, 1, PELO);
  p.rect(hx + 2, 12, 4, 1, PELO);
  // Ojos
  if (pose.parpadeo) {
    p.rect(hx - 4, 15, 3, 1, PIEL_S);
    p.rect(hx + 2, 15, 3, 1, PIEL_S);
  } else {
    p.rect(hx - 4, 14, 3, 2, D.blanco);
    p.rect(hx + 2, 14, 3, 2, D.blanco);
    p.rect(hx - 3 + ojo, 14, 1, 2, P.tinta);
    p.rect(hx + 3 + ojo, 14, 1, 2, P.tinta);
  }
  // Nariz
  p.px(hx, 17, PIEL_S);
  p.px(hx + 1, 18, PIEL_S);
  // Bigote fino y perilla
  p.rect(hx - 2, 20, 5, 1, PELO);
  p.rect(hx - 1, 24, 3, 2, PELO);
  p.px(hx - 2, 23, PELO);
  p.px(hx + 2, 23, PELO);
  // Boca
  if (pose.boca === 0) p.rect(hx - 1, 22, 3, 1, D.rojo_labios);
  else if (pose.boca === 1) p.rect(hx - 1, 22, 3, 1, P.tinta);
  else {
    p.rect(hx - 1, 21, 3, 2, P.tinta);
    p.px(hx, 22, D.lengua);
  }
  // --- Brazos según la tarea ---
  const brazo = (x0: number, y0: number, x1: number, y1: number) => {
    for (let k = -1; k <= 1; k++) p.linea(x0 + k, y0, x1 + k, y1, P.negro);
    p.linea(x0, y0, x1, y1, CAMISETA);
    p.elipse(x1, y1, 2.5, 2.5, P.negro);
    p.elipse(x1, y1, 1.8, 1.8, PIEL);
  };
  const hi = { x: cx - 14, y: ty + 2 }; // hombro izquierdo
  const hd = { x: cx + 14, y: ty + 2 }; // hombro derecho
  const f = pose.f;
  switch (pose.tarea) {
    case 'limpiar': {
      const tx = cx - 6 + (f ? 8 : 0);
      brazo(hi.x, hi.y, tx - 4, 58);
      brazo(hd.x, hd.y, tx + 6, 58);
      p.rect(tx - 5, 58, 12, 4, P.negro);
      p.rect(tx - 4, 58, 10, 3, D.espadas_brillo);
      p.px(tx - 2, 59, D.blanco);
      p.px(tx + 2, 59, D.blanco);
      break;
    }
    case 'secar':
      brazo(hi.x, hi.y, cx - 4, 40 - f);
      brazo(hd.x, hd.y, cx + 5, 42 + f);
      p.rect(cx - 6, 33 - f, 6, 8, P.negro);
      p.rect(cx - 5, 34 - f, 4, 6, '#A8C4C8');
      p.px(cx - 5, 34 - f, D.blanco);
      p.rect(cx + 1, 38 + f, 6, 5, D.espadas_brillo);
      break;
    case 'cana':
      brazo(hi.x, hi.y, cx - 10, 56);
      brazo(hd.x, hd.y, 40, 36 - f);
      p.rect(36, 44, 6, 9, P.negro);
      p.rect(37, 45 + (f ? 0 : 2), 4, 7 - (f ? 0 : 2), P.oros);
      p.rect(37, 45, 4, 1, D.blanco);
      break;
    case 'saludar':
      brazo(hi.x, hi.y, cx - 10, 56);
      brazo(hd.x, hd.y, 40 + (f ? 2 : -1), 12);
      break;
    case 'senalar':
      if (pose.lado < 0) {
        brazo(hi.x, hi.y, 1, ty + 2);
        brazo(hd.x, hd.y, cx + 10, 56);
        p.rect(0, ty + 1, 2, 1, PIEL);
      } else {
        brazo(hd.x, hd.y, 42, ty + 2);
        brazo(hi.x, hi.y, cx - 10, 56);
        p.rect(42, ty + 1, 2, 1, PIEL);
      }
      break;
    case 'quieto':
    case 'hablar':
      brazo(hi.x, hi.y, cx - 11, 58);
      brazo(hd.x, hd.y, cx + 11, 58);
      break;
  }
  return p;
}

const cache = new Map<string, HTMLCanvasElement>();

function imagen(pose: Pose): HTMLCanvasElement {
  const clave = `${pose.tarea}${pose.f}${pose.mirada}${pose.parpadeo ? 1 : 0}${pose.boca}${pose.lado}`;
  let c = cache.get(clave);
  if (!c) {
    const p = dibujar(pose);
    iluminar(p, DIEGO_X, DIEGO_Y);
    c = p.aCanvas();
    cache.set(clave, c);
  }
  return c;
}

/** Máquina de tareas: cada 4-10 s elige una, ponderada; saludar, señalar y hablar se fuerzan. */
export class Diego {
  private t = 0;
  private tarea: TareaDiego = 'saludar';
  private finTarea = 1600;
  private forzada: { tarea: TareaDiego; hasta: number; lado: -1 | 1 } | null = null;
  private proximoParpadeo = 2500;
  /** X del ratón en la escena (o null si no está sobre el bar). */
  mirarA: number | null = null;
  /** Mientras habla, la boca se mueve. */
  hablando = false;

  constructor(private readonly rng: () => number = Math.random) {}

  forzar(tarea: TareaDiego, ms: number, lado: -1 | 1 = 1): void {
    this.forzada = { tarea, hasta: this.t + ms, lado };
  }

  actualizar(dt: number): void {
    this.t += dt;
    if (this.forzada && this.t > this.forzada.hasta) this.forzada = null;
    if (this.t > this.finTarea) {
      const bolsa: TareaDiego[] = ['limpiar', 'limpiar', 'limpiar', 'secar', 'secar', 'cana', 'quieto', 'quieto'];
      this.tarea = bolsa[Math.floor(this.rng() * bolsa.length)];
      this.finTarea = this.t + 4000 + this.rng() * 6000;
    }
    if (this.t > this.proximoParpadeo + 140) this.proximoParpadeo = this.t + 2200 + this.rng() * 3200;
  }

  dibujar(ctx: CanvasRenderingContext2D): void {
    let tarea = this.forzada?.tarea ?? this.tarea;
    if (this.hablando && !this.forzada) tarea = 'hablar';
    const lento = tarea === 'quieto' || tarea === 'hablar';
    const f = Math.floor(this.t / (tarea === 'saludar' ? 180 : lento ? 900 : 320)) % 2;
    let mirada: -1 | 0 | 1 = 0;
    if (this.forzada?.tarea === 'senalar') mirada = this.forzada.lado;
    else if (this.mirarA !== null) {
      const d = this.mirarA - (DIEGO_X + DIEGO_W / 2);
      mirada = d < -40 ? -1 : d > 40 ? 1 : 0;
    }
    const boca: 0 | 1 | 2 = this.hablando ? ([0, 2, 1, 2] as const)[Math.floor(this.t / 110) % 4] : 0;
    const parpadeo = this.t > this.proximoParpadeo && this.t < this.proximoParpadeo + 140;
    ctx.drawImage(imagen({ tarea, f, mirada, parpadeo, boca, lado: this.forzada?.lado ?? 1 }), DIEGO_X, DIEGO_Y);
  }
}
