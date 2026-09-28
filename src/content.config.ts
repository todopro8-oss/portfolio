// Fuente única de verdad de los proyectos (spec, sección 4). Un .md por proyecto en
// src/content/proyectos/, con sus fotos en la carpeta del mismo nombre.

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const bilingue = z.object({ es: z.string(), en: z.string() });

export const OBJETOS = ['tv', 'perchero-a', 'perchero-b', 'revistero', 'cartel', 'rotulo'] as const;

const proyectos = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/proyectos' }),
  schema: ({ image }) => {
    const foto = z.object({
      src: image(),
      /** Ancho en la rejilla de 12 columnas: ancho = 12, mitad = 6, tercio = 4, cuarto = 3. */
      tam: z.enum(['ancho', 'mitad', 'tercio', 'cuarto']).default('mitad'),
      /** La foto es un plano o una pieza gráfica: fondo neutro alrededor. */
      encajar: z.boolean().default(false),
      pie: z.string().optional(),
      alt: bilingue.optional(),
    });
    return z.object({
      slug: z.string(),
      idAntiguo: z.string().optional(),
      orden: z.number().int(),
      titulo: bilingue,
      tipo: bilingue,
      anio: z.number().int(),
      objeto: z.enum(OBJETOS),
      etiqueta: bilingue,
      portada: image().optional(),
      video: z.url().optional(),
      bucleTV: z.string().optional(),
      cartel: z
        .object({
          titulo: z.string(),
          subtitulo: bilingue,
          combate: z.string().optional(),
          fecha: z.string().optional(),
          lugar: z.string().optional(),
        })
        .optional(),
      sobre: bilingue,
      proceso: bilingue,
      resultado: bilingue,
      meta: z.array(z.object({ k: bilingue, v: bilingue })).default([]),
      rotuloGaleria: bilingue.optional(),
      galeria: z.array(foto).default([]),
      looks: z
        .array(
          z.object({
            n: z.number().int(),
            nombre: bilingue,
            descripcion: bilingue,
            portada: image(),
            galeria: z.array(foto),
          }),
        )
        .optional(),
      fuente: z.string().optional(),
      /** Borrador: la página existe pero solo dice «Próximamente». */
      borrador: z.boolean().default(false),
      /** Oculto: ni página ni entrada en la carta (LATRAKABLOCK hasta que Diego decida). */
      oculto: z.boolean().default(false),
    });
  },
});

export const collections = { proyectos };
