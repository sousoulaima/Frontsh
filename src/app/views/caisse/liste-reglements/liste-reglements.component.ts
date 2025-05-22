import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ReglementService, Reglement } from '../../../services/reglement.service';
import { ModaliteRegService, ModaliteReg } from '../../../services/modalite-reg.service';
import { AbonnementService, Abonnement } from '../../../services/abonnement.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-liste-reglements',
  templateUrl: './liste-reglements.component.html',
  styleUrls: ['./liste-reglements.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    // Modal animation (already present from previous request)
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' })),
      ]),
    ]),
    // Animation for success message
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
export class ListeReglementsComponent implements OnInit {
  searchQuery = '';
  showModal = false;
  showViewModal = false;
  showDeleteConfirm = false;
  isEditing = false;
  reglementToDelete: Reglement | null = null;
  viewedReglement: Reglement | null = null;
  successMessage: string | null = null;
  showSuccess = false;

  reglements: Reglement[] = [];
  filteredReglements: Reglement[] = [];
  modaliteRegs: ModaliteReg[] = [];
  filteredModalites: ModaliteReg[] = [];
  abonnements: Abonnement[] = [];
  currentReglement: Partial<Reglement> = this.resetReglement();
  verif_mod = false;

  constructor(
    private reglementService: ReglementService,
    private abonnementService: AbonnementService,
    private cdr: ChangeDetectorRef,
    private modaliteService: ModaliteRegService
  ) {}

  ngOnInit(): void {
    this.loadModalites().then(() => {
      this.loadAbonnements().then(() => {
        this.loadReglements();
      });
    });
  }

  // Method to display success message
  private displaySuccessMessage(message: string): void {
    this.successMessage = message;
    this.showSuccess = true;
    this.cdr.detectChanges();

    // Automatically hide the message after 3 seconds
    setTimeout(() => {
      this.showSuccess = false;
      this.successMessage = null;
      this.cdr.detectChanges();
    }, 3000);
  }

