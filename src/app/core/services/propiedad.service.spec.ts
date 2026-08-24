import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Propiedad } from '../models/propiedad.model';
import { PropiedadService } from './propiedad.service';

describe('PropiedadService', () => {
  let service: PropiedadService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/propiedades`;
  const propiedad: Propiedad = {
    IdPropiedad: 1, IdBarrio: 2, Barrio: 'MORA', IdCalle: 3,
    Calle: 'LAVALLE', Altura: '2894'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(PropiedadService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe listar propiedades mediante GET', () => {
    service.getPropiedades().subscribe(response => expect(response).toEqual([propiedad]));
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([propiedad]);
  });

  it('debe enviar página y filtros al endpoint paginado', () => {
    service.getPropiedadesPaginadas(3, 15, 'Lavalle', 'MORA', 'activas', 'con').subscribe();
    const req = httpMock.expectOne(request => request.url === `${apiUrl}/paginadas`);
    expect(req.request.params.get('page')).toBe('3');
    expect(req.request.params.get('pageSize')).toBe('15');
    expect(req.request.params.get('search')).toBe('Lavalle');
    expect(req.request.params.get('barrio')).toBe('MORA');
    expect(req.request.params.get('estado')).toBe('activas');
    expect(req.request.params.get('catastro')).toBe('con');
    req.flush({ Page: 3, PageSize: 15, Total: 40, Items: [] });
  });

  it('debe obtener el detalle mediante GET', () => {
    service.getPropiedad(1).subscribe(response => expect(response).toEqual(propiedad));
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(propiedad);
  });

  it('debe propagar errores HTTP', () => {
    let status = 0;
    service.getPropiedades().subscribe({ error: error => status = error.status });
    httpMock.expectOne(apiUrl).flush({}, { status: 500, statusText: 'Error' });
    expect(status).toBe(500);
  });
});
