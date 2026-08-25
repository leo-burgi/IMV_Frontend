import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CalidadDatosAdjudicaciones } from '../models/calidad-datos-adjudicaciones.model';
import { CalidadDatosService } from './calidad-datos.service';

describe('CalidadDatosService', () => {
  let service: CalidadDatosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(CalidadDatosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe obtener métricas desde Inicio', () => {
    const expected = { TotalLegacy: 5374, TotalMigradas: 283, PorcentajeMigrado: 5.27 } as CalidadDatosAdjudicaciones;
    service.getCalidadAdjudicaciones().subscribe(response => expect(response).toEqual(expected));
    const req = httpMock.expectOne(`${environment.apiUrl}/inicio/calidad-adjudicaciones`);
    expect(req.request.method).toBe('GET');
    req.flush(expected);
  });

  it('debe propagar el error del endpoint', () => {
    let status = 0;
    service.getCalidadAdjudicaciones().subscribe({ error: error => status = error.status });
    httpMock.expectOne(`${environment.apiUrl}/inicio/calidad-adjudicaciones`)
      .flush({}, { status: 503, statusText: 'No disponible' });
    expect(status).toBe(503);
  });
});
