// Escena principal de «Diego Pérez Bar» (480×270): el interior del bar como juego. Los objetos son
// los proyectos de Diego; al pasar el ratón se resaltan y se nombran, y al pulsarlos hacen un
// pequeño movimiento de videojuego, la cámara se acerca a saltos enteros y se abre su ficha.
// La mesa de mus de la esquina lleva al juego.

import { envolver, medir, texto } from '../core/bitmapFont';
import type { EventoEntrada } from '../core/input';
import type { Juego } from '../core/juego';
import { crearLienzo } from '../core/pantalla';
import type { Escena } from '../core/sceneManager';
import { DERIVADOS as D, PALETA as P } from '../data/palette';
import { caja, marco } from '../render/pixel';
import { capaDelante, capaFondo } from './arte';
import { Diego, DIEGO_W, DIEGO_X, DIEGO_Y } from './diego';
import { ALTO_BAR, ANCHO_BAR, iluminar, silueta } from './luz';
import { FRASES, OBJETOS, ORDEN_TECLADO, type DefObjeto, type IdObjeto } from './objetos';
import * as vivo from './vivo';

const RESALTE = '#F6DC7A';
const CLAVE_VISITADOS = 'dpbar.visitados';
const CLAVE_VISTO = 'dpbar.visto';
const CLAVE_SONIDO = 'dpbar.sonido';

interface Objeto {
  def: DefObjeto;
  img: HTMLCanvasElement;
  borde: HTMLCanvasElement;
  x: number;
  y: number;
  w: number;
  h: number;
}

type Blanco = IdObjeto | 'diego';

type Estado = 'libre' | 'anticipando' | 'acercando' | 'ficha' | 'alejando' | 'saliendo';

interface Bocadillo {
  lineas: string[];
  total: number;
  inicio: number;
  hasta: number;
}

let sprites: Map<IdObjeto, Objeto> | null = null;

function crearSprites(): Map<IdObjeto, Objeto> {
  if (sprites) return sprites;
  sprites = new Map();
  for (const def of OBJETOS) {
    const p = def.sprite();
    const borde = silueta(p, RESALTE).aCanvas();
    iluminar(p, def.x, def.y);
    const img = p.aCanvas();
    if (def.textos) def.textos(img.getContext('2d')!);
    sprites.set(def.id, { def, img, borde, x: def.x, y: def.y, w: p.ancho, h: p.alto });
  }
  return sprites;
}

function leer<T>(clave: string, porDefecto: T): T {
  try {
    const v = localStorage.getItem(clave);
    return v === null ? porDefecto : (JSON.parse(v) as T);
  } catch {
    return porDefecto;
  }
}

function guardar(clave: string, valor: unknown): void {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Sin almacenamiento: se olvida al cerrar.
  }
}

export interface OpcionesBar {
  /** Pulsar la mesa de mus: el juego entra en la selección de compañero. */
  alJugarMus: () => void;
  /** Se vuelve del juego: la cámara sale desde la mesa. */
  desdeLaMesa?: boolean;
}

export class EscenaBar implements Escena {
  readonly nombre = 'Bar';
  private readonly objetos = crearSprites();
  private readonly lienzo = crearLienzo(ANCHO_BAR, ALTO_BAR);
  private readonly diego = new Diego();
  private readonly reducido =
    typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  private t = 0;
  private estado: Estado = 'libre';
  private tEstado = 0;
  private hover: Blanco | null = null;
  private foco: Blanco | null = null;
  private seleccion: Blanco | null = null;
  private activo: Blanco | null = null;
  private tactil = false;
  private zoom = 1;
  private centro = { x: ANCHO_BAR / 2, y: ALTO_BAR / 2 };
  private lupaHasta = 0;
  private bocadillo: Bocadillo | null = null;
  private visitados = new Set<string>(leer<string[]>(CLAVE_VISITADOS, []));
  private mudo = leer<boolean>(CLAVE_SONIDO, false);
  private volumenes: [number, number, number] | null = null;
  private sinTocar = 0;
  private proximoDestello = 5000;
  private destello: { id: IdObjeto; hasta: number } | null = null;
  private rodillos = [0, 1, 2];
  private giro: { hasta: number[]; premio: boolean } | null = null;
  private confeti: { x: number; y: number; vx: number; vy: number; c: string }[] = [];
  private turnoFrase = new Map<string, number>();
  private corteBaraja = 7000;

  constructor(
    private readonly juego: Juego,
    private readonly op: OpcionesBar,
  ) {}

  // ---------------------------------------------------------------------------
  // Ciclo de vida
  // ---------------------------------------------------------------------------

  entrar(): void {
    this.juego.pantalla.resolucion(ANCHO_BAR, ALTO_BAR);
    this.juego.audio.musica(null);
    this.aplicarSonido();
    if (this.op.desdeLaMesa) {
      this.activo = 'mesa';
      this.centro = this.centroDe('mesa');
      this.cambiarEstado('alejando');
      this.decir(this.frase('vueltaDeProyecto'), 900);
      return;
    }
    if (!leer<boolean>(CLAVE_VISTO, false)) {
      guardar(CLAVE_VISTO, true);
      this.diego.forzar('saludar', 1400);
      setTimeout(() => {
        this.decir(FRASES.entrada[0]);
        this.diego.forzar('senalar', 2200, -1);
      }, 700);
    } else {
      this.diego.forzar('saludar', 1200);
      this.decir(this.frase('vuelta'), 500);
    }
  }

  salir(): void {
    this.juego.audio.ambiente(false);
  }

  // ---------------------------------------------------------------------------
  // Lógica
  // ---------------------------------------------------------------------------

  actualizar(dt: number): void {
    this.t += dt;
    this.tEstado += dt;
    this.diego.actualizar(dt);
    const mira = this.hover ?? this.foco ?? this.seleccion;
    this.diego.mirarA = mira
      ? this.centroDe(mira).x
      : this.juego.entrada.raton.dentro
        ? this.juego.entrada.raton.x
        : null;
    const b = this.bocadillo;
    this.diego.hablando = !!b && this.t < b.inicio + b.total * 28 && this.t >= b.inicio;
    if (b && this.t > b.hasta) this.bocadillo = null;

    this.sinTocar += dt;
    if (this.sinTocar > 60000 && this.estado === 'libre' && !this.bocadillo) {
      this.decir(this.frase('inactividad'));
      this.sinTocar = -60000;
    }

    switch (this.estado) {
      case 'anticipando':
        if (this.tEstado > 100) this.tras();
        break;
      case 'acercando':
        this.zoom = this.reducido ? 1 : this.tEstado < 120 ? 1 : this.tEstado < 240 ? 2 : 3;
        if (this.tEstado > 380) {
          if (this.activo === 'mesa') {
            this.cambiarEstado('saliendo');
            this.op.alJugarMus();
          } else this.cambiarEstado('ficha');
        }
        break;
      case 'alejando':
        this.zoom = this.reducido ? 1 : this.tEstado < 120 ? 3 : this.tEstado < 240 ? 2 : 1;
        if (this.tEstado > 260) {
          this.zoom = 1;
          this.foco = this.tactil ? null : this.activo;
          this.activo = null;
          this.cambiarEstado('libre');
        }
        break;
      default:
        break;
    }

    // Destellos de atención sobre lo no visitado, empezando por el cartel.
    if (!this.reducido && this.estado === 'libre' && this.t > this.proximoDestello) {
      const pendiente = (['raska', 'tv', 'perchaA', 'perchaB', 'punketa', 'pizarra', 'mesa'] as IdObjeto[]).find(
        (id) => !this.visitados.has(id),
      );
      if (pendiente) this.destello = { id: pendiente, hasta: this.t + 260 };
      this.proximoDestello = this.t + 6000 + Math.random() * 3000;
    }

    // Tragaperras
    if (this.giro) {
      this.giro.hasta.forEach((h, i) => {
        if (this.t < h) this.rodillos[i] = Math.floor(this.t / 70 + i * 2) % 5;
      });
      if (this.t > this.giro.hasta[2]) {
        const premio = this.giro.premio;
        this.giro = null;
        if (premio) {
          this.juego.audio.sfx('aplauso', { volumen: 0.6 });
          this.decir(this.frase('premio'));
          for (let k = 0; k < 60; k++)
            this.confeti.push({
              x: 462,
              y: 110,
              vx: (Math.random() - 0.7) * 0.18,
              vy: -0.1 - Math.random() * 0.15,
              c: [P.oros, P.neon, D.copas_brillo, D.bastos_brillo][k % 4],
            });
        } else if (Math.random() < 0.5) this.decir(this.frase('sinPremio'));
      }
    }
    for (const c of this.confeti) {
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vy += 0.0004 * dt;
    }
    this.confeti = this.confeti.filter((c) => c.y < ALTO_BAR);
    if (this.t > this.corteBaraja + 700) this.corteBaraja = this.t + 6000 + Math.random() * 6000;
  }

