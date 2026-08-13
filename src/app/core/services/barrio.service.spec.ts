import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { BarrioService } from './barrio.service';

describe('BarrioService', () => {
  let service: BarrioService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(BarrioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
