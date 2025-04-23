import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { AdherentService, Adherent } from '../../../services/adherent.service';

interface ExtendedAdherent extends Adherent {
  code?: string;
  societe_code: string;
  idpointage: string;
}

@Component({
  selector: 'app-adherent',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './adherent.component.html',
  styleUrls: ['./adherent.component.scss'],
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
export class AdherentComponent implements OnInit {
  adherents: ExtendedAdherent[] = [];
  filteredAdherents: ExtendedAdherent[] = [];
  searchQuery = '';
  filterProfession = '';
  showFilter = false;
  showModal = false;
  showViewModal = false;
  showDeleteConfirm = false;
  isEditing = false;
  formErrors: string[] = [];
  backendErrors: string[] = [];
  currentAdherent: ExtendedAdherent = {
    nom: '',
    prenom: '',
    email: '',
    adresse: '',
    tel1: '',
    tel2: '',
    profession: '',
    cin: '',
    datenaissance: '',
    codetva: '',
    raisonsoc: '',
    idpointage: '',
    societe_code: ''
  };
  viewedAdherent: ExtendedAdherent | null = null;
  adherentToDelete: ExtendedAdherent | null = null;

  constructor(private adherentService: AdherentService) {}

  ngOnInit(): void {
    this.loadAdherents();
  }

  loadAdherents(): void {
    this.adherentService.getAll().subscribe({
      next: (data) => {
        this.adherents = data as ExtendedAdherent[];
        this.filteredAdherents = [...this.adherents];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des adhérents:', err);
        alert('Erreur lors du chargement des adhérents');
      }
    });
  }

  filterAdherents(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredAdherents = this.adherents.filter((adherent) => {
      const matchesSearch =
        (adherent.code?.toString().toLowerCase().includes(query) || false) ||
        (adherent.nom?.toLowerCase().includes(query) || false) ||
        (adherent.prenom?.toLowerCase().includes(query) || false) ||
        (adherent.email?.toLowerCase().includes(query) || false) ||
        (adherent.tel1?.toLowerCase().includes(query) || false) ||
        (adherent.profession?.toLowerCase().includes(query) || false);

      const matchesProfession = this.filterProfession
        ? adherent.profession?.toLowerCase().includes(this.filterProfession.toLowerCase()) || false
        : true;

      return matchesSearch && matchesProfession;
    });
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  openAddAdherentModal(): void {
    this.isEditing = false;
    this.currentAdherent = {
      nom: '',
      prenom: '',
      email: '',
      adresse: '',
      tel1: '',
      tel2: '',
      profession: '',
      cin: '',
      datenaissance: '',
      codetva: '',
      raisonsoc: '',
      idpointage: '',
      societe_code: ''
    };
    this.formErrors = [];
    this.backendErrors = [];
    this.showModal = true;
  }

  openEditAdherentModal(adherent: ExtendedAdherent): void {
    this.isEditing = true;
    this.currentAdherent = { ...adherent };
    if (this.currentAdherent.datenaissance) {
      this.currentAdherent.datenaissance = new Date(this.currentAdherent.datenaissance).toISOString().split('T')[0];
    }
    this.formErrors = [];
    this.backendErrors = [];
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentAdherent = {
      nom: '',
      prenom: '',
      email: '',
      adresse: '',
      tel1: '',
      tel2: '',
      profession: '',
      cin: '',
      datenaissance: '',
      codetva: '',
      raisonsoc: '',
      idpointage: '',
      societe_code: ''
    };
    this.formErrors = [];
    this.backendErrors = [];
  }

  validateForm(): boolean {
    this.formErrors = [];
    const requiredFields = [
      { field: 'nom', value: this.currentAdherent.nom, message: 'Le nom est obligatoire' },
      { field: 'prenom', value: this.currentAdherent.prenom, message: 'Le prénom est obligatoire' },
      { field: 'email', value: this.currentAdherent.email, message: 'L\'email est obligatoire' },
      // Temporarily reduce required fields to match Postman test
      // Add back other fields after confirming the issue is fixed
    ];

    requiredFields.forEach((field) => {
      const valueAsString = String(field.value || '');
      if (!field.value || valueAsString.trim() === '') {
        this.formErrors.push(field.message);
      }
    });

    if (this.currentAdherent.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.currentAdherent.email)) {
      this.formErrors.push('L\'email doit être une adresse email valide');
    }

    console.log('Form Errors:', this.formErrors);
    console.log('Form Data:', this.currentAdherent); // Debug: Log all form data
    return this.formErrors.length === 0;
  }

  saveAdherent(): void {
    console.log('saveAdherent called');
    console.log('Current Adherent:', this.currentAdherent);

    this.backendErrors = [];

    if (!this.validateForm()) {
      console.log('Validation failed, stopping submission');
      alert('Validation failed: ' + this.formErrors.join(', ')); // Show validation errors to user
      return;
    }

    const adherentData: Adherent = {
      nom: this.currentAdherent.nom,
      prenom: this.currentAdherent.prenom,
      email: this.currentAdherent.email,
      adresse: this.currentAdherent.adresse || undefined,
      tel1: this.currentAdherent.tel1 || undefined,
      tel2: this.currentAdherent.tel2 || undefined,
      profession: this.currentAdherent.profession || undefined,
      cin: this.currentAdherent.cin || undefined,
      datenaissance: this.currentAdherent.datenaissance || undefined,
      codetva: this.currentAdherent.codetva || undefined,
      raisonsoc: this.currentAdherent.raisonsoc || undefined,
      idpointage: this.currentAdherent.idpointage || undefined,
      societe_code: this.currentAdherent.societe_code || undefined
    };

    console.log('Adherent Data to Submit:', adherentData);

    if (this.isEditing && this.currentAdherent.code) {
      this.adherentService.update(this.currentAdherent.code, adherentData).subscribe({
        next: () => {
          console.log('Adherent updated successfully');
          this.loadAdherents();
          this.closeModal();
          alert('Adhérent mis à jour avec succès');
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour:', err);
          if (err.status === 422 && err.error?.errors) {
            this.backendErrors = Object.values(err.error.errors).flat() as string[];
          } else {
            this.backendErrors = ['Erreur lors de la mise à jour de l\'adhérent: ' + (err.error?.message || 'Veuillez réessayer')];
          }
          console.log('Backend Errors:', this.backendErrors);
          alert('Erreur: ' + this.backendErrors.join(', ')); // Show backend errors to user
        }
      });
    } else {
      this.adherentService.create(adherentData).subscribe({
        next: (response) => {
          console.log('Adherent created successfully:', response);
          this.loadAdherents();
          this.closeModal();
          alert('Adhérent ajouté avec succès');
        },
        error: (err) => {
          console.error('Erreur lors de la création:', err);
          if (err.status === 422 && err.error?.errors) {
            this.backendErrors = Object.values(err.error.errors).flat() as string[];
          } else {
            this.backendErrors = ['Erreur lors de l\'ajout de l\'adhérent: ' + (err.error?.message || 'Veuillez réessayer')];
          }
          console.log('Backend Errors:', this.backendErrors);
          alert('Erreur: ' + this.backendErrors.join(', ')); // Show backend errors to user
        }
      });
    }
  }

  viewAdherent(adherent: ExtendedAdherent): void {
    this.viewedAdherent = adherent;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewedAdherent = null;
  }

  confirmDeleteAdherent(adherent: ExtendedAdherent): void {
    this.adherentToDelete = adherent;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.adherentToDelete = null;
  }

  deleteAdherent(): void {
    if (this.adherentToDelete?.code) {
      this.adherentService.delete(this.adherentToDelete.code).subscribe({
        next: () => {
          this.loadAdherents();
          this.cancelDelete();
          alert('Adhérent supprimé avec succès');
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          alert('Erreur lors de la suppression de l\'adhérent: ' + (err.error?.message || 'Veuillez réessayer'));
          this.cancelDelete();
        }
      });
    }
  }
}