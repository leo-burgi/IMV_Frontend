import { Component, Input, OnInit } from '@angular/core';
import { PlanService } from 'src/app/core/services/plan.service';
import { Plan } from 'src/app/core/models/plan.model';
import { ImvSearchService } from 'src/app/core/services/imv-search.service';

@Component({
  selector: 'app-planes',
  templateUrl: './planes.component.html',
  styleUrls: ['../../shared/imv-table.css']
})
export class PlanesComponent implements OnInit {
  @Input() idPlanSeleccionado?: number;
  listaPlanes: Plan[] = [];
  filtroBusqueda = '';
  mostrarModalAlta = false;
  modoEdicion = false;
  guardando = false;
  cargando = false;
  mensajeError = '';
  mensajeExito = '';
  readonly pageSize = 15;
  currentPage = 1;
  planForm: Partial<Plan> = { OrigenPlan: '', NombrePlan: '' };

  constructor(private planService: PlanService, private searchService: ImvSearchService) { }

  ngOnInit(): void {
    this.searchService.searchTerm$.subscribe((term) => {
      this.filtroBusqueda = term || '';
      this.currentPage = 1;
    });
    this.cargarPlanes();
  }

  cargarPlanes(): void {
    this.cargando = true;
    this.mensajeError = '';
    this.planService.getPlanes().subscribe({
      next: (data) => {
        this.listaPlanes = data || [];
        this.cargando = false;
        this.abrirPlanContextual();
      },
      error: () => {
        this.cargando = false;
        this.mensajeError = 'No se pudieron cargar los planes desde IMV.Api.';
      }
    });
  }

  onFiltroChange(term: string): void {
    this.filtroBusqueda = term;
    this.currentPage = 1;
    this.searchService.setSearch(term);
  }

  get planesFiltrados(): Plan[] {
    const term = this.filtroBusqueda.trim().toLowerCase();
    return this.listaPlanes.filter(plan => !term ||
      `${plan.NombrePlan || ''} ${plan.OrigenPlan || ''} ${plan.Barrio || ''} ${(plan.Barrios || []).join(' ')}`
        .toLowerCase().includes(term));
  }

  get planesPaginados(): Plan[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.planesFiltrados.slice(start, start + this.pageSize);
  }

  cambiarPagina(page: number): void { this.currentPage = page; }

  abrirModalAlta(plan?: Plan): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    this.modoEdicion = !!plan;
    this.planForm = plan ? { ...plan } : { OrigenPlan: '', NombrePlan: '' };
    this.mostrarModalAlta = true;
  }

  cerrarModalAlta(): void {
    this.mostrarModalAlta = false;
    this.guardando = false;
    this.mensajeError = '';
    this.modoEdicion = false;
    this.planForm = { OrigenPlan: '', NombrePlan: '' };
  }

  guardarPlan(): void {
    const origen = this.planForm.OrigenPlan?.trim();
    const nombre = this.planForm.NombrePlan?.trim();

    if (!origen) {
      this.mensajeError = 'El origen del plan es obligatorio.';
      return;
    }

    if (!nombre) {
      this.mensajeError = 'El nombre del plan es obligatorio.';
      return;
    }

    this.guardando = true;
    this.mensajeError = '';

    const datosPlan: Plan = {
      OrigenPlan: origen,
      NombrePlan: nombre
    };
    const request = this.modoEdicion && this.planForm.IdPlan
      ? this.planService.updatePlan({
          ...datosPlan,
          IdPlan: this.planForm.IdPlan
        })
      : this.planService.createPlan(datosPlan);

    request.subscribe({
      next: () => {
        this.cargarPlanes();
        this.mostrarModalAlta = false;
        this.guardando = false;
        this.mensajeExito = this.modoEdicion ? 'El plan se actualizó correctamente.' : 'El plan se cargó correctamente.';
        this.modoEdicion = false;
        this.planForm = { OrigenPlan: '', NombrePlan: '' };
      },
      error: error => {
        this.guardando = false;
        this.mensajeError = error.error && error.error.Message
          ? error.error.Message
          : 'No se pudo guardar el plan. Verificá la conexión con IMV.Api.';
      }
    });
  }

  verDetalle(plan: Plan): void {
    alert('Vas a ver el detalle del plan: ' + (plan.NombrePlan || 'Sin nombre informado'));
  }

  editarPlan(plan: Plan): void {
    this.abrirModalAlta(plan);
  }

  private abrirPlanContextual(): void {
    if (!this.idPlanSeleccionado) return;
    const index = this.listaPlanes.findIndex(plan => plan.IdPlan === this.idPlanSeleccionado);
    if (index < 0) {
      this.mensajeError = 'No se encontró el plan seleccionado.';
      return;
    }

    this.filtroBusqueda = '';
    this.currentPage = Math.floor(index / this.pageSize) + 1;
    const plan = this.listaPlanes[index];
    this.idPlanSeleccionado = undefined;
    this.editarPlan(plan);
  }
}
