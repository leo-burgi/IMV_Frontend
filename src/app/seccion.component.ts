import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConsultaDestino } from './core/models/consulta-integral.model';
import { AppComponent } from './app.component';
@Component({ selector: 'app-seccion', templateUrl: './seccion.component.html', styleUrls: ['./app.component.css', './seccion.component.css'] })
export class SeccionComponent { constructor(public app: AppComponent, route: ActivatedRoute) {
    app.seccionActiva = route.snapshot.routeConfig?.path || 'bienvenida';
    const id = Number(route.snapshot.queryParams.id);
    app.destinoContextual = id > 0 ? { seccion: app.seccionActiva as ConsultaDestino, id } : undefined;
  } }
