import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AbonnementService, Abonnement, Adherent, TypeAbonnement, CategorieAbonnement } from '../../../../services/abonnement.service';
import { ModaliteRegService, ModaliteReg } from '../../../../services/modalite-reg.service';
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
    categorie_abonnement_codecateg: '',
    modalite_reg_id: ''
  };

  newAdherent: Adherent = {
    code: '',
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

  adherents: Adherent[] = [];
  typesAbonnement: TypeAbonnement[] = [];
  typesAbonnement2: TypeAbonnement[] = [];
  categories: CategorieAbonnement[] = [];
  paymentMethods = ['Espèces', 'Carte Bancaire', 'Chèque', 'Virement'];
  filteredModalites: ModaliteReg[] = [];
  showAddAdherentModal = false;
  modaliteRegs: ModaliteReg[] = [];
  constructor(
    private router: Router,
    private abonnementService: AbonnementService,
    private modaliteService: ModaliteRegService
  ) {}

  ngOnInit(): void {
    this.loadAdherents();
    this.loadTypesAbonnement();
    this.loadCategories();
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
  loadAdherents(): void {
    this.abonnementService.getAllAdherents().subscribe({
      next: (data) => this.adherents = data,
      error: (err) => console.error('Erreur chargement adhérents:', err)
    });
  }


  loadTypesAbonnement(): void {
    this.abonnementService.getAllTypesAbonnement().subscribe({
      next: (data) => {
        this.typesAbonnement = data;
      },
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
    for (const type of this.typesAbonnement) {
      if (String(type.code) === this.newAbonnement.type_abonnement_code) {
        this.newAbonnement.totalttc = type.forfait;
        this.newAbonnement.totalhtabo = type.forfait / 1.19;
        this.newAbonnement.totalht = this.newAbonnement.totalhtabo;
        
        // Calcul date de fin
        const startDate = new Date(this.newAbonnement.datedeb);
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + type.nbmois);
        this.newAbonnement.datefin = endDate.toISOString().split('T')[0];
        
        // Réinitialiser les paiements lors du changement de type
        this.newAbonnement.mtpaye = 0;
        this.newAbonnement.restepaye = this.newAbonnement.totalttc;
        this.newAbonnement.solde = false;
      }
    }
  
    
  }

  onCategorieChange(): void {
    this.typesAbonnement2=[];
    for (const type of this.typesAbonnement) {
      if (String(type.id_categorie) === this.newAbonnement.categorie_abonnement_codecateg) {
        this.typesAbonnement2.push(type);
      }
    }
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

  openAddAdherentModal(): void {
    this.newAdherent = {
      code: this.abonnementService.generateAdherentCode(),
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
    this.showAddAdherentModal = true;
  }

  closeAddAdherentModal(): void {
    this.showAddAdherentModal = false;
  }

  saveAdherent(): void {
    this.abonnementService.createAdherent(this.newAdherent).subscribe({
      next: (adherent) => {
        this.adherents.push(adherent);
        this.newAbonnement.adherent_code = adherent.code;
        this.closeAddAdherentModal();
        alert('Adhérent créé avec succès');
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert('Erreur lors de la création de l\'adhérent');
      }
    });
  }

  saveAbonnement(): void {
    console.log(this.newAbonnement);
    this.abonnementService.createAbonnement(this.newAbonnement).subscribe({
      next: () => {
        alert('Abonnement créé avec succès');
        this.router.navigate(['abonnement/listeAbonnement']);
      },
      error: (err:any) => {
        console.error('Erreur:', err);
        alert('Erreur lors de la création de l\'abonnement');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['abonnement/listeAbonnement']);
  }
}