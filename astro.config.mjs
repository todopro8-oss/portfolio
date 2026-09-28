// @ts-check
import { defineConfig } from 'astro/config';

// Dominio configurable para el futuro (spec, sección 3): SITIO=https://diegoperez.bar BASE=/ npm run build
const site = process.env.SITIO ?? 'https://todopro8-oss.github.io';
const base = process.env.BASE ?? '/portfolio';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
});
