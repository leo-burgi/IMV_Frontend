import { Component } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-ingreso-local',
  template: `
    <form (ngSubmit)="ingresar()" #formulario="ngForm" autocomplete="on">
      <h2>Ingresar con cuenta IMV</h2>
      <p>Usá la cuenta interna habilitada por Informática. No ingreses tu contraseña de la red municipal.</p>
      <label for="usuario-imv">Usuario IMV</label>
      <input id="usuario-imv" name="usuario" [(ngModel)]="usuario" required maxlength="50" autocomplete="username" [disabled]="enviando" />
      <label for="contrasena-imv">Contraseña IMV</label>
      <input id="contrasena-imv" type="password" name="contrasena" [(ngModel)]="contrasena" required maxlength="128" autocomplete="current-password" [disabled]="enviando" />
      <p *ngIf="error" role="alert">{{ error }}</p>
      <button type="submit" [disabled]="enviando || formulario.invalid">{{ enviando ? 'Ingresando…' : 'Ingresar' }}</button>
    </form>
  `,
  styles: [`label { display: block; margin-top: 1rem; } input { width: 100%; padding: .5rem; } button { margin-top: 1rem; } h2 { font-size: 1.25rem; }`]
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
      () => this.error = 'No se pudo ingresar. Verificá las credenciales o consultá a Informática.'
    );
  }
}
