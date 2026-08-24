import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Adjudicacion, AdjudicacionCatalogos, AdjudicacionPayload } from '../models/adjudicacion.model';
import { AdjudicacionService } from './adjudicacion.service';

describe('AdjudicacionService', () => {
  let service: AdjudicacionService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/adjudicaciones`;
  const adjudicacion: Adjudicacion = {
    IdAdjudicacion: 1, IdPropiedad: 2, Propiedad: 'Belgrano 100', Catastro: '123',
    IdPlan: 3, NombrePlan: 'Plan A', OrigenPlan: 'IMV', IdTitularPrincipal: 4, TitularPrincipal: 'Pérez, Ana',
    Cotitulares: [], Activa: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AdjudicacionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe listar adjudicaciones mediante GET', () => {
    service.getAdjudicaciones().subscribe(response => expect(response).toEqual([adjudicacion]));
    const req = httpMock.expectOne(`${apiUrl}/listar`);
    expect(req.request.method).toBe('GET');
    req.flush([adjudicacion]);
  });

  it('debe enviar página y filtros al endpoint paginado', () => {
    service.getAdjudicacionesPaginadas(2, 15, 'Pérez', 3, 'activas').subscribe();
    const req = httpMock.expectOne(request => request.url === `${apiUrl}/paginadas`);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('15');
    expect(req.request.params.get('search')).toBe('Pérez');
    expect(req.request.params.get('idPlan')).toBe('3');
    expect(req.request.params.get('estado')).toBe('activas');
    req.flush({ Page: 2, PageSize: 15, Total: 20, Items: [] });
  });

  it('debe obtener el detalle mediante GET', () => {
    service.getDetalle(1).subscribe(response => expect(response).toEqual(adjudicacion));
    const req = httpMock.expectOne(`${apiUrl}/detalle/1`);
    expect(req.request.method).toBe('GET');
    req.flush(adjudicacion);
  });

  it('debe obtener catálogos mediante GET', () => {
    const catalogos: AdjudicacionCatalogos = { Propiedades: [], Planes: [], Personas: [] };
    service.getCatalogos().subscribe(response => expect(response).toEqual(catalogos));
    const req = httpMock.expectOne(`${apiUrl}/catalogos`);
    expect(req.request.method).toBe('GET');
    req.flush(catalogos);
  });

  it('debe enviar el payload completo mediante POST', () => {
    const payload: AdjudicacionPayload = {
      IdPropiedad: 2, IdPlan: 3, IdTitularPrincipal: 4, IdCotitulares: [5], Activa: true
    };
    service.createAdjudicacion(payload).subscribe(response => expect(response).toEqual(adjudicacion));
    const req = httpMock.expectOne(`${apiUrl}/guardar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(adjudicacion);
  });

  it('debe editar incluyendo IdAdjudicacion', () => {
    const payload: AdjudicacionPayload = {
      IdAdjudicacion: 1, IdPropiedad: 2, IdPlan: 3,
      IdTitularPrincipal: 4, IdCotitulares: [], Activa: false
    };
    service.updateAdjudicacion(payload).subscribe(response => expect(response).toEqual(adjudicacion));
    const req = httpMock.expectOne(`${apiUrl}/editar`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.IdAdjudicacion).toBe(1);
    req.flush(adjudicacion);
  });

  it('debe propagar errores HTTP', () => {
    let status = 0;
    service.getAdjudicaciones().subscribe({ error: error => status = error.status });
    httpMock.expectOne(`${apiUrl}/listar`).flush({}, { status: 500, statusText: 'Error' });
    expect(status).toBe(500);
  });
});
