import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AuditoriaService } from './auditoria.service';

describe('AuditoriaService', () => {
  let service: AuditoriaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AuditoriaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe obtener el historial ordenado por el endpoint de auditoría', () => {
    service.getHistorial('Propiedades', 7).subscribe(historial => expect(historial.length).toBe(1));
    const req = httpMock.expectOne(`${environment.apiUrl}/auditoria/Propiedades/7`);
    expect(req.request.method).toBe('GET');
    req.flush([{ IdAuditoria: 1, Entidad: 'Propiedades', IdEntidad: 7, Operacion: 'MODIFICACION', Campo: 'Altura', Usuario: 'usuario', FechaHora: '2026-08-28T10:00:00' }]);
  });
});
