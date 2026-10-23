import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserWorkplaceAttachComponent } from './user-workplace-attach-component';

describe('UserWorkplaceAttachComponent', () => {
  let component: UserWorkplaceAttachComponent;
  let fixture: ComponentFixture<UserWorkplaceAttachComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserWorkplaceAttachComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserWorkplaceAttachComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
