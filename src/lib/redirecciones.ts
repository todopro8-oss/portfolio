// Enlaces del portfolio clásico (#/cv, #/p/<id>, #/p/<id>/look/<n>) → rutas nuevas (spec, sección 3).

/** Ids antiguos que cambian de slug. */
export const SLUGS_ANTIGUOS: Record<string, string> = { oviu: 'r3up' };

/** Ids antiguos sin página en la web nueva: van a la carta (DECISIONES D11). */
export const A_LA_CARTA = new Set(['latrakablock']);

/**
 * Camino nuevo (sin base ni idioma) para un hash antiguo, o null si el hash no es de la web vieja.
 * `slugs` son los proyectos con página; lo que no esté ahí acaba en la carta.
 */
export function destinoDeHash(hash: string, slugs: ReadonlySet<string>): string | null {
  const h = hash.replace(/^#\/?/, '').replace(/\/+$/, '');
  if (h === '') return null;
  if (h === 'cv') return '/cv/';
  const m = h.match(/^p\/([\w-]+)(?:\/look\/(\d+))?$/);
  if (!m) return null;
  const id = m[1];
  if (A_LA_CARTA.has(id)) return '/carta/';
  const slug = SLUGS_ANTIGUOS[id] ?? id;
  if (!slugs.has(slug)) return '/carta/';
  return m[2] ? `/proyectos/${slug}/look/${m[2]}/` : `/proyectos/${slug}/`;
}
