# Auditoría H0 — punto de partida

Hecha el 28 de septiembre de 2026 sobre `main` en `69cadc8` («Remove Spify AF cover image», 1 de junio
de 2026) y sobre Mus de Pedanía en `a7aba50`. Resume lo encontrado y el plan; las decisiones que salen de
aquí están numeradas en `DECISIONES.md`.

## 1. El portfolio actual

### Código

| Punto de la spec (sección 1)                          | Verificado | Detalle                                                                                                                                  |
| ----------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Un único `index.html` con React 18 dev + Babel        | Sí         | `react.development.js` y `react-dom.development.js` 18.3.1 y `@babel/standalone` 7.29.0 desde unpkg; JSX en `<script type="text/babel">` |
| HTML servido vacío                                    | Sí         | Todo se pinta en `#root` con `createRoot`; sin JS no hay contenido                                                                       |
| Enrutado por hash                                     | Sí         | `#/`, `#/cv`, `#/p/<id>`, `#/p/<id>/look/<n>` (`parseHash`)                                                                              |
| Bilingüe con `I18N` + `loc()` y `portfolio.lang`      | Sí         |                                                                                                                                          |
| Sin `meta description`, Open Graph ni reduced motion  | Sí         | Solo `charset`, `viewport` y `title`; `styles.css` no tiene `prefers-reduced-motion`                                                     |
| Easter egg con sonidos meme y `easter-egg.mp4`        | Sí         | 10 mp3 de `assets/sounds/` (nombres de memes de terceros). El mp4 lo generó una herramienta de Google (ver D5)                           |
| Tipografías                                           | —          | Google Fonts: Archivo, Archivo Narrow, Inter y JetBrains Mono. Panel «Tweaks»: claro/oscuro, B/N y tipografía                            |
| Despliegue                                            | —          | Sin `.github/workflows`: Pages publica la rama `main` tal cual. En el remoto solo hay `main` y ninguna etiqueta                          |

### Contenido (`PROJECTS` y `CV_DATA`)

| id             | Título       | Tipo                 | Año  | Fotos en la página | Notas                                                                    |
| -------------- | ------------ | -------------------- | ---- | ------------------ | ------------------------------------------------------------------------ |
| `mi-pueblo-es` | MI PUEBLO ES | Proyecto audiovisual | 2025 | 16 de 17           | Vídeo de YouTube, 11:17. `08.jpg` no se usa. Sin portada (`cover: ""`)   |
| `oviu`         | R3UP         | Identidad · Moda     | 2025 | 8 + 3 looks × 5    | Looks 1–3 (Oficinista, Motero, Fiesta). Sin portada propia               |
| `punketa`      | PUNKETA      | Proyecto editorial   | 2024 | 9 + portada        | 48 pp., rejilla de 6 columnas. Es el proyecto «Destacado»                |
| `latrakablock` | LATRAKABLOCK | Proyecto tipográfico | 2024 | 7                  | Fuente `LATRAKABLOCK-Regular.ttf` (40 KB). Fuera de los 5 del bar        |
| `spify-af`     | SPIFY AF     | Proyecto de moda     | 2023 | 14                 | El último commit quitó su portada. Nombre por confirmar (SPIFY o SPICY)  |

El CV tiene perfil (ES/EN, en HTML), 6 experiencias (incluida la de camarero), 8 bloques de habilidades,
formación, teléfono y email, y la fecha «Junio 2026». Hay un dato que caduca solo («20 años», fijo en
`I18N`) y erratas que revisar a mano al migrar (p. ej. «Nanobana»).

### Peso de `assets/`

`du` da 274 MiB (286 MB). **La página solo usa 52 MB**; el resto son originales que no enlaza nadie:

| Qué                                        | Archivos | Peso    | Tamaño             | ¿Se usa? |
| ------------------------------------------ | -------- | ------- | ------------------ | -------- |
| `spify/01–09.png`                          | 9        | ~104 MB | 6240×4160          | No       |
| `oviu/01–15.jpg`                           | 15       | 79 MB   | 4903–5616 px       | No       |
| `latrakablock/01–09.jpg`                   | 9        | ~48 MB  | hasta 4288×2848    | No       |
| `mi-pueblo/*.jpg`                          | 16       | 35 MB   | 1920–5184 px       | Sí       |
| Resto usado (proyectos, CV, retrato, vídeo y sonidos) | 68 | ~17 MB | fotos a ~1920 px | Sí     |
| Otros sin usar                             | 6        | ~3 MB   | `cv-reference.jpg`, `easter-egg.webp`, `mi-pueblo/08`, `punketa/05` y `11`, `oviu/identidad/05` | No |

