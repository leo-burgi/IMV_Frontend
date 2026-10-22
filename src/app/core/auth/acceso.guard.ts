import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, take, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
@Injectable({ providedIn: 'root' })
export class AccesoGuard implements CanActivate {
  constructor(private auth: AuthService) {}
  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.auth.estado$.pipe(filter(estado => estado !== 'cargando'), take(1), map(estado => {
      const roles: string[] = route.data.roles || [];
      return estado === 'autenticado' && (roles.length === 0 || (this.auth.usuario?.Roles || []).some(rol => rol === 'Admin' || roles.indexOf(rol) >= 0));
    }));
  }
}
