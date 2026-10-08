import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplaceCreateComponent } from './workplace-create-component';

describe('WorkplaceCreateComponent', () => {
  let component: WorkplaceCreateComponent;
  let fixture: ComponentFixture<WorkplaceCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkplaceCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkplaceCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
