import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjoutAbonnementComponent } from './ajout-abonnement.component';

describe('AjoutAbonnementComponent', () => {
  let component: AjoutAbonnementComponent;
  let fixture: ComponentFixture<AjoutAbonnementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AjoutAbonnementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AjoutAbonnementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
