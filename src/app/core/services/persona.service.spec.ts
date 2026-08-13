import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Persona } from '../models/persona.model';
import { PersonaService } from './persona.service';

describe('PersonaService', () => {
  let service: PersonaService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/personas`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(PersonaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe obtener personas mediante GET', () => {
    const expected: Persona[] = [{ IdPersona: 1, DNI: '123', Apellido: 'Pérez', Nombre: 'Ana' }];
    service.getPersonas().subscribe(response => expect(response).toEqual(expected));
    const req = httpMock.expectOne(`${apiUrl}/listar`);
    expect(req.request.method).toBe('GET');
    req.flush(expected);
  });

  it('debe crear una persona mediante POST', () => {
    const payload: Persona = { DNI: '123', Apellido: 'Pérez', Nombre: 'Ana' };
    service.createPersona(payload).subscribe(response => expect(response.IdPersona).toBe(2));
    const req = httpMock.expectOne(`${apiUrl}/guardar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ IdPersona: 2, ...payload });
  });

  it('debe editar mediante PUT incluyendo IdPersona', () => {
    const payload: Persona = { IdPersona: 2, DNI: '123', Apellido: 'Pérez', Nombre: 'Ana' };
    service.updatePersona(payload).subscribe(response => expect(response).toEqual(payload));
    const req = httpMock.expectOne(`${apiUrl}/editar`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.IdPersona).toBe(2);
    req.flush(payload);
  });

  it('debe propagar errores HTTP', () => {
    let status = 0;
    service.getPersonas().subscribe({ error: error => status = error.status });
    httpMock.expectOne(`${apiUrl}/listar`).flush({}, { status: 500, statusText: 'Error' });
    expect(status).toBe(500);
  });
});
