// CV (migrado de CV_DATA): se valida al importar para que un error en cv.json rompa el build.

import { z } from 'astro/zod';
import datos from '../content/cv.json';

const bilingue = z.object({ es: z.string(), en: z.string() });
const entrada = z.object({ cuando: z.string(), que: bilingue, texto: bilingue });

export const esquemaCv = z.object({
  nombre: z.string(),
  rol: bilingue,
  lugar: bilingue,
  perfil: bilingue,
  experiencia: z.array(entrada),
  habilidades: z.array(z.object({ k: bilingue, v: bilingue })),
  formacion: z.array(entrada),
  contacto: z.object({ email: z.email(), telefono: z.string(), telefonoPublico: z.boolean() }),
  actualizado: bilingue,
});

export const cv = esquemaCv.parse(datos);
