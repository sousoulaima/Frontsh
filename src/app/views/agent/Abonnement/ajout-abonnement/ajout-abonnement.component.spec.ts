import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AjoutAbonnementComponent } from './ajout-abonnement.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('AjoutAbonnementComponent', () => {
  let component: AjoutAbonnementComponent;
  let fixture: ComponentFixture<AjoutAbonnementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AjoutAbonnementComponent, // Import standalone component directly
        FormsModule,
        CommonModule,
        HttpClientTestingModule,
        RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AjoutAbonnementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});