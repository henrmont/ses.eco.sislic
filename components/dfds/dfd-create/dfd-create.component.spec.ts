import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DfdCreateComponent } from './dfd-create-component';

describe('DfdCreateComponent', () => {
  let component: DfdCreateComponent;
  let fixture: ComponentFixture<DfdCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DfdCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DfdCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
