import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Barrio } from '../models/barrio.model';
import { BarrioService } from './barrio.service';

describe('BarrioService', () => {
  let service: BarrioService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/barrios`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(BarrioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe obtener barrios mediante GET', () => {
    const expected: Barrio[] = [{ IdBarrio: 1, Nombre: 'Centro' }];
    service.getBarrios().subscribe(response => expect(response).toEqual(expected));
    const req = httpMock.expectOne(`${apiUrl}/listar`);
    expect(req.request.method).toBe('GET');
    req.flush(expected);
  });

  it('debe crear un barrio mediante POST', () => {
    const payload: Barrio = { Nombre: 'Norte' };
    const expected: Barrio = { IdBarrio: 2, ...payload };
    service.createBarrio(payload).subscribe(response => expect(response).toEqual(expected));
    const req = httpMock.expectOne(`${apiUrl}/guardar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(expected);
  });

  it('debe editar un barrio mediante PUT incluyendo IdBarrio', () => {
    const payload: Barrio = { IdBarrio: 2, Nombre: 'Norte actualizado' };
    service.updateBarrio(payload).subscribe(response => expect(response).toEqual(payload));
    const req = httpMock.expectOne(`${apiUrl}/editar`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    expect(req.request.body.IdBarrio).toBe(2);
    req.flush(payload);
  });

  it('debe propagar errores HTTP', () => {
    let receivedError: HttpErrorResponse | undefined;
    service.getBarrios().subscribe({
      next: () => fail('La solicitud debía fallar'),
      error: error => receivedError = error
    });
    const req = httpMock.expectOne(`${apiUrl}/listar`);
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });
    expect(receivedError && receivedError.status).toBe(500);
  });
});
