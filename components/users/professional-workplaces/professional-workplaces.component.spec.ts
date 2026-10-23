import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserWorkplacesComponent } from './user-workplaces-component';

describe('UserWorkplacesComponent', () => {
  let component: UserWorkplacesComponent;
  let fixture: ComponentFixture<UserWorkplacesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserWorkplacesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserWorkplacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
