import { ComponentFixture, TestBed } from '@angular/core/testing';

import { listeSalleComponent } from './liste-salle.component';

describe('ListeSalleComponent', () => {
  let component: listeSalleComponent;
  let fixture: ComponentFixture<listeSalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [listeSalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(listeSalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
