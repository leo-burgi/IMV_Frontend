import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotarialesComponent } from './notariales.component';

describe('NotarialesComponent', () => {
  let fixture: ComponentFixture<NotarialesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ declarations: [NotarialesComponent] }).compileComponents();
    fixture = TestBed.createComponent(NotarialesComponent);
  });

  it('debe crear la sección informativa', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
