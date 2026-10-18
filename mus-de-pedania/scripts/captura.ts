// Capturas automáticas con Playwright (sección 16: revisar la mesa a 1x y 3x).
//   npx tsx scripts/captura.ts --url "?galeria=cartas" --escala 3 --salida screenshots/cartas.png [--esperar 800]
// Con --pasos "clic:120,150;espera:500;tecla:m" se pueden encadenar acciones antes de la captura;
// «hasta:<expresión JS>» espera a que la expresión sea cierta y «foto:nombre» guarda una intermedia.

import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { chromium } from 'playwright';
import { createServer } from 'vite';
import { argumentos } from './args';

const args = argumentos(process.argv.slice(2));
const escala = Number(args.escala ?? 3);
const url = String(args.url ?? '');
const salida = String(args.salida ?? 'screenshots/captura.png');
const esperar = Number(args.esperar ?? 800);
const pasos = String(args.pasos ?? '')
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean);
const capturasIntermedias = Boolean(args.intermedias);

const servidor = await createServer({ server: { port: 5299, strictPort: false }, logLevel: 'error' });
await servidor.listen();
const puerto = servidor.config.server.port ?? 5299;
const navegador = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH,
});
try {
  const ancho = Number(args.ancho ?? 320);
  const alto = Number(args.alto ?? 200);
  const pagina = await navegador.newPage({ viewport: { width: ancho * escala, height: alto * escala } });
  const errores: string[] = [];
  pagina.on('pageerror', (e) => errores.push(String(e)));
  pagina.on('console', (m) => {
    if (m.type() === 'error') errores.push(m.text());
  });
  await pagina.goto(`http://localhost:${puerto}/${url}`);
  await pagina.waitForTimeout(esperar);
  const canvas = pagina.locator('#pantalla');
  /** Punto lógico → píxel de la ventana (la resolución lógica cambia entre el bar y el juego). */
  const aVentana = async (x: number, y: number) => {
    const caja = (await canvas.boundingBox())!;
    const [w, h] = (await pagina.evaluate(
      "[document.getElementById('pantalla').width, document.getElementById('pantalla').height]",
    )) as [number, number];
    return [caja.x + (x + 0.5) * (caja.width / w), caja.y + (y + 0.5) * (caja.height / h)] as const;
  };
  let n = 0;
  for (const paso of pasos) {
    const [tipo, ...resto] = paso.split(':');
    const valor = resto.join(':');
    if (tipo === 'clic') {
      const [x, y] = valor.split(',').map(Number);
      await pagina.mouse.click(...(await aVentana(x, y)));
    } else if (tipo === 'mover') {
      const [x, y] = valor.split(',').map(Number);
      await pagina.mouse.move(...(await aVentana(x, y)));
    } else if (tipo === 'tecla') {
      await pagina.keyboard.press(valor);
    } else if (tipo === 'espera') {
      await pagina.waitForTimeout(Number(valor));
    } else if (tipo === 'eval') {
      await pagina.evaluate(valor);
    } else if (tipo === 'hasta') {
      await pagina.waitForFunction(valor, undefined, { timeout: 600_000, polling: 30 });
    } else if (tipo === 'foto') {
      const ruta = salida.replace(/\.png$/, `-${valor || ++n}.png`);
      mkdirSync(dirname(ruta), { recursive: true });
      await canvas.screenshot({ path: ruta });
      console.log(`Captura: ${ruta}`);
    }
    if (capturasIntermedias) {
      const ruta = salida.replace(/\.png$/, `-paso${++n}.png`);
      await canvas.screenshot({ path: ruta });
    }
  }
  mkdirSync(dirname(salida), { recursive: true });
  await canvas.screenshot({ path: salida });
  console.log(`Captura: ${salida}`);
  if (errores.length) {
    console.log('Errores en la página:');
    for (const e of errores) console.log(`  ${e}`);
    process.exitCode = 1;
  }
} finally {
  await navegador.close();
  await servidor.close();
}
