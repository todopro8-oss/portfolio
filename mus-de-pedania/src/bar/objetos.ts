// Catálogo de puntos interactivos del bar (PROMPT_BAR, sección 8): dónde está cada objeto, cómo se
// dibuja, qué dice al pasar el ratón y qué hace al pulsarlo. Los proyectos son los 5 del bar.

import type { Pixeles } from '../render/pixel';
import {
  spriteMesa,
  spritePerchaA,
  spritePerchaB,
  spritePizarra,
  spritePuerta,
  spritePunketa,
  spriteRadio,
  spriteRaska,
  spriteTele,
  spriteTelefono,
  spriteTragaperras,
  textosPizarra,
  textosRaska,
} from './arte';

export type IdObjeto =
  | 'puerta'
  | 'tv'
  | 'perchaA'
  | 'perchaB'
  | 'punketa'
  | 'raska'
  | 'telefono'
  | 'pizarra'
  | 'radio'
  | 'tragaperras'
  | 'mesa';

export type Accion = 'proyecto' | 'cv' | 'mus' | 'radio' | 'puerta' | 'telefono' | 'tragaperras';

export interface Proyecto {
  titulo: string;
  tipo: string;
  anio: string;
  /** Aún sin contenido (RASKA). */
  proximamente?: boolean;
}

export interface DefObjeto {
  id: IdObjeto;
  x: number;
  y: number;
  sprite: () => Pixeles;
  /** Textos que se dibujan encima del sprite ya iluminado. */
  textos?: (ctx: CanvasRenderingContext2D) => void;
  verbo: string;
  nombre: string;
  accion: Accion;
  proyecto?: Proyecto;
  /** Margen extra del área de clic (áreas generosas: PROMPT_BAR 2.3). */
  margen?: number;
}

export const OBJETOS: DefObjeto[] = [
  {
    id: 'puerta',
    x: 8,
    y: 80,
    sprite: spritePuerta,
    verbo: 'Salir a la calle',
    nombre: '',
    accion: 'puerta',
  },
  {
    id: 'tv',
    x: 14,
    y: 2,
    sprite: spriteTele,
    verbo: 'Encender la tele',
    nombre: 'MI PUEBLO ES',
    accion: 'proyecto',
    proyecto: { titulo: 'MI PUEBLO ES', tipo: 'Proyecto audiovisual', anio: '2025' },
  },
  {
    id: 'perchaA',
    x: 57,
    y: 95,
    sprite: spritePerchaA,
    verbo: 'Probarse',
    nombre: 'R3UP',
    accion: 'proyecto',
    proyecto: { titulo: 'R3UP', tipo: 'Identidad · Moda', anio: '2025' },
    margen: 3,
  },
  {
    id: 'perchaB',
    x: 82,
    y: 95,
    sprite: spritePerchaB,
    verbo: 'Probarse',
    // Nombre por confirmar con Diego (SPIFY o SPICY): PROMPT_BAR, sección 19.
    nombre: 'SPIFY AF',
    accion: 'proyecto',
    proyecto: { titulo: 'SPIFY AF', tipo: 'Proyecto de moda', anio: '2023' },
    margen: 3,
  },
  {
    id: 'punketa',
    x: 138,
    y: 125,
    sprite: spritePunketa,
    verbo: 'Leer',
    nombre: 'PUNKETA',
    accion: 'proyecto',
    proyecto: { titulo: 'PUNKETA', tipo: 'Proyecto editorial', anio: '2024' },
    margen: 4,
  },
  {
    id: 'raska',
    x: 188,
    y: 18,
    sprite: spriteRaska,
    textos: (ctx) => textosRaska(ctx, 'RASKA', 'PRÓXIMAMENTE'),
    verbo: 'Mirar el cartel',
    nombre: 'RASKA',
    accion: 'proyecto',
    proyecto: { titulo: 'RASKA', tipo: 'Proyecto nuevo', anio: '', proximamente: true },
  },
  {
    id: 'telefono',
    x: 296,
    y: 62,
    sprite: spriteTelefono,
    verbo: 'Llamar a Diego',
    nombre: 'Contacto',
    accion: 'telefono',
    margen: 4,
  },
  {
    id: 'pizarra',
    x: 322,
    y: 72,
    sprite: spritePizarra,
    textos: textosPizarra,
    verbo: 'Leer el menú del día',
    nombre: 'CV',
    accion: 'cv',
    proyecto: { titulo: 'CV', tipo: 'El menú del día de Diego', anio: '' },
  },
  {
    id: 'radio',
    x: 420,
    y: 28,
    sprite: spriteRadio,
    verbo: 'Apagar la radio',
    nombre: '',
    accion: 'radio',
    margen: 4,
  },
  {
    id: 'tragaperras',
    x: 448,
    y: 96,
    sprite: spriteTragaperras,
    verbo: 'Echar una moneda',
    nombre: '',
    accion: 'tragaperras',
  },
  {
    id: 'mesa',
    x: 330,
    y: 200,
    sprite: spriteMesa,
    verbo: 'Echar un mus',
    nombre: '',
    accion: 'mus',
  },
];

/** Orden del foco con teclado (PROMPT_BAR 10.2); Diego va entre el teléfono y la pizarra. */
export const ORDEN_TECLADO: (IdObjeto | 'diego')[] = [
  'puerta',
  'tv',
  'perchaA',
  'perchaB',
  'punketa',
  'raska',
  'telefono',
  'diego',
  'pizarra',
  'radio',
  'tragaperras',
  'mesa',
];

/** Frases de Diego (3 variantes por evento, PROMPT_BAR sección 9). */
export const FRASES = {
  entrada: ['¡Pasa, pasa! Echa un ojo al cartel del fondo: es lo último.'],
  vuelta: ['¡Hombre, otra vez por aquí!', '¿Lo de siempre?', 'Pasa, que hay sitio.'],
  sobreMi: [
    'Soy Diego. Aquí cada cosa es un proyecto mío: la tele, las perchas, la revista, el cartel… Toca lo que te llame.',
    'Si te cansas de mirar, en la esquina hay mesa de mus. Y en la pizarra, mi menú del día.',
    'Diseño gráfico y audiovisual, servido en su punto. ¿Qué te pongo?',
  ],
  vueltaDeProyecto: ['¿Qué tal? ¿Otra ronda?', 'Eso lo hice yo, ¿eh?', '¿Te pongo otra cosa?'],
  inactividad: [
    '¿Te pongo algo o solo miras?',
    'Tranquilo, que aquí no se cobra por mirar.',
    'La tele no muerde: tócala.',
  ],
  puerta: [
    '¿Ya te vas? Si todavía no has visto el cartel…',
    'La calle la estoy pintando todavía.',
    '¡Espera, que te pongo la última!',
  ],
  telefono: [
    'Mi número lo apunto aquí dentro de nada.',
    'Ring, ring… Todavía no lo he enchufado.',
    'Para llamarme, un poco de paciencia.',
  ],
  premio: [
    '¡Premio! Esa no la paga la casa.',
    '¡Tres iguales! Hoy invitas tú.',
    '¡Anda! Si esa máquina nunca da nada.',
  ],
  sinPremio: ['Otra vez será.', 'Esa máquina tiene más mala suerte que yo al mus.', 'La casa siempre gana.'],
};
