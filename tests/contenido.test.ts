// Comprueba el contenido migrado y las piezas puras (rutas, redirecciones, textos).

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { en } from '../src/i18n/en';
import { es } from '../src/i18n/es';
import { construirRuta } from '../src/i18n';
import { destinoDeHash } from '../src/lib/redirecciones';
import { esquemaCv } from '../src/lib/cv';
import cvJson from '../src/content/cv.json';

const DIR = join(import.meta.dirname, '..', 'src', 'content', 'proyectos');
const proyectos = readdirSync(DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => {
    const texto = readFileSync(join(DIR, f), 'utf8');
    const datos = parse(texto.split(/^---$/m)[1]) as Record<string, unknown> & {
      slug: string;
      orden: number;
      oculto?: boolean;
      borrador?: boolean;
      portada?: string;
      galeria: { src: string }[];
      looks?: { portada: string; galeria: { src: string }[] }[];
    };
    return { archivo: f, datos };
  });

describe('contenido migrado', () => {
  it('hay 5 proyectos en el bar, en el orden de la spec, y LATRAKABLOCK oculto', () => {
    const bar = proyectos.filter((p) => !p.datos.oculto).sort((a, b) => a.datos.orden - b.datos.orden);
    expect(bar.map((p) => p.datos.slug)).toEqual(['mi-pueblo-es', 'r3up', 'spify-af', 'punketa', 'raska']);
    expect(proyectos.find((p) => p.datos.slug === 'latrakablock')?.datos.oculto).toBe(true);
  });

  it('el nombre del archivo es el slug', () => {
    for (const p of proyectos) expect(p.archivo).toBe(`${p.datos.slug}.md`);
  });

  it('todas las fotos referenciadas existen', () => {
    const faltan: string[] = [];
    for (const p of proyectos) {
      const rutas = [p.datos.portada, ...p.datos.galeria.map((g) => g.src)];
      for (const l of p.datos.looks ?? []) rutas.push(l.portada, ...l.galeria.map((g) => g.src));
      for (const r of rutas) if (r && !existsSync(join(DIR, r))) faltan.push(`${p.archivo}: ${r}`);
    }
    expect(faltan).toEqual([]);
  });

  it('las galerías conservan todas las fotos del portfolio clásico', () => {
    const n = (slug: string) => proyectos.find((p) => p.datos.slug === slug)!.datos.galeria.length;
    expect(n('mi-pueblo-es')).toBe(16);
    expect(n('r3up')).toBe(8);
    expect(n('punketa')).toBe(9);
    expect(n('spify-af')).toBe(14);
    const looks = proyectos.find((p) => p.datos.slug === 'r3up')!.datos.looks!;
    expect(looks.map((l) => l.galeria.length)).toEqual([4, 4, 4]);
  });

  it('RASKA es borrador y no publica datos del evento', () => {
    const r = proyectos.find((p) => p.datos.slug === 'raska')!.datos as unknown as { borrador: boolean; cartel: Record<string, unknown> };
    expect(r.borrador).toBe(true);
    expect(Object.keys(r.cartel).sort()).toEqual(['subtitulo', 'titulo']);
  });

  it('el CV es válido y el teléfono no se publica hasta que Diego lo confirme', () => {
    const cv = esquemaCv.parse(cvJson);
    expect(cv.experiencia.length).toBeGreaterThan(0);
    expect(cv.contacto.telefonoPublico).toBe(false);
  });

  it('no queda ninguna foto de más de 2560 px de lado mayor sin reducir', async () => {
    const sharp = (await import('sharp')).default;
    const grandes: string[] = [];
    for (const p of proyectos) {
      for (const g of p.datos.galeria) {
        const m = await sharp(join(DIR, g.src)).metadata();
        if (Math.max(m.width ?? 0, m.height ?? 0) > 2560) grandes.push(g.src);
      }
    }
    expect(grandes).toEqual([]);
  });
});

describe('rutas e idiomas', () => {
  it('construye rutas con base, idioma y barra final', () => {
    expect(construirRuta('/portfolio/', '/', 'es')).toBe('/portfolio/');
    expect(construirRuta('/portfolio/', '/', 'en')).toBe('/portfolio/en/');
    expect(construirRuta('/portfolio', '/carta/', 'es')).toBe('/portfolio/carta/');
    expect(construirRuta('/portfolio/', 'proyectos/r3up', 'en')).toBe('/portfolio/en/proyectos/r3up/');
    expect(construirRuta('/', '/cv/', 'es')).toBe('/cv/');
  });

  it('los diccionarios ES y EN tienen las mismas claves y ninguna vacía', () => {
    const claves = (o: object, p = ''): string[] =>
      Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? claves(v, `${p}${k}.`) : [`${p}${k}`]));
    expect(claves(en)).toEqual(claves(es));
    const vacias = (o: object): unknown[] => Object.values(o).flatMap((v) => (typeof v === 'object' ? vacias(v) : v === '' ? [v] : []));
    expect(vacias(es)).toEqual([]);
    expect(vacias(en)).toEqual([]);
  });
});

describe('enlaces del portfolio clásico', () => {
  const slugs = new Set(['mi-pueblo-es', 'r3up', 'spify-af', 'punketa', 'raska']);
  it.each([
    ['#/cv', '/cv/'],
    ['#/p/oviu', '/proyectos/r3up/'],
    ['#/p/oviu/look/2', '/proyectos/r3up/look/2/'],
    ['#/p/mi-pueblo-es', '/proyectos/mi-pueblo-es/'],
    ['#/p/spify-af/', '/proyectos/spify-af/'],
    ['#/p/latrakablock', '/carta/'],
    ['#/p/no-existe', '/carta/'],
  ])('%s → %s', (hash, destino) => {
    expect(destinoDeHash(hash, slugs)).toBe(destino);
  });

  it('ignora los hashes que no son de la web vieja', () => {
    for (const h of ['', '#', '#/', '#contenido', '#look-1']) expect(destinoDeHash(h, slugs)).toBeNull();
  });
});

