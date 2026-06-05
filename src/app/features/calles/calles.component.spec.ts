import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallesComponent } from './calles.component';

describe('CallesComponent', () => {
  let component: CallesComponent;
  let fixture: ComponentFixture<CallesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
