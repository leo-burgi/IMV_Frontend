import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DashboardDTO } from 'src/app/models/dashboard.model';
import { DashboardService } from 'src/app/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  dashboardData: DashboardDTO | null = null;
  errorMensaje: string = '';

 
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
}