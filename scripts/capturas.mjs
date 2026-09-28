// Capturas de las páginas del build (spec, sección 21): escritorio a 1× y 2× y móvil.
// Sirve dist/ con `astro preview` y revisa que no haya errores de consola ni enlaces rotos internos.
//   npm run build && node scripts/capturas.mjs [--salida capturas]

import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { preview } from 'astro';
import { chromium } from 'playwright';

const RAIZ = join(import.meta.dirname, '..');
const i = process.argv.indexOf('--salida');
const SALIDA = i > 0 ? process.argv[i + 1] : join(RAIZ, 'capturas');
mkdirSync(SALIDA, { recursive: true });

const PAGINAS = [
  ['portada', '/'],
  ['carta', '/carta/'],
  ['mi-pueblo-es', '/proyectos/mi-pueblo-es/'],
  ['r3up', '/proyectos/r3up/'],
  ['r3up-look-2', '/proyectos/r3up/look/2/'],
  ['spify-af', '/proyectos/spify-af/'],
  ['punketa', '/proyectos/punketa/'],
  ['raska', '/proyectos/raska/'],
  ['cv', '/cv/'],
  ['mus', '/mus/'],
  ['en-carta', '/en/carta/'],
  ['en-r3up', '/en/proyectos/r3up/'],
];
const VISTAS = [
  { nombre: '1x', viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
  { nombre: '2x', viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 },
  { nombre: 'movil', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
];

const servidor = await preview({ root: RAIZ, server: { port: 4399 }, logLevel: 'error' });
const base = `http://localhost:4399/portfolio`;
const navegador = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const errores = [];
try {
  for (const v of VISTAS) {
    const ctx = await navegador.newContext(v);
    const pagina = await ctx.newPage();
    pagina.on('console', (m) => m.type() === 'error' && errores.push(`${v.nombre} ${pagina.url()}: ${m.text()}`));
    pagina.on('pageerror', (e) => errores.push(`${v.nombre} ${pagina.url()}: ${e}`));
    pagina.on('response', (r) => r.status() >= 400 && r.url().startsWith(base) && errores.push(`${r.status()} ${r.url()}`));
    for (const [nombre, camino] of PAGINAS) {
      if (v.nombre === '2x' && !['portada', 'mi-pueblo-es', 'cv'].includes(nombre)) continue;
      await pagina.goto(`${base}${camino}`, { waitUntil: 'networkidle' });
      // Fuerza la carga de las fotos diferidas antes de la captura de página completa.
      await pagina.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 40));
        }
        window.scrollTo(0, 0);
      });
      await pagina.waitForLoadState('networkidle');
      await pagina.screenshot({ path: join(SALIDA, `${nombre}-${v.nombre}.png`), fullPage: v.nombre !== '2x' });
    }
    await ctx.close();
  }
} finally {
  await navegador.close();
  await servidor.stop();
}
console.log(`Capturas en ${SALIDA}`);
if (errores.length) {
  console.log('Errores:');
  for (const e of errores) console.log(`  ${e}`);
  process.exitCode = 1;
} else console.log('Sin errores de consola ni respuestas 4xx/5xx.');
