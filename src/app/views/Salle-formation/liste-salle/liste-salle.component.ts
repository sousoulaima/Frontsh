import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalleFormation, SalleFormationService } from '../../../services/salle-formation.service';
import { trigger, transition, style, animate } from '@angular/animations';

interface PrixOption {
  value: number;
  label: string;
  isPrive: boolean;
}

interface SalleFormationWithPrix extends SalleFormation {
  prixJour?: number;
  prixHeure?: number;
}

@Component({
  selector: 'app-liste-salle',
  templateUrl: './liste-salle.component.html',
  styleUrls: ['./liste-salle.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' })),
      ]),
    ]),
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class listeSalleComponent implements OnInit {
  searchQuery = '';
  showFilter = false;
  showModal = false;
  showViewModal = false;
  showDeleteConfirm = false;
  isEditing = false;
  salleToDelete: SalleFormation | null = null;
  viewedSalle: SalleFormation | null = null;
  successMessage: string | null = null;
  showSuccess = false;

  salles: SalleFormation[] = [];
  filteredSalles: SalleFormation[] = [];
  currentSalle: Partial<SalleFormationWithPrix> = this.resetSalle();

  prixOptions: PrixOption[] = [
    { value: 25, label: '25 DT (Standard)', isPrive: false },
    { value: 35, label: '35 DT (Premium)', isPrive: true },
    { value: 45, label: '45 DT (VIP)', isPrive: true },
  ];

  currentPrixJour: number = 25;
  currentPrixHeure: number = 25;

  constructor(
    private salleService: SalleFormationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSalles();
  }

  private displaySuccessMessage(message: string): void {
    this.successMessage = message;
    this.showSuccess = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.showSuccess = false;
      this.successMessage = null;
      this.cdr.detectChanges();
    }, 3000);
  }

  resetSalle(): Partial<SalleFormationWithPrix> {
    return {
      designationsalle: '',
      capacitesalle: 10,
      prives_j: false,
      prives_n: false,
      prixJour: 25,
      prixHeure: 25,
    };
  }

  loadSalles(): void {
    this.salleService.getAll().subscribe({
      next: (salles) => {
        this.salles = salles.map(salle => ({
          ...salle,
          prixJour: salle.prives_j ? 35 : 25,
          prixHeure: salle.prives_n ? 35 : 25,
        }));
        this.filteredSalles = [...this.salles];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading salles:', err),
    });
  }

  prepareSalleForSave(salle: Partial<SalleFormationWithPrix>): SalleFormation {
    return {
      codesalle: salle.codesalle,
      designationsalle: salle.designationsalle || '',
      capacitesalle: salle.capacitesalle || 10,
      prives_j: !!(salle.prixJour && salle.prixJour > 30),
      prives_n: !!(salle.prixHeure && salle.prixHeure > 30),
    };
  }

  filterSalles(): void {
    this.filteredSalles = this.salles.filter((salle) => {
      const query = this.searchQuery.toLowerCase();
      return (
        salle.codesalle?.toString().includes(query) ||
        salle.designationsalle.toLowerCase().includes(query) ||
        salle.capacitesalle.toString().includes(query)
      );
    });
    this.cdr.detectChanges();
  }

  openAddSalleModal(): void {
    this.isEditing = false;
    this.currentSalle = this.resetSalle();
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openEditSalleModal(salle: SalleFormation): void {
    this.isEditing = true;
    this.currentSalle = {
      ...salle,
      prixJour: salle.prives_j ? 35 : 25,
      prixHeure: salle.prives_n ? 35 : 25,
    };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  saveSalle(): void {
    const salleToSave = this.prepareSalleForSave(this.currentSalle);

    if (this.isEditing && salleToSave.codesalle) {
      this.salleService.update(salleToSave.codesalle, salleToSave).subscribe({
        next: () => {
          this.loadSalles();
          this.closeModal();
          this.displaySuccessMessage('Salle de formation modifiée avec succès');
        },
        error: (err) => console.error('Error updating salle:', err),
      });
    } else {
      this.salleService.create(salleToSave).subscribe({
        next: () => {
          this.loadSalles();
          this.closeModal();
          this.displaySuccessMessage('Salle de formation ajoutée avec succès');
        },
        error: (err) => console.error('Error creating salle:', err),
      });
    }
  }

  updatePriveStatus(): void {
    if (!this.currentSalle) return;

    this.currentSalle.prives_j = !!(
      this.currentSalle.capacitesalle &&
      this.currentSalle.capacitesalle > 20 &&
      this.currentSalle.prixJour &&
      this.currentSalle.prixJour > 30
    );

    this.currentSalle.prives_n = !!(
      this.currentSalle.capacitesalle &&
      this.currentSalle.capacitesalle > 20 &&
      this.currentSalle.prixHeure &&
      this.currentSalle.prixHeure > 30
    );
  }

  viewSalle(salle: SalleFormation): void {
    this.viewedSalle = salle;
    this.showViewModal = true;
    this.cdr.detectChanges();
  }

  confirmDeleteSalle(salle: SalleFormation): void {
    this.salleToDelete = salle;
    this.showDeleteConfirm = true;
    this.cdr.detectChanges();
  }

  deleteSalle(): void {
    if (this.salleToDelete?.codesalle) {
      this.salleService.delete(this.salleToDelete.codesalle).subscribe({
        next: () => {
          this.loadSalles();
          this.cancelDelete();
          this.displaySuccessMessage('Salle de formation supprimée avec succès');
        },
        error: (err) => console.error('Error deleting salle:', err),
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.currentSalle = this.resetSalle();
    this.cdr.detectChanges();
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewedSalle = null;
    this.cdr.detectChanges();
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.salleToDelete = null;
    this.cdr.detectChanges();
  }

  getPriveStatus(prive: boolean): string {
    return prive ? 'Oui' : 'Non';
  }

  getPriveLabel(isPrive: boolean): string {
    return isPrive ? 'Privé' : 'Standard';
  }
}