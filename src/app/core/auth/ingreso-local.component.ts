import { Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-ingreso-local',
  templateUrl: './ingreso-local.component.html',
  styleUrls: ['./ingreso-local.component.css']
})
export class IngresoLocalComponent {
  usuario = '';
  contrasena = '';
  enviando = false;
  error = '';
  constructor(public auth: AuthService) {}
  ingresar(): void {
    if (this.enviando || !this.usuario.trim() || !this.contrasena) { return; }
    this.enviando = true;
    this.error = '';
    const solicitud = this.auth.ingresarLocal(this.usuario.trim(), this.contrasena);
    this.contrasena = '';
    solicitud.pipe(finalize(() => { this.enviando = false; })).subscribe(
      usuario => this.auth.aceptar(usuario),
      error => this.error = error.status === 503 && error.error?.Codigo === 'IMV_ESQUEMA_PENDIENTE' ?
        'El acceso a IMV todavía no está preparado. Informática debe completar la actualización de la base de datos antes de iniciar sesión.' :
        'No se pudo ingresar. Verificá las credenciales o consultá a Informática.'
    );
  }
}
