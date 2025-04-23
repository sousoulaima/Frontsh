import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { CategorieAbonnementService } from '../../../services/categorie-abonnement.service';

interface CategorieDisplay {
  codecateg: string;
  designationcateg: string;
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

  constructor(private categorieService: CategorieAbonnementService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categorieService.getAll().subscribe({
      next: (data) => {
        // Transformation des données pour ne garder que codecateg et designationcateg
        this.categories = data
          .filter(item => item.codecateg) // Ensure codecateg is not undefined
          .map(item => {
            console.log('Catégories chargées:', item);
            return {
              codecateg: item.codecateg as string, // Explicitly cast to string
              designationcateg: item.designationcateg || '' // Assign a default empty string if undefined
            };
          });
        this.filteredCategories = [...this.categories];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des catégories:', err);
      }
    });
  }

  filterCategories(): void {
    const query = this.searchTerm.toLowerCase().trim();
    this.filteredCategories = this.categories.filter((categorie) => {
      return (
        (categorie.codecateg?.toLowerCase().includes(query)) ||
        (categorie.designationcateg.toLowerCase().includes(query))
      );
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentCategorie = {};
    this.showModal = true;
  }

  openEditModal(categorie: CategorieDisplay): void {
    this.isEditMode = true;
    this.currentCategorie = { ...categorie };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentCategorie = {};
  }

  saveCategorie(): void {
    if (!this.currentCategorie.designationcateg) return;

    const categorieData = {
      codecateg: this.currentCategorie.codecateg,
      designationcateg: this.currentCategorie.designationcateg,
      nomcateg: this.currentCategorie.designationcateg // Si nécessaire pour le backend
    };

    if (this.isEditMode && this.currentCategorie.codecateg) {
      this.categorieService.update(this.currentCategorie.codecateg, categorieData)
        .subscribe({
          next: () => {
            this.loadCategories();
            this.closeModal();
          },
          error: (err) => {
            console.error('Erreur lors de la mise à jour:', err);
          }
        });
    } else {
      this.categorieService.create(categorieData)
        .subscribe({
          next: () => {
            this.loadCategories();
            this.closeModal();
          },
          error: (err) => {
            console.error('Erreur lors de la création:', err);
          }
        });
    }
  }

  viewCategorie(categorie: CategorieDisplay): void {
    this.viewedCategorie = categorie;
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
    if (this.categorieToDelete?.codecateg) {
      this.categorieService.delete(this.categorieToDelete.codecateg)
        .subscribe({
          next: () => {
            this.loadCategories();
            this.cancelDelete();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression:', err);
          }
        });
    }
  }
}