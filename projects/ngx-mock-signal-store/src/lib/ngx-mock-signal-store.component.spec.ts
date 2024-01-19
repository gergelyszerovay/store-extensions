import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxMockSignalStoreComponent } from './ngx-mock-signal-store.component';

describe('NgxMockSignalStoreComponent', () => {
  let component: NgxMockSignalStoreComponent;
  let fixture: ComponentFixture<NgxMockSignalStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxMockSignalStoreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NgxMockSignalStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
