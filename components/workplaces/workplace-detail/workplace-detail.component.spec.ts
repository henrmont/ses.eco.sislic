import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplaceDetailComponent } from './workplace-detail-component';

describe('WorkplaceDetailComponent', () => {
  let component: WorkplaceDetailComponent;
  let fixture: ComponentFixture<WorkplaceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkplaceDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkplaceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
