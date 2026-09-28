// Migra el contenido del portfolio clásico (constantes PROJECTS y CV_DATA de index.html) a
// src/content/: un .md por proyecto con su frontmatter, cv.json y las fotos que la página usaba.
// Las fotos se COPIAN desde assets/ (el original no se toca); después, `npm run originales`.
//   npm run migrar            (no pisa lo que ya exista)
//   npm run migrar -- --forzar

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { stringify } from 'yaml';

const RAIZ = join(import.meta.dirname, '..');
const FORZAR = process.argv.includes('--forzar');
const DESTINO = join(RAIZ, 'src', 'content');

// --- 1. Leer los datos del index.html antiguo --------------------------------------------------
const html = readFileSync(join(RAIZ, 'index.html'), 'utf8');
const ini = html.indexOf('const PROJECTS = [');
const fin = html.indexOf('function loc(');
if (ini < 0 || fin < 0) throw new Error('No encuentro PROJECTS / loc() en index.html');
const { PROJECTS, CV_DATA, I18N } = runInNewContext(`${html.slice(ini, fin)}; ({ PROJECTS, CV_DATA, I18N })`);

// --- 2. Correspondencias con el bar ------------------------------------------------------------
/** id antiguo → datos nuevos. El orden es el de la tabla de la sección 4 de PROMPT_BAR.md. */
const BAR = {
  'mi-pueblo-es': {
    slug: 'mi-pueblo-es',
    orden: 1,
    objeto: 'tv',
    etiqueta: { es: 'Encender la tele', en: 'Turn on the TV' },
  },
  oviu: { slug: 'r3up', orden: 2, objeto: 'perchero-a', etiqueta: { es: 'Probarse', en: 'Try on' } },
  'spify-af': { slug: 'spify-af', orden: 3, objeto: 'perchero-b', etiqueta: { es: 'Probarse', en: 'Try on' } },
  punketa: { slug: 'punketa', orden: 4, objeto: 'revistero', etiqueta: { es: 'Leer', en: 'Read' } },
  latrakablock: {
    slug: 'latrakablock',
    orden: 6,
    objeto: 'rotulo',
    etiqueta: { es: 'Mirar el rótulo', en: 'Look at the sign' },
    // Fuera de los 5 proyectos del bar hasta que Diego decida (DECISIONES D11).
    oculto: true,
  },
};

const TAM = { quarter: 'cuarto', third: 'tercio', 'span-6': 'mitad', wide: 'ancho' };

/** Texto bilingüe normalizado: siempre { es, en }. */
function bi(v) {
  if (v == null) return { es: '', en: '' };
  if (typeof v === 'string') return { es: v, en: v };
  return { es: v.es ?? v.en ?? '', en: v.en ?? v.es ?? '' };
}