  loadModalites(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.modaliteService.getAll().subscribe({
        next: (data) => {
          this.modaliteRegs = data.map((item: any) => ({
            ...item,
            designationmod: item.designationMod
          }));
          this.filteredModalites = [...this.modaliteRegs];
          console.log('Modalités chargées:', this.modaliteRegs);
          resolve();
        },
        error: (err) => {
          console.error('Erreur lors du chargement des modalités:', err);
          reject(err);
        }
      });
    });
  }

  loadAbonnements(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.abonnementService.getAllAbonnements().subscribe({
        next: (abonnements: Abonnement[]) => {
          this.abonnements = abonnements;
          this.cdr.detectChanges();
          console.log('Abonnements chargés:', this.abonnements);
          resolve();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error loading abonnements:', err);
          reject(err);
        }
      });
    });
  }

  onModChange(): void {
    this.verif_mod = this.currentReglement.modalite_reg ? this.getModaliteName(this.currentReglement.modalite_reg) === 'chéque' : false;
  }

  resetReglement(): Partial<Reglement> {
    return {
      codereg: undefined,
      datereg: '',
      mtreg: '',
      numchq: '',
      numtraite: '',
      commentaire: '',
      modalite_reg: '',
      abonnement_codeabo: undefined
    };
  }

  formatDateForInput(isoDate: string): string {
    return isoDate ? isoDate.split('T')[0] : '';
  }

  formatDateForApi(date: string): string {
    return date ? `${date}T00:00:00.000Z` : '';
  }

  loadReglements(): void {
    this.reglementService.getAll().subscribe({
      next: (reglements: any[]) => {
        this.reglements = reglements.map(reg => ({
          codereg: reg.codereg,
          datereg: this.formatDateForInput(reg.datereg),
          mtreg: reg.mtreg,
          numchq: reg.numchq,
          numtraite: reg.numtraite,
          commentaire: reg.commentaire,
          modalite_reg: String(reg.modalite_reg || reg.modaliteReg || reg.modalite_reg_id || ''),
          abonnement_codeabo: reg.abonnement_codeabo || reg.abonnementCodeabo || reg.abonnement_id || undefined
        }));
        this.filteredReglements = [...this.reglements];
        console.log('Reglements chargés:', this.reglements);
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => console.error('Error loading reglements:', err)
    });
  }

  getModaliteName(codeMod: string | undefined): string {
    if (!codeMod) {
      console.log('Code Modalité non défini:', codeMod);
      return 'Non défini';
    }
    const mod = this.filteredModalites.find(m => String(m.codeMod) === codeMod || String(m.codeMod) === codeMod.toString());
    console.log('Filtered Modalites at search:', this.filteredModalites);
    console.log('Recherche Modalité:', codeMod, '->', mod ? mod.designationmod : 'Non trouvé');
    return mod ? mod.designationmod : 'Non défini';
  }

  filterReglements(): void {
    this.filteredReglements = this.reglements.filter((reglement) => {
      const query = this.searchQuery.toLowerCase();
      return (
        (reglement.codereg?.toString() || '').toLowerCase().includes(query) ||
        (reglement.datereg || '').toLowerCase().includes(query) ||
        (reglement.mtreg || '').toLowerCase().includes(query) ||
        (reglement.numchq || '').toLowerCase().includes(query) ||
        (reglement.numtraite || '').toLowerCase().includes(query) ||
        (reglement.commentaire || '').toLowerCase().includes(query) ||
        ((reglement.modalite_reg ? this.getModaliteName(reglement.modalite_reg) : '') || '').toLowerCase().includes(query) ||
        (this.getAbonnementName(reglement.abonnement_codeabo) || '').toLowerCase().includes(query)
      );
    });
    this.cdr.detectChanges();
  }

  getAbonnementName(codeabo: number | undefined): string {
    if (!codeabo && codeabo !== 0) {
      console.log('Code Abonnement non défini:', codeabo);
      return 'Non défini';
    }
    const abonnement = this.abonnements.find(a => a.codeabo === codeabo);
    console.log('Recherche Abonnement:', codeabo, '->', abonnement ? `Abonnement ${abonnement.codeabo}` : 'Non trouvé');
    return abonnement ? `Abonnement ${abonnement.codeabo}` : 'Non défini';
  }

  openAddReglementModal(): void {
    this.isEditing = false;
    this.currentReglement = this.resetReglement();
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openEditReglementModal(reglement: Reglement): void {
    this.isEditing = true;
    this.currentReglement = { ...reglement, datereg: this.formatDateForInput(reglement.datereg) };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.currentReglement = this.resetReglement();
    this.cdr.detectChanges();
  }

  saveReglement(): void {
    if (!this.currentReglement.modalite_reg || !this.currentReglement.abonnement_codeabo) {
      console.error('Modalité ou Abonnement manquant:', this.currentReglement);
      return;
    }

    const reglementToSave = {
      ...this.currentReglement,
      datereg: this.formatDateForApi(this.currentReglement.datereg || ''),
      modalite_reg: this.currentReglement.modalite_reg,
      abonnement_codeabo: Number(this.currentReglement.abonnement_codeabo)
    } as Reglement;

    console.log('Reglement to save:', reglementToSave);

    if (this.isEditing && reglementToSave.codereg) {
      this.reglementService.update(reglementToSave.codereg + "", reglementToSave).subscribe({
        next: () => {
          this.loadReglements();
          this.closeModal();
          this.displaySuccessMessage('Règlement modifié avec succès');
        },
        error: (err: HttpErrorResponse) => console.error('Error updating reglement:', err)
      });
    } else {
      this.reglementService.create(reglementToSave).subscribe({
        next: () => {
          this.loadReglements();
          this.closeModal();
          this.displaySuccessMessage('Règlement ajouté avec succès');
        },
        error: (err: HttpErrorResponse) => console.error('Error creating reglement:', err)
      });
    }
  }

  viewReglement(reglement: Reglement): void {
    this.viewedReglement = { ...reglement, datereg: this.formatDateForInput(reglement.datereg) };
    this.showViewModal = true;
    this.cdr.detectChanges();
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewedReglement = null;
    this.cdr.detectChanges();
  }

  confirmDeleteReglement(reglement: Reglement): void {
    this.reglementToDelete = reglement;
    this.showDeleteConfirm = true;
    this.cdr.detectChanges();
  }

  deleteReglement(): void {
    if (this.reglementToDelete?.codereg) {
      this.reglementService.delete(this.reglementToDelete.codereg + "").subscribe({
        next: () => {
          this.loadReglements();
          this.cancelDelete();
          this.displaySuccessMessage('Règlement supprimé avec succès');
        },
        error: (err: HttpErrorResponse) => console.error('Error deleting reglement:', err)
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.reglementToDelete = null;
    this.cdr.detectChanges();
  }
}