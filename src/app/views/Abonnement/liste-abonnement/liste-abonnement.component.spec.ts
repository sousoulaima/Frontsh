import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeAbonnementComponent } from './liste-abonnement.component';

describe('ListeAbonnementComponent', () => {
  let component: ListeAbonnementComponent;
  let fixture: ComponentFixture<ListeAbonnementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeAbonnementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeAbonnementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
