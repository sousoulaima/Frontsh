import { Component, OnInit, ChangeDetectorRef, NgZone, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
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
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' })),
      ]),
    ]),
    trigger('filterAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-12px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-12px)' })),
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
export class AdherentComponent implements OnInit {
  adherents: ExtendedAdherent[] = [];
  filteredAdherents: ExtendedAdherent[] = [];
  searchQuery = '';
  filterProfession = '';
  showFilter = false;
  showModal = false;
  showViewModal = false;
  showDeleteConfirm = false;
  isSaving = false;
  formErrors: string[] = [];
  backendErrors: string[] = [];
  successMessage: string | null = null;
  showSuccess = false;
  currentAdherent: ExtendedAdherent = this.resetAdherent();
  viewedAdherent: ExtendedAdherent | null = null;
  adherentToDelete: ExtendedAdherent | null = null;

  @ViewChild('adherentForm') adherentForm!: NgForm;

  constructor(
    private adherentService: AdherentService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadAdherents();
  }

  private resetAdherent(): ExtendedAdherent {
    return {
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
      societe_code: '',
      societe: null,
      abonnements: []
    };
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

  loadAdherents(): void {
    this.adherentService.getAll().subscribe({
      next: (data) => {
        this.adherents = (data as ExtendedAdherent[]).map(adherent => ({
          ...adherent,
          societe_code: adherent.societe_code || '',
          idpointage: adherent.idpointage || ''
        }));
        this.applyFilters();
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des adhérents:', err);
        this.backendErrors = ['Erreur lors du chargement des adhérents'];
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    if (!this.adherents || this.adherents.length === 0) {
      this.filteredAdherents = [];
      this.cdr.detectChanges();
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();
    const professionFilter = this.filterProfession.toLowerCase().trim();

    this.filteredAdherents = this.adherents.filter(adherent => {
      const matchesSearch = !query || Object.values(adherent).some(value =>
        value && value.toString().toLowerCase().includes(query)
      );
      const matchesProfession = !professionFilter || 
        (adherent.profession && adherent.profession.toLowerCase().includes(professionFilter));

      return matchesSearch && matchesProfession;
    });

    console.log('Search query:', this.searchQuery, 'Filtered results:', this.filteredAdherents);
    this.cdr.detectChanges();
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
    this.cdr.detectChanges();
  }

  openAddAdherentModal(): void {
    this.currentAdherent = this.resetAdherent();
    this.formErrors = [];
    this.backendErrors = [];
    this.showModal = true;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.isSaving = false;
    this.currentAdherent = this.resetAdherent();
    this.formErrors = [];
    this.backendErrors = [];
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  validateForm(): boolean {
    this.formErrors = [];

    const requiredFields = [
      { field: 'nom', value: this.currentAdherent.nom, message: 'Le nom est obligatoire' },
      { field: 'prenom', value: this.currentAdherent.prenom, message: 'Le prénom est obligatoire' },
      { field: 'email', value: this.currentAdherent.email, message: 'L\'email est obligatoire' },
      { field: 'tel1', value: this.currentAdherent.tel1, message: 'Le numéro de téléphone est obligatoire' },
      { field: 'cin', value: this.currentAdherent.cin, message: 'Le CIN est obligatoire' },
      { field: 'codetva', value: this.currentAdherent.codetva, message: 'Le Code TVA est obligatoire' },
      { field: 'idpointage', value: this.currentAdherent.idpointage, message: 'L\'ID Pointage est obligatoire' },
      { field: 'societe_code', value: this.currentAdherent.societe_code, message: 'Le Code Société est obligatoire' },
      { field: 'raisonsoc', value: this.currentAdherent.raisonsoc, message: 'La Raison Sociale est obligatoire' }
    ];

    requiredFields.forEach((field) => {
      const valueAsString = String(field.value || '').trim();
      if (!valueAsString) {
        this.formErrors.push(field.message);
      }
    });

    console.log('Form Validation - currentAdherent:', this.currentAdherent);
    console.log('Form Validation - Errors:', this.formErrors);

    if (this.currentAdherent.email) {
      const email = this.currentAdherent.email.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        this.formErrors.push('L\'email doit être une adresse email valide');
      } else {
        const isEmailTaken = this.adherents.some(adherent => adherent.email === email);
        if (isEmailTaken) {
          this.formErrors.push('Cet email est déjà utilisé par un autre adhérent');
        }
      }
    }

    if (this.currentAdherent.cin) {
      const cin = this.currentAdherent.cin.trim();
      if (!/^\d{8}$/.test(cin)) {
        this.formErrors.push('Le CIN doit contenir exactement 8 chiffres');
      } else {
        const isCinTaken = this.adherents.some(adherent => adherent.cin === cin);
        if (isCinTaken) {
          this.formErrors.push('Ce CIN est déjà utilisé par un autre adhérent');
        }
      }
    }

    if (this.currentAdherent.tel1) {
      const tel1 = this.currentAdherent.tel1.trim();
      if (!/^\d{8}$/.test(tel1)) {
        this.formErrors.push('Le numéro de téléphone doit contenir exactement 8 chiffres');
      } else {
        const isTel1Taken = this.adherents.some(adherent => adherent.tel1 === tel1);
        if (isTel1Taken) {
          this.formErrors.push('Ce numéro de téléphone est déjà utilisé par un autre adhérent');
        }
      }
    }

    return this.formErrors.length === 0;
  }

  saveAdherent(): void {
    this.backendErrors = [];

    if (!this.adherentForm.valid || !this.validateForm()) {
      this.backendErrors = ['Veuillez corriger les erreurs dans le formulaire'];
      console.log('Form invalid, errors:', this.backendErrors);
      return;
    }

    this.isSaving = true;
    const adherentData: Adherent = {
      nom: this.currentAdherent.nom!.trim(),
      prenom: this.currentAdherent.prenom!.trim(),
      email: this.currentAdherent.email!.trim(),
      adresse: this.currentAdherent.adresse?.trim() || undefined,
      tel1: this.currentAdherent.tel1?.trim() || undefined,
      tel2: this.currentAdherent.tel2?.trim() || undefined,
      profession: this.currentAdherent.profession?.trim() || undefined,
      cin: this.currentAdherent.cin?.trim() || undefined,
      datenaissance: this.currentAdherent.datenaissance || undefined,
      codetva: this.currentAdherent.codetva?.trim() || undefined,
      raisonsoc: this.currentAdherent.raisonsoc?.trim() || undefined,
      idpointage: this.currentAdherent.idpointage?.trim() || undefined,
      societe_code: this.currentAdherent.societe_code?.trim() || undefined
    };

    console.log('Saving adherent:', adherentData);

    this.adherentService.create(adherentData).subscribe({
      next: () => {
        this.displaySuccessMessage('Adhérent ajouté avec succès');
        this.loadAdherents();
        this.closeModal();
      },
      error: (err) => {
        let errorMessage = 'Erreur lors de l\'ajout de l\'adhérent';
        if (err.status === 422 && err.error?.errors) {
          this.backendErrors = Object.values(err.error.errors).flat() as string[];
          errorMessage = this.backendErrors.join(', ');
        } else if (err.error?.message) {
          errorMessage = err.error.message;
          this.backendErrors = [errorMessage];
        } else {
          errorMessage += ': Veuillez réessayer';
          this.backendErrors = [errorMessage];
        }
        console.error('Create error:', err);
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  viewAdherent(adherent: ExtendedAdherent): void {
    this.viewedAdherent = adherent;
    this.showViewModal = true;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewedAdherent = null;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  confirmDeleteAdherent(adherent: ExtendedAdherent): void {
    this.adherentToDelete = adherent;
    this.showDeleteConfirm = true;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.adherentToDelete = null;
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  deleteAdherent(): void {
    if (this.adherentToDelete?.code) {
      this.adherentService.delete(this.adherentToDelete.code).subscribe({
        next: () => {
          this.displaySuccessMessage('Adhérent supprimé avec succès');
          this.loadAdherents();
          this.cancelDelete();
        },
        error: (err) => {
          const errorMessage = 'Erreur lors de la suppression de l\'adhérent: ' + (err.error?.message || 'Veuillez réessayer');
          this.backendErrors = [errorMessage];
          console.error('Delete error:', err);
          this.cancelDelete();
          this.cdr.detectChanges();
        }
      });
    }
  }
}