import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplaceDeleteComponent } from './workplace-delete-component';

describe('WorkplaceDeleteComponent', () => {
  let component: WorkplaceDeleteComponent;
  let fixture: ComponentFixture<WorkplaceDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkplaceDeleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkplaceDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
