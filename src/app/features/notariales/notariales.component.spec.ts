import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { NotarialService } from '../../core/services/notarial.service';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { NotarialesComponent } from './notariales.component';

describe('NotarialesComponent', () => {
  let fixture: ComponentFixture<NotarialesComponent>;
  let component: NotarialesComponent;
  let service: jasmine.SpyObj<NotarialService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj('NotarialService', ['getCatalogos', 'getPaged', 'getDetalle', 'addEstado']);
    service.getCatalogos.and.returnValue(of([]));
    service.getPaged.and.returnValue(of({ Page: 1, PageSize: 15, Total: 0, Items: [] }));
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [NotarialesComponent, PaginationComponent],
      providers: [{ provide: NotarialService, useValue: service }]
    }).compileComponents();
    fixture = TestBed.createComponent(NotarialesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('carga catálogo y primera página', () => {
    expect(component).toBeTruthy();
    expect(service.getPaged).toHaveBeenCalledWith(1, 15, '', null);
  });

  it('vuelve a página 1 al filtrar', () => {
    component.currentPage = 3;
    component.filtroEstado = 0;
    component.onFiltroChange();
    expect(component.currentPage).toBe(1);
    expect(service.getPaged).toHaveBeenCalledWith(1, 15, '', 0);
  });
});
