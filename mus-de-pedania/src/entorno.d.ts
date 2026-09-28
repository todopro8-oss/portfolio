/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** «bar»: la página arranca en Diego Pérez Bar en vez de en el menú del mus. */
  readonly VITE_INICIO?: string;
}
