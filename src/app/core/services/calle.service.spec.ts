import { TestBed } from '@angular/core/testing';

import { CalleService } from './calle.service';

describe('CalleService', () => {
  let service: CalleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
