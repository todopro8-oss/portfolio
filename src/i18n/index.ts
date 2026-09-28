// Idiomas y rutas. `es` va sin prefijo y `en` en /en/… (spec, sección 3).

import { en } from './en';
import { es } from './es';

export type Idioma = 'es' | 'en';
export const IDIOMAS: readonly Idioma[] = ['es', 'en'];
export const CLAVE_IDIOMA = 'portfolio.lang';

const DICCIONARIOS = { es, en };

export function textos(idioma: Idioma): typeof es {
  return DICCIONARIOS[idioma];
}

export function otroIdioma(idioma: Idioma): Idioma {
  return idioma === 'es' ? 'en' : 'es';
}

/** Une la base del sitio, el prefijo del idioma y un camino como «/carta/» (siempre con barra final). */
export function construirRuta(base: string, camino: string, idioma: Idioma): string {
  const b = base.replace(/\/+$/, '');
  const c = camino.replace(/^\/+/, '').replace(/\/?$/, '/');
  const prefijo = idioma === 'en' ? '/en' : '';
  return `${b}${prefijo}/${c === '/' ? '' : c}`;
}

/** Ruta de una página del sitio en un idioma. */
export function ruta(camino: string, idioma: Idioma): string {
  return construirRuta(import.meta.env.BASE_URL, camino, idioma);
}

/** Elige el texto de un campo bilingüe del contenido. */
export function local(v: { es: string; en: string }, idioma: Idioma): string {
  return v[idioma] || v.es;
}
