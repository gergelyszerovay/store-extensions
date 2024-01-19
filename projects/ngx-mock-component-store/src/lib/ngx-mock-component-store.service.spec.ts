import { TestBed } from '@angular/core/testing';

import { NgxMockComponentStoreService } from './ngx-mock-component-store.service';

describe('NgxMockComponentStoreService', () => {
  let service: NgxMockComponentStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxMockComponentStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
