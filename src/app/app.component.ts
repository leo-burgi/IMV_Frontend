import { Component } from '@angular/core';
import { ConsultaDestino, ConsultaIntegralEstado, ConsultaIntegralNavegacion } from './core/models/consulta-integral.model';
import { ImvSearchService } from './core/services/imv-search.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  // estado inicial
  seccionActiva: string = 'bienvenida';
  consultaIntegralEstado?: ConsultaIntegralEstado;
  destinoContextual?: { seccion: ConsultaDestino; id: number };

  // sidebar colapsable
  sidebarCollapsed: boolean = false;

  avisosImportantes: string[] = [
    'Germán no viene el lunes',
    'Estela viene lunes, miercoles y viernes',
    'Las secciones aún están en desarrollo, pueden tener datos de prueba o no funcionar del todo'
  ];

  constructor(private searchService: ImvSearchService) {}

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  cambiarSeccion(seccion: string) {
    this.destinoContextual = undefined;
    this.seccionActiva = seccion;
  }

  navegarDesdeConsulta(navegacion: ConsultaIntegralNavegacion): void {
    this.consultaIntegralEstado = navegacion.estado;
    this.destinoContextual = { seccion: navegacion.seccion, id: navegacion.id };
    this.seccionActiva = navegacion.seccion;
  }

  idDestino(seccion: ConsultaDestino): number | undefined {
    return this.destinoContextual && this.destinoContextual.seccion === seccion
      ? this.destinoContextual.id
      : undefined;
  }

  // buscador
  buscar(query: string) {
    const texto = (query || '').trim().toLowerCase();
    this.searchService.setSearch(texto);

    if (!texto) { return; }

    if (texto.includes('plan')) {
      this.cambiarSeccion('planes'); return;
    }
    if (texto.includes('home') || texto.includes('inicio') ||
        texto.includes('portal') || texto.includes('dashboard')) {
      this.cambiarSeccion('home'); return;
    }
    if (texto.includes('barrio') || texto.includes('bario')) {
      this.cambiarSeccion('barrios'); return;
    }
    if (texto.includes('calle') || texto.includes('cale')) {
      this.cambiarSeccion('calles'); return;
    }
    if (texto.includes('persona')) {
      this.cambiarSeccion('personas'); return;
    }
    if (texto.includes('consulta')) {
      this.cambiarSeccion('consulta-integral'); return;
    }
    if (texto.includes('adjudic')) {
      this.cambiarSeccion('adjudicaciones'); return;
    }
    if (texto.includes('propiedad') || texto.includes('inmueble')) {
      this.cambiarSeccion('propiedades'); return;
    }
    if (texto.includes('notarial')) {
      this.cambiarSeccion('notariales'); return;
    }

    if (['planes', 'barrios', 'calles', 'personas', 'adjudicaciones', 'propiedades', 'notariales', 'consulta-integral'].includes(this.seccionActiva)) {
      return;
    }

    this.cambiarSeccion('home');
  }
}
