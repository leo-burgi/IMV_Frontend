import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  //estado inicial
  seccionActiva: string = 'bienvenida';

  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;

  }

  //buscador rústico del layout
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

    if (texto.includes('barrio') || texto.includes('barrios') || texto.includes('bario') || texto.includes('barios') ) {
      this.cambiarSeccion('barrios');
      return;
    }

    if (texto.includes('calle') || texto.includes('calles') || texto.includes('cale') || texto.includes('cales')) {
      this.cambiarSeccion('calles');
      return;
    }

    //si no coincide con nada, dashboard por defecto
    this.cambiarSeccion('home');
  }
}