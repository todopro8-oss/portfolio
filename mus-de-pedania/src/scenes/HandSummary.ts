// Recuento de la mano (sección 9, punto 9): pizarrita central que lista lance a lance
// lo que cobra cada pareja. La mesa la muestra encima mientras las piedras vuelan.

import { AVANCE, texto } from '../core/bitmapFont';
import { NOMBRE_LANCE, resumirPartes } from '../data/narrador.es';
import { UI } from '../data/ui.es';
import { DERIVADOS as D, PALETA as P } from '../data/palette';
import type { LineaRecuento } from '../mus/types';
import { panelPizarra } from '../render/ui';

export const RECT_RECUENTO = { x: 84, y: 128, w: 152, h: 68 };

export class HandSummary {
  lineas: LineaRecuento[] = [];
  visible = false;
  mensajeFinal: string | null = null;
  private t = 0;

  reiniciar(): void {
    this.lineas = [];
    this.visible = false;
    this.mensajeFinal = null;
  }

  agregar(l: LineaRecuento): void {
    this.visible = true;
    this.lineas.push(l);
  }

  actualizar(dt: number): void {
    this.t += dt;
  }

  dibujar(ctx: CanvasRenderingContext2D): void {
    if (!this.visible) return;
    const { x, y, w, h } = RECT_RECUENTO;
    panelPizarra(ctx, x, y, w, h);
    texto(ctx, UI.recuento.titulo, x + w / 2, y + 3, P.oros, { alinear: 'centro', variante: 'tiza' });
    this.lineas.slice(-4).forEach((l, i) => {
      const ly = y + 15 + i * 11;
      const nombre = NOMBRE_LANCE[l.lance];
      texto(ctx, `${nombre}:`, x + 3, ly, P.tiza, { variante: 'tiza' });
      if (l.equipo === null || l.partes.length === 0) {
        texto(ctx, 'nadie', x + 45, ly, P.tiza_sombra, { variante: 'tiza' });
        return;
      }
      const eq = l.equipo === 0 ? 'Nos.' : 'Ellos';
      texto(ctx, eq, x + 45, ly, l.equipo === 0 ? D.bastos_brillo : D.copas_brillo, { variante: 'tiza' });
      // Partes: «+2 (querido)», abreviadas si no caben tras el nombre de la pareja.
      const max = Math.floor((w - 3 - (45 + 5 * AVANCE + 2)) / AVANCE);
      texto(ctx, resumirPartes(l.partes, max), x + w - 3, ly, P.tiza, { alinear: 'derecha', variante: 'tiza' });
    });
    if (this.mensajeFinal && Math.floor(this.t / 500) % 2 === 0) {
      texto(ctx, this.mensajeFinal, x + w / 2, y + h - 10, P.tiza_sombra, { alinear: 'centro' });
    }
  }
}
