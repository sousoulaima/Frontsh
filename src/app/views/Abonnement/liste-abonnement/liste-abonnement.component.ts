import { Component, OnInit, HostListener, ChangeDetectorRef, ViewChild, NgZone } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { AbonnementService, Abonnement, Adherent, TypeAbonnement } from '../../../services/abonnement.service';
import { forkJoin } from 'rxjs';

interface EnrichedAbonnement extends Abonnement {
  adherentName: string;
  typeDesignation: string;
}

@Component({
  selector: 'app-liste-abonnement',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './liste-abonnement.component.html',
  styleUrls: ['./liste-abonnement.component.scss'],
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
  ],
})
export class ListeAbonnementComponent implements OnInit {
  abonnements: EnrichedAbonnement[] = [];
  filteredAbonnements: EnrichedAbonnement[] = [];
  adherents: Adherent[] = [];
  typesAbonnement: TypeAbonnement[] = [];
  
  searchQuery = '';
  filterType = '';
  filterStatus = '';
  showFilter = false;
  showModal = false;
  showViewModal = false;
  showToast = false;
  toastMessage = '';
  toastClass = '';
  isSaving = false;
  private toastTimeout: any = null;

  currentAbonnement: Partial<Abonnement> & { adherentName?: string } = {};
  viewedAbonnement: EnrichedAbonnement | null = null;

  @ViewChild('abonnementForm') abonnementForm!: NgForm;

