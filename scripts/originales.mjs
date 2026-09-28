// Reduce las fotos de src/content/ a 2560 px de lado mayor antes de commitearlas (spec, sección 3).
// Las que ya caben no se tocan (así no se recomprimen en cada pasada). Respeta la orientación EXIF y
// quita los metadatos (fecha, cámara, GPS). Las versiones AVIF/WebP las genera Astro al compilar.
//   npm run originales

import { readdirSync, renameSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import sharp from 'sharp';

const RAIZ = join(import.meta.dirname, '..');
const LADO_MAX = 2560;

function* fotos(dir) {
  for (const n of readdirSync(dir)) {
    const ruta = join(dir, n);
    if (statSync(ruta).isDirectory()) yield* fotos(ruta);
    else if (/\.(jpe?g|png)$/i.test(n)) yield ruta;
  }
}

let reducidas = 0;
let antes = 0;
let despues = 0;
for (const ruta of fotos(join(RAIZ, 'src'))) {
  const img = sharp(ruta);
  const { width = 0, height = 0, orientation } = await img.metadata();
  // Con orientación EXIF 5-8 el lado mayor real es el otro, pero da igual: se compara el mayor.
  if (Math.max(width, height) <= LADO_MAX && (!orientation || orientation === 1)) continue;
  const tmp = `${ruta}.tmp`;
  const salida = sharp(ruta).rotate().resize({ width: LADO_MAX, height: LADO_MAX, fit: 'inside', withoutEnlargement: true });
  if (/\.png$/i.test(ruta)) await salida.png({ compressionLevel: 9 }).toFile(tmp);
  else await salida.jpeg({ quality: 88, mozjpeg: true }).toFile(tmp);
  antes += statSync(ruta).size;
  despues += statSync(tmp).size;
  renameSync(tmp, ruta);
  reducidas++;
  console.log(`  ${relative(RAIZ, ruta)}: ${width}×${height} → ≤ ${LADO_MAX} px`);
}
const mb = (b) => (b / 1e6).toFixed(1);
console.log(reducidas ? `${reducidas} fotos reducidas: ${mb(antes)} MB → ${mb(despues)} MB` : 'Nada que reducir.');