/** assets/oviu/look1/02.jpg → r3up/look1-02.jpg (relativo a src/content/proyectos). */
function rutaNueva(slug, src) {
  const partes = src.replace(/^assets\/[^/]+\//, '').split('/');
  return `${slug}/${partes.join('-')}`;
}

const copiadas = [];
function copiar(src, destinoRel) {
  const origen = join(RAIZ, src);
  const destino = join(DESTINO, 'proyectos', destinoRel);
  if (!existsSync(origen)) throw new Error(`Falta ${src}`);
  mkdirSync(dirname(destino), { recursive: true });
  if (FORZAR || !existsSync(destino)) copyFileSync(origen, destino);
  copiadas.push(destinoRel);
  return `./${destinoRel}`;
}

function imagenes(slug, lista = []) {
  return lista.map((im) => {
    const e = { src: copiar(im.src, rutaNueva(slug, im.src)), tam: TAM[im.size] ?? 'mitad' };
    if (im.fit) e.encajar = true;
    if (im.cap) e.pie = im.cap;
    return e;
  });
}

function escribir(ruta, contenido) {
  if (existsSync(ruta) && !FORZAR) {
    console.log(`  ya existe, no se toca: ${ruta.replace(RAIZ + '/', '')}`);
    return;
  }
  mkdirSync(dirname(ruta), { recursive: true });
  writeFileSync(ruta, contenido);
  console.log(`  escrito: ${ruta.replace(RAIZ + '/', '')}`);
}

function markdown(datos, cuerpo) {
  return `---\n${stringify(datos, { lineWidth: 0 })}---\n\n${cuerpo}\n`;
}

// --- 3. Proyectos ------------------------------------------------------------------------------
console.log('Proyectos:');
for (const p of PROJECTS) {
  const bar = BAR[p.id];
  if (!bar) throw new Error(`Proyecto sin correspondencia en el bar: ${p.id}`);
  const galeria = imagenes(bar.slug, p.images);
  // Portada: la que hubiera; si no, la primera foto de la galería (DECISIONES D12).
  const portada = p.cover ? copiar(p.cover, rutaNueva(bar.slug, p.cover)) : galeria[0]?.src;
  const d = {
    slug: bar.slug,
    idAntiguo: p.id,
    orden: bar.orden,
    titulo: { es: p.title, en: p.titleEn ?? p.title },
    tipo: bi(p.kind),
    anio: Number(p.year),
    objeto: bar.objeto,
    etiqueta: bar.etiqueta,
    portada,
  };
  if (p.video) d.video = p.video;
  d.sobre = bi(p.about);
  d.proceso = bi(p.process);
  d.resultado = bi(p.result);
  d.meta = (p.meta ?? []).map((m) => ({ k: bi(m.k), v: bi(m.v) }));
  if (p.imageLabel) d.rotuloGaleria = bi(p.imageLabel);
  d.galeria = galeria;
  if (p.looks) {
    d.looks = p.looks.map((l) => ({
      n: l.id,
      nombre: bi(l.name),
      descripcion: bi(l.desc),
      portada: copiar(l.cover, rutaNueva(bar.slug, l.cover)),
      galeria: imagenes(bar.slug, l.images),
    }));
  }
  if (p.font) d.fuente = copiar(p.font, rutaNueva(bar.slug, p.font));
  d.borrador = false;
  if (bar.oculto) d.oculto = true;
  escribir(
    join(DESTINO, 'proyectos', `${bar.slug}.md`),
    markdown(d, '<!-- Texto largo del proyecto (opcional). Los textos cortos van en el frontmatter, en ES y EN. -->'),
  );
}

// RASKA: nuevo, sin contenido todavía (spec, secciones 4 y 7.2).
escribir(
  join(DESTINO, 'proyectos', 'raska.md'),
  markdown(
    {
      slug: 'raska',
      orden: 5,
      titulo: { es: 'RASKA', en: 'RASKA' },
      tipo: { es: 'Proyecto nuevo', en: 'New project' },
      anio: 2026,
      objeto: 'cartel',
      etiqueta: { es: 'Mirar el cartel', en: 'Look at the poster' },
      // Textos del cartel del bar. No se publican nombres, fecha ni lugar hasta que Diego lo confirme.
      cartel: { titulo: 'RASKA', subtitulo: { es: 'PRÓXIMAMENTE', en: 'COMING SOON' } },
      sobre: { es: '', en: '' },
      proceso: { es: '', en: '' },
      resultado: { es: '', en: '' },
      meta: [],
      galeria: [],
      borrador: true,
    },
    '<!-- RASKA: a la espera del contenido de Diego. -->',
  ),
);

// --- 4. CV --------------------------------------------------------------------------------------
console.log('CV:');
const cvDir = join(DESTINO, 'cv');
mkdirSync(cvDir, { recursive: true });
if (FORZAR || !existsSync(join(cvDir, 'retrato.jpg'))) copyFileSync(join(RAIZ, 'assets/retrato.jpg'), join(cvDir, 'retrato.jpg'));
mkdirSync(join(RAIZ, 'public'), { recursive: true });
if (FORZAR || !existsSync(join(RAIZ, 'public/cv.pdf'))) copyFileSync(join(RAIZ, 'assets/cv.pdf'), join(RAIZ, 'public/cv.pdf'));
const cv = {
  nombre: 'Diego Pérez Muñoz',
  rol: { es: I18N.es.cv_name_sub, en: I18N.en.cv_name_sub },
  lugar: { es: I18N.es.subline_city, en: I18N.en.subline_city },
  perfil: bi(CV_DATA.intro),
  experiencia: CV_DATA.experience.map((e) => ({ cuando: e.when, que: bi(e.what), texto: bi(e.body) })),
  habilidades: CV_DATA.skills.map((h) => ({ k: bi(h.k), v: bi(h.v) })),
  formacion: CV_DATA.education.map((e) => ({ cuando: e.when, que: bi(e.what), texto: bi(e.body) })),
  contacto: {
    email: CV_DATA.contact.email,
    telefono: CV_DATA.contact.phone,
    // Hoy es público en main; en la web nueva no se muestra hasta que Diego lo confirme (DECISIONES D13).
    telefonoPublico: false,
  },
  actualizado: bi(CV_DATA.contact.updated),
};
escribir(join(DESTINO, 'cv.json'), `${JSON.stringify(cv, null, 2)}\n`);

console.log(`\n${copiadas.length} archivos de proyecto copiados o ya presentes. Ahora: npm run originales`);
