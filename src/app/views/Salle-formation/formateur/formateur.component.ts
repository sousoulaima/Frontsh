import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { Formateur, FormateurService } from '../../../services/formateur.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Assurez-vous d'importer correctement l'interface

@Component({
  selector: 'app-formateur',
  templateUrl: './formateur.component.html',
  styleUrls: ['./formateur.component.scss'],
  imports: [CommonModule, FormsModule], // Add these imports
  animations: [
    // (Les animations restent inchangées)
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
    this.loadFormateurs(); // Charger les formateurs au démarrage du composant
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
    this.formateurService.getAll().subscribe((formateurs) => {
      this.formateurs = formateurs;
      console.log('Formateurs:', this.formateurs); // Debugging line
      this.filteredFormateurs = [...this.formateurs];
      this.cdr.detectChanges();
    });
  }

  filterFormateurs(): void {
    this.filteredFormateurs = this.formateurs.filter((formateur) => {
      const query = this.searchQuery.toLowerCase();
      return (
        formateur.codefor?.toString().toLowerCase().includes(query) ||
        formateur.nomfor.toLowerCase().includes(query) ||
        formateur.prenomfor.toLowerCase().includes(query) ||
        formateur.emailfor?.toLowerCase().includes(query) ||
        formateur.telfor?.includes(query) ||
        formateur.adrfor?.toLowerCase().includes(query)
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
    const now = new Date().toISOString().replace('T', ' ').split('.')[0];
    if (this.isEditing) {
      if (this.currentFormateur.codefor) {
        this.formateurService.update(this.currentFormateur.codefor, this.currentFormateur as Formateur).subscribe(() => {
          this.loadFormateurs();
          this.closeModal();
        });
      }
    } else {
      const newFormateur = { ...this.currentFormateur, created_at: now, updated_at: now } as Formateur;
      this.formateurService.create(newFormateur).subscribe(() => {
        this.loadFormateurs();
        this.closeModal();
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
      this.formateurService.delete(this.formateurToDelete.codefor).subscribe(() => {
        this.loadFormateurs();
        this.cancelDelete();
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.formateurToDelete = null;
    this.cdr.detectChanges();
  }
}
