import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonopolyGameComponent } from './monopoly-game.component';

describe('MonopolyGameComponent', () => {
  let component: MonopolyGameComponent;
  let fixture: ComponentFixture<MonopolyGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonopolyGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonopolyGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
