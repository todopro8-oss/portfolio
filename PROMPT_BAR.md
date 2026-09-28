# PROMPT PARA CLAUDE CODE — «Diego Pérez Bar» (portfolio v2)

> Uso: guarda este archivo como `PROMPT_BAR.md` en la raíz del proyecto y dile a Claude Code:
> «Lee PROMPT_BAR.md completo y ejecuta el Hito 0. No borres nada del proyecto de mus.»

---

## 0. Cambio de rumbo (léelo primero)

Hasta ahora estabas construyendo **Mus de Pedanía**, un juego de mus en pixel art (spec en `PROMPT.md`; ya existe una copia de seguridad). El proyecto cambia de foco:

**El juego pasa a vivir dentro del nuevo portfolio de Diego Pérez Muñoz**, diseñador gráfico (IED Madrid) con orientación audiovisual. El portfolio es un bar en pixel art, **«Diego Pérez Bar»**:

1. El visitante llega a la **fachada** y entra por la **puerta**.
2. Dentro, **Diego es el camarero**: limpia y trajina detrás de la barra.
3. Los **objetos del bar son sus proyectos**. Al hacer clic, el objeto hace un pequeño movimiento de videojuego y te lleva a la página del proyecto.
4. En una **esquina está la mesa de mus**: un clic y entras directamente al juego, en la selección de compañero.

Todo lo decidido en `PROMPT.md` para el juego (reglas, IA, señas, límites de originalidad de la sección 2) **sigue vigente**. Lo que cambia es dónde vive el juego y quién es el camarero.

Ahora NO toca profundizar en el contenido de cada proyecto: se construyen la idea, la escena, la interacción y una plantilla provisional de página de proyecto con el contenido que ya existe.

---

## 1. Auditoría del portfolio actual (repo `todopro8-oss/portfolio`, GitHub Pages)

URL: https://todopro8-oss.github.io/portfolio/ — Diego no se siente identificado con él.

Lo que hay (verifícalo tú al clonar):

- Un único `index.html` con **React 18 en build de desarrollo desde unpkg + Babel standalone transpilando JSX en el navegador**. Es lento y el HTML servido está vacío (sin contenido para buscadores ni para las previsualizaciones al compartir el enlace).
- Enrutado por hash: `#/`, `#/cv`, `#/p/<id>`, `#/p/<id>/look/<n>`.
- Bilingüe ES/EN con `I18N` + `loc()`; idioma guardado en `localStorage` (`portfolio.lang`).
- **Datos que hay que migrar** (constantes `PROJECTS` y `CV_DATA`):
  - `mi-pueblo-es` — MI PUEBLO ES, proyecto audiovisual (2025): retrato de Trillo, 11:17, YouTube `https://youtu.be/wHM5rLot01g`, 16 fotos en `assets/mi-pueblo/`.
  - `oviu` → título **R3UP**, identidad y moda (2025): 3 looks (Oficinista, Motero, Fiesta) con subpáginas, identidad y packaging en `assets/oviu/`.
  - `punketa` — PUNKETA, proyecto editorial (2024): revista de 48 pp., rejilla de 6 columnas, `assets/punketa/`.
  - `latrakablock` — LATRAKABLOCK, proyecto tipográfico (2024), con la fuente `LATRAKABLOCK-Regular.ttf`. **No está en la lista de 5 proyectos del bar** (ver sección 19).
  - `spify-af` — **SPIFY AF**, cápsula de camisetas serigrafiadas (2023). Diego lo ha escrito como «SPICY AF»: confirmar el nombre correcto antes de publicar.
  - CV completo (experiencia, habilidades, formación, contacto), `assets/cv.pdf`, `assets/retrato.jpg`.
- Easter egg: al clicar todas las letras del nombre suenan efectos y se reproduce `assets/easter-egg.mp4` (5 s). Varios sonidos de `assets/sounds/` son memes sacados de series y programas de terceros. **No los reutilices**; el nuevo easter egg usa sonidos propios o CC0.
- Imágenes enormes: p. ej. `latrakablock/*.jpg` a 4288×2848 y ~5 MB cada una; `assets/` pesa ~274 MB y `.git` ~271 MB. GitHub Pages recomienda repos de hasta 1 GB, sitios publicados de 1 GB como máximo y un ancho de banda blando de 100 GB/mes.
- Sin `meta description`, sin Open Graph, sin `prefers-reduced-motion`.

---

## 2. Principios de diseño (basados en investigación)

1. **La gente que contrata decide rápido.** En un estudio con 16 responsables de diseño y 243 candidaturas, tardaron de media 55 s en decidir si entrevistaban. Por eso:
   - de la llegada al primer proyecto: 1 clic para entrar y 1 clic para abrir, con animaciones cortas;
   - un atajo visible **«La carta»** con todo el trabajo en lista, CV y contacto, a un clic desde cualquier pantalla.
