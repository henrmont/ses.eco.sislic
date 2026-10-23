import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateDfdsPage } from './validate-dfds-page';

describe('ValidateDfdsPage', () => {
  let component: ValidateDfdsPage;
  let fixture: ComponentFixture<ValidateDfdsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidateDfdsPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidateDfdsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
