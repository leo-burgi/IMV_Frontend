import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlanesComponent } from './features/planes/planes.component';
import { BarriosComponent } from './features/barrios/barrios.component';
import { CallesComponent } from './features/calles/calles.component';
import { PersonasComponent } from './features/personas/personas.component';
import { NotarialesComponent } from './features/notariales/notariales.component';
import { AdjudicacionesComponent } from './features/adjudicaciones/adjudicaciones.component';
import { PropiedadesComponent } from './features/propiedades/propiedades.component';
import { ConsultaIntegralComponent } from './features/consulta-integral/consulta-integral.component';

const routes: Routes = [
  { path: 'planes', component: PlanesComponent },
  { path: 'barrios', component: BarriosComponent },
  { path: 'calles', component: CallesComponent },
  { path: 'personas', component: PersonasComponent },
  { path: 'notariales', component: NotarialesComponent },
  { path: 'adjudicaciones', component: AdjudicacionesComponent },
  { path: 'propiedades', component: PropiedadesComponent },
  { path: 'consulta-integral', component: ConsultaIntegralComponent },
  { path: '', redirectTo: '/planes', pathMatch: 'full' } // Redirección por defecto
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
