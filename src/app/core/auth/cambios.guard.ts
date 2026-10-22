import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
@Injectable({ providedIn: 'root' })
export class CambiosGuard implements CanDeactivate<unknown> {
  canDeactivate(): boolean {
    return !document.querySelector('main input.ng-dirty,main select.ng-dirty,main textarea.ng-dirty') ||
      window.confirm('Hay cambios sin guardar. ¿Descartarlos y continuar?');
  }
}
