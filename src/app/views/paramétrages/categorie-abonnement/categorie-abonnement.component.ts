import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { CategorieAbonnementService } from '../../../services/categorie-abonnement.service';

interface TypeAbonnementDisplay {
  code: string;
  designation: string;
  nbMois: number;
  nbJours: number;
  forfait: number;
  accesLibre: boolean;
  nbSeanceSemaine: number;
}

interface CategorieDisplay {
  codecateg: string;
  designationcateg: string;
  nomcateg: string;
  abonnements: TypeAbonnementDisplay[];
}

@Component({
  selector: 'app-categorie-abonnement',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './categorie-abonnement.component.html',
  styleUrls: ['./categorie-abonnement.component.scss'],
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
    trigger('successAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' })),
      ]),
    ]),
  ],
})
export class CategorieAbonnementComponent implements OnInit {
  categories: CategorieDisplay[] = [];
  filteredCategories: CategorieDisplay[] = [];
  searchTerm = '';
  showModal = false;
  showViewModal = false;
  showDeleteConfirm = false;
  isEditMode = false;
  currentCategorie: Partial<CategorieDisplay> = {};
  viewedCategorie: CategorieDisplay | null = null;
  categorieToDelete: CategorieDisplay | null = null;
  successMessage: string | null = null;
  backendErrors: string[] = [];

  constructor(
    private categorieService: CategorieAbonnementService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categorieService.getAll().subscribe({
      next: (data) => {
        if (!Array.isArray(data)) {
          console.error('Expected an array from CategorieAbonnementService, received:', data);
          this.categories = [];
          this.filteredCategories = [];
          this.backendErrors.push('Données invalides reçues du service');
          this.cdr.detectChanges();
          return;
        }

        this.categories = data
          .filter((item) => item.codecateg)
          .map((item) => {
            const mappedItem: CategorieDisplay = {
              codecateg: String(item.codecateg || ''),
              designationcateg: item.designationcateg || '',
              nomcateg: item.nomcateg || item.designationcateg || '',
              abonnements: Array.isArray(item.abonnements)
                ? item.abonnements.map((abo: any) => ({
                    code: String(abo.code || abo.codeAbonnement || abo.code_abonnement || ''),
                    designation: abo.designation || abo.designationAbonnement || abo.designation_abonnement || '',
                    nbMois: abo.nbMois || abo.nb_mois || 0,
                    nbJours: abo.nbJours || abo.nb_jours || 0,
                    forfait: abo.forfait || 0,
                    accesLibre: abo.accesLibre || abo.acces_libre || false,
                    nbSeanceSemaine: abo.nbSeanceSemaine || abo.nb_seance_semaine || 0,
                  }))
                : [],
            };
            return mappedItem;
          });

        this.filteredCategories = [...this.categories];
        console.log('Loaded categories:', this.categories);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.backendErrors.push('Erreur lors du chargement des catégories: ' + (err.message || JSON.stringify(err)));
        this.categories = [];
        this.filteredCategories = [];
        this.cdr.detectChanges();
      },
    });
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filterCategories(target.value);
  }

  filterCategories(searchValue: string): void {
    this.searchTerm = searchValue;
    const query = this.searchTerm.toLowerCase().trim();

    console.log('Filtering with query:', query);

    this.filteredCategories = query
      ? this.categories.filter((categorie) => {
          const matchesCodecateg = categorie.codecateg.toLowerCase().includes(query);
          const matchesDesignationcateg = categorie.designationcateg.toLowerCase().includes(query);
          const matchesNomcateg = categorie.nomcateg.toLowerCase().includes(query);
          const matchesAbonnements = categorie.abonnements.some((type) => {
            const designation = type.designation.toLowerCase();
            const code = type.code.toLowerCase();
            return designation.includes(query) || code.includes(query);
          });

          const matches = matchesCodecateg || matchesDesignationcateg || matchesNomcateg || matchesAbonnements;
          console.log(`Categorie ${categorie.codecateg}:`, { matchesCodecateg, matchesDesignationcateg, matchesNomcateg, matchesAbonnements, matches });
          return matches;
        })
      : [...this.categories];

    console.log('Filtered categories:', this.filteredCategories);
    this.cdr.detectChanges();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterCategories('');
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentCategorie = { designationcateg: '', abonnements: [] };
    this.showModal = true;
  }

  openEditModal(categorie: CategorieDisplay): void {
    this.isEditMode = true;
    this.currentCategorie = { ...categorie, abonnements: categorie.abonnements || [] };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentCategorie = { designationcateg: '', abonnements: [] };
  }

  saveCategorie(): void {
    if (!this.currentCategorie.designationcateg) {
      console.error('Designationcateg is required');
      return;
    }

    const categorieData: Omit<CategorieDisplay, 'codecateg'> & { codecateg?: string } = {
      codecateg: this.currentCategorie.codecateg,
      designationcateg: this.currentCategorie.designationcateg,
      nomcateg: this.currentCategorie.designationcateg,
      abonnements: this.currentCategorie.abonnements || [],
    };

    if (this.isEditMode && this.currentCategorie.codecateg) {
      this.categorieService
        .update(this.currentCategorie.codecateg, categorieData as CategorieDisplay)
        .subscribe({
          next: () => {
            this.loadCategories();
            this.closeModal();
            this.showSuccessMessage('Catégorie d\'Abonnement modifiée avec succès');
          },
          error: (err) => {
            console.error('Erreur lors de la mise à jour:', err);
          },
        });
    } else {
      this.categorieService.create(categorieData as CategorieDisplay).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
          this.showSuccessMessage('Catégorie d\'Abonnement ajoutée avec succès');
        },
        error: (err) => {
          console.error('Erreur lors de la création:', err);
        },
      });
    }
  }

  viewCategorie(categorie: CategorieDisplay): void {
    this.viewedCategorie = { ...categorie, abonnements: categorie.abonnements || [] };
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewedCategorie = null;
  }

  confirmDeleteCategorie(categorie: CategorieDisplay): void {
    this.categorieToDelete = categorie;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.categorieToDelete = null;
  }

  deleteCategorie(): void {
    if (!this.categorieToDelete?.codecateg) return;

    this.categorieService.delete(this.categorieToDelete.codecateg).subscribe({
      next: () => {
        this.loadCategories();
        this.cancelDelete();
        this.showSuccessMessage('Catégorie d\'Abonnement supprimée avec succès');
      },
      error: (err) => {
        console.error('Erreur lors de la suppression:', err);
      },
    });
  }

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }
}