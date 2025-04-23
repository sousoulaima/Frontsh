import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypesAbonnementComponent } from './types-abonnement.component';

describe('TypesAbonnementComponent', () => {
  let component: TypesAbonnementComponent;
  let fixture: ComponentFixture<TypesAbonnementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypesAbonnementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypesAbonnementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
