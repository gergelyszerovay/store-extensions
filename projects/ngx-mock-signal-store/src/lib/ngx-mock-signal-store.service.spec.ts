import { TestBed } from '@angular/core/testing';

import { NgxMockSignalStoreService } from './ngx-mock-signal-store.service';

describe('NgxMockSignalStoreService', () => {
  let service: NgxMockSignalStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxMockSignalStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
