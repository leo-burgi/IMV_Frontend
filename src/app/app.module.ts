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

@NgModule({
  declarations: [
    AppComponent,
    PlanesComponent,
    BarriosComponent, 
    CallesComponent, 
    DashboardComponent,
    ImvFilterPipe,
    PersonasComponent,
    NotarialesComponent
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
