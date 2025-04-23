import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { TypeAbonnementService } from '../../../services/type-abonnement.service';

interface TypeAbonnementDisplay {
  code: string;
  designation: string;
  nbMois: number;
  nbJours: number;
  accesLibre: boolean;
  forfait: number;
  nbSeanceSemaine: number;
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
  currentSubscription: TypeAbonnementDisplay = {
    code: '',
    designation: '',
    nbMois: 0,
    nbJours: 0,
    accesLibre: true,
    forfait: 0,
    nbSeanceSemaine: 0
  };
  viewedSubscription: TypeAbonnementDisplay | null = null;
  subscriptionToDelete: TypeAbonnementDisplay | null = null;

  constructor(private typeAbonnementService: TypeAbonnementService) {}

  ngOnInit(): void {
    this.loadSubscriptions();
  }

  loadSubscriptions(): void {
    this.typeAbonnementService.getAll().subscribe({
      next: (data: any) => {
        this.subscriptions = data.map((item: any) => ({
          code: item.code.toString(),
          designation: item.designation,
          nbMois: Number(item.nbmois) || 0,
          nbJours: Number(item.nbjours) || 0,
          accesLibre: Boolean(item.acceslibre),
          forfait: Number(item.forfait) || 0,
          nbSeanceSemaine: Number(item.nbseancesemaine) || 0
        }));
        this.filteredSubscriptions = [...this.subscriptions];
      },
      error: (err) => {
        console.error('Erreur lors du chargement:', err);
      }
    });
  }

  filterSubscriptions(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredSubscriptions = this.subscriptions.filter((subscription) => {
      const matchesSearch =
        subscription.code.toLowerCase().includes(query) ||
        subscription.designation.toLowerCase().includes(query);
      const matchesDuration = this.filterDuration ? 
        subscription.nbMois.toString() === this.filterDuration : true;
      return matchesSearch && matchesDuration;
    });
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  openAddSubscriptionModal(): void {
    this.isEditing = false;
    this.currentSubscription = {
      code: '',
      designation: '',
      nbMois: 0,
      nbJours: 0,
      accesLibre: true,
      forfait: 0,
      nbSeanceSemaine: 0
    };
    this.showModal = true;
  }

  openEditSubscriptionModal(subscription: TypeAbonnementDisplay): void {
    this.isEditing = true;
    this.currentSubscription = { ...subscription };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentSubscription = {
      code: '',
      designation: '',
      nbMois: 0,
      nbJours: 0,
      accesLibre: true,
      forfait: 0,
      nbSeanceSemaine: 0
    };
  }
// Méthode utilitaire pour conversion robuste en boolean
private ensureBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return Boolean(value);
}
  saveSubscription(): void {
    if (!this.currentSubscription.designation) return;

  // Conversion STRICTE et FIABLE en boolean
  const accesLibreValue = this.ensureBoolean(this.currentSubscription.accesLibre);

  const subscriptionData = {
    designation: this.currentSubscription.designation,
    nbmois: this.currentSubscription.nbMois || 0,
    nbjours: this.currentSubscription.nbJours || 0,
    acceslibre: accesLibreValue, // Boolean garanti
    forfait: (this.currentSubscription.forfait || 0).toFixed(2),
    nbseancesemaine: this.currentSubscription.nbSeanceSemaine || 0
  };

    
    console.log('Subscription Data:', subscriptionData);
    if (this.isEditing && this.currentSubscription.code) {
      this.typeAbonnementService.update(Number(this.currentSubscription.code), subscriptionData)
        .subscribe({
          next: () => {
            this.loadSubscriptions();
            this.closeModal();
          },
          error: (err) => {
            console.error('Erreur lors de la mise à jour:', err);
            if (err.error?.errors?.acceslibre) {
              alert(err.error.errors.acceslibre[0]);
            }
          }
        });
    } else {
      this.typeAbonnementService.create(subscriptionData)
        .subscribe({
          next: () => {
            this.loadSubscriptions();
            this.closeModal();
          },
          error: (err) => {
            console.error('Erreur lors de la création:', err);
            if (err.error?.errors?.acceslibre) {
              alert(err.error.errors.acceslibre[0]);
            }
          }
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
      this.typeAbonnementService.delete(Number(this.subscriptionToDelete.code))
        .subscribe({
          next: () => {
            this.loadSubscriptions();
            this.cancelDelete();
          },
          error: (err) => {
            console.error('Erreur lors de la suppression:', err);
          }
        });
    }
  }
}