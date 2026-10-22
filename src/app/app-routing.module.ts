import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { SeccionComponent } from './seccion.component';
import { CambiosGuard } from './core/auth/cambios.guard';
import { AccesoGuard } from './core/auth/acceso.guard';
const routes: Routes = [
  { path: '', redirectTo: 'bienvenida', pathMatch: 'full' },
  { path: 'bienvenida', component: SeccionComponent, canActivate: [AccesoGuard], canDeactivate: [CambiosGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange', data: { roles: [] } },
  { path: 'home', component: SeccionComponent, canActivate: [AccesoGuard], canDeactivate: [CambiosGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange', data: { roles: ['Administrativo'] } },
  { path: 'planes', component: SeccionComponent, canActivate: [AccesoGuard], canDeactivate: [CambiosGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange', data: { roles: ['Administrativo'] } },
  { path: 'barrios', component: SeccionComponent, canActivate: [AccesoGuard], canDeactivate: [CambiosGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange', data: { roles: ['Administrativo'] } },
  { path: 'calles', component: SeccionComponent, canActivate: [AccesoGuard], canDeactivate: [CambiosGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange', data: { roles: ['Administrativo'] } },
  { path: 'personas', component: SeccionComponent, canActivate: [AccesoGuard], canDeactivate: [CambiosGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange', data: { roles: ['Administrativo', 'Notarial'] } },
  { path: 'propiedades', component: SeccionComponent, canActivate: [AccesoGuard], canDeactivate: [CambiosGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange', data: { roles: ['Administrativo', 'Notarial'] } },
  { path: 'adjudicaciones', component: SeccionComponent, canActivate: [AccesoGuard], canDeactivate: [CambiosGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange', data: { roles: ['Administrativo', 'Notarial'] } },
  { path: 'notariales', component: SeccionComponent, canActivate: [AccesoGuard], canDeactivate: [CambiosGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange', data: { roles: ['Notarial'] } },
  { path: 'consulta-integral', component: SeccionComponent, canActivate: [AccesoGuard], canDeactivate: [CambiosGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange', data: { roles: ['Administrativo'] } },
  { path: '**', redirectTo: 'bienvenida' }
];
@NgModule({ imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })], exports: [RouterModule] })
export class AppRoutingModule {
  constructor(router: Router) {
    router.routeReuseStrategy.shouldReuseRoute = (futura, actual) => futura.routeConfig === actual.routeConfig &&
      JSON.stringify(futura.queryParams) === JSON.stringify(actual.queryParams);
  }
}
