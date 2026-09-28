# DECISIONES — Diego Pérez Bar

Decisiones que la spec (`PROMPT_BAR.md`) no cubre, la interpretan o chocan con lo encontrado en el código
(`AUDITORIA.md`). Cada una dice qué se hace por defecto; si Diego decide otra cosa, se cambia aquí.

## H0

**D1. Etiqueta y rama.** La rama `bar` sale de `69cadc8` (el `main` actual, que sigue publicado). En
`bar` solo se han añadido documentos; no se ha borrado ni movido nada. La etiqueta `v1-portfolio-clasico`
sobre `69cadc8` no se pudo subir desde el entorno de Claude (su proxy de git solo admite ramas). Mientras
no exista, `69cadc8` es la referencia del portfolio clásico. Para crearla en GitHub: *Releases → Draft a
new release → Choose a tag*, escribir `v1-portfolio-clasico`, destino `main` (mientras `main` siga en
`69cadc8`) y publicar.

**D2. Correcciones a la sección 1 de la spec.**

- Las imágenes de 4288×2848 y ~5 MB de LATRAKABLOCK son las `01–09.jpg`, que la página no muestra.
- De los 286 MB de `assets/` (274 MiB) la página solo usa 52 MB. Lo más pesado sin usar: `spify/*.png`
  (~104 MB), `oviu/01–15.jpg` (79 MB) y `latrakablock/01–09.jpg` (~48 MB).
- MI PUEBLO ES tiene 17 fotos en la carpeta y usa 16 (`08.jpg` no).
- Los 271 MB de `.git` son los de un clon superficial: el historial completo no se ha medido.

**D3. Originales sin usar: ni se migran ni se borran.** El script del H1 migra solo lo que enlaza la
página actual. Los originales sin usar siguen en `assets/` (y en la etiqueta) hasta que Diego diga si
alguno debe entrar (por ejemplo, `oviu/01–15.jpg` parece el shooting de R3UP en alta). Como Pages
publicará solo el build de Astro, ese peso no llega al sitio publicado; el tamaño del repo es otra
decisión de Diego.

**D4. Diego en el juego frente a «nada de personas reales» (sección 2 del `PROMPT.md` del mus).** La
sección 14 de la nueva spec pone a Diego de camarero, y la misma sección dice que la regla de «sin
personas reales» sigue aplicando. Interpretación: **excepción única para Diego**, titular del portfolio y
autor del encargo. Su sprite sale de las fotos que aporte; sus frases se escriben para el personaje; su
voz es el balbuceo sintético (no se graba a nadie). No entra ninguna otra persona real, y tampoco nombres
de negocios reales (el bar donde Diego trabajó sale en el CV, no en la escena).

**D5. `easter-egg.mp4`.** Sus metadatos dicen que lo generó una herramienta de Google (típico de una
descarga de YouTube). Hasta que Diego confirme que es material propio, la tragaperras usa un premio
placeholder propio y no ese vídeo. Los 10 mp3 de `assets/sounds/` no se reutilizan (spec, sección 1).

**D6. Nombre del bar dentro del juego.** En el chat se pidió renombrar el bar del mus a «Casa David»; la
spec nueva lo llama «Diego Pérez Bar» (sección 14). Manda la spec nueva: no se aplica «Casa David».

**D7. Pendientes del juego anteriores al cambio de rumbo.** Siguen apuntados para antes o durante el H6:
cartas destapadas de los rivales legibles (sin solaparse ni quedar bajo las piedras) y una baraja más
detallada «al estilo Fournier». Esto último choca con «no copies ninguna baraja comercial» del
`PROMPT.md` del mus: se interpreta como **estilo tradicional español** (fondo blanco, pinta en el marco,
índices en las esquinas, espadas y bastos largos cruzados, figuras de cuerpo entero), dibujado desde cero,
sin marcas, textos ni dibujos concretos de ninguna baraja comercial.

**D8. El juego en inglés.** El mus está entero en español (y su vocabulario no se traduce bien). Por
defecto `/en/mus/` carga el mismo juego en español con una nota breve en inglés; traducir la interfaz es
un extra para después, si Diego lo quiere.

**D9. Tamaño del píxel del juego frente al del bar (sección 15, ±1 px CSS).** Con escala entera, el juego
(320×200) sale más grande que el bar (480×270) en pantallas grandes: a 2560×1440 serían 7 px contra 5. En
el portfolio, la escala del juego se limita a la del bar + 1 y el resto son bandas.

**D10. Cambio de despliegue.** Hoy Pages publica `main` tal cual («Deploy from a branch»). Para pasar a
GitHub Actions hay que cambiar en GitHub *Settings → Pages → Source* a «GitHub Actions» **en el mismo
momento** en que `bar` entre en `main`; si se fusiona antes, Pages serviría el código fuente de Astro y la
web se rompería. Ese cambio lo hace Diego al aprobar.

**D11. Enlaces antiguos a LATRAKABLOCK.** Mientras esté desactivado, `#/p/latrakablock` redirige a
`/carta/` en vez de dar un 404.

**D12. Portadas vacías.** MI PUEBLO ES, LATRAKABLOCK y SPIFY AF no tienen `cover`. Como la carta y las
tarjetas de Open Graph necesitan una, se usa de forma provisional la primera foto de su galería.

**D13. Datos personales.** El teléfono está hoy publicado en `main`. En la versión nueva, `cv.json` lleva
`telefonoPublico` a `false` hasta que Diego responda; el email sigue visible. La edad («20 años») está
escrita a mano y caduca: se quita hasta que Diego decida.

**D14. Tipografía de las páginas de contenido.** Se propondrá una familia en el H1, servida desde el propio
sitio (sin Google Fonts: más rápido y sin llamadas a terceros). No se mantiene Archivo/Inter por inercia.

## Preguntas para Diego

De la sección 19 de la spec:

1. ¿«SPIFY AF» o «SPICY AF»?
2. LATRAKABLOCK: ¿fuera del portfolio o como rótulo del bar clicable?
3. RASKA: ¿qué datos del evento se pueden publicar y cuándo? ¿Arte final del cartel?
4. Fotos de referencia para el sprite de camarero.
5. Clip de 10–15 s de MI PUEBLO ES para la tele.
6. ¿El teléfono de contacto se muestra en público?
7. ¿Dominio propio?

Nuevas tras la auditoría:

8. ¿Alguno de los originales sin usar debe entrar en la web nueva (D3)?
9. ¿`easter-egg.mp4` es material propio (D5)?
10. ¿Se muestra la edad en el CV (D13)?
11. ¿Confirmas «Diego Pérez Bar» para el bar del juego en lugar de «Casa David» (D6)?
12. ¿Quieres el juego traducido al inglés más adelante (D8)?
