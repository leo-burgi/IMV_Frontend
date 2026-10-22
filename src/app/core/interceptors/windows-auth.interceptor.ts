import { Injectable, Injector } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

@Injectable()
export class WindowsAuthInterceptor implements HttpInterceptor {
  constructor(private injector: Injector) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const api = new URL(environment.apiUrl, document.baseURI);
    const destino = new URL(request.url, document.baseURI);
    const ruta = api.pathname.replace(/\/$/, '');
    const esApi = destino.origin === api.origin &&
      (destino.pathname === ruta || destino.pathname.indexOf(ruta + '/') === 0);
    if (!esApi) { return next.handle(request); }
    const modifica = ['GET', 'HEAD', 'OPTIONS'].indexOf(request.method) < 0;
    const solicitud = request.clone({ withCredentials: true,
      setHeaders: modifica ? { 'X-IMV-Solicitud': '1' } : {}
    });
    return next.handle(solicitud).pipe(
      catchError((error: HttpErrorResponse) => {
        const ingreso = destino.pathname === ruta + '/auth/login' || destino.pathname === ruta + '/auth/windows' || destino.pathname === ruta + '/auth/me';
        if (!ingreso && error.status === 401 && destino.pathname !== ruta + '/auth/salir') {
          this.injector.get(AuthService).registrarError(error.status);
        }
        return throwError(error);
      })
    );
  }
}
