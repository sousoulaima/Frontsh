import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { ModaliteRegService, ModaliteReg } from '../../../services/modalite-reg.service';

@Component({
  selector: 'app-module-reglement',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './module-reglement.component.html',
  styleUrls: ['./module-reglement.component.scss'],
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' })),
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
export class ModuleReglementComponent implements OnInit {
  modaliteRegs: ModaliteReg[] = [];
  filteredModalites: ModaliteReg[] = [];
  searchQuery = '';
  showModal = false;
  showViewModal = false;
  showDeleteConfirm = false;
  isEditing = false;
  currentModalite: Partial<ModaliteReg> = { designationmod: '' };
  viewedModalite: ModaliteReg | null = null;
  modaliteToDelete: ModaliteReg | null = null;
  successMessage: string | null = null;

  constructor(private modaliteService: ModaliteRegService) {}

  ngOnInit(): void {
    this.loadModalites();
  }

  loadModalites(): void {
    this.modaliteService.getAll().subscribe({
      next: (data) => {
        console.log('Raw data from service:', data);

        if (!Array.isArray(data)) {
          console.error('Expected an array from ModaliteRegService, received:', data);
          this.modaliteRegs = [];
          this.filteredModalites = [];
          return;
        }

        this.modaliteRegs = data.map((item: any) => ({
          codeMod: item.codeMod || item.code_mod || '',
          designationmod: item.designationmod || item.designationMod || '',
        }));

        console.log('Mapped modaliteRegs:', this.modaliteRegs);
        this.filteredModalites = [...this.modaliteRegs];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des modalités:', err);
        this.modaliteRegs = [];
        this.filteredModalites = [];
      },
    });
  }

  filterModalites(): void {
    const query = this.searchQuery.toLowerCase().trim();
    console.log('Filtering with query:', query);

    this.filteredModalites = query
      ? this.modaliteRegs.filter((m) => {
          const codeMod = m.codeMod ? String(m.codeMod).toLowerCase() : '';
          const designationmod = m.designationmod ? m.designationmod.toLowerCase() : '';

          const matchesCode = codeMod.includes(query);
          const matchesDesignation = designationmod.includes(query);

          console.log(`Item: ${JSON.stringify(m)}, Matches: Code=${matchesCode}, Designation=${matchesDesignation}`);

          return matchesCode || matchesDesignation;
        })
      : [...this.modaliteRegs];

    console.log('Filtered modalites:', this.filteredModalites);
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentModalite = { designationmod: '' };
    this.showModal = true;
  }

  openEditModal(modalite: ModaliteReg): void {
    this.isEditing = true;
    this.currentModalite = { ...modalite };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentModalite = { designationmod: '' };
  }

  saveModalite(): void {
    if (!this.currentModalite.designationmod) {
      console.error('Designationmod is required');
      return;
    }

    if (this.isEditing && this.currentModalite.codeMod) {
      const payload: ModaliteReg = {
        codeMod: this.currentModalite.codeMod,
        designationmod: this.currentModalite.designationmod,
      };

      this.modaliteService.update(this.currentModalite.codeMod, payload).subscribe({
        next: () => {
          this.loadModalites();
          this.closeModal();
          this.showSuccessMessage('Modalité de Règlement modifiée avec succès');
        },
        error: (err) => console.error('Erreur lors de la mise à jour:', err),
      });
    } else {
      const payload: Omit<ModaliteReg, 'codeMod'> = {
        designationmod: this.currentModalite.designationmod,
      };

      this.modaliteService.create(payload as ModaliteReg).subscribe({
        next: () => {
          this.loadModalites();
          this.closeModal();
          this.showSuccessMessage('Modalité de Règlement ajoutée avec succès');
        },
        error: (err) => console.error('Erreur lors de la création:', err),
      });
    }
  }

  viewModalite(modalite: ModaliteReg): void {
    this.viewedModalite = modalite;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewedModalite = null;
  }

  confirmDeleteModalite(modalite: ModaliteReg): void {
    this.modaliteToDelete = modalite;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.modaliteToDelete = null;
  }

  deleteModalite(): void {
    if (!this.modaliteToDelete?.codeMod) return;

    this.modaliteService.delete(this.modaliteToDelete.codeMod).subscribe({
      next: () => {
        this.loadModalites();
        this.cancelDelete();
        this.showSuccessMessage('Modalité de Règlement supprimée avec succès');
      },
      error: (err) => console.error('Erreur lors de la suppression:', err),
    });
  }

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }
}