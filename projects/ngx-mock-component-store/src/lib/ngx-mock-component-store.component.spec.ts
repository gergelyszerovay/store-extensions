import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxMockComponentStoreComponent } from './ngx-mock-component-store.component';

describe('NgxMockComponentStoreComponent', () => {
  let component: NgxMockComponentStoreComponent;
  let fixture: ComponentFixture<NgxMockComponentStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxMockComponentStoreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NgxMockComponentStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
