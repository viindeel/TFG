import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquilibrioVidaLaboralComponent } from './equilibrio-vida-laboral.component';

describe('EquilibrioVidaLaboralComponent', () => {
  let component: EquilibrioVidaLaboralComponent;
  let fixture: ComponentFixture<EquilibrioVidaLaboralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquilibrioVidaLaboralComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquilibrioVidaLaboralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
