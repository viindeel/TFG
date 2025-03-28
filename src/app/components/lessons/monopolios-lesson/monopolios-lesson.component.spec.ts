import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonopoliosLessonComponent } from './monopolios-lesson.component';

describe('MonopoliosLessonComponent', () => {
  let component: MonopoliosLessonComponent;
  let fixture: ComponentFixture<MonopoliosLessonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonopoliosLessonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonopoliosLessonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
