import { Pipe, PipeTransform } from '@angular/core';

/**
 * ImvFilterPipe
 * Filtra un array de objetos por un término de búsqueda,
 * buscando en los campos indicados (case-insensitive).
 *
 * Uso en template:
 *   *ngFor="let item of lista | imvFilter:filtroBusqueda:['Campo1','Campo2']"
 *
 * Registro: agregar ImvFilterPipe a declarations en app.module.ts
 */
@Pipe({
  name: 'imvFilter'
})
export class ImvFilterPipe implements PipeTransform {

  transform(items: any[], termino: string, campos: string[]): any[] {
    if (!items || !termino || termino.trim() === '') {
      return items;
    }
    const t = termino.trim().toLowerCase();
    return items.filter(item =>
      campos.some(campo => {
        const valor = item[campo];
        return valor && valor.toString().toLowerCase().includes(t);
      })
    );
  }
}