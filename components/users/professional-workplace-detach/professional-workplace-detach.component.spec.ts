import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserWorkplaceDetachComponent } from './user-workplace-detach-component';

describe('UserWorkplaceDetachComponent', () => {
  let component: UserWorkplaceDetachComponent;
  let fixture: ComponentFixture<UserWorkplaceDetachComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserWorkplaceDetachComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserWorkplaceDetachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
