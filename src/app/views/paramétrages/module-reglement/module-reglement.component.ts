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

  constructor(private modaliteService: ModaliteRegService) {}

  ngOnInit(): void {
    this.loadModalites();
  }

  loadModalites(): void {
    this.modaliteService.getAll().subscribe({
      next: (data) => {
        // Si `data` est un tableau d'objets
        this.modaliteRegs = data.map((item: any) => ({
          ...item,
          designationmod: item.designationMod
        }));
      
        console.log('Modalités chargées:', this.modaliteRegs);
        this.filteredModalites = [...this.modaliteRegs];
      },
      error: (err) => {
        console.error('Erreur lors du chargement des modalités:', err);
      }
    });
  }

  filterModalites(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredModalites = query
      ? this.modaliteRegs.filter(m =>
          m.designationmod.toLowerCase().includes(query) ||
          (m.codeMod && m.codeMod.toLowerCase().includes(query)))
      : [...this.modaliteRegs];
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
    const payload: any = {
      designationmod: this.currentModalite.designationmod
    };

    if (this.isEditing && this.currentModalite.codeMod) {
      this.modaliteService.update(this.currentModalite.codeMod, payload).subscribe({
        next: () => {
          this.loadModalites();
          this.closeModal();
        },
        error: (err) => console.error('Erreur lors de la mise à jour:', err)
      });
    } else {
      this.modaliteService.create(payload).subscribe({
        next: () => {
          this.loadModalites();
          this.closeModal();
        },
        error: (err) => console.error('Erreur lors de la création:', err)
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
      },
      error: (err) => console.error('Erreur lors de la suppression:', err)
    });
  }
}
