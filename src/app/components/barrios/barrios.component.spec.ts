import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BarriosComponent } from './barrios.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';


describe('BarriosComponent', () => {
  let component: BarriosComponent;
  let fixture: ComponentFixture<BarriosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BarriosComponent ],
      imports: [ HttpClientTestingModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BarriosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
