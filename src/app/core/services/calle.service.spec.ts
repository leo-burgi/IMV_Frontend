import { HttpErrorResponse } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { Calle } from '../models/calle.model';
import { CalleService } from './calle.service';

describe('CalleService', () => {
  let service: CalleService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/calles`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(CalleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe obtener las calles mediante GET', () => {
    const expected: Calle[] = [
      { IdCalle: 1, Nombre: 'San Martín', NombreReducido: 'San Martín' }
    ];

    service.getCalles().subscribe(response => {
      expect(response).toEqual(expected);
    });

    const req = httpMock.expectOne(`${apiUrl}/listar`);
    expect(req.request.method).toBe('GET');
    req.flush(expected);
  });

  it('debe crear una calle mediante POST y enviar el payload esperado', () => {
    const payload: Calle = { Nombre: 'Nueva Avenida', NombreReducido: 'Nva. Av.' };
    const expected: Calle = { IdCalle: 99, ...payload };

    service.createCalle(payload).subscribe(response => {
      expect(response).toEqual(expected);
    });

    const req = httpMock.expectOne(`${apiUrl}/guardar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(expected);
  });

  it('debe editar una calle mediante PUT incluyendo IdCalle', () => {
    const payload: Calle = {
      IdCalle: 7,
      Nombre: 'Avenida Actualizada',
      NombreReducido: 'Av. Act.'
    };

    service.updateCalle(payload).subscribe(response => {
      expect(response).toEqual(payload);
    });

    const req = httpMock.expectOne(`${apiUrl}/editar`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    expect(req.request.body.IdCalle).toBe(7);
    req.flush(payload);
  });

  it('debe propagar los errores HTTP', () => {
    let receivedError: HttpErrorResponse | undefined;

    service.getCalles().subscribe({
      next: () => fail('La solicitud debía fallar'),
      error: error => receivedError = error
    });

    const req = httpMock.expectOne(`${apiUrl}/listar`);
    req.flush(
      { Message: 'Error inesperado' },
      { status: 500, statusText: 'Internal Server Error' }
    );

    expect(receivedError).toBeTruthy();
    expect(receivedError && receivedError.status).toBe(500);
  });
});