  constructor(
    private abonnementService: AbonnementService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      abonnements: this.abonnementService.getAllAbonnements(),
      adherents: this.abonnementService.getAllAdherents(),
      types: this.abonnementService.getAllTypesAbonnement(),
    }).subscribe({
      next: (results) => {
        this.adherents = results.adherents;
        this.typesAbonnement = results.types;

        this.abonnements = results.abonnements.map(abonnement => {
          const adherent = results.adherents.find(a => a.code === abonnement.adherent_code);
          const type = results.types.find(t => t.code === abonnement.type_abonnement_code);
          
          const updatedAbonnement = {
            ...abonnement,
            totalhtabo: this.cleanNumber(abonnement.totalhtabo),
            totalremise: this.cleanNumber(abonnement.totalremise),
            totalht: this.cleanNumber(abonnement.totalht),
            totalttc: this.cleanNumber(abonnement.totalttc),
            mtpaye: this.cleanNumber(abonnement.mtpaye),
            restepaye: this.cleanNumber(abonnement.restepaye)
          };

          this.updateFinancials(updatedAbonnement);

          return {
            ...updatedAbonnement,
            adherentName: adherent ? `${adherent.nom} ${adherent.prenom}` : 'Inconnu',
            typeDesignation: type ? type.designation : 'Inconnu'
          };
        });

        this.filteredAbonnements = [...this.abonnements];
        this.filterAbonnements();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données:', err);
        this.showToastMessage('Erreur lors du chargement des données', 'error');
      }
    });
  }

  cleanNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    const cleanValue = String(value).replace(' DT', '').trim();
    return Number(parseFloat(cleanValue).toFixed(2)) || 0;
  }

  filterAbonnements(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredAbonnements = this.abonnements.filter((abonnement) => {
      const dateAboFormatted = abonnement.dateabo ? new Date(abonnement.dateabo).toLocaleDateString('fr-FR') : '';
      const dateDebFormatted = abonnement.datedeb ? new Date(abonnement.datedeb).toLocaleDateString('fr-FR') : '';
      const dateFinFormatted = abonnement.datefin ? new Date(abonnement.datefin).toLocaleDateString('fr-FR') : '';

      const matchesSearch =
        (abonnement.codeabo?.toString().toLowerCase().includes(query) || false) ||
        (abonnement.adherentName?.toLowerCase().includes(query) || false) ||
        (abonnement.typeDesignation?.toLowerCase().includes(query) || false) ||
        (dateAboFormatted.includes(query) || false) ||
        (dateDebFormatted.includes(query) || false) ||
        (dateFinFormatted.includes(query) || false) ||
        (abonnement.totalhtabo?.toString().includes(query) || false) ||
        (abonnement.totalttc?.toString().includes(query) || false);

      const matchesType = this.filterType ? 
        abonnement.typeDesignation === this.filterType : true;
      
      const matchesStatus = this.filterStatus ? 
        this.isSoldeOui(abonnement.restepaye).toString() === this.filterStatus : true;

      return matchesSearch && matchesType && matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.filterType = '';
    this.filterStatus = '';
    this.showFilter = false;
    this.filterAbonnements();
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-container')) {
      this.showFilter = false;
    }
  }

  openEditAbonnementModal(abonnement: EnrichedAbonnement): void {
    this.currentAbonnement = { 
      ...abonnement, 
      totalremise: abonnement.totalremise || 0,
      adherentName: abonnement.adherentName 
    };
    this.updateFinancials(this.currentAbonnement);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentAbonnement = {};
  }

  updateFinancials(abonnement: Partial<Abonnement> = this.currentAbonnement): void {
    const totalHTAbo = this.cleanNumber(abonnement.totalhtabo);
    const remisePercentage = this.cleanNumber(abonnement.totalremise);
    const mtpaye = this.cleanNumber(abonnement.mtpaye);
    const taxRate = 0.19;

    const remiseAmount = (totalHTAbo * remisePercentage) / 100;
    abonnement.totalht = Number((totalHTAbo - remiseAmount).toFixed(2));
    abonnement.totalttc = Number((abonnement.totalht * (1 + taxRate)).toFixed(2));
    abonnement.restepaye = Number((abonnement.totalttc - mtpaye).toFixed(2));
  }

  updateDateFin(): void {
    if (!this.currentAbonnement.datedeb || !this.currentAbonnement.type_abonnement_code) {
      this.currentAbonnement.datefin = undefined;
      return;
    }
    
    const type = this.typesAbonnement.find(t => t.code === this.currentAbonnement.type_abonnement_code);
    if (!type) return;
    
    const startDate = new Date(this.currentAbonnement.datedeb);
    const endDate = new Date(startDate);
    
    if (type.nbmois) {
      endDate.setMonth(startDate.getMonth() + type.nbmois);
    } else if (type.nbjours) {
      endDate.setDate(startDate.getDate() + type.nbjours);
    }
    
    this.currentAbonnement.datefin = endDate.toISOString().split('T')[0];
  }

  saveAbonnement(): void {
    console.log('saveAbonnement appelé, formulaire valide:', this.abonnementForm.valid);
    if (!this.currentAbonnement || !this.currentAbonnement.codeabo) {
      console.error('Codeabo manquant:', this.currentAbonnement);
      this.showToastMessage('Code de l\'abonnement manquant', 'error');
      return;
    }

    if (!this.abonnementForm.valid) {
      console.error('Formulaire invalide:', this.abonnementForm.controls);
      this.showToastMessage('Veuillez remplir tous les champs requis', 'error');
      return;
    }

    this.isSaving = true;
    this.updateFinancials(this.currentAbonnement);

    const updatePayload: Abonnement = {
      codeabo: this.currentAbonnement.codeabo!,
      adherent_code: this.currentAbonnement.adherent_code!,
      dateabo: this.currentAbonnement.dateabo!,
      type_abonnement_code: this.currentAbonnement.type_abonnement_code!,
      totalhtabo: this.cleanNumber(this.currentAbonnement.totalhtabo),
      datedeb: this.currentAbonnement.datedeb!,
      datefin: this.currentAbonnement.datefin!,
      totalremise: this.cleanNumber(this.currentAbonnement.totalremise),
      totalht: this.cleanNumber(this.currentAbonnement.totalht),
      totalttc: this.cleanNumber(this.currentAbonnement.totalttc),
      mtpaye: this.cleanNumber(this.currentAbonnement.mtpaye),
      restepaye: this.cleanNumber(this.currentAbonnement.restepaye),
      solde: this.isSoldeOui(this.currentAbonnement.restepaye),
      categorie_abonnement_codecateg: this.currentAbonnement.categorie_abonnement_codecateg || '',
      modalite_reg_id: this.currentAbonnement.modalite_reg_id || ''
    };

    console.log('Envoi de la requête update avec payload:', updatePayload);

    this.abonnementService.update(Number(updatePayload.codeabo), updatePayload).subscribe({
      next: (response) => {
        console.log('Succès: Abonnement modifié, réponse:', response);
        // Fallback alert to confirm callback
        window.alert('Abonnement modifié avec succès');
        this.showToastMessage('Abonnement modifié avec succès', 'success');
        this.loadData();
        this.closeModal();
        this.isSaving = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Erreur lors de la modification de l\'abonnement:', err);
        const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
        this.showToastMessage('Erreur lors de la modification: ' + errorMessage, 'error');
        this.isSaving = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('Requête update terminée');
      }
    });
  }

  showToastMessage(message: string, type: 'success' | 'error'): void {
    console.log('showToastMessage appelé:', { message, type, showToastBefore: this.showToast });
    this.ngZone.run(() => {
      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout);
        this.toastTimeout = null;
      }

      this.toastMessage = message;
      this.toastClass = type === 'error' ? 'error' : 'success';
      this.showToast = true;
      document.body.offsetHeight; // Force reflow
      this.cdr.markForCheck();
      this.cdr.detectChanges();

      console.log('Toast activé:', { showToast: this.showToast, toastMessage: this.toastMessage, toastClass: this.toastClass });

      setTimeout(() => {
        const toastElement = document.querySelector('.toast');
        if (toastElement) {
          const styles = window.getComputedStyle(toastElement);
          console.log('Toast styles:', {
            display: styles.display,
            opacity: styles.opacity,
            zIndex: styles.zIndex,
            position: styles.position,
            top: styles.top,
            right: styles.right
          });
        } else {
          console.error('Toast element not found in DOM');
        }
      }, 100);

      this.toastTimeout = setTimeout(() => {
        this.ngZone.run(() => {
          this.showToast = false;
          this.toastMessage = '';
          this.toastClass = '';
          this.cdr.markForCheck();
          this.cdr.detectChanges();
          console.log('Toast désactivé');
          this.toastTimeout = null;
        });
      }, 4000);
    });
  }

  viewAbonnement(abonnement: EnrichedAbonnement): void {
    this.viewedAbonnement = abonnement;
    this.showViewModal = true;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.viewedAbonnement = null;
  }

  isSoldeOui(restepaye: number | string | undefined): boolean {
    if (restepaye === undefined || restepaye === null) return false;
    const cleanValue = this.cleanNumber(restepaye);
    return cleanValue <= 0;
  }
}