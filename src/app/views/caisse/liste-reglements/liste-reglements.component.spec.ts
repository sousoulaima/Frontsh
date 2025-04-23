import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeReglementsComponent } from './liste-reglements.component';

describe('ListeReglementsComponent', () => {
  let component: ListeReglementsComponent;
  let fixture: ComponentFixture<ListeReglementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeReglementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListeReglementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
