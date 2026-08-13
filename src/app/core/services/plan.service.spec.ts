import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Plan } from '../models/plan.model';
import { PlanService } from './plan.service';

describe('PlanService', () => {
  let service: PlanService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/planes`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(PlanService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe obtener planes mediante GET', () => {
    const expected: Plan[] = [{ IdPlan: 1, NombrePlan: 'Plan A', Programa: 'Programa A' }];
    service.getPlanes().subscribe(response => expect(response).toEqual(expected));
    const req = httpMock.expectOne(`${apiUrl}/listar`);
    expect(req.request.method).toBe('GET');
    req.flush(expected);
  });

  it('debe crear un plan mediante POST', () => {
    const payload: Plan = { NombrePlan: 'Plan B' };
    const expected: Plan = { IdPlan: 2, ...payload };
    service.createPlan(payload).subscribe(response => expect(response).toEqual(expected));
    const req = httpMock.expectOne(`${apiUrl}/guardar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(expected);
  });

  it('debe editar un plan mediante PUT incluyendo IdPlan', () => {
    const payload: Plan = { IdPlan: 2, NombrePlan: 'Plan actualizado', Programa: 'Programa' };
    service.updatePlan(payload).subscribe(response => expect(response).toEqual(payload));
    const req = httpMock.expectOne(`${apiUrl}/editar`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    expect(req.request.body.IdPlan).toBe(2);
    req.flush(payload);
  });

  it('debe propagar errores HTTP', () => {
    let receivedError: HttpErrorResponse | undefined;
    service.getPlanes().subscribe({
      next: () => fail('La solicitud debía fallar'),
      error: error => receivedError = error
    });
    const req = httpMock.expectOne(`${apiUrl}/listar`);
    req.flush({}, { status: 500, statusText: 'Internal Server Error' });
    expect(receivedError && receivedError.status).toBe(500);
  });
});
