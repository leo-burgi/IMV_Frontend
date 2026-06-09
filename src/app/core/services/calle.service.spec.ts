import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CalleService } from './calle.service';

describe('CalleService', () => {
  let service: CalleService;
  let httpMock: HttpTestingController;

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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a calle via POST', () => {
    const payload = { NombreCalle: 'Nueva Av.', NombreReducido: 'NA' };
    const expected = { IdCalle: 99, ...payload };

    service.createCalle(payload).subscribe(response => {
      expect(response).toEqual(expected);
    });

    const req = httpMock.expectOne('https://localhost:44350/api/calles/guardar');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(expected);
  });
});
