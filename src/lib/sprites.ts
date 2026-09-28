// Sprites provisionales de los objetos del bar para las cabeceras de las páginas (spec, sección 12).
// Son placeholders: en el H7 se sustituyen por el arte de Aseprite. Cada carácter es un píxel.

import type { OBJETOS } from '../content.config';

export type Objeto = (typeof OBJETOS)[number];

/** Paleta del juego (PROMPT.md, 11.1) + el rojo apagado reservado a RASKA (valor provisional). */
const PALETA: Record<string, string> = {
  k: '#1A1410', // tinta
  n: '#3A2415', // madera oscura
  w: '#6E4424', // madera
  W: '#A86C3A', // madera clara
  c: '#F1E6C8', // papel
  C: '#C9B98F', // papel en sombra
  s: '#1F2E27', // pizarra
  G: '#3E8C6E', // azulejo
  g: '#8FD0A8', // azulejo brillante
  y: '#E2B227', // oros
  b: '#2F58A8', // espadas
  B: '#8CA8E0',
  v: '#3E7C2C', // bastos
  V: '#7FB866',
  x: '#B8B8B0', // gris claro
  t: '#EAEAE0', // tiza
  r: '#8C3B36', // rojo apagado de RASKA (provisional)
};

/** Objetos de proyecto + sprites sueltos de la interfaz. */
export type Sprite = Objeto | 'naipe';

const MAPAS: Record<Sprite, string[]> = {
  naipe: [
    'kkkkkkkkkk',
    'kcccccccck',
    'kckcccccck',
    'kcccccccck',
    'kccckkccck',
    'kcckyykcck',
    'kckyyyykck',
    'kckyyyykck',
    'kcckyykcck',
    'kccckkccck',
    'kcccccccck',
    'kcccccckck',
    'kcccccccck',
    'kkkkkkkkkk',
  ],
  tv: [
    '....k......k....',
    '.....k....k.....',
    '......k..k......',
    'kkkkkkkkkkkkkkkk',
    'kWWWWWWWWWWWWWWk',
    'kWkkkkkkkkkkWWWk',
    'kWkggggggggkWyWk',
    'kWkGGGGGGGGkWWWk',
    'kWkggggggggkWyWk',
    'kWkGGGGGGGGkWWWk',
    'kWkkkkkkkkkkWWWk',
    'kWWWWWWWWWWWWWWk',
    'kkkkkkkkkkkkkkkk',
    '.kk..........kk.',
  ],
  'perchero-a': [
    '......kkk.......',
    '.....k...k......',
    '.........k......',
    '........k.......',
    '..kkkkkkkkkkkk..',
    '.kcccckkkkcccck.',
    'kcccccckkcccccck',
    'kcckcccckccckcck',
    'kkkkcccckcccckkk',
    '...kcccckcccck..',
    '...kcccckcccck..',
    '...kcccckcccck..',
    '...kcccckcccck..',
    '...kkkkkkkkkkk..',
  ],
  'perchero-b': [
    '......kkk.......',
    '.....k...k......',
    '.........k......',
    '........k.......',
    '..kkkkkkkkkkkk..',
    '.kvvvvkkkkvvvvk.',
    'kvvvvvvvvvvvvvvk',
    'kvvvvvyyyyvvvvvk',
    'kkkkvvykkyvvkkkk',
    '...kvvyyyyvvk...',
    '...kvvvvvvvvk...',
    '...kvvvvvvvvk...',
    '...kvvvvvvvvk...',
    '...kkkkkkkkkk...',
  ],
  revistero: [
    'kkkkkkkkkkkk',
    'kbbbbbbbbbbk',
    'kbyyyyyyyybk',
    'kbbbbbbbbbbk',
    'kbccccccccbk',
    'kbckkkkkkcbk',
    'kbckBBBBkcbk',
    'kbckBBBBkcbk',
    'kbckkkkkkcbk',
    'kbccccccccbk',
    'kbbbbbbbbbbk',
    'kbtttttbbbbk',
    'kbttbbbbbbbk',
    'kbbbbbbbbbbk',
    'kkkkkkkkkkkk',
  ],
  cartel: [
    '......kk......',
    '.kkkkkyykkkkk.',
    '.kccccyycccck.',
    '.kcrrrrrrrrck.',
    '.kcrkrkrkkrck.',
    '.kcrrrrrrrrck.',
    '.kccccccccck..',
    '.kckkkkkkkkck.',
    '.kccccccccck..',
    '.kckrkkrkkkck.',
    '.kcckcckcrcck.',
    '.kccccccccck..',
    '.kckkkkkcck...',
    '.kkkkkkkkk....',
  ],
  rotulo: [
    'kkkkkkkkkkkkkkkk',
    'knnnnnnnnnnnnnnk',
    'kntttntttntttnnk',
    'kntnnntnnntnnnnk',
    'kntttntttntttnnk',
    'knnnnnnnnnnnnnnk',
    'kkkkkkkkkkkkkkkk',
    '...k........k...',
  ],
};

export interface Tramo {
  x: number;
  y: number;
  w: number;
  color: string;
}

/** Píxeles del sprite agrupados en tramos horizontales del mismo color (menos nodos en el SVG). */
export function tramosDe(objeto: Sprite): { ancho: number; alto: number; tramos: Tramo[] } {
  const filas = MAPAS[objeto];
  const ancho = Math.max(...filas.map((f) => [...f].length));
  const tramos: Tramo[] = [];
  filas.forEach((fila, y) => {
    const px = [...fila];
    let x = 0;
    while (x < px.length) {
      const color = PALETA[px[x]];
      if (!color) {
        x++;
        continue;
      }
      let w = 1;
      while (x + w < px.length && px[x + w] === px[x]) w++;
      tramos.push({ x, y, w, color });
      x += w;
    }
  });
  return { ancho, alto: filas.length, tramos };
}
