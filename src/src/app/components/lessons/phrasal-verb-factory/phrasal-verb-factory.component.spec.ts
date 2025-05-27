import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhrasalVerbFactoryComponent } from './phrasal-verb-factory.component';

describe('PhrasalVerbFactoryComponent', () => {
  let component: PhrasalVerbFactoryComponent;
  let fixture: ComponentFixture<PhrasalVerbFactoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhrasalVerbFactoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhrasalVerbFactoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
