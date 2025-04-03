import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkLifeBalanceGameComponent } from './work-life-balance-game.component';

describe('WorkLifeBalanceGameComponent', () => {
  let component: WorkLifeBalanceGameComponent;
  let fixture: ComponentFixture<WorkLifeBalanceGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkLifeBalanceGameComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkLifeBalanceGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
