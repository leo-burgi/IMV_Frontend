import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { PlanesComponent } from './features/planes/planes.component';
import { BarriosComponent } from './features/barrios/barrios.component';
import { CallesComponent } from './features/calles/calles.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ImvFilterPipe } from './shared/imv-filter.pipe';
import { PersonasComponent } from './features/personas/personas.component';
import { NotarialesComponent } from './features/notariales/notariales.component';
import { AdjudicacionesComponent } from './features/adjudicaciones/adjudicaciones.component';
import { CalidadDatosPanelComponent } from './features/inicio/calidad-datos-panel.component';
import { PropiedadesComponent } from './features/propiedades/propiedades.component';
import { PaginationComponent } from './shared/pagination/pagination.component';
import { ConsultaIntegralComponent } from './features/consulta-integral/consulta-integral.component';

@NgModule({
  declarations: [
    AppComponent,
    PlanesComponent,
    BarriosComponent, 
    CallesComponent, 
    DashboardComponent,
    ImvFilterPipe,
    PersonasComponent,
    NotarialesComponent,
    AdjudicacionesComponent,
    CalidadDatosPanelComponent,
    PropiedadesComponent,
    PaginationComponent,
    ConsultaIntegralComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