  private cambiarEstado(e: Estado): void {
    this.estado = e;
    this.tEstado = 0;
  }

  private frase(evento: keyof typeof FRASES): string {
    const lista = FRASES[evento];
    const i = this.turnoFrase.get(evento) ?? Math.floor(Math.random() * lista.length);
    this.turnoFrase.set(evento, (i + 1) % lista.length);
    return lista[i % lista.length];
  }

  private decir(s: string, retardo = 0): void {
    const lineas = envolver(s, 28).slice(0, 5);
    const total = lineas.reduce((a, l) => a + [...l].length, 0);
    const inicio = this.t + retardo;
    this.bocadillo = { lineas, total, inicio, hasta: inicio + total * 28 + 2600 };
  }

  private centroDe(b: Blanco): { x: number; y: number } {
    if (b === 'diego') return { x: DIEGO_X + DIEGO_W / 2, y: DIEGO_Y + 24 };
    const o = this.objetos.get(b)!;
    return { x: o.x + o.w / 2, y: o.y + o.h / 2 };
  }

  private rectDe(b: Blanco): { x: number; y: number; w: number; h: number } {
    if (b === 'diego') return { x: DIEGO_X + 6, y: DIEGO_Y, w: DIEGO_W - 12, h: 64 };
    const o = this.objetos.get(b)!;
    const m = o.def.margen ?? 2;
    return { x: o.x - m, y: o.y - m, w: o.w + 2 * m, h: o.h + 2 * m };
  }

  /** Objeto bajo un punto, del más cercano a cámara al más lejano. */
  private blancoEn(x: number, y: number): Blanco | null {
    const orden: Blanco[] = [
      'mesa',
      'tragaperras',
      'diego',
      'radio',
      'pizarra',
      'telefono',
      'punketa',
      'perchaB',
      'perchaA',
      'puerta',
      'tv',
      'raska',
    ];
    for (const b of orden) {
      const r = this.rectDe(b);
      if (x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h) return b;
    }
    return null;
  }

  private defDe(b: Blanco): DefObjeto | null {
    return b === 'diego' ? null : this.objetos.get(b)!.def;
  }

  /** Pulsar un objeto: anticipación (aplastado + hit-stop) y después su acción. */
  private activar(b: Blanco): void {
    if (this.estado !== 'libre') return;
    this.sinTocar = 0;
    this.activo = b;
    this.seleccion = null;
    this.juego.audio.sfx('clic', { volumen: 0.6 });
    if (b !== 'diego') {
      this.visitados.add(b);
      guardar(CLAVE_VISITADOS, [...this.visitados]);
      const c = this.centroDe(b);
      this.diego.forzar('senalar', 900, c.x < DIEGO_X ? -1 : 1);
    }
    this.cambiarEstado('anticipando');
  }

  /** Tras la anticipación: acercar la cámara o actuar en el sitio. */
  private tras(): void {
    const b = this.activo!;
    const def = this.defDe(b);
    const enSitio = () => {
      this.activo = null;
      this.cambiarEstado('libre');
    };
    if (b === 'diego') {
      this.diego.forzar('saludar', 800);
      this.decir(this.frase('sobreMi'));
      return enSitio();
    }
    switch (def!.accion) {
      case 'proyecto':
      case 'cv':
      case 'mus':
        if (def!.accion === 'mus') this.juego.audio.sfx('barajar', { volumen: 0.7 });
        else this.juego.audio.sfx('carta', { volumen: 0.5 });
        this.centro = this.centroDe(b);
        this.cambiarEstado('acercando');
        return;
      case 'radio':
        this.mudo = !this.mudo;
        guardar(CLAVE_SONIDO, this.mudo);
        this.aplicarSonido();
        return enSitio();
      case 'puerta':
        this.juego.audio.sfx('campana', { volumen: 0.5 });
        this.decir(this.frase('puerta'));
        return enSitio();
      case 'telefono':
        this.juego.audio.sfx('turno', { volumen: 0.5 });
        this.decir(this.frase('telefono'));
        return enSitio();
      case 'tragaperras':
        if (!this.giro) {
          this.juego.audio.sfx('piedra', { volumen: 0.6 });
          const premio = Math.random() < 0.25;
          const final = premio ? [3, 3, 3] : [0, 1, 2].map(() => Math.floor(Math.random() * 5));
          if (!premio && final[0] === final[1] && final[1] === final[2]) final[2] = (final[2] + 1) % 5;
          this.giro = { hasta: [this.t + 700, this.t + 1000, this.t + 1300], premio };
          setTimeout(() => (this.rodillos = final), 1320);
        }
        return enSitio();
    }
  }

  private cerrarFicha(): void {
    if (this.estado !== 'ficha') return;
    this.juego.audio.sfx('clic', { volumen: 0.4 });
    this.cambiarEstado('alejando');
    if (Math.random() < 0.5) this.decir(this.frase('vueltaDeProyecto'), 400);
  }

  private aplicarSonido(): void {
    const o = this.juego.opciones;
    if (this.mudo) {
      if (!this.volumenes) this.volumenes = [o.volumenMusica, o.volumenEfectos, o.volumenVoces];
      o.volumenMusica = 0;
      o.volumenEfectos = 0;
      o.volumenVoces = 0;
    } else if (this.volumenes) {
      [o.volumenMusica, o.volumenEfectos, o.volumenVoces] = this.volumenes;
      this.volumenes = null;
    }
    this.juego.audio.aplicarVolumenes?.();
    this.juego.audio.ambiente(!this.mudo);
  }

  // ---------------------------------------------------------------------------
  // Entrada
  // ---------------------------------------------------------------------------

  private readonly botonLupa = { x: 458, y: 257, w: 20, h: 13 };
  private readonly botonSonido = { x: 436, y: 257, w: 20, h: 13 };
  private readonly botonAbrir = { x: 358, y: 257, w: 74, h: 13 };
  private readonly panel = { x: 90, y: 46, w: 300, h: 178 };
  private readonly botonVolver = { x: 158, y: 196, w: 164, h: 16 };

