import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AbonnementService, Abonnement, Adherent, TypeAbonnement, CategorieAbonnement } from '../../../services/abonnement.service';

@Component({
  selector: 'app-ajout-abonnement',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './ajout-abonnement.component.html',
  styleUrls: ['./ajout-abonnement.component.scss']
})
export class AjoutAbonnementComponent implements OnInit {
  newAbonnement: Abonnement = {
    dateabo: new Date().toISOString().split('T')[0],
    totalhtabo: 0,
    totalremise: 0,
    totalht: 0,
    totalttc: 0,
    solde: false,
    restepaye: 0,
    mtpaye: 0,
    datedeb: new Date().toISOString().split('T')[0],
    datefin: '',
    adherent_code: '',
    type_abonnement_code: '',
    categorie_abonnement_codecateg: ''
  };
  
  adherents: Adherent[] = [];
  typesAbonnement: TypeAbonnement[] = [];
  categories: CategorieAbonnement[] = [];
  paymentMethods = ['Espèces', 'Carte Bancaire', 'Chèque', 'Virement'];

  constructor(
    private router: Router,
    private abonnementService: AbonnementService
  ) {}

  ngOnInit(): void {
    this.loadAdherents();
    this.loadTypesAbonnement();
    this.loadCategories();
  }

  loadAdherents(): void {
    this.abonnementService.getAllAdherents().subscribe({
      next: (data) => this.adherents = data,
      error: (err) => console.error('Erreur chargement adhérents:', err)
    });
  }

  loadTypesAbonnement(): void {
    this.abonnementService.getAllTypesAbonnement().subscribe({
      next: (data) => this.typesAbonnement = data,
      error: (err) => console.error('Erreur chargement types:', err)
    });
  }

  loadCategories(): void {
    this.abonnementService.getAllCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Erreur chargement catégories:', err)
    });
  }

  onTypeChange(): void {
    const selectedType = this.typesAbonnement.find(t => t.code === this.newAbonnement.type_abonnement_code);
    if (selectedType) {
      // Calcul des montants
      this.newAbonnement.totalttc = selectedType.forfait;
      this.newAbonnement.totalhtabo = selectedType.forfait / 1.19;
      this.newAbonnement.totalht = this.newAbonnement.totalhtabo;
      
      // Calcul date de fin
      const startDate = new Date(this.newAbonnement.datedeb);
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + selectedType.nbmois);
      this.newAbonnement.datefin = endDate.toISOString().split('T')[0];
      
      // Réinitialiser les paiements lors du changement de type
      this.newAbonnement.mtpaye = 0;
      this.newAbonnement.restepaye = this.newAbonnement.totalttc;
      this.newAbonnement.solde = false;
    }
  }

  onCategorieChange(): void {
    console.log('Catégorie sélectionnée:', this.newAbonnement.categorie_abonnement_codecateg);
  }

  calculateDateFin(dureeMois: number): void {
    if (!this.newAbonnement.datedeb) return;
    
    const startDate = new Date(this.newAbonnement.datedeb);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + dureeMois);
    
    this.newAbonnement.datefin = endDate.toISOString().split('T')[0];
  }

  updateFinancials(): void {
    const totalHTAbo = this.newAbonnement.totalhtabo || 0;
    const totalRemise = this.newAbonnement.totalremise || 0;
    const taxRate = 0.19;
    this.newAbonnement.totalht = totalHTAbo - totalRemise;
    this.newAbonnement.totalttc = this.newAbonnement.totalht * (1 + taxRate);
    this.updateSolde();
  }

  updateSolde(): void {
    const montantPaye = this.newAbonnement.mtpaye || 0;
    const totalTTC = this.newAbonnement.totalttc || 0;

    // Recalcul du reste à payer
    this.newAbonnement.restepaye = totalTTC - montantPaye;

    // Mise à jour du solde
    this.newAbonnement.solde = this.newAbonnement.restepaye <= 0;
  }

  saveAbonnement(): void {
    this.abonnementService.createAbonnement(this.newAbonnement).subscribe({
      next: () => {
        alert('Abonnement créé avec succès');
        this.router.navigate(['abonnement/listeAbonnement']);
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert('Erreur lors de la création de l\'abonnement');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['abonnement/listeAbonnement']);
  }
}
