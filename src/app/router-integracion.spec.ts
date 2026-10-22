import { NO_ERRORS_SCHEMA, NgZone } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Location } from '@angular/common';
import { AppComponent } from './app.component';
import { SeccionComponent } from './seccion.component';
import { AppRoutingModule } from './app-routing.module';
import { environment } from '../environments/environment';
describe('Navegación integrada y permisos', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ declarations: [AppComponent, SeccionComponent],
      imports: [FormsModule, HttpClientTestingModule, AppRoutingModule, RouterTestingModule], schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });
  it('conserva el destino de enlaces profundos y atrás/adelante', fakeAsync(() => {
    const router = TestBed.inject(Router);
    TestBed.inject(NgZone).run(() => router.initialNavigation());
    const fixture = TestBed.createComponent(AppComponent); fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne(environment.apiUrl + '/auth/me').flush({
      Autenticado: true, IdUsuarioAplicacion: 1, MetodoIngreso: 'Local', NombreMostrar: 'Prueba', Iniciales: 'PR', Roles: ['Administrativo']
    }); tick(); fixture.detectChanges();
    TestBed.inject(NgZone).run(() => router.navigateByUrl('/personas?id=4')); tick(); fixture.detectChanges();
    expect(fixture.componentInstance.seccionActiva).toBe('personas');
    expect(fixture.componentInstance.idDestino('personas')).toBe(4);
    TestBed.inject(NgZone).run(() => router.navigateByUrl('/propiedades?id=9')); tick(); fixture.detectChanges();
    expect(fixture.componentInstance.idDestino('propiedades')).toBe(9);
    TestBed.inject(Location).back(); tick(); fixture.detectChanges();
    expect(router.url).toBe('/personas?id=4');
    expect(fixture.componentInstance.idDestino('personas')).toBe(4);
    TestBed.inject(Location).forward(); tick(); fixture.detectChanges();
    expect(router.url).toBe('/propiedades?id=9');
    fixture.destroy();
  }));
  it('una guarda denegada conserva la sección permitida', fakeAsync(() => {
    const router = TestBed.inject(Router);
    TestBed.inject(NgZone).run(() => router.initialNavigation());
    const fixture = TestBed.createComponent(AppComponent); fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne(environment.apiUrl + '/auth/me').flush({
      Autenticado: true, IdUsuarioAplicacion: 1, MetodoIngreso: 'Local', NombreMostrar: 'Prueba', Iniciales: 'PR', Roles: ['Notarial']
    }); tick(); fixture.detectChanges();
    TestBed.inject(NgZone).run(() => router.navigateByUrl('/personas?id=4')); tick(); fixture.detectChanges();
    TestBed.inject(NgZone).run(() => router.navigateByUrl('/planes')); tick(); fixture.detectChanges();
    expect(router.url).toBe('/personas?id=4');
    expect(fixture.componentInstance.seccionActiva).toBe('personas');
    fixture.destroy();
  }));
});
