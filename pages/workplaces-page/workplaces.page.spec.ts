import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkplacePage } from './workplace-page';

describe('WorkplacePage', () => {
  let component: WorkplacePage;
  let fixture: ComponentFixture<WorkplacePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkplacePage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkplacePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
