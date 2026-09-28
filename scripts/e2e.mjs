// Prueba de extremo a extremo del build: enlaces antiguos, visor, idioma, vídeo y 404.
//   npm run build && node scripts/e2e.mjs

import { join } from 'node:path';
import { preview } from 'astro';
import { chromium } from 'playwright';

const RAIZ = join(import.meta.dirname, '..');
const servidor = await preview({ root: RAIZ, server: { port: 4398 }, logLevel: 'error' });
const B = 'http://localhost:4398/portfolio';
const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await nav.newPage();
const ok = (c, m) => console.log(`${c ? 'OK ' : 'MAL'} ${m}`);
try {
  await p.goto(`${B}/#/p/oviu/look/2`);
  await p.waitForURL(/look\/2\/$/);
  ok(p.url().endsWith('/portfolio/proyectos/r3up/look/2/'), `hash antiguo → ${p.url()}`);

  await p.goto(`${B}/#/cv`);
  await p.waitForURL(/\/cv\/$/);
  ok(true, `#/cv → ${p.url()}`);

  await p.goto(`${B}/proyectos/punketa/`);
  await p.locator('[data-galeria] a[data-lightbox]').first().click();
  await p.waitForSelector('dialog[open]');
  ok(true, `visor abierto: ${await p.locator('[data-cuenta]').textContent()}`);
  await p.keyboard.press('ArrowRight');
  ok((await p.locator('[data-cuenta]').textContent()) === '2 / 9', `flecha derecha: ${await p.locator('[data-cuenta]').textContent()}`);
  await p.keyboard.press('Escape');
  ok((await p.locator('dialog[open]').count()) === 0, 'Esc cierra el visor');

  await p.getByRole('link', { name: 'English' }).click();
  await p.waitForURL(/\/en\/proyectos\/punketa\/$/);
  ok(true, `cambio de idioma → ${p.url()}`);
  ok((await p.getAttribute('html', 'lang')) === 'en', 'html lang=en tras navegar sin recarga');

  await p.goto(`${B}/`);
  await p.waitForURL(/\/en\/$/);
  ok(true, `idioma recordado en la portada → ${p.url()}`);

  await p.goto(`${B}/proyectos/mi-pueblo-es/`);
  await p.locator('[data-video] button').click();
  const src = await p.locator('[data-video] iframe').getAttribute('src');
  ok(src?.startsWith('https://www.youtube-nocookie.com/embed/wHM5rLot01g'), `vídeo: ${src}`);

  const r = await p.goto(`${B}/no-existe/`);
  ok(r?.status() === 404, `404: ${r?.status()}`);
} finally {
  await nav.close();
  await servidor.stop();
}
