import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DfdsPage } from './dfds-page';

describe('DfdsPage', () => {
  let component: DfdsPage;
  let fixture: ComponentFixture<DfdsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DfdsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DfdsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
