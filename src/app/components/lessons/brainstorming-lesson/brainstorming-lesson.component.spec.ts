import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrainstormingLessonComponent } from './brainstorming-lesson.component';

describe('BrainstormingLessonComponent', () => {
  let component: BrainstormingLessonComponent;
  let fixture: ComponentFixture<BrainstormingLessonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrainstormingLessonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrainstormingLessonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
