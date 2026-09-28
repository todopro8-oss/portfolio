# CLAUDE.md — Diego Pérez Bar (portfolio v2)

Portfolio de Diego Pérez Muñoz convertido en un bar en pixel art. La especificación completa está en
`PROMPT_BAR.md`; este archivo es el resumen operativo. Lo que interpreta o corrige la spec va en
`DECISIONES.md`, y lo encontrado en el repo al empezar, en `AUDITORIA.md`.

## Cambio de rumbo

- Antes: este repo era un portfolio clásico (un `index.html` con React + Babel en el navegador).
  Ese estado queda etiquetado como `v1-portfolio-clasico` y sigue publicado desde `main`.
- Ahora: se trabaja en la rama **`bar`**. El visitante llega a la fachada de «Diego Pérez Bar», entra,
  Diego es el camarero y los objetos del bar son los proyectos. En una esquina está la mesa de mus.
- El juego **Mus de Pedanía** (repo `todopro8-oss/ferias-2026`, carpeta `mus-de-pedania/`, copia de
  seguridad en el commit `a7aba50` de la rama `claude/new-session-eqp2k1`) se integrará en `/mus/` en el
  H6. Su spec (`PROMPT.md` de ese proyecto) sigue vigente: reglas, IA, señas y originalidad.

## Reglas que no se negocian

- **Nada se borra**: ni el proyecto de mus, ni ramas, ni historial de git. No se reescribe la historia
  (el `.git` pesa mucho y limpiarlo es decisión de Diego).
- **Deploy a Pages solo desde `main`**, y solo cuando Diego dé el visto bueno. Hasta entonces, `bar`,
  builds locales (`astro preview`) y capturas.
- **El envoltorio es pixel art; el trabajo no**: las fotos de los proyectos se ven a calidad completa.
- **1 clic para entrar, 1 clic para abrir** un proyecto; «La carta» siempre a un clic.
- **Sonido solo tras un gesto** (el clic en la puerta).
- **Originalidad**: nada de personas reales salvo Diego (titular del portfolio, ver `DECISIONES.md` D4);
  nada de assets de terceros. Los sonidos meme del portfolio antiguo no se reutilizan; audio propio o CC0.
- Las decisiones de la sección 19 de la spec **no las toma Claude**: se pregunta y se deja placeholder.

## Stack (desde el H1)

- Astro (salida estática) + TypeScript estricto, GitHub Pages con GitHub Actions (`withastro/action`).
- `site: 'https://todopro8-oss.github.io'`, `base: '/portfolio'`.
- Motor de escena compartido con el juego en `src/engine/` (Canvas 2D, sin Phaser/Pixi/React).
- Islas cliente: escena del bar (`client:only`) en `/` y juego en `/mus/`. Carta, CV y proyectos: HTML
  estático con muy poco JS. `<ClientRouter />` para navegar sin recargar.
- i18n de Astro: `es` sin prefijo, `en` en `/en/…`. Todas las cadenas en `src/i18n/`.
- Imágenes con `astro:assets` (AVIF/WebP, 640/1280/1920/2560). `npm run originales` reduce a 2560 px.

## Estructura prevista

```
src/engine/      bucle, escenas, entrada, pantalla (resolución configurable), fuente bitmap, paleta,
                 tweens, RNG, Pixeles, hojas Aseprite, audio (synth, secuenciador, sfx, balbuceo)
src/bar/         escena del bar: fachada, interior, hotspots, Diego, cámara, transiciones
src/game/        Mus de Pedanía (movido en el H6 con sus tests)
src/content/     proyectos/<slug>.md (fuente única de verdad) y cv.json
src/i18n/        es.ts, en.ts
src/pages/       /, /carta/, /proyectos/<slug>/, /proyectos/r3up/look/<n>/, /cv/, /mus/ y /en/…
src/components/  Carta, ProyectoPlantilla, Galeria, Lightbox, ContactoCard, UIChrome
public/sprites/  atlas PNG + JSON de Aseprite; public/audio/
```

En la raíz siguen los archivos del portfolio clásico (`index.html`, `styles.css`, `assets/`): Astro no
los usa y `npm run migrar` lee de ahí. No se borran (ver D3).

Hechos en el H1: `src/content.config.ts` (esquema zod), `src/lib/` (proyectos, CV, redirecciones de hash,
sprites provisionales), `src/components/` (UIChrome, Carta, ProyectoPlantilla, LookPlantilla, Galeria,
Lightbox, VideoFachada, ContactoCard, PaginaCv, Portada, PaginaSimple, SpriteObjeto), `src/layouts/Base`.
Cada página existe en `src/pages/` y en `src/pages/en/` como envoltorio fino de un componente.

## Comandos

```
npm run dev          # servidor de desarrollo (http://localhost:4321/portfolio/)
npm test             # Vitest: contenido, rutas, textos, redirecciones
npm run build        # astro check + build estático en dist/ (la 1.ª vez ~4,5 min por las fotos)
npm run preview      # sirve dist/
npm run migrar       # vuelve a generar src/content desde el index.html clásico (--forzar para pisar)
npm run originales   # reduce a 2560 px las fotos nuevas de src/ antes de commitear
node scripts/capturas.mjs [--salida dir]   # capturas 1×, 2× y móvil + errores de consola y 404
```

Chromium para Playwright: `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (o `CHROMIUM_PATH`).

## Hitos

| Hito | Contenido                                                                 | Estado    |
| ---- | ------------------------------------------------------------------------- | --------- |
| H0   | Auditoría, etiqueta y rama, este archivo, `DECISIONES.md`, `AUDITORIA.md` | Hecho     |
| H1   | Astro + i18n + contenido migrado + carta + CV + proyectos + redirecciones | Hecho     |
| H2   | Motor compartido + fachada (rótulo como barra de carga, puerta, audio)    | Pendiente |
| H3   | Interior con placeholders, hotspots DOM, hover, lupa, paneo en móvil      | Pendiente |
| H4   | Transiciones: squash, hit-stop, zoom por pasos, iris, vuelta al objeto    | Pendiente |
| H5   | Diego camarero: tareas, mirar al cursor, señalar, diálogo «Sobre mí»      | Pendiente |
| H6   | Juego en `/mus/`: selección de compañero directa, salida al bar, Diego    | Pendiente |
| H7   | Arte final: pipeline Aseprite, TV con vídeo pixelado, cartel RASKA, audio | Pendiente |
| H8   | Accesibilidad, SEO, presupuestos, Playwright, despliegue                  | Pendiente |

Al cerrar cada hito: commit descriptivo, capturas de la escena a 1×, 2× y en viewport móvil, y un
resumen breve de lo hecho y lo pendiente.

## Convenciones

- Identificadores y comentarios en español, como en el juego. Textos visibles siempre desde `src/i18n/`
  o desde el contenido (`src/content/`), nunca sueltos en el código.
- Slugs: `mi-pueblo-es`, `r3up` (antes `oviu`), `spify-af` (nombre por confirmar), `punketa`, `raska`.
- Enlaces antiguos por hash (`#/p/<id>`, `#/p/<id>/look/<n>`, `#/cv`) redirigen a las rutas nuevas.
- Si la spec choca con el código real: parar, explicarlo en `DECISIONES.md` y proponer alternativa.
