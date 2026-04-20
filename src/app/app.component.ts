import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  seccionActiva: string = 'home';

  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
  }

  buscar(query: string) {
    const texto = (query || '').trim().toLowerCase();
    if (!texto) {
      return;
    }

    if (texto.includes('plan')) {
      this.cambiarSeccion('planes');
      return;
    }

    if (texto.includes('home') || texto.includes('inicio') || texto.includes('portal') || texto.includes('dashboard')) {
      this.cambiarSeccion('home');
      return;
    }

    if (texto.includes('barrio') || texto.includes('barrios') || texto.includes('calle') || texto.includes('calles') || texto.includes('persona') || texto.includes('personas') || texto.includes('adjudicacion') || texto.includes('convenio') || texto.includes('notarial') || texto.includes('técnica') || texto.includes('tecnica')) {
      this.cambiarSeccion('home');
      return;
    }

    this.cambiarSeccion('home');
  }
}
