import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalleFormation, SalleFormationService } from '../../../../services/salle-formation.service';

interface PrixOption {
  value: number;
  label: string;
  isPrive: boolean;
}
// Créons une interface étendue pour le composant
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
    // (Les animations peuvent rester inchangées)
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

  salles: SalleFormation[] = [];
  filteredSalles: SalleFormation[] = [];
  // Modifions le type de currentSalle
  currentSalle: Partial<SalleFormationWithPrix> = this.resetSalle();

    // Options pour les prix
    prixOptions: PrixOption[] = [
      { value: 25, label: '25 DT (Standard)', isPrive: false },
      { value: 35, label: '35 DT (Premium)', isPrive: true },
      { value: 45, label: '45 DT (VIP)', isPrive: true }
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

  resetSalle(): Partial<SalleFormationWithPrix> {
    return {
      designationsalle: '',
      capacitesalle: 10,
      prives_j: false,
      prives_n: false,
      prixJour: 25,  // Valeur par défaut
      prixHeure: 25  // Valeur par défaut
    };
  }

  loadSalles(): void {
    this.salleService.getAll().subscribe({
      next: (salles) => {
        this.salles = salles.map(salle => ({
          ...salle,
          // Ajout des propriétés calculées pour l'affichage
          prixJour: salle.prives_j ? 35 : 25,
          prixHeure: salle.prives_n ? 35 : 25
        }));
        this.filteredSalles = [...this.salles];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading salles:', err)
    });
  }

  // Adaptons la méthode prepareSalleForSave
  prepareSalleForSave(salle: Partial<SalleFormationWithPrix>): SalleFormation {
    return {
      codesalle: salle.codesalle,
      designationsalle: salle.designationsalle || '',
      capacitesalle: salle.capacitesalle || 10,
      prives_j: !!(salle.prixJour && salle.prixJour > 30),
      prives_n: !!(salle.prixHeure && salle.prixHeure > 30)
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
  }

  openAddSalleModal(): void {
    this.isEditing = false;
    this.currentSalle = this.resetSalle();
    this.showModal = true;
  }

    // Adaptons openEditSalleModal
    openEditSalleModal(salle: SalleFormation): void {
      this.isEditing = true;
      this.currentSalle = { 
        ...salle,
        prixJour: salle.prives_j ? 35 : 25,
        prixHeure: salle.prives_n ? 35 : 25
      };
      this.showModal = true;
    }

  saveSalle(): void {
    const salleToSave = this.prepareSalleForSave(this.currentSalle);
    
    if (this.isEditing && salleToSave.codesalle) {
      this.salleService.update(salleToSave.codesalle, salleToSave)
        .subscribe(() => {
          this.loadSalles();
          this.closeModal();
        });
    } else {
      this.salleService.create(salleToSave)
        .subscribe(() => {
          this.loadSalles();
          this.closeModal();
        });
    }
  }

  updatePriveStatus(): void {
    if (!this.currentSalle) return;
    
    // Mise à jour prives_j basée sur prixJour et capacité
    this.currentSalle.prives_j = !!(
      this.currentSalle.capacitesalle && 
      this.currentSalle.capacitesalle > 20 && 
      this.currentSalle.prixJour && 
      this.currentSalle.prixJour > 30
    );

    // Mise à jour prives_n basée sur prixHeure et capacité
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
  }

  confirmDeleteSalle(salle: SalleFormation): void {
    this.salleToDelete = salle;
    this.showDeleteConfirm = true;
  }

  deleteSalle(): void {
    if (this.salleToDelete?.codesalle) {
      this.salleService.delete(this.salleToDelete.codesalle)
        .subscribe(() => {
          this.loadSalles();
          this.cancelDelete();
        });
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.currentSalle = this.resetSalle();
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewedSalle = null;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.salleToDelete = null;
  }

  getPriveStatus(prive: boolean): string {
    return prive ? 'Oui' : 'Non';
  }
  getPriveLabel(isPrive: boolean): string {
    return isPrive ? 'Privé' : 'Standard';
  }
  
}