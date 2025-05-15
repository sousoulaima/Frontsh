import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Formateur, FormateurService } from '../../../services/formateur.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-formateur',
  standalone: true,
  templateUrl: './formateur.component.html',
  styleUrls: ['./formateur.component.scss'],
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
export class FormateurComponent implements OnInit {
  searchQuery = '';
  showFilter = false;
  showModal = false;
  showViewModal = false;
  showDeleteConfirm = false;
  isEditing = false;
  formateurToDelete: Formateur | null = null;
  viewedFormateur: Formateur | null = null;

  formateurs: Formateur[] = [];
  filteredFormateurs: Formateur[] = [];
  currentFormateur: Partial<Formateur> = this.resetFormateur();

  constructor(private formateurService: FormateurService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadFormateurs();
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
        this.formateurs = formateurs;
        this.filteredFormateurs = [...formateurs];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading formateurs:', err),
    });
  }

  filterFormateurs(): void {
    this.filteredFormateurs = this.formateurs.filter((formateur) => {
      const query = this.searchQuery.toLowerCase();
      return (
        (formateur.codefor?.toString().toLowerCase() || '').includes(query) ||
        (formateur.nomfor?.toLowerCase() || '').includes(query) ||
        (formateur.prenomfor?.toLowerCase() || '').includes(query) ||
        (formateur.emailfor?.toLowerCase() || '').includes(query) ||
        (formateur.telfor || '').includes(query) ||
        (formateur.adrfor?.toLowerCase() || '').includes(query)
      );
    });
    this.cdr.detectChanges();
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
    this.cdr.detectChanges();
  }

  openAddFormateurModal(): void {
    this.isEditing = false;
    this.currentFormateur = this.resetFormateur();
    this.currentFormateur.codefor = `FOR-${(this.formateurs.length + 1).toString().padStart(3, '0')}`;
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openEditFormateurModal(formateur: Formateur): void {
    this.isEditing = true;
    this.currentFormateur = { ...formateur };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.currentFormateur = this.resetFormateur();
    this.cdr.detectChanges();
  }

  saveFormateur(): void {
    // Validate that nomfor and prenomfor do not contain digits
    const hasDigitsInNom = /\d/.test(this.currentFormateur.nomfor || '');
    const hasDigitsInPrenom = /\d/.test(this.currentFormateur.prenomfor || '');

    if (hasDigitsInNom) {
      alert('Le nom ne doit pas contenir de chiffres.');
      return;
    }

    if (hasDigitsInPrenom) {
      alert('Le prénom ne doit pas contenir de chiffres.');
      return;
    }

    // Validate email and phone number uniqueness
    const emailExists = this.formateurs.some(
      (f) =>
        f.emailfor === this.currentFormateur.emailfor &&
        (!this.isEditing || f.codefor !== this.currentFormateur.codefor)
    );
    const phoneExists = this.formateurs.some(
      (f) =>
        f.telfor === this.currentFormateur.telfor &&
        (!this.isEditing || f.codefor !== this.currentFormateur.codefor)
    );

    if (emailExists) {
      alert('Cet email est déjà utilisé par un autre formateur.');
      return;
    }

    if (phoneExists) {
      alert('Ce numéro de téléphone est déjà utilisé par un autre formateur.');
      return;
    }

    if (this.isEditing) {
      if (this.currentFormateur.codefor) {
        this.formateurService.update(this.currentFormateur.codefor, this.currentFormateur as Formateur).subscribe({
          next: () => {
            this.loadFormateurs();
            this.closeModal();
          },
          error: (err) => {
            console.error('Error updating formateur:', err);
            alert('Erreur lors de la mise à jour du formateur.');
          },
        });
      }
    } else {
      this.formateurService.create(this.currentFormateur as Formateur).subscribe({
        next: () => {
          this.loadFormateurs();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating formateur:', err);
          alert('Erreur lors de la création du formateur.');
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
      this.formateurService.delete(this.formateurToDelete.codefor).subscribe({
        next: () => {
          this.loadFormateurs();
          this.cancelDelete();
        },
        error: (err) => {
          console.error('Error deleting formateur:', err);
          alert('Erreur lors de la suppression du formateur.');
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