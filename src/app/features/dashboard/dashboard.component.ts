import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DashboardDTO } from 'src/app/core/models/dashboard.model';
import { DashboardService } from 'src/app/core/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  dashboardData: DashboardDTO | null = null;
  errorMensaje: string = '';
  readonly coloresEstados: string[] = [
    '#185fa5', '#2e7d4f', '#d97706', '#7c3aed',
    '#0f6e56', '#c24156', '#64748b', '#378add'
  ];
  readonly coloresBarrios: string[] = ['#185fa5', '#2f76b8', '#4f8dc9', '#72a5da', '#9abfe7'];

 
  // Esto va a disparar un string (el nombre de la sección) hacia afuera.
  @Output() solicitarNavegacion = new EventEmitter<string>();

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.dashboardService.getResumen().subscribe({
      next: (data) => {
        this.dashboardData = data;
      },
      error: (err) => {
        console.error('Error al cargar el dashboard:', err);
        this.errorMensaje = 'No se pudieron cargar las métricas.';
      }
    });
  }

  // Método local del HTML que activa el emisor
  irASeccion(seccion: string) {
    this.solicitarNavegacion.emit(seccion);
  }

  colorEstado(indice: number): string {
    return this.coloresEstados[indice % this.coloresEstados.length];
  }

  colorBarrio(indice: number): string {
    return this.coloresBarrios[Math.min(indice, this.coloresBarrios.length - 1)];
  }

  get estiloGraficoEscrituras(): string {
    const estados = this.dashboardData && this.dashboardData.EstadosEscrituras
      ? this.dashboardData.EstadosEscrituras.filter(estado => estado.Porcentaje > 0)
      : [];

    if (estados.length === 0) {
      return '#eef1f5';
    }

    let acumulado = 0;
    const segmentos = estados.map((estado, indice) => {
      const inicio = acumulado;
      acumulado += estado.Porcentaje;
      return `${this.colorEstado(indice)} ${inicio}% ${Math.min(acumulado, 100)}%`;
    });

    return `conic-gradient(${segmentos.join(', ')})`;
  }

  get descripcionGraficoEscrituras(): string {
    const estados = this.dashboardData && this.dashboardData.EstadosEscrituras
      ? this.dashboardData.EstadosEscrituras
      : [];
    return estados.length === 0
      ? 'No hay escrituras con estados registrados.'
      : estados.map(estado => `${estado.Estado}: ${estado.Porcentaje}%`).join(', ');
  }
}