Las imágenes de 4288×2848 y ~5 MB que cita la spec son justo las de LATRAKABLOCK que no se muestran. Lo
que de verdad pesa al visitante es MI PUEBLO ES (35 MB en 16 fotos, una de 10,3 MB).

El `.git` ocupa 271 MB **en un clon superficial** (solo el último commit): es el tamaño de la instantánea
actual, no del historial completo, que no he descargado.

## 2. Mus de Pedanía (lo que se reutiliza)

Estado: H0–H8 de su spec hechos, 70 tests en verde, lint y build limpios. TypeScript + Vite, Canvas 2D
a 320×200, sin dependencias en tiempo de ejecución.

| Pieza                                                                  | Destino         | Qué hay que tocar                                                                                                          |
| ---------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `core/loop`, `sceneManager`, `tween`, `rng`                            | `src/engine/`   | Nada: no dependen del juego                                                                                                |
| `core/pantalla`, `core/input`                                          | `src/engine/`   | Resolución fija 320×200 (constantes `ANCHO`/`ALTO`) y escalado en px CSS: hay que parametrizarla y escalar en px de dispositivo (spec 10.1) |
| `core/bitmapFont`, `data/palette`, `render/pixel`, `render/bubbles`    | `src/engine/`   | Nada importante; la fuente ya tiene ÁÉÍÓÚÜÑ¡¿«» y variantes tiza/dorada                                                     |
| `art/spriteSheet` (lector de JSON de Aseprite), `art/placeholderGen`   | `src/engine/`   | Ya carga PNG + JSON de Aseprite con tags; el generador de bustos sirve para el placeholder de Diego                         |
| `audio/synth`, `sequencer`, `sfx`, `babble`                            | `src/engine/`   | Solo dependen del RNG. `audio/motor` depende de las opciones y las voces del juego: se parte en motor común + capa del juego |
| `mus/`, `ai/`, `scenes/`, cartas, piedras, mesa, `barScene`, cameos    | `src/game/`     | Se mueven con sus tests                                                                                                    |

Puntos de fricción para el H6:

- **Sin desmontaje**: `main.ts` crea el canvas, el bucle y los listeners una sola vez. Para vivir en una
  isla con `<ClientRouter />` hace falta `montar(canvas)` / `desmontar()` (parar el bucle, soltar
  listeners y audio).
- **Entrada directa a la selección de compañero**: ya existe (`flujo.partida()` y el torneo abren
  `CharacterSelect`); solo falta la ruta y el selector Partida / Torneo.
- **Nicanor** aparece en 9 archivos (46 menciones: bar, voces, líneas, intro, fin de partida). Pasa a ser
  Diego.
- **Audio**: el juego desbloquea su propio `AudioContext` en el primer gesto. En el portfolio debe usar el
  que desbloquea la puerta del bar.
- **Idioma**: todo el juego está en español (`ui.es.ts`, `lines.es.ts`). Ver D8.
- Pendientes del juego pedidos antes de este cambio: cartas destapadas de los rivales más legibles y
  baraja más detallada al estilo tradicional. Ver D6 y D7.

## 3. Plan

1. **H1 (siguiente)**: Astro en la rama `bar` junto a los archivos antiguos; script que migra `PROJECTS` y
   `CV_DATA` a `src/content/` (y luego revisión a mano); `npm run originales` sobre las fotos que se
   usan; carta, CV y plantilla de proyecto en ES/EN; redirecciones de hash. Resultado: la web de
   contenido funciona sola, rápida y sin escena.
2. **H2–H5**: motor compartido, fachada, interior con placeholders, transiciones y Diego camarero.
3. **H6**: el juego se muda a `src/game/` sin romper sus tests.
4. **H7–H8**: arte final (con lo que aporte Diego), accesibilidad, SEO, presupuestos y despliegue.

Lo que necesita respuesta de Diego está al final de `DECISIONES.md`.