2. **El envoltorio es pixel art; el trabajo NO.** Las imágenes pequeñas, pixeladas o sin zoom son un motivo clásico de descarte. Las páginas de proyecto muestran las fotos a calidad completa, con zoom.
3. **Nada de «pixel hunting».** El problema clásico de las aventuras gráficas es buscar a ciegas dónde se puede clicar. Soluciones que aplicamos:
   - nombre del objeto al pasar el ratón, al estilo de las aventuras de los 90;
   - botón que revela todos los puntos interactivos a la vez;
   - áreas de clic generosas (chunky hitboxes);
   - pistas de atención sutiles en lo no visitado.
4. **Móvil de primera.** Muchos primeros vistazos a un portfolio ocurren en el móvil. Áreas táctiles de al menos 24×24 px CSS (WCAG 2.2, 2.5.8, nivel AA); objetivo real 44×44.
5. **Dos caras, una sola fuente de contenido.** Web de contenido rápida y rastreable (páginas estáticas de proyecto, carta, CV) + escena interactiva que carga encima. Si la escena falla o el usuario prefiere menos movimiento, todo sigue accesible.
6. **Sonido solo tras un gesto.** Los navegadores permiten vídeo silenciado en autoplay, pero el audio exige interacción del usuario. El clic en la puerta es ese gesto y desbloquea el audio.
7. **Transiciones robustas.** Las View Transitions de mismo documento son Baseline desde Firefox 144 (octubre de 2025); las de documento cruzado siguen sin Firefox. La transición principal se hace en canvas + CSS (funciona en todas partes); las View Transitions son solo un extra progresivo.
8. **Pixel art nítido.** Escalado entero en píxeles de dispositivo e `image-rendering: pixelated`, sin posiciones subpíxel.

---

## 3. Stack y arquitectura

- **Astro (salida estática) + TypeScript estricto**, desplegado en GitHub Pages con GitHub Actions (`withastro/action`).
  - `site: 'https://todopro8-oss.github.io'`, `base: '/portfolio'`, configurable para un dominio propio futuro (p. ej. `diegoperez.bar` si está libre).
- **Motor de escena compartido** con el juego: extrae de Mus de Pedanía a `src/engine/` lo reutilizable (bucle, sprites Aseprite, fuente bitmap, paleta, tweens, audio, RNG). El bar y el mus lo usan igual. Canvas 2D, sin Phaser/Pixi/React.
- **Islas cliente**: la escena del bar (`client:only`) en `/` y el juego en `/mus/`, cargados bajo demanda. Las páginas de proyecto, la carta y el CV son HTML estático con muy poco JS.
- **Navegación**: `<ClientRouter />` de Astro para navegar sin recargar. La transición de videojuego (sección 10) la controla el motor antes de llamar a `navigate()`.
- **i18n**: Astro i18n, `es` por defecto sin prefijo, `en` en `/en/…`. Todas las cadenas en diccionarios; se acabaron los textos sueltos en el código.
- **Imágenes**: `astro:assets` (sharp) → AVIF/WebP con anchos 640/1280/1920/2560 y `srcset`. Script `npm run originales` que reduce los originales a 2560 px de lado mayor antes de commitear.

Rutas:

```
/                        fachada + interior del bar (isla canvas) + contenido HTML equivalente oculto a la vista pero accesible
/carta/                  índice rápido: proyectos, CV, contacto (sin canvas)
/proyectos/<slug>/       página de proyecto (plantilla provisional)
/proyectos/r3up/look/<n>/
/cv/
/mus/                    juego (entra directo a selección de compañero)
/en/…                    mismas rutas en inglés
```

Compatibilidad con enlaces antiguos: en `/`, si llega `#/p/oviu`, `#/p/<id>`, `#/p/<id>/look/<n>` o `#/cv`, redirige a la ruta nueva. Mapa de slugs: `oviu → r3up`; los demás iguales.

Estructura:

```
src/
  engine/        (compartido con el juego)
  bar/           scene.ts, layout.ts, hotspots.ts, diego.ts, camera.ts, transitions.ts, attention.ts, facade.ts, touch.ts
  game/          (código de Mus de Pedanía movido aquí, sin romper sus tests)
  content/proyectos/<slug>.md   (fuente única de verdad)
  content/cv.json
  i18n/es.ts, en.ts
  pages/…
  components/    Carta.astro, ProyectoPlantilla.astro, Galeria.astro, Lightbox, ContactoCard, UIChrome (La carta · ES/EN · sonido)
public/sprites/  atlas PNG + JSON (Aseprite), audio/
```

---

## 4. Modelo de contenido (`src/content/proyectos/*.md`)

Frontmatter por proyecto (validado con esquema zod):

