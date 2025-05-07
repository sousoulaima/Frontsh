import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { AbonnementService, Abonnement, Adherent, TypeAbonnement, CategorieAbonnement } from '../../../../services/abonnement.service';
import { forkJoin } from 'rxjs';

interface EnrichedAbonnement extends Abonnement {
  adherentName: string;
  typeDesignation: string;
  categorieDesignation: string;
}

@Component({
  selector: 'app-liste-abonnement',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './liste-abonnement.component.html',
  styleUrls: ['./liste-abonnement.component.scss'],
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
    trigger('filterAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' })),
      ]),
    ]),
  ],
})
export class ListeAbonnementComponent implements OnInit {
  abonnements: EnrichedAbonnement[] = [];
  filteredAbonnements: EnrichedAbonnement[] = [];
  adherents: Adherent[] = [];
  typesAbonnement: TypeAbonnement[] = [];
  categoriesAbonnement: CategorieAbonnement[] = [];
  
  searchQuery = '';
  filterType = '';
  filterMiPaye = '';
  showFilter = false;
  showModal = false;
  showViewModal = false;
  showDeleteConfirm = false;
  isEditing = false;
  
  currentAbonnement: Partial<Abonnement> = {};
  viewedAbonnement: EnrichedAbonnement | null = null;
  abonnementToDelete: EnrichedAbonnement | null = null;

  constructor(private abonnementService: AbonnementService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      abonnements: this.abonnementService.getAllAbonnements(),
      adherents: this.abonnementService.getAllAdherents(),
      types: this.abonnementService.getAllTypesAbonnement(),
      categories: this.abonnementService.getAllCategories()
    }).subscribe({
      next: (results) => {
        this.adherents = results.adherents;
        this.typesAbonnement = results.types;
        this.categoriesAbonnement = results.categories;

        this.abonnements = results.abonnements.map(abonnement => {
          const adherent = results.adherents.find(a => a.code === abonnement.adherent_code);
          const type = results.types.find(t => t.code === abonnement.type_abonnement_code);
          const categorie = results.categories.find(c => c.codecateg === abonnement.categorie_abonnement_codecateg);
          
          return {
            ...abonnement,
            adherentName: adherent ? `${adherent.nom} ${adherent.prenom}` : 'Inconnu',
            typeDesignation: type ? type.designation : 'Inconnu',
            categorieDesignation: categorie ? categorie.designationcateg : 'Inconnu'
          };
        });

        this.filteredAbonnements = [...this.abonnements];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données:', err);
      }
    });
  }

  filterAbonnements(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredAbonnements = this.abonnements.filter((abonnement) => {
      const matchesSearch =
        abonnement.codeabo?.toString().includes(query) ||
        abonnement.adherentName.toLowerCase().includes(query) ||
        abonnement.dateabo?.includes(query) ||
        abonnement.datedeb?.includes(query) ||
        abonnement.datefin?.includes(query) ||
        abonnement.typeDesignation.toLowerCase().includes(query);
      
      const matchesType = this.filterType ? 
        abonnement.typeDesignation === this.filterType : true;
      
      const matchesMiPaye = this.filterMiPaye ? 
        (typeof abonnement.mtpaye === 'string' ? 
         abonnement.mtpaye === this.filterMiPaye.toLowerCase() : 
         false) : true;
      
      return matchesSearch && matchesType && matchesMiPaye;
    });
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  openEditAbonnementModal(abonnement: EnrichedAbonnement): void {
    this.isEditing = true;
    this.currentAbonnement = { ...abonnement };
    this.showModal = true;
  }

  openAddAbonnementModal(): void {
    this.isEditing = false;
    this.currentAbonnement = {
      dateabo: new Date().toISOString().split('T')[0],
      solde: false,
      restepaye: 0,
      mtpaye: 0,
      totalhtabo: 0,
      totalremise: 0,
      totalht: 0,
      totalttc: 0
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentAbonnement = {};
  }

  updateFinancials(): void {
    const totalHTAbo = this.currentAbonnement.totalhtabo || 0;
    const totalRemise = this.currentAbonnement.totalremise || 0;
    const taxRate = 0.19; // TVA 19%
    
    this.currentAbonnement.totalht = totalHTAbo - totalRemise;
    this.currentAbonnement.totalttc = (this.currentAbonnement.totalht || 0) * (1 + taxRate);
    
    if (this.currentAbonnement.solde) {
      this.currentAbonnement.restepaye = 0;
      this.currentAbonnement.mtpaye = this.currentAbonnement.totalttc;
    } else {
      this.currentAbonnement.restepaye = (this.currentAbonnement.totalttc || 0) - (this.currentAbonnement.mtpaye || 0);
    }
  }

  updateDateFin(): void {
    if (!this.currentAbonnement.datedeb || !this.currentAbonnement.type_abonnement_code) {
      this.currentAbonnement.datefin = undefined;
      return;
    }
    
    const type = this.typesAbonnement.find(t => t.code === this.currentAbonnement.type_abonnement_code);
    if (!type) return;
    
    const startDate = new Date(this.currentAbonnement.datedeb);
    const endDate = new Date(startDate);
    
    if (type.nbmois) {
      endDate.setMonth(startDate.getMonth() + type.nbmois);
    } else if (type.nbjours) {
      endDate.setDate(startDate.getDate() + type.nbjours);
    }
    
    this.currentAbonnement.datefin = endDate.toISOString().split('T')[0];
  }

  saveAbonnement(): void {
    if (!this.currentAbonnement) return;

    if (this.isEditing && this.currentAbonnement.codeabo) {
      this.abonnementService.update(this.currentAbonnement.codeabo, this.currentAbonnement as Abonnement)
        .subscribe({
          next: () => {
            this.loadData();
            this.closeModal();
          },
          error: (err) => {
            console.error('Erreur lors de la mise à jour:', err);
          }
        });
    } else {
      this.abonnementService.createAbonnement(this.currentAbonnement as Abonnement)
        .subscribe({
          next: () => {
            this.loadData();
            this.closeModal();
          },
          error: (err) => {
            console.error('Erreur lors de la création:', err);
          }
        });
    }
  }

  viewAbonnement(abonnement: EnrichedAbonnement): void {
    this.viewedAbonnement = abonnement;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewedAbonnement = null;
  }

  confirmDeleteAbonnement(abonnement: EnrichedAbonnement): void {
    this.abonnementToDelete = abonnement;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.abonnementToDelete = null;
  }

  deleteAbonnement(): void {
    if (!this.abonnementToDelete?.codeabo) return;

    this.abonnementService.delete(this.abonnementToDelete.codeabo)
      .subscribe({
        next: () => {
          this.loadData();
          this.cancelDelete();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
        }
      });
  }

  getMiPayeClass(mtpaye: any): string {
    if (!mtpaye) return '';

    const mode = typeof mtpaye === 'string' ? mtpaye.toLowerCase() : String(mtpaye).toLowerCase();
    
    switch (mode) {
      case 'espèces':
      case 'especes':
        return 'miPaye-especes';
      case 'carte':
        return 'miPaye-carte';
      case 'chèque':
      case 'cheque':
        return 'miPaye-cheque';
      default:
        return '';
    }
  }
}