import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { TypeAbonnementService } from '../../../services/type-abonnement.service';
import { CategorieAbonnementService } from '../../../services/categorie-abonnement.service';

interface TypeAbonnementDisplay {
  code: string;
  designation: string;
  nbMois: number;
  nbJours: number;
  accesLibre: boolean;
  forfait: number;
  nbSeanceSemaine: number;
  idCategorie: string;
  categorieName?: string;
}

interface CategorieDisplay {
  codecateg: string;
  designationcateg: string;
  nomcateg: string;
  abonnements?: TypeAbonnementDisplay[];
}

@Component({
  selector: 'app-types-abonnement',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './types-abonnement.component.html',
  styleUrls: ['./types-abonnement.component.scss'],
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
export class TypesAbonnementComponent implements OnInit {
  subscriptions: TypeAbonnementDisplay[] = [];
  filteredSubscriptions: TypeAbonnementDisplay[] = [];
  searchQuery = '';
  filterDuration = '';
  showFilter = false;
  showModal = false;
  showViewModal = false;
  showDeleteConfirm = false;
  isEditing = false;
  categories: CategorieDisplay[] = [];
  currentSubscription: TypeAbonnementDisplay = this.getDefaultSubscription();
  viewedSubscription: TypeAbonnementDisplay | null = null;
  subscriptionToDelete: TypeAbonnementDisplay | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage: string | null = null;

  constructor(
    private typeAbonnementService: TypeAbonnementService,
    private categorieService: CategorieAbonnementService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadSubscriptions();
  }

  // Retourne un objet d'abonnement par défaut
  private getDefaultSubscription(): TypeAbonnementDisplay {
    return {
      code: '',
      designation: '',
      nbMois: 0,
      nbJours: 0,
      accesLibre: true,
      forfait: 0,
      nbSeanceSemaine: 0,
      idCategorie: '',
    };
  }

  loadCategories(): void {
    this.categorieService.getAll().subscribe({
      next: (data) => {
        this.categories = data
          .filter((item) => item.codecateg != null)
          .map((item) => ({
            codecateg: item.codecateg!.toString(),
            designationcateg: item.designationcateg || '',
            nomcateg: item.nomcateg || item.designationcateg || '',
            abonnements: item.abonnements || [],
          }));
      },
      error: (err) => {
        console.error('Erreur lors du chargement des catégories:', err);
        this.errorMessage = 'Impossible de charger les catégories';
      },
    });
  }

  loadSubscriptions(): void {
    this.isLoading = true;
    this.typeAbonnementService.getAll().subscribe({
      next: (data: any) => {
        this.subscriptions = data.map((item: any) => ({
          code: item.code.toString(),
          designation: item.designation || '',
          nbMois: Number(item.nbmois) || 0,
          nbJours: Number(item.nbjours) || 0,
          accesLibre: Boolean(item.acceslibre),
          forfait: Number(item.forfait) || 0,
          nbSeanceSemaine: Number(item.nbseancesemaine) || 0,
          idCategorie: item.id_categorie?.toString() || '',
          categorieName: this.getCategorieName(item.id_categorie),
        }));
        this.filteredSubscriptions = [...this.subscriptions];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement:', err);
        this.errorMessage = 'Impossible de charger les abonnements';
        this.isLoading = false;
      },
    });
  }

  getCategorieName(idCategorie: string): string {
    console.log(typeof idCategorie); // should be 'string'
    console.log(typeof this.categories[0]?.codecateg); // should also be 'string'
    let designation = 'N/A';
    for (let i = 0; i < this.categories.length; i++) {
      if (this.categories[i].codecateg.toString() === idCategorie.toString()) {
        designation = this.categories[i].designationcateg;
      }
    }
    return designation;
  }

  filterSubscriptions(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredSubscriptions = this.subscriptions.filter((subscription) => {
      const matchesSearch =
        subscription.code.toLowerCase().includes(query) ||
        subscription.designation.toLowerCase().includes(query) ||
        subscription.categorieName?.toLowerCase().includes(query);
      const matchesDuration = this.filterDuration
        ? subscription.nbMois.toString() === this.filterDuration
        : true;
      return matchesSearch && matchesDuration;
    });
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
    if (!this.showFilter) {
      this.filterDuration = '';
      this.filterSubscriptions();
    }
  }

  openAddSubscriptionModal(): void {
    this.isEditing = false;
    this.currentSubscription = this.getDefaultSubscription();
    this.errorMessage = '';
    this.showModal = true;
  }

  openEditSubscriptionModal(subscription: TypeAbonnementDisplay): void {
    this.isEditing = true;
    this.currentSubscription = { ...subscription };
    this.errorMessage = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentSubscription = this.getDefaultSubscription();
    this.errorMessage = '';
  }

  validateForm(): boolean {
    this.errorMessage = '';

    if (!this.currentSubscription.designation.trim()) {
      this.errorMessage = 'La désignation est obligatoire';
      return false;
    }

    if (!this.currentSubscription.idCategorie) {
      this.errorMessage = 'La catégorie est obligatoire';
      return false;
    }

    if (this.currentSubscription.nbMois < 0 || isNaN(this.currentSubscription.nbMois)) {
      this.errorMessage = 'Le nombre de mois doit être un nombre positif ou zéro';
      return false;
    }

    if (this.currentSubscription.nbJours < 0 || isNaN(this.currentSubscription.nbJours)) {
      this.errorMessage = 'Le nombre de jours doit être un nombre positif ou zéro';
      return false;
    }

    if (this.currentSubscription.forfait < 0 || isNaN(this.currentSubscription.forfait)) {
      this.errorMessage = 'Le forfait doit être un nombre positif ou zéro';
      return false;
    }

    if (this.currentSubscription.nbSeanceSemaine < -1 || isNaN(this.currentSubscription.nbSeanceSemaine)) {
      this.errorMessage = 'Le nombre de séances doit être -1 (illimité) ou un nombre positif';
      return false;
    }

    return true;
  }

  saveSubscription(): void {
    if (!this.validateForm()) {
      return;
    }

    const subscriptionData = {
      designation: this.currentSubscription.designation.trim(),
      nbmois: Number(this.currentSubscription.nbMois) || 0,
      nbjours: Number(this.currentSubscription.nbJours) || 0,
      acceslibre: this.currentSubscription.accesLibre,
      forfait: Number(this.currentSubscription.forfait) || 0,
      nbseancesemaine: Number(this.currentSubscription.nbSeanceSemaine) || 0,
      id_categorie: this.currentSubscription.idCategorie,
    };

    this.isLoading = true;

    if (this.isEditing && this.currentSubscription.code) {
      this.typeAbonnementService.update(Number(this.currentSubscription.code), subscriptionData).subscribe({
        next: () => {
          this.loadSubscriptions();
          this.closeModal();
          this.isLoading = false;
          this.showSuccessMessage('Types d\'Abonnement modifié avec succès');
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour:', err);
          this.errorMessage = err.error?.message || 'Une erreur est survenue lors de la mise à jour';
          this.isLoading = false;
        },
      });
    } else {
      this.typeAbonnementService.create(subscriptionData).subscribe({
        next: () => {
          this.loadSubscriptions();
          this.closeModal();
          this.isLoading = false;
          this.showSuccessMessage('Types d\'Abonnement ajouté avec succès');
        },
        error: (err) => {
          console.error('Erreur lors de la création:', err);
          this.errorMessage = err.error?.message || 'Une erreur est survenue lors de la création';
          this.isLoading = false;
        },
      });
    }
  }

  viewSubscription(subscription: TypeAbonnementDisplay): void {
    this.viewedSubscription = { ...subscription };
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewedSubscription = null;
  }

  confirmDeleteSubscription(subscription: TypeAbonnementDisplay): void {
    this.subscriptionToDelete = { ...subscription };
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.subscriptionToDelete = null;
  }

  deleteSubscription(): void {
    if (this.subscriptionToDelete?.code) {
      this.isLoading = true;
      this.typeAbonnementService.delete(Number(this.subscriptionToDelete.code)).subscribe({
        next: () => {
          this.loadSubscriptions();
          this.cancelDelete();
          this.isLoading = false;
          this.showSuccessMessage('Types d\'Abonnement supprimé avec succès');
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          this.errorMessage = 'Une erreur est survenue lors de la suppression';
          this.isLoading = false;
        },
      });
    }
  }

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }
}