import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { ConsultaIntegralDetalle, ConsultaIntegralPagina } from '../models/consulta-integral.model';
import { ConsultaIntegralService } from './consulta-integral.service';

describe('ConsultaIntegralService', () => {
  let service: ConsultaIntegralService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/consulta-integral`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ConsultaIntegralService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe buscar con paginación server-side mediante GET', () => {
    const response: ConsultaIntegralPagina = { Page: 2, PageSize: 15, Total: 20, Items: [] };
    service.search(' 12345678 ', 'PERSONA', 2, 15).subscribe(value => expect(value).toEqual(response));

    const request = httpMock.expectOne(req => req.url === apiUrl);
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('search')).toBe('12345678');
    expect(request.request.params.get('tipo')).toBe('PERSONA');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('pageSize')).toBe('15');
    request.flush(response);
  });

  it('debe consultar detalles exclusivamente mediante GET', () => {
    const response = { TipoResultado: 'PERSONA', NivelConfianza: 'DEFINITIVO', Adjudicaciones: [], AntecedentesLegacy: [], Faltantes: [], Advertencias: [] } as ConsultaIntegralDetalle;
    service.getPersona(1).subscribe();
    service.getPropiedad(2).subscribe();
    service.getLegacy(3).subscribe();

    [`${apiUrl}/persona/1`, `${apiUrl}/propiedad/2`, `${apiUrl}/legacy/3`].forEach(url => {
      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe('GET');
      request.flush(response);
    });
  });
});
