import { Component, ChangeDetectorRef, OnInit, NgZone, ViewChild } from '@angular/core';
import { Formateur, FormateurService } from '../../../services/formateur.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
  standalone: true
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-container')) {
      this.clickOutside.emit();
    }
  }
}

@Component({
  selector: 'app-formateur',
  standalone: true,
  templateUrl: './formateur.component.html',
  styleUrls: ['./formateur.component.scss'],
  imports: [CommonModule, FormsModule, ClickOutsideDirective],
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
export class FormateurComponent implements OnInit {
  searchQuery = '';
  filterNom = '';
  showFilter = false;
  showModal = false;
  showViewModal = false;
  showDeleteConfirm = false;
  successMessage: string | null = null;
  showSuccess = false;
  isEditing = false;
  isSaving = false;
  formErrors: string[] = [];
  backendErrors: string[] = [];
  formateurToDelete: Formateur | null = null;
  viewedFormateur: Formateur | null = null;

  formateurs: Formateur[] = [];
  filteredFormateurs: Formateur[] = [];
  currentFormateur: Partial<Formateur> = this.resetFormateur();

  @ViewChild('formateurForm') formateurForm!: NgForm;

  constructor(
    private formateurService: FormateurService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadFormateurs();
  }

  private displaySuccessMessage(message: string): void {
    this.ngZone.run(() => {
      this.successMessage = message;
      this.showSuccess = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.showSuccess = false;
        this.successMessage = null;
        this.cdr.detectChanges();
      }, 3000);
    });
  }

  resetFormateur(): Partial<Formateur> {
    return {
      codefor: '',
      nomfor: '',
      prenomfor: '',
      telfor: '',
      emailfor: '',
      adrfor: '',
    };
  }

  loadFormateurs(): void {
    this.formateurService.getAll().subscribe({
      next: (formateurs) => {
        this.formateurs = formateurs.map(f => ({
          ...f,
          codefor: String(f.codefor || '')
        }));
        this.filteredFormateurs = [...this.formateurs];
        this.filterFormateurs();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading formateurs:', err);
        this.backendErrors.push('Erreur lors du chargement des formateurs: ' + (err.message || JSON.stringify(err)));
        this.cdr.detectChanges();
      },
    });
  }

  filterFormateurs(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredFormateurs = this.formateurs.filter((formateur) => {
      const matchesSearch =
        !query ||
        (formateur.codefor?.toString().toLowerCase().includes(query) || false) ||
        (formateur.nomfor?.toLowerCase().includes(query) || false) ||
        (formateur.prenomfor?.toLowerCase().includes(query) || false) ||
        (formateur.emailfor?.toString().toLowerCase().includes(query) || false) ||
        (formateur.telfor?.toString().toLowerCase().includes(query) || false) ||
        (formateur.adrfor?.toString().toLowerCase().includes(query) || false);

      const matchesNom =
        !this.filterNom ||
        (formateur.nomfor?.toLowerCase().includes(this.filterNom.toLowerCase()) || false);

      return matchesSearch && matchesNom;
    });
    this.cdr.detectChanges();
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
    this.cdr.detectChanges();
  }

  closeFilter(): void {
    this.showFilter = false;
    this.cdr.detectChanges();
  }

  openAddFormateurModal(): void {
    this.isEditing = false;
    this.currentFormateur = this.resetFormateur();
    this.currentFormateur.codefor = `FOR-${(this.formateurs.length + 1).toString().padStart(3, '0')}`;
    this.formErrors = [];
    this.backendErrors = [];
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openEditFormateurModal(formateur: Formateur): void {
    this.isEditing = true;
    this.currentFormateur = { ...formateur, codefor: String(formateur.codefor || '') };
    this.formErrors = [];
    this.backendErrors = [];
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.isSaving = false;
    this.currentFormateur = this.resetFormateur();
    this.formErrors = [];
    this.backendErrors = [];
    this.cdr.detectChanges();
  }

  validateForm(): boolean {
    this.formErrors = [];

    const requiredFields = [
      { field: 'codefor', value: this.currentFormateur.codefor, message: 'Le code est requis' },
      { field: 'nomfor', value: this.currentFormateur.nomfor, message: 'Le nom est requis' },
      { field: 'prenomfor', value: this.currentFormateur.prenomfor, message: 'Le prénom est requis' },
      { field: 'emailfor', value: this.currentFormateur.emailfor, message: "L'email est requis" },
      { field: 'telfor', value: this.currentFormateur.telfor, message: 'Le téléphone est requis' },
      { field: 'adrfor', value: this.currentFormateur.adrfor, message: "L'adresse est requise" },
    ];

    requiredFields.forEach((field) => {
      const valueAsString = String(field.value || '').trim();
      if (!valueAsString) {
        this.formErrors.push(field.message);
      }
    });

    const hasDigitsInNom = /\d/.test(this.currentFormateur.nomfor || '');
    const hasDigitsInPrenom = /\d/.test(this.currentFormateur.prenomfor || '');

    if (hasDigitsInNom) {
      this.formErrors.push('Le nom ne doit pas contenir de chiffres');
    }

    if (hasDigitsInPrenom) {
      this.formErrors.push('Le prénom ne doit pas contenir de chiffres');
    }

    if (this.currentFormateur.emailfor) {
      const email = this.currentFormateur.emailfor.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        this.formErrors.push("L'email doit être une adresse email valide");
      } else {
        const isEmailTaken = this.formateurs.some(
          (f) =>
            f.emailfor === email &&
            (!this.isEditing || String(f.codefor) !== String(this.currentFormateur.codefor))
        );
        if (isEmailTaken) {
          this.formErrors.push('Cet email est déjà utilisé par un autre formateur');
        }
      }
    }

    if (this.currentFormateur.telfor) {
      const tel = this.currentFormateur.telfor.trim();
      if (!/^\d{8}$/.test(tel)) {
        this.formErrors.push('Le numéro de téléphone doit contenir exactement 8 chiffres');
      } else {
        const isTelTaken = this.formateurs.some(
          (f) =>
            f.telfor === tel &&
            (!this.isEditing || String(f.codefor) !== String(this.currentFormateur.codefor))
        );
        if (isTelTaken) {
          this.formErrors.push('Ce numéro de téléphone est déjà utilisé par un autre formateur');
        }
      }
    }

    return this.formErrors.length === 0;
  }

  saveFormateur(): void {
    this.backendErrors = [];

    if (!this.formateurForm.valid || !this.validateForm()) {
      this.backendErrors.push('Veuillez corriger les erreurs dans le formulaire');
      this.cdr.detectChanges();
      return;
    }

    this.isSaving = true;
    const formateurData: Formateur = {
      codefor: this.currentFormateur.codefor!,
      nomfor: this.currentFormateur.nomfor!.trim(),
      prenomfor: this.currentFormateur.prenomfor!.trim(),
      emailfor: this.currentFormateur.emailfor!.trim(),
      telfor: this.currentFormateur.telfor!.trim(),
      adrfor: this.currentFormateur.adrfor!.trim(),
    };

    if (this.isEditing) {
      if (this.currentFormateur.codefor) {
        this.formateurService.update(this.currentFormateur.codefor, formateurData).subscribe({
          next: () => {
            this.loadFormateurs();
            this.closeModal();
            this.isSaving = false;
            this.displaySuccessMessage('Formateur modifié avec succès');
          },
          error: (err) => {
            const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
            this.backendErrors.push('Erreur lors de la modification: ' + errorMessage);
            this.isSaving = false;
            this.cdr.detectChanges();
          },
        });
      }
    } else {
      this.formateurService.create(formateurData).subscribe({
        next: () => {
          this.loadFormateurs();
          this.closeModal();
          this.isSaving = false;
          this.displaySuccessMessage('Formateur ajouté avec succès');
        },
        error: (err) => {
          const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
          this.backendErrors.push('Erreur lors de la création: ' + errorMessage);
          this.isSaving = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  viewFormateur(formateur: Formateur): void {
    this.viewedFormateur = formateur;
    this.showViewModal = true;
    this.cdr.detectChanges();
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewedFormateur = null;
    this.cdr.detectChanges();
  }

  confirmDeleteFormateur(formateur: Formateur): void {
    this.formateurToDelete = formateur;
    this.showDeleteConfirm = true;
    this.cdr.detectChanges();
  }

  deleteFormateur(): void {
    if (this.formateurToDelete && this.formateurToDelete.codefor) {
      const codefor = String(this.formateurToDelete.codefor);
      this.formateurService.delete(codefor).subscribe({
        next: () => {
          this.loadFormateurs();
          this.cancelDelete();
          this.displaySuccessMessage('Formateur supprimé avec succès');
        },
        error: (err) => {
          const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
          this.backendErrors.push('Erreur lors de la suppression: ' + errorMessage);
          this.cdr.detectChanges();
        },
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.formateurToDelete = null;
    this.cdr.detectChanges();
  }
}