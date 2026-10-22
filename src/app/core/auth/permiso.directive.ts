import { Directive, Input, HostBinding } from '@angular/core';
import { AuthService } from '../services/auth.service';
@Directive({ selector: '[imvRol]' })
export class PermisoDirective {
  @Input() imvRol = '';
  constructor(private auth: AuthService) {}
  @HostBinding('style.display') get display(): string | null {
    const roles = this.auth.usuario?.Roles || [];
    return roles.indexOf('Admin') >= 0 || this.imvRol.split(',').some(r => roles.indexOf(r) >= 0) ? null : 'none';
  }
}