```yaml
slug: mi-pueblo-es
orden: 1
titulo: { es: "MI PUEBLO ES", en: "MY TOWN IS" }
tipo: { es: "Proyecto audiovisual", en: "Audiovisual project" }
anio: 2025
objeto: tv            # tv | perchero-a | perchero-b | revistero | cartel | (rotulo: opcional)
etiqueta: { es: "Encender la tele", en: "Turn on the TV" }
portada: ./img/cover.jpg
video: https://youtu.be/wHM5rLot01g
bucleTV: ./tv-loop.webm          # 10-15 s, sin audio, lo aporta Diego (placeholder mientras tanto)
meta: [...]                      # migrado de PROJECTS
galeria: [...]                   # migrado de PROJECTS
borrador: false
```

Los 5 proyectos del bar:

| Orden | Proyecto | Objeto en el bar | Estado |
|---|---|---|---|
| 1 | MI PUEBLO ES | Televisor antiguo con el vídeo | Migrar |
| 2 | R3UP | Perchero, percha A | Migrar (incluye looks) |
| 3 | SPIFY AF (confirmar nombre) | Perchero, percha B | Migrar |
| 4 | PUNKETA | Revista en la estantería, entre otras revistas | Migrar |
| 5 | RASKA | Cartel en el centro del bar; **lo que más llama la atención** | Nuevo; `borrador: true` hasta que Diego aporte contenido |
| — | LATRAKABLOCK | Opcional: rótulo del bar compuesto en esta tipografía | Desactivado; preguntar a Diego |

---

## 5. Flujo de la experiencia

```
[Fachada] --clic en puerta / Intro--> [Interior] --clic en objeto--> [Página de proyecto] --«Volver a la barra»/Esc--> [Interior, con la cámara saliendo del objeto]
                                   |--clic en mesa de mus--> [/mus/ selección de compañero] --Salir--> [Interior, junto a la mesa]
                                   |--«La carta» (siempre visible)--> [/carta/]
```

- Primera visita: fachada → interior. Visitas posteriores (flag en `localStorage`): se entra directamente al interior, con la puerta cerrándose detrás en 300 ms. Opción «Ver la fachada» en el menú de la carta.
- Llegar por enlace directo a un proyecto → la página de proyecto carga sin escena; «Volver a la barra» lleva al interior.

---

## 6. Escena 1: la fachada

Resolución lógica **480×270** (16:9; escala entera ×2/×3/×4 a 960×540, 1440×810 y 1920×1080).

- Calle de barrio al anochecer: acera, bordillo, farola, cubo de basura, un gato que cruza de vez en cuando.
- Edificio con toldo, persiana metálica a medio subir en la ventana lateral y, a través del cristal, luz cálida y siluetas jugando a las cartas.
- **Rótulo «DIEGO PÉREZ BAR»** (caja de luz o letras de neón). Si Diego activa LATRAKABLOCK, se compone con su tipografía.
- Cartel «ABIERTO» colgado en la puerta.
- **La carga es el rótulo**: mientras se precargan los assets del interior, las letras del rótulo se encienden una a una según el progreso. Cuando todo está listo, el cartel gira a «ABIERTO» y aparece bajo la puerta, parpadeando, **«PULSA PARA ENTRAR»** (el «Press Start» clásico).
- Si se hace clic antes de terminar la carga, Diego asoma la cabeza por la puerta: «¡Un segundo, que estoy fregando!».
- Clic o Intro en la puerta:
  - la puerta se abre en 4 fotogramas y sale luz cálida;
  - suena la campanilla y entra el ambiente del bar (se desbloquea el audio);
  - la cámara avanza y funde al interior (≤ 900 ms en total);
  - Diego saluda desde la barra con la primera frase.
- Enlace pequeño y siempre visible: «Ver la carta».

---

## 7. Escena 2: el interior

### 7.1 Composición (480×270, vista frontal tipo aventura gráfica)

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ [TV en soporte]          ░░ FOCO ░░                [estante de botellas][radio] │
│  (MI PUEBLO ES)       ┌──────────────┐           [pizarra «Menú del día» = CV] │
│                       │              │                                         │
│ [puerta] [perchero]   │    RASKA     │  [teléfono     ┌──── DIEGO ────┐       │
│  (salir)  R3UP ·SPIFY │   (cartel)   │   de pared =   │  detrás de la │[tra-  │
│          [estantería  │              │   contacto]    │    barra      │ga-    │
│           revistas:   └──────────────┘  ═════════════BARRA═══════════ │perras]│
│           PUNKETA]                         [taburetes]                         │
│▓▓▓▓▓▓▓▓▓ suelo de baldosa hidráulica ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  [MESA DE MUS en la  │
│  (servilletas en el suelo)                                   esquina, 1er plano]│
└───────────────────────────────────────────────────────────────────────────────┘
```

Rectángulos orientativos en coordenadas de escena (x, y, ancho, alto). Ajústalos en `layout.ts` tras ver el arte, sin cambiar la jerarquía:

| Elemento | Rect | Notas |
|---|---|---|
| TV en soporte de pared (esquina superior izquierda) | 14, 12, 70, 54 | Pantalla de unos 52×38 |
| Puerta (vista desde dentro) | 6, 78, 42, 122 | Salir a la fachada |
| Perchero de pie | 52, 88, 58, 112 | Dos perchas: A (R3UP) y B (SPIFY AF) |
| Estantería de revistas | 114, 96, 62, 104 | 8-10 revistas; PUNKETA de frente en la balda central |
| **Cartel RASKA** | 186, 18, 104, 136 | Centro geométrico y visual del bar |
| Foco sobre el cartel | Encima del cartel | Cono de luz, único foco de la escena |
| Teléfono de pared (contacto) | 296, 64, 18, 30 | Clásico de monedas |
| Estante de botellas + radio | 318, 16, 150, 70 | La radio es el control de sonido |
| Pizarra «Menú del día» (CV) | 322, 90, 40, 38 | Escrita a tiza |
| Barra | 300, 128, 176, 72 | Encimera en y ≈ 128 |
| Diego (de cintura para arriba) | ≈ 380, 70, 44, 64 | Detrás de la barra |
| Tragaperras (easter egg) | 440, 96, 36, 104 | Contra la pared derecha |
| **Mesa de mus** | 352, 206, 128, 64 | Esquina inferior derecha, primer plano: tapete, baraja, cuenco de piedras, 2 sillas |
| Suelo | y de 200 a 270 | Baldosa hidráulica |

### 7.2 Jerarquía visual (el cartel RASKA manda)

- El interior está en penumbra cálida (fluorescente y tungsteno). El **único foco dirigido** ilumina el cartel.
- El cartel es el elemento más grande, más contrastado y el único con el color de acento de RASKA. El resto de la escena usa la paleta del juego (madera, azulejo verde, crema, tiza) algo desaturada.
- Identidad RASKA (la aporta Diego; hasta entonces, placeholder respetuoso):
  - nace de un experimento de pimienta en agua con una gota de jabón;
  - trabaja negro y rojo apagado, pero lo importante es **lo manual**: rastros, trazos, texturas. Reinterprétalo en pixel sin «limpiarlo» de más.
- Animación del cartel: esquina inferior que ondea levemente, chincheta que brilla, polvo en el haz de luz. Cinta o pegatina de tiza «NUEVO».
- La primera vez que se entra, Diego señala el cartel con una frase corta.
- **Textos del cartel configurables** (título, combate, fecha, lugar) en `raska.md`. Por defecto: solo «RASKA» + «PRÓXIMAMENTE». No publiques nombres, fecha ni lugar hasta que Diego lo confirme.

### 7.3 Detalles de ambientación (sin clic, dan vida)

Servilletas de papel en el suelo, palillero, tapa en una vitrina, reloj de pared, calendario de taller inventado, mosca que ronda la lámpara, vaho de la cafetera.

---

## 8. Catálogo de puntos interactivos

Cada hotspot tiene: `id`, `rect` (o polígono), `verbo + nombre` (ES/EN), `destino`, animación idle, animación de hover, animación de clic y SFX.

| Objeto | Etiqueta al pasar el ratón | Destino | Idle | Clic (movimiento de videojuego) | SFX |
|---|---|---|---|---|---|
| Televisor | «Encender la tele — MI PUEBLO ES» | `/proyectos/mi-pueblo-es/` | Bucle del vídeo real **pixelado** en la pantalla, con líneas de barrido | Clac del botón, la imagen se estrecha a una raya, destello y la pantalla crece hasta ocupar la vista | Clac + zumbido CRT |
| Percha A | «Probarse — R3UP» | `/proyectos/r3up/` | Balanceo mínimo cada pocos segundos | La percha se descuelga y la prenda viene hacia cámara | Tintineo de percha |
| Percha B | «Probarse — SPIFY AF» | `/proyectos/spify-af/` | Balanceo desfasado respecto a A | Igual que A | Tintineo |
| Revista PUNKETA | «Leer — PUNKETA» | `/proyectos/punketa/` | Sobresale 1 px del resto | Sale de la balda, vuela al centro y se abre (2 fotogramas de pasar página) | «Fwip» de papel |
| Cartel RASKA | «Mirar el cartel — RASKA» | `/proyectos/raska/` | Ondea, brillo de chincheta, polvo en el foco | Salta la chincheta, el cartel se despega y viene a cámara (sacudida de 1 px, desactivable) | Chincheta + papel |
| Mesa de mus | «Echar un mus» | `/mus/` (selección de compañero) | La baraja se corta sola de vez en cuando | Se reparten 4 cartas hacia cámara y funde a la selección | Barajar |
| Diego | «Hablar con Diego» | Diálogo «Sobre mí» | Tareas de camarero (sección 9) | Deja lo que hace, mira al visitante y abre el bocadillo | «¿Qué te pongo?» |
| Pizarra «Menú del día» | «Leer la carta del día — CV» | `/cv/` | Tiza que brilla | La pizarra se acerca y el texto a tiza se vuelve el CV | Tiza |
| Teléfono de pared | «Llamar a Diego — Contacto» | Tarjeta de contacto (modal) | Suena bajito cada mucho tiempo (opcional, sin audio si está en silencio) | El auricular se descuelga | Ring corto |
| Radio | «Apagar la radio» / «Encender la radio» | Alterna el sonido | Lucecita encendida | Clic del dial | Ruido de sintonía |
| Tragaperras | «Echar una moneda» | Easter egg | Luces en ciclo de paleta | Rodillos con iconos de los proyectos; con tres iguales se reproduce `easter-egg.mp4` a pantalla completa | Sonido propio o CC0 |
| Puerta (interior) | «Salir a la calle» | Fachada | — | La puerta se abre | Campanilla |
| Cartelito «Se habla English» | «Change language» / «Cambiar idioma» | Alterna ES/EN | — | Gira como un cartel de «abierto/cerrado» | Clac |

Las revistas de relleno de la estantería llevan **títulos inventados**, nunca cabeceras reales.

---

## 9. Diego, el camarero

- Sprite de busto detrás de la barra, unos 44×64 px de escena.
  - **Referencia**: fotos de Diego (las aportará). Hasta entonces, placeholder generado con `placeholderGen.ts` (pelo, piel, camiseta y delantal).
  - Diego ha trabajado de camarero de verdad; el guiño está en su CV.
- Animaciones: `idle` (respiración), `parpadeo`, `limpiar_barra` (trapo en bucle), `secar_vaso`, `tirar_caña`, `colocar_botella` (se gira hacia el estante), `mirar_cursor` (izquierda/centro/derecha según la X del ratón), `saludar`, `señalar` (hacia el objeto clicado), `hablar` (3 visemas), `reir`.
- Máquina de estados de tareas: cada 4-10 s elige una tarea ponderada. Si el cursor está sobre un hotspot, lo mira; al clicar un objeto, lo señala durante la transición.
- **Diálogo «Sobre mí»**:
  - bocadillo en pixel con efecto máquina de escribir (clic para completar) y el texto del perfil actual del CV, resumido en 2-3 frases;
  - opciones: «Ver mi CV», «Contacto», «Echar un mus», «Nada, gracias»;
  - funciona con teclado y lector de pantalla (el diálogo es un `<dialog>` real del DOM encima del canvas).
- Frases cortas por evento, 3 variantes cada una, en ES y EN: `entrada`, `primera_vez_raska`, `vuelta_de_proyecto`, `inactividad_60s` («¿Te pongo algo o solo miras?»), `tragaperras_premio`.

---

## 10. Sistema de interacción

### 10.1 Escalado y encuadre

- Escala entera en **píxeles de dispositivo**: `s = floor(min(anchoCSS·dpr / 480, altoCSS·dpr / 270))`; tamaño CSS del canvas = `480·s/dpr` × `270·s/dpr`, centrado, con bandas del color de la calle o el suelo.
- **Modo paneo** cuando 1 píxel de escena quedaría por debajo de 1,5 px CSS (móvil en vertical):
  - la escena se ajusta al ~62 % de la altura con escala entera;
  - se desplaza horizontalmente con arrastre inercial y botones ◀ ▶;
  - debajo aparece una tira de chips «¿Qué hay en el bar?», uno por hotspot. Tocar un chip centra la cámara en el objeto y lo resalta.
- Móvil en horizontal o tablet: escena completa.

### 10.2 Capa DOM de hotspots (accesibilidad y SEO)

- Encima del canvas, una capa de `<a href>` (proyectos, CV, mus) y `<button>` (Diego, teléfono, radio, idioma, tragaperras), **transparentes**, colocados con la misma transformación que la escena.
- Cada uno con `aria-label` completo, p. ej. «Televisor: MI PUEBLO ES, proyecto audiovisual».
- El canvas lleva `aria-hidden="true"`. Un `<h1>` visualmente oculto: «Diego Pérez Bar — portfolio de Diego Pérez Muñoz, diseñador gráfico y audiovisual».
- Área mínima 24×24 px CSS a cualquier escala (padding invisible si el sprite es pequeño); objetivo 44×44 en táctil.
- Foco con teclado: orden lógico (puerta, TV, perchero, revistas, cartel, teléfono, Diego, pizarra, radio, tragaperras, mesa). Se dibuja un contorno pixel de 1 px más la etiqueta, igual que el hover.

### 10.3 Hover (ratón)

- Cursor propio en pixel: flecha por defecto y mano señalando sobre un hotspot (con fallback de cursor nativo).
- Al entrar en un hotspot:
  - contorno de 1 px en color de resalte (tiza o amarillo) alrededor del sprite;
  - el objeto sube 1 px;
  - **línea de verbo** en la parte inferior de la escena, en fuente pixel: «Encender la tele — MI PUEBLO ES».
- Sin retardos: todo aparece al instante.

### 10.4 Toque (móvil)

- Primer toque en un objeto = seleccionar (contorno, etiqueta, la cámara lo centra).
- Aparece un botón grande «Abrir» junto a la etiqueta; segundo toque sobre el objeto o sobre «Abrir» = abrir.
- Así se evitan aperturas accidentales al panear.

### 10.5 Descubrimiento

- **Botón lupa «¿Qué hay aquí?»** (tecla `H`; en táctil siempre visible): durante 2 s dibuja el contorno de todos los hotspots con sus nombres.
- **Destellos de atención** (un brillo de 2 fotogramas) cada 6-9 s sobre un hotspot aún no visitado, empezando por el cartel RASKA. Se apagan cuando ya se ha visitado todo, y con movimiento reducido.
- Visitados: marca de tiza mínima (✓) junto al objeto, guardada en `localStorage`.

### 10.6 UI fija (siempre visible, mínima, fuente pixel)

- Arriba a la izquierda: «DIEGO PÉREZ BAR».
- Arriba a la derecha: **[La carta]** · **[ES / EN]** · **[🔊 / 🔇]**.
- `Esc` = volver o cerrar. Todo con nombres accesibles y foco visible.

---

## 11. Kit de transiciones («movimiento de videojuego»)

Secuencia estándar al abrir un objeto (≤ 900 ms en total):

1. **Anticipación**: el objeto se aplasta 1 fotograma (squash de 2 px) y hay una pausa de 40 ms (hit-stop). Suena el SFX.
2. **Reacción**: Diego gira la cabeza y señala.
3. **Acercamiento de cámara**: zoom hacia el centro del objeto por **pasos enteros** (×1 → ×2 → ×3), 3 pasos en unos 360 ms, siempre alineado a la rejilla de píxeles.
4. **Iris**: un círculo negro se cierra sobre el objeto (clip-path `circle()` en una capa DOM, 260 ms, easing de pasos). Durante el negro, `navigate()` a la ruta.
5. **Apertura**: la página del proyecto se abre con el iris desde el centro (260 ms). La cabecera de la página muestra el sprite del objeto en grande.

- **Volver a la barra** (botón, `Esc` o atrás del navegador): iris cerrándose, llegada al bar con la cámara acercada al objeto y zoom de salida en 3 pasos. El foco del teclado vuelve al hotspot de origen.
- **Variantes por objeto**: TV (la pantalla crece), revista (vuela y se abre), prendas (se descuelgan), cartel (se despega), mesa (reparto de cartas). Todas encajan en los pasos 1-3; el iris es común.
- Opción de desarrollo `transicion: 'iris' | 'zoom' | 'disolucion-pixel'` para probar; por defecto iris + zoom.
- **Movimiento reducido** (`prefers-reduced-motion` o interruptor propio): sin zoom, sin sacudidas, sin destellos ni balanceos; la transición es un fundido de 150 ms. La TV muestra un fotograma fijo en lugar del bucle.
- Opcional: si el navegador soporta `document.startViewTransition`, se usa para el morph del sprite del objeto a la cabecera del proyecto. Si no, el iris basta.

---

## 12. Plantilla provisional de página de proyecto

Sin profundizar todavía: se rellena con el contenido migrado.

- Barra superior: «← Volver a la barra» · título · [La carta] · ES/EN.
- Cabecera: sprite pixel del objeto (escalado entero) + título grande + tipo, año y rol.
- Cuerpo **content-first, sin pixelar nada**:
  - galería con las fotos reales a calidad completa (AVIF/WebP responsive) y lightbox con zoom, flechas y teclado;
  - textos «Sobre el proyecto», «Proceso» y «Resultado»;
  - bloque de meta.
- MI PUEBLO ES: reproductor con **fachada ligera** (miniatura + botón de play) que carga el iframe de `youtube-nocookie.com` solo al pulsar. Recomendar a Diego subtítulos en YouTube.
- R3UP: los 3 looks como secciones con ancla o subrutas.
- RASKA: plantilla vacía con «Próximamente» mientras sea borrador.
- Pie: «Siguiente ronda →» (siguiente proyecto) y «Ronda anterior».
- Tipografía y maquetación de las páginas: limpias y editoriales, el trabajo es el protagonista. El guiño al bar va en la cabecera, los textos de navegación y los detalles; nunca tapa las fotos.

---

## 13. La carta, el CV, el contacto, el idioma y el sonido

- **/carta/**: la vía rápida y el fallback de todo.
  - Estética de carta de bar impresa (papel, tinta, precios sustituidos por año y tipo).
  - Lista de los 5 proyectos con miniatura real, CV, contacto, descarga del PDF y enlace «Entrar al bar».
  - Es también lo que ven buscadores, lectores de pantalla y quien desactive JS.
- **/cv/**: migra `CV_DATA` completo (perfil, experiencia, habilidades, formación, contacto) + retrato + descarga de `cv.pdf`. Cabecera con la pizarra a tiza; el cuerpo, legible y sobrio.
- **Contacto** (teléfono de pared): modal con email (`mailto:` + botón copiar) y teléfono. **Preguntar a Diego si quiere el teléfono público**; hoy lo está.
- **Idioma**: cartelito y botón de la UI; persiste en `localStorage` y cambia a la ruta `/en/` equivalente.
- **Sonido**: apagado hasta el clic en la puerta. Ambiente de bar a volumen bajo (murmullo, cafetera, vasos), SFX de objetos y blips de Diego al hablar (balbuceo sintético del juego, con su timbre). Radio y botón 🔊 alternan; el estado persiste. Nunca suena nada nada más cargar la página.

---

## 14. Integración del juego de mus

- Mueve el código a `src/game/` sin romper sus tests.
- Desde el bar, `/mus/` entra **directamente en la selección de compañero**: se saltan el arranque retro, la intro y el menú. Arriba, un selector simple Partida / Torneo.
- **El camarero del juego pasa a ser Diego** (mismo sprite y animaciones que en el portfolio; Nicanor se retira) y el bar del juego pasa a llamarse **Diego Pérez Bar**. Donde se vea el fondo, reutiliza los assets del interior (TV con su bucle, cartel RASKA).
- «Salir» o `Esc` en el menú de pausa → vuelve al bar con la cámara junto a la mesa.
- La intro del pueblo sigue existiendo como opción del juego («Ver intro»), no en el flujo del portfolio.
- Sigue aplicando la sección 2 de `PROMPT.md`: personajes, arte, textos y música originales, sin personas reales.

---

## 15. Arte

- **Resolución**: bar y fachada a 480×270; el juego sigue a 320×200. El tamaño de píxel en pantalla debe ser parecido (±1 px CSS) en ambos.
- **Paleta**: la del juego (sección 11.1 de `PROMPT.md`) + un acento reservado a RASKA (negro y rojo apagado; valores exactos cuando Diego pase la identidad). Nada más en la escena usa ese rojo.
- **Pipeline**: PNG + JSON de Aseprite por objeto (`tv`, `perchero`, `revistero`, `cartel_raska`, `diego`, `mesa`, `fachada`…) con tags para cada animación y capa de «hitmask» para contornos y áreas de clic precisas.
  - **Placeholders procedurales desde el día 1** (formas y colores planos con su etiqueta), para que Diego pueda sustituir sprite a sprite sin tocar código.
  - Documenta en `ARTE.md` tamaños, tags y nombres esperados.
- **TV**: el bucle de vídeo se dibuja en el canvas reducido al tamaño de la pantalla (52×38) con vecino más próximo, y encima líneas de barrido y viñeta, de modo que el vídeo real parece pixel art. Fuente: `tv-loop.webm` + mp4 de respaldo, 10-15 s, sin audio, ≤ 800 KB, precargado solo tras entrar.
- Fuente bitmap del juego para la UI de la escena. Las páginas de contenido usan una familia legible (decisión de diseño a proponer a Diego; no hace falta Archivo/Inter por inercia).

---

## 16. Audio

- Reutiliza `synth.ts`, `sfx.ts` y `babble.ts` del juego.
- Nuevos SFX: campanilla de puerta, clac de TV y zumbido CRT, perchas, papel, chincheta, tiza, ring de teléfono, dial de radio, tragaperras, barajar.
- Ambiente en bucle ≤ 200 KB.
- Todo **propio o CC0**, con la fuente de cada archivo anotada en `AUDIO.md`.

---

## 17. Accesibilidad, SEO y rendimiento

- **Accesibilidad**:
  - WCAG 2.2 AA en carta, CV y proyectos;
  - la escena es navegable con teclado y lector de pantalla gracias a la capa DOM;
  - `prefers-reduced-motion`, foco visible y contraste de las etiquetas;
  - `lang` correcto y alternativas de texto en todas las imágenes de proyecto.
- **SEO y compartir**:
  - `title` y `meta description` por página;
  - Open Graph y Twitter card: la fachada renderizada a 1200×630 para la home y la portada real para cada proyecto;
  - `sitemap.xml`, `robots.txt`, `hreflang` ES/EN;
  - datos estructurados `Person` y `CreativeWork`.
- **Presupuestos**:
  - fachada interactiva ≤ 400 KB transferidos; interior ≤ 1,2 MB adicionales, precargados mientras se ve la fachada;
  - bucle de TV ≤ 800 KB, en diferido; audio ≤ 300 KB, tras el clic;
  - imagen principal de cada proyecto ≤ 250 KB en AVIF;
  - LCP < 2,5 s en 4G en carta y proyectos; Lighthouse ≥ 90 en rendimiento y accesibilidad en esas páginas;
  - escena a 60 fps en un portátil medio y ≥ 30 fps en un móvil medio.
- Pausa el bucle de render con la pestaña oculta y en las páginas de contenido.

---

## 18. Migración y despliegue

1. Etiqueta el estado actual del repo (`v1-portfolio-clasico`) y crea la rama `bar`. **No reescribas el historial de git ni borres ramas sin permiso explícito de Diego** (el `.git` pesa ~271 MB; limpiarlo es una decisión suya).
2. Migra el contenido de `PROJECTS` y `CV_DATA` a `src/content/` automáticamente (script) y revisa a mano los textos ES/EN.
3. Ejecuta `npm run originales` sobre `assets/` y verifica que el sitio publicado queda muy por debajo de 1 GB.
4. GitHub Actions: build de Astro + deploy a Pages **solo desde `main`**. Hasta que Diego apruebe, trabaja en `bar` y enséñale builds locales (`astro preview`) y capturas.
5. Redirecciones de hash antiguas (sección 3).
6. Opcional, cuando Diego lo decida: dominio propio (configurable en `astro.config`).

---

## 19. Decisiones que NO tomas tú (pregunta a Diego y deja placeholder)

- Nombre exacto: «SPIFY AF» (como en el portfolio actual) o «SPICY AF» (como lo escribió en el chat).
- LATRAKABLOCK: ¿fuera del portfolio o como rótulo del bar clicable? Por defecto, desactivado.
- RASKA: qué datos del evento pueden publicarse y cuándo; arte final del cartel.
- Referencias fotográficas de Diego para su sprite de camarero.
- Clip de 10-15 s de MI PUEBLO ES para la TV.
- Si el teléfono de contacto se muestra públicamente.
- Dominio propio.

---

## 20. Hitos y criterios de aceptación

| Hito | Contenido | Hecho cuando… |
|---|---|---|
| H0 | Auditoría del repo actual y del proyecto de mus; etiqueta y rama; `CLAUDE.md` actualizado con este cambio de rumbo; `DECISIONES.md` | Diego tiene un resumen de lo encontrado y del plan, sin nada borrado |
| H1 | Astro + i18n + contenido migrado + carta + CV + páginas de proyecto provisionales + optimización de imágenes + redirecciones | La web de contenido funciona sola en ES y EN, rápida y sin escena |
| H2 | Motor compartido extraído + fachada: rótulo como barra de carga, «PULSA PARA ENTRAR», puerta, desbloqueo de audio | Entrar al bar funciona con ratón, teclado y toque |
| H3 | Interior con placeholders: layout, capa DOM de hotspots, hover con línea de verbo, lupa, cursor, foco, modo paneo y chips en móvil, UI fija | Se llega a cualquier proyecto en 2 clics o toques; navegable con teclado |
| H4 | Kit de transiciones: squash, hit-stop, zoom por pasos, iris, vuelta al objeto, visitados, movimiento reducido | Ida y vuelta fluidas en Chrome, Safari y Firefox; ≤ 900 ms |
| H5 | Diego camarero: máquina de tareas, mirar al cursor, señalar, diálogo «Sobre mí» | Diego se siente vivo y el diálogo es accesible |
| H6 | Juego integrado en `/mus/`: entrada directa a selección de compañero, salida al bar, Diego como camarero | Sus tests siguen en verde; ida y vuelta sin recargar assets |
| H7 | Sustitución de arte: pipeline Aseprite, TV con vídeo pixelado, cartel RASKA con foco, audio final | Cambiar un sprite no requiere tocar código |
| H8 | Accesibilidad, SEO, presupuestos, pruebas con Playwright (rutas, teclado, movimiento reducido, viewport móvil, cero errores en consola), despliegue | Todo en verde y Diego da el visto bueno para `main` |

## 21. Forma de trabajar

- Al cerrar cada hito: commit descriptivo, capturas de la escena a 1×, 2× y en viewport móvil, y un resumen breve de lo hecho y lo pendiente.
- Si algo de esta spec choca con lo que ves en el código real, detente, explícalo en `DECISIONES.md` y propón la alternativa.
- Prioridad absoluta: que un reclutador con prisa vea el trabajo de Diego a calidad completa en menos de un minuto, y que quien tenga tiempo se lo pase en grande en el bar.
