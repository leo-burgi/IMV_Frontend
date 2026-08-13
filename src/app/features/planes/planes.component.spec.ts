import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

import { PlanesComponent } from './planes.component';
import { ImvFilterPipe } from '../../shared/imv-filter.pipe';

describe('PlanesComponent', () => {
  let component: PlanesComponent;
  let fixture: ComponentFixture<PlanesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlanesComponent, ImvFilterPipe],
      imports: [HttpClientTestingModule, FormsModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
