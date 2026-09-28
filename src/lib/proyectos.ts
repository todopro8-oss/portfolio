// Consultas sobre la colección de proyectos.

import { getCollection, type CollectionEntry } from 'astro:content';
import { local, type Idioma } from '../i18n';

export type Proyecto = CollectionEntry<'proyectos'>;

/** Proyectos del bar (sin los ocultos), en el orden de la spec. Incluye los borradores. */
export async function proyectosDelBar(): Promise<Proyecto[]> {
  const todos = await getCollection('proyectos', (p) => !p.data.oculto);
  return todos.sort((a, b) => a.data.orden - b.data.orden);
}

/** Ronda anterior y siguiente, dando la vuelta. */
export function vecinos(lista: Proyecto[], slug: string): { anterior: Proyecto; siguiente: Proyecto } {
  const i = lista.findIndex((p) => p.data.slug === slug);
  const n = lista.length;
  return { anterior: lista[(i - 1 + n) % n], siguiente: lista[(i + 1) % n] };
}

/** El valor de la fila «Rol» de la ficha, si existe. */
export function rolDe(p: Proyecto, idioma: Idioma): string | undefined {
  const fila = p.data.meta.find((m) => m.k.es.toLowerCase() === 'rol');
  return fila ? local(fila.v, idioma) : undefined;
}

/** Id de YouTube de un enlace youtu.be/… o youtube.com/watch?v=… */
export function idYoutube(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}