  entrada(e: EventoEntrada): void {
    const dentroDe = (x: number, y: number, r: { x: number; y: number; w: number; h: number }) =>
      x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
    if (e.tipo === 'mover') {
      this.tactil = false;
      this.sinTocar = 0;
      if (this.estado !== 'libre') return;
      const b = this.blancoEn(e.x, e.y);
      if (b !== this.hover && b) this.juego.audio.sfx('hover', { volumen: 0.25 });
      this.hover = b;
      if (b) this.foco = null;
      return;
    }
    if (e.tipo === 'clic') {
      this.sinTocar = 0;
      if (e.tactil) this.tactil = true;
      if (this.bocadillo && this.t < this.bocadillo.inicio + this.bocadillo.total * 28) {
        // Clic mientras escribe: completa la frase.
        this.bocadillo.inicio = this.t - this.bocadillo.total * 28;
      }
      if (this.estado === 'ficha') {
        if (dentroDe(e.x, e.y, this.botonVolver) || !dentroDe(e.x, e.y, this.panel)) this.cerrarFicha();
        return;
      }
      if (this.estado !== 'libre') return;
      if (dentroDe(e.x, e.y, this.botonLupa)) {
        this.lupaHasta = this.t + 2200;
        return;
      }
      if (dentroDe(e.x, e.y, this.botonSonido)) {
        this.mudo = !this.mudo;
        guardar(CLAVE_SONIDO, this.mudo);
        this.aplicarSonido();
        return;
      }
      if (this.tactil && this.seleccion && dentroDe(e.x, e.y, this.botonAbrir)) {
        this.activar(this.seleccion);
        return;
      }
      const b = this.blancoEn(e.x, e.y);
      if (!b) {
        this.seleccion = null;
        return;
      }
      // En táctil, el primer toque selecciona y el segundo abre (PROMPT_BAR 10.4).
      if (this.tactil && this.seleccion !== b) {
        this.seleccion = b;
        this.juego.audio.sfx('hover', { volumen: 0.3 });
        return;
      }
      this.activar(b);
      return;
    }
    if (e.tipo === 'tecla') {
      this.sinTocar = 0;
      const k = e.tecla.toLowerCase();
      if (this.estado === 'ficha') {
        if (k === 'escape' || k === 'enter' || k === ' ' || k === 'backspace') this.cerrarFicha();
        return;
      }
      if (this.estado !== 'libre') return;
      if (k === 'tab') {
        const actual = this.foco ?? this.hover;
        const i = actual ? ORDEN_TECLADO.indexOf(actual) : -1;
        const n = ORDEN_TECLADO.length;
        this.foco = ORDEN_TECLADO[(i + (e.mayus ? -1 : 1) + n) % n];
        this.hover = null;
        this.juego.audio.sfx('hover', { volumen: 0.25 });
      } else if ((k === 'enter' || k === ' ') && this.foco) this.activar(this.foco);
      else if (k === 'h') this.lupaHasta = this.t + 2200;
      else if (k === 'm') {
        this.mudo = !this.mudo;
        guardar(CLAVE_SONIDO, this.mudo);
        this.aplicarSonido();
      } else if (k === 'escape') {
        this.foco = null;
        this.bocadillo = null;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Dibujo
  // ---------------------------------------------------------------------------

  private resaltado(b: Blanco): boolean {
    if (this.estado !== 'libre') return false;
    return b === this.hover || b === this.foco || b === this.seleccion || this.t < this.lupaHasta;
  }

  private dibujarObjeto(ctx: CanvasRenderingContext2D, id: IdObjeto): void {
    const o = this.objetos.get(id)!;
    let dx = 0;
    let dy = 0;
    const enJuego = this.activo === id;
    if (enJuego && this.estado === 'anticipando' && this.tEstado < 60) {
      // Aplastado de 2 px durante un fotograma.
      ctx.drawImage(o.img, o.x, o.y + 2, o.w, o.h - 2);
      return;
    }
    if (enJuego && (this.estado === 'acercando' || this.estado === 'ficha') && !this.reducido) {
      if (id === 'perchaA' || id === 'perchaB') dx = [0, 1, 0, -1][Math.floor(this.t / 70) % 4];
      else if (id === 'punketa') dy = -Math.min(4, Math.floor(this.tEstado / 40));
      else if (id === 'raska' && this.estado === 'acercando') dx = Math.floor(this.t / 40) % 2;
    }
    if (this.resaltado(id)) {
      dy -= 1;
      ctx.drawImage(o.borde, o.x - 1 + dx, o.y - 1 + dy);
    }
    ctx.drawImage(o.img, o.x + dx, o.y + dy);
    if (id === 'tv') {
      const destello = enJuego && this.estado === 'acercando' ? Math.max(0, 1 - this.tEstado / 200) : 0;
      ctx.save();
      ctx.translate(dx, dy);
      vivo.dibujarTele(ctx, this.reducido ? 4000 : this.t, destello);
      ctx.restore();
    }
  }

  dibujar(pantalla: CanvasRenderingContext2D): void {
    const ctx = this.lienzo.ctx;
    const t = this.t;
    ctx.drawImage(capaFondo(), 0, 0);
    vivo.dibujarTubos(ctx, t);
    vivo.dibujarNeon(ctx, t);
    for (const id of [
      'raska',
      'tv',
      'puerta',
      'perchaA',
      'perchaB',
      'punketa',
      'telefono',
      'pizarra',
      'radio',
    ] as const)
      this.dibujarObjeto(ctx, id);
    vivo.dibujarEsquinaCartel(ctx, t, 188 + 103, 18 + 133);
    if (!this.reducido) {
      vivo.dibujarPolvo(ctx, t);
      vivo.dibujarMosca(ctx, t);
    }
    // Luz de la radio: encendida si suena
    ctx.fillStyle = this.mudo ? D.gris : P.oros;
    ctx.fillRect(441, 31, 1, 1);
    // Chincheta que brilla de vez en cuando
    if (Math.floor(t / 150) % 30 === 0) {
      ctx.fillStyle = D.blanco;
      ctx.fillRect(239, 18, 1, 1);
    }
    // Diego, detrás de la barra (resaltado: flechita de tiza sobre la cabeza)
    this.diego.dibujar(ctx);
    ctx.drawImage(capaDelante(), 0, 0);
    if (this.resaltado('diego')) {
      const cx = DIEGO_X + DIEGO_W / 2;
      ctx.fillStyle = RESALTE;
      ctx.fillRect(cx - 2, DIEGO_Y - 8, 5, 1);
      ctx.fillRect(cx - 1, DIEGO_Y - 7, 3, 1);
      ctx.fillRect(cx, DIEGO_Y - 6, 1, 1);
    }
    if (!this.reducido) vivo.dibujarVaho(ctx, t);
    this.dibujarObjeto(ctx, 'tragaperras');
    vivo.dibujarLucesTragaperras(ctx, t, 448, 96);
    this.dibujarRodillos(ctx);
    this.dibujarObjeto(ctx, 'mesa');
    this.dibujarBaraja(ctx);
    for (const c of this.confeti) {
      ctx.fillStyle = c.c;
      ctx.fillRect(Math.round(c.x), Math.round(c.y), 1, 1);
    }
    this.dibujarMarcas(ctx);
    if (this.t < this.lupaHasta && this.estado === 'libre') this.dibujarNombres(ctx);

    // Cámara: se acerca a saltos enteros (×1, ×2, ×3), siempre alineada a la rejilla.
    if (this.zoom === 1) pantalla.drawImage(this.lienzo.canvas, 0, 0);
    else {
      const sw = ANCHO_BAR / this.zoom;
      const sh = ALTO_BAR / this.zoom;
      const sx = Math.round(Math.max(0, Math.min(ANCHO_BAR - sw, this.centro.x - sw / 2)));
      const sy = Math.round(Math.max(0, Math.min(ALTO_BAR - sh, this.centro.y - sh / 2)));
      pantalla.drawImage(this.lienzo.canvas, sx, sy, sw, sh, 0, 0, ANCHO_BAR, ALTO_BAR);
    }

    if (this.zoom === 1 && this.t >= this.lupaHasta) this.dibujarBocadillo(pantalla);
    this.dibujarInterfaz(pantalla);
    if (this.estado === 'ficha') this.dibujarFicha(pantalla);
    if (this.estado === 'saliendo') {
      pantalla.fillStyle = P.negro;
      pantalla.fillRect(0, 0, ANCHO_BAR, ALTO_BAR);
    }
  }

  /** Iconos de los proyectos en los rodillos de la tragaperras. */
  private dibujarRodillos(ctx: CanvasRenderingContext2D): void {
    const iconos = [
      [P.madera, D.bastos_brillo],
      [P.tinta, P.copas],
      ['#C2307A', '#E6D93A'],
      ['#ECE4D0', '#8C3B36'],
      [D.blanco, P.oros],
    ];
    this.rodillos.forEach((s, i) => {
      const x = 448 + 5 + i * 7;
      const y = 96 + 27;
      const [a, b] = iconos[s];
      ctx.fillStyle = a;
      ctx.fillRect(x, y, 5, 10);
      ctx.fillStyle = b;
      ctx.fillRect(x + 1, y + 3, 3, 4);
    });
  }

  /** La baraja de la mesa se corta sola de vez en cuando. */
  private dibujarBaraja(ctx: CanvasRenderingContext2D): void {
    const d = this.t - this.corteBaraja;
    if (d < 0 || d > 700 || this.reducido) return;
    const alto = Math.round(Math.sin((d / 700) * Math.PI) * 4);
    ctx.fillStyle = P.negro;
    ctx.fillRect(330 + 49, 200 + 16 - alto, 10, 4);
    ctx.fillStyle = D.copas_osc;
    ctx.fillRect(330 + 50, 200 + 16 - alto, 8, 3);
  }

  /** Visitados (✓ de tiza) y destellos de atención. */
  private dibujarMarcas(ctx: CanvasRenderingContext2D): void {
    for (const id of this.visitados) {
      const o = this.objetos.get(id as IdObjeto);
      if (!o || o.def.accion !== 'proyecto') continue;
      const x = o.x + o.w - 3;
      const y = o.y - 5;
      ctx.fillStyle = P.tiza;
      ctx.fillRect(x, y + 2, 1, 1);
      ctx.fillRect(x + 1, y + 3, 1, 1);
      ctx.fillRect(x + 2, y + 2, 1, 1);
      ctx.fillRect(x + 3, y + 1, 1, 1);
      ctx.fillRect(x + 4, y, 1, 1);
    }
    const d = this.destello;
    if (d && this.t < d.hasta) {
      const o = this.objetos.get(d.id)!;
      const x = o.x + o.w - 6;
      const y = o.y + 4;
      const grande = this.t > d.hasta - 130;
      ctx.fillStyle = D.blanco;
      ctx.fillRect(x, y - (grande ? 3 : 1), 1, grande ? 7 : 3);
      ctx.fillRect(x - (grande ? 3 : 1), y, grande ? 7 : 3, 1);
      ctx.fillStyle = RESALTE;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  /** Lupa: el nombre de todo lo que se puede tocar. */
  private dibujarNombres(ctx: CanvasRenderingContext2D): void {
    const etiquetas: [Blanco, string][] = [
      ...OBJETOS.map((d) => [d.id, d.nombre || d.verbo] as [Blanco, string]),
      ['diego', 'Diego'],
    ];
    for (const [b, s] of etiquetas) {
      const c = this.centroDe(b);
      const w = medir(s) + 5;
      const x = Math.round(Math.max(1, Math.min(ANCHO_BAR - w - 1, c.x - w / 2)));
      const y = Math.round(Math.max(20, Math.min(ALTO_BAR - 26, c.y - 5)));
      caja(ctx, x, y, w, 11, P.negro);
      caja(ctx, x + 1, y + 1, w - 2, 9, P.pizarra);
      texto(ctx, s, x + 3, y + 3, P.tiza);
    }
  }

  private dibujarBocadillo(ctx: CanvasRenderingContext2D): void {
    const b = this.bocadillo;
    if (!b || this.t < b.inicio) return;
    let quedan = Math.floor((this.t - b.inicio) / 28);
    const visibles = b.lineas.map((l) => {
      const n = Math.max(0, Math.min([...l].length, quedan));
      quedan -= [...l].length;
      return [...l].slice(0, n).join('');
    });
    const w = Math.max(...b.lineas.map((l) => medir(l))) + 10;
    const h = b.lineas.length * 10 + 7;
    // A la derecha del cartel, sobre la contrabarra, con el piquito hacia la cabeza de Diego.
    const ax = DIEGO_X + 12;
    const ay = DIEGO_Y + 2;
    const x = Math.round(Math.min(ANCHO_BAR - 4 - w, Math.max(298, ax - w / 2)));
    const y = Math.round(ay - h - 6);
    caja(ctx, x + 1, y, w - 2, h, P.negro);
    caja(ctx, x, y + 1, w, h - 2, P.negro);
    caja(ctx, x + 1, y + 1, w - 2, h - 2, P.papel);
    // Piquito hacia Diego
    for (let k = 0; k < 5; k++) caja(ctx, ax - k, y + h - 1 + k, 1 + k, 1, k === 4 ? P.negro : P.papel);
    caja(ctx, ax - 5, y + h - 1, 1, 6, P.negro);
    visibles.forEach((l, i) => texto(ctx, l, x + 5, y + 5 + i * 10, P.tinta));
  }

  private dibujarInterfaz(ctx: CanvasRenderingContext2D): void {
    caja(ctx, 0, 257, ANCHO_BAR, 13, '#140E0A');
    caja(ctx, 0, 257, ANCHO_BAR, 1, P.madera_osc);
    // Botones de abajo a la derecha: sonido y lupa «¿Qué hay aquí?»
    const boton = (r: { x: number; y: number; w: number; h: number }, activo: boolean) => {
      caja(ctx, r.x, r.y, r.w, r.h, P.negro);
      caja(ctx, r.x + 1, r.y + 1, r.w - 2, r.h - 2, activo ? P.madera : P.madera_osc);
      caja(ctx, r.x + 1, r.y + 1, r.w - 2, 1, P.madera_clara);
    };
    const raton = this.juego.entrada.raton;
    const sobre = (r: { x: number; y: number; w: number; h: number }) =>
      raton.dentro && raton.x >= r.x && raton.y >= r.y && raton.x < r.x + r.w && raton.y < r.y + r.h;
    boton(this.botonSonido, sobre(this.botonSonido));
    const s = this.botonSonido;
    ctx.fillStyle = P.tiza;
    ctx.fillRect(s.x + 5, s.y + 5, 2, 3);
    ctx.fillRect(s.x + 7, s.y + 4, 1, 5);
    ctx.fillRect(s.x + 8, s.y + 3, 1, 7);
    if (this.mudo) {
      ctx.fillStyle = D.copas_brillo;
      for (let k = 0; k < 5; k++) {
        ctx.fillRect(s.x + 11 + k, s.y + 4 + k, 1, 1);
        ctx.fillRect(s.x + 15 - k, s.y + 4 + k, 1, 1);
      }
    } else {
      ctx.fillRect(s.x + 11, s.y + 5, 1, 3);
      ctx.fillRect(s.x + 13, s.y + 4, 1, 5);
    }
    boton(this.botonLupa, sobre(this.botonLupa) || this.t < this.lupaHasta);
    const l = this.botonLupa;
    ctx.fillStyle = P.tiza;
    ctx.fillRect(l.x + 7, l.y + 2, 4, 1);
    ctx.fillRect(l.x + 7, l.y + 7, 4, 1);
    ctx.fillRect(l.x + 6, l.y + 3, 1, 4);
    ctx.fillRect(l.x + 11, l.y + 3, 1, 4);
    ctx.fillRect(l.x + 11, l.y + 8, 1, 1);
    ctx.fillRect(l.x + 12, l.y + 9, 1, 1);
    ctx.fillRect(l.x + 13, l.y + 10, 1, 1);

    // Línea de verbo, abajo, como en las aventuras de los 90
    const b = this.estado === 'libre' ? (this.hover ?? this.foco ?? this.seleccion) : null;
    let linea: string;
    let color: string = P.tiza;
    if (this.t < this.lupaHasta) linea = 'Todo lo que se puede tocar en el bar';
    else if (b === 'diego') linea = 'Hablar con Diego';
    else if (b) {
      const def = this.defDe(b)!;
      const verbo = def.accion === 'radio' ? (this.mudo ? 'Encender la radio' : 'Apagar la radio') : def.verbo;
      linea = def.nombre ? `${verbo} — ${def.nombre}` : verbo;
    } else {
      linea = this.tactil ? 'Toca un objeto del bar' : 'Pasa el ratón por el bar · H: ¿qué hay aquí?';
      color = P.tiza_sombra;
    }
    texto(ctx, linea, this.tactil && this.seleccion ? 178 : 216, 260, color, { alinear: 'centro' });
    if (this.tactil && this.seleccion && this.estado === 'libre') {
      const a = this.botonAbrir;
      caja(ctx, a.x, a.y, a.w, a.h, P.oros);
      texto(ctx, 'ABRIR ▸', a.x + a.w / 2, a.y + 3, P.tinta, { alinear: 'centro' });
    }
    // Foco de teclado visible (además de la silueta)
    if (this.foco && this.juego.entrada.modoTeclado && this.estado === 'libre') {
      const r = this.rectDe(this.foco);
      marco(ctx, r.x - 2, r.y - 2, r.w + 4, r.h + 4, RESALTE);
    }
  }

  /** Ficha provisional del proyecto: se abrirá su «sala» cuando haya contenido. */
  private dibujarFicha(ctx: CanvasRenderingContext2D): void {
    const def = this.activo && this.activo !== 'diego' ? this.defDe(this.activo) : null;
    const pr = def?.proyecto;
    if (!pr) return;
    const { x, y, w, h } = this.panel;
    const aparece = Math.min(1, this.tEstado / 160);
    const dy = this.reducido ? 0 : Math.round((1 - aparece) * 30);
    ctx.fillStyle = 'rgba(12,8,6,0.55)';
    ctx.fillRect(0, 0, ANCHO_BAR, ALTO_BAR);
    caja(ctx, x + 3, y + 3 + dy, w, h, P.negro);
    caja(ctx, x, y + dy, w, h, P.negro);
    caja(ctx, x + 1, y + 1 + dy, w - 2, h - 2, P.papel);
    marco(ctx, x + 5, y + 5 + dy, w - 10, h - 10, D.papel_sombra);
    const cx = x + w / 2;
    texto(ctx, 'DIEGO PÉREZ BAR', cx, y + 14 + dy, D.gris, { alinear: 'centro' });
    texto(ctx, pr.titulo, cx, y + 32 + dy, P.tinta, { alinear: 'centro', negrita: true, escala: 2 });
    const sub = pr.anio ? `${pr.tipo} · ${pr.anio}` : pr.tipo;
    texto(ctx, sub, cx, y + 58 + dy, P.madera, { alinear: 'centro' });
    caja(ctx, x + 40, y + 72 + dy, w - 80, 1, D.papel_sombra);
    const lineas = pr.proximamente
      ? ['Diego lo está preparando.', 'Muy pronto, aquí mismo.']
      : ['Aquí se abrirá la sala de este proyecto.', 'Está en obras: vuelve pronto.'];
    lineas.forEach((l, i) => texto(ctx, l, cx, y + 84 + i * 12 + dy, P.tinta, { alinear: 'centro' }));
    // Sello «PRÓXIMAMENTE»
    const sx = cx - 50;
    const sy = y + 118 + dy;
    marco(ctx, sx, sy, 100, 15, D.copas_osc);
    marco(ctx, sx + 1, sy + 1, 98, 13, D.copas_osc);
    texto(ctx, 'PRÓXIMAMENTE', cx, sy + 4, D.copas_osc, { alinear: 'centro' });
    // Botón de volver
    const bv = this.botonVolver;
    const raton = this.juego.entrada.raton;
    const encima = raton.x >= bv.x && raton.y >= bv.y && raton.x < bv.x + bv.w && raton.y < bv.y + bv.h;
    caja(ctx, bv.x, bv.y + dy, bv.w, bv.h, P.negro);
    caja(ctx, bv.x + 1, bv.y + 1 + dy, bv.w - 2, bv.h - 2, encima ? P.barniz : D.crema_boton);
    texto(ctx, 'VOLVER A LA BARRA (Esc)', bv.x + bv.w / 2, bv.y + 5 + dy, P.tinta, { alinear: 'centro' });
  }
}
