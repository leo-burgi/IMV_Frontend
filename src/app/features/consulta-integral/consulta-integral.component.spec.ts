import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ConsultaIntegralDetalle, ConsultaIntegralResultado } from '../../core/models/consulta-integral.model';
import { ConsultaIntegralService } from '../../core/services/consulta-integral.service';
import { ConsultaIntegralComponent } from './consulta-integral.component';

describe('ConsultaIntegralComponent', () => {
  let fixture: ComponentFixture<ConsultaIntegralComponent>;
  let component: ConsultaIntegralComponent;
  let service: jasmine.SpyObj<ConsultaIntegralService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj('ConsultaIntegralService', ['search', 'getPersona', 'getPropiedad', 'getLegacy']);
    service.search.and.returnValue(of({ Page: 1, PageSize: 15, Total: 0, Items: [] }));
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [ConsultaIntegralComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: ConsultaIntegralService, useValue: service }]
    }).compileComponents();
    fixture = TestBed.createComponent(ConsultaIntegralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe buscar desde página 1 y paginar en el servidor', () => {
    component.search = '12345678';
    component.tipo = 'PERSONA';
    component.buscar(1);
    expect(service.search).toHaveBeenCalledWith('12345678', 'PERSONA', 1, 15);

    component.cambiarPagina(2);
    expect(service.search).toHaveBeenCalledWith('12345678', 'PERSONA', 2, 15);
  });

  it('debe cargar el detalle correspondiente sin operaciones de escritura', () => {
    const item = resultado('LEGACY', 'COINCIDENCIA_CANDIDATA');
    item.IdRegistroLegacy = 20;
    service.getLegacy.and.returnValue(of(detalle('LEGACY', 'COINCIDENCIA_CANDIDATA')));

    component.toggleDetalle(item);

    expect(service.getLegacy).toHaveBeenCalledWith(20);
    expect(component.detalleDe(item)?.NivelConfianza).toBe('COINCIDENCIA_CANDIDATA');
  });

  it('debe separar visualmente confirmado, candidato y antecedente legacy', () => {
    component.resultados = [
      resultado('PERSONA', 'DEFINITIVO'),
      resultado('LEGACY', 'COINCIDENCIA_CANDIDATA'),
      resultado('LEGACY', 'ANTECEDENTE_LEGACY_NO_VALIDADO')
    ];
    component.busquedaRealizada = true;
    component.total = 3;
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Confirmado');
    expect(text).toContain('Coincidencia candidata');
    expect(text).toContain('Antecedente legacy no validado');
  });

  it('debe mostrar literalmente la observación RAW en el detalle legacy', () => {
    const item = resultado('LEGACY', 'ANTECEDENTE_LEGACY_NO_VALIDADO');
    item.IdRegistroLegacy = 21;
    const response = detalle('LEGACY', 'ANTECEDENTE_LEGACY_NO_VALIDADO');
    response.AntecedentesLegacy = [{
      IdRegistro: 21, IdLote: 20, HojaOrigen: 'HOJA', FilaOrigen: 4,
      CategoriaInformacion: 'ANTECEDENTE_LEGACY_NO_VALIDADO', EstadoValidacion: 'CONFLICTO',
      RawObservaciones: 'Texto RAW; sin alterar / 01'
    }];
    service.getLegacy.and.returnValue(of(response));
    component.resultados = [item];
    component.total = 1;
    component.busquedaRealizada = true;
    component.toggleDetalle(item);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Texto RAW; sin alterar / 01');
  });

  it('debe mostrar una única advertencia legacy al final del detalle', () => {
    const item = resultado('PERSONA', 'DEFINITIVO');
    item.IdPersona = 1;
    const response = detalle('PERSONA', 'DEFINITIVO');
    response.Advertencias = ['Advertencia anterior 1', 'Advertencia anterior 2'];
    service.getPersona.and.returnValue(of(response));
    component.resultados = [item];
    component.total = 1;
    component.busquedaRealizada = true;
    component.toggleDetalle(item);
    fixture.detectChanges();

    const warnings = fixture.nativeElement.querySelectorAll('.consulta-warning');
    expect(warnings.length).toBe(1);
    expect(warnings[0].textContent).toContain('Los datos legacy que se muestran deben ser verificados y confirmados');
    expect(warnings[0]).toBe(warnings[0].parentElement.lastElementChild);
  });

  function resultado(tipo: 'PERSONA' | 'PROPIEDAD' | 'LEGACY', nivel: any): ConsultaIntegralResultado {
    return {
      TipoResultado: tipo, NivelConfianza: nivel, Titulo: tipo, Estado: 'PENDIENTE_VERIFICACION',
      TieneInformacionDefinitiva: tipo !== 'LEGACY'
    };
  }

  function detalle(tipo: any, nivel: any): ConsultaIntegralDetalle {
    return { TipoResultado: tipo, NivelConfianza: nivel, Adjudicaciones: [], AntecedentesLegacy: [], Faltantes: [], Advertencias: [] };
  }
});
