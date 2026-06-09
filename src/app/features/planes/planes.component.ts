import { Component, OnInit } from '@angular/core';
import { PlanService } from 'src/app/core/services/plan.service';
import { Plan } from 'src/app/core/models/plan.model';
import { ImvSearchService } from 'src/app/core/services/imv-search.service';

@Component({
  selector: 'app-planes',
  templateUrl: './planes.component.html',
  styleUrls: ['../../shared/imv-table.css']
})
export class PlanesComponent implements OnInit {
  listaPlanes: Plan[] = [];
  filtroBusqueda = '';
  mostrarModalAlta = false;
  modoEdicion = false;
  guardando = false;
  mensajeError = '';
  mensajeExito = '';
  planForm: Partial<Plan> = { NombrePlan: '', Programa: '' };

  constructor(private planService: PlanService, private searchService: ImvSearchService) { }

  ngOnInit(): void {
    this.searchService.searchTerm$.subscribe((term) => {
      this.filtroBusqueda = term || '';
    });
    this.cargarPlanes();
  }

  cargarPlanes(): void {
    this.planService.getPlanes().subscribe({
      next: (data) => this.listaPlanes = data || [],
      error: () => this.mensajeError = 'No se pudieron cargar los planes desde IMV.Api.'
    });
  }

  onFiltroChange(term: string): void {
    this.filtroBusqueda = term;
    this.searchService.setSearch(term);
  }

  abrirModalAlta(plan?: Plan): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.modoEdicion = !!plan;
    this.planForm = plan ? { ...plan } : { NombrePlan: '', Programa: '' };
    this.mostrarModalAlta = true;
  }

  cerrarModalAlta(): void {
    this.mostrarModalAlta = false;
    this.guardando = false;
    this.mensajeError = '';
    this.modoEdicion = false;
    this.planForm = { NombrePlan: '', Programa: '' };
  }

  guardarPlan(): void {
    const nombre = this.planForm.NombrePlan?.trim();
    const programa = this.planForm.Programa?.trim();

    if (!nombre || !programa) {
      this.mensajeError = 'El nombre del plan y el programa son obligatorios.';
      return;
    }

    this.guardando = true;
    this.mensajeError = '';

    const payload: Partial<Plan> = { NombrePlan: nombre, Programa: programa };
    const request = this.modoEdicion && this.planForm.IdPlan
      ? this.planService.updatePlan(this.planForm as Plan)
      : this.planService.createPlan(payload);

    request.subscribe({
      next: () => {
        this.cargarPlanes();
        this.mostrarModalAlta = false;
        this.guardando = false;
        this.mensajeExito = this.modoEdicion ? 'El plan se actualizó correctamente.' : 'El plan se cargó correctamente.';
        this.modoEdicion = false;
        this.planForm = { NombrePlan: '', Programa: '' };
      },
      error: () => {
        this.guardando = false;
        this.mensajeError = 'No se pudo guardar el plan. Verificá la conexión con IMV.Api.';
      }
    });
  }

  verDetalle(plan: Plan): void {
    alert('Vas a ver el detalle del plan: ' + plan.NombrePlan);
  }

  editarPlan(plan: Plan): void {
    this.abrirModalAlta(plan);
  }
}
