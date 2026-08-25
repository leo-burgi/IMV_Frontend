import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CalidadDatosAdjudicaciones } from '../../core/models/calidad-datos-adjudicaciones.model';
import { CalidadDatosService } from '../../core/services/calidad-datos.service';

@Component({
  selector: 'app-calidad-datos-panel',
  templateUrl: './calidad-datos-panel.component.html',
  styleUrls: ['./calidad-datos-panel.component.css']
})
export class CalidadDatosPanelComponent implements OnInit {
  @Output() verAdjudicaciones = new EventEmitter<void>();

  calidadDatos: CalidadDatosAdjudicaciones | null = null;
  cargando = false;
  mensajeError = '';

  constructor(private calidadDatosService: CalidadDatosService) { }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.mensajeError = '';
    this.calidadDatosService.getCalidadAdjudicaciones().subscribe({
      next: data => {
        this.calidadDatos = data;
        this.cargando = false;
      },
      error: () => {
        this.mensajeError = 'No se pudo consultar el estado de la migración de adjudicaciones.';
        this.cargando = false;
      }
    });
  }

  claseNivelDeuda(): string {
    return this.calidadDatos ? this.calidadDatos.NivelDeuda.toLowerCase() : 'alta';
  }
}
