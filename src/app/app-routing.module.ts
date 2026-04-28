import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlanesComponent } from './components/planes/planes.component';
import { BarriosComponent } from './components/barrios/barrios.component';
import { CallesComponent } from './components/calles/calles.component';

const routes: Routes = [
  { path: 'planes', component: PlanesComponent },
  { path: 'barrios', component: BarriosComponent },
  { path: 'calles', component: CallesComponent },
  { path: '', redirectTo: '/planes', pathMatch: 'full' } // Redirección por defecto
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }