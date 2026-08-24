import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<PaginationComponent>;
  let component: PaginationComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ declarations: [PaginationComponent] }).compileComponents();
    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
  });

  it('se oculta con 15 resultados o menos', () => {
    component.total = 15;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('nav')).toBeNull();
  });

  it('emite un cambio de página válido', () => {
    component.total = 40;
    component.page = 1;
    spyOn(component.pageChange, 'emit');
    component.goTo(2);
    expect(component.pageChange.emit).toHaveBeenCalledWith(2);
  });
});
