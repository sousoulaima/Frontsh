import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AbonnementService, Abonnement, Adherent, TypeAbonnement, CategorieAbonnement } from '../../../services/abonnement.service';
import { ModaliteRegService, ModaliteReg } from '../../../services/modalite-reg.service';

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
  filteredModalites: ModaliteReg[] = [];
  showAddAdherentModal = false;
  modaliteRegs: ModaliteReg[] = [];

  private emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  private cinPattern = /^[0-9]{8}$/;
  private phonePattern = /^[0-9]{8}$/;

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
        this.modaliteRegs = data.map((item: any) => ({
          ...item,
          designationmod: item.designationMod
        }));
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
        this.onCategorieChange();
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
    const selectedType = this.typesAbonnement.find(type => String(type.code) === this.newAbonnement.type_abonnement_code);
    if (selectedType) {
      this.newAbonnement.totalhtabo = selectedType.forfait / 1.19;
      this.newAbonnement.totalht = this.newAbonnement.totalhtabo;
      this.updateFinancials();

      const startDate = new Date(this.newAbonnement.datedeb);
      const endDate = new Date(startDate);
      
      if (selectedType.nbmois && selectedType.nbmois > 0) {
        endDate.setMonth(startDate.getMonth() + selectedType.nbmois);
      }
      
      if (selectedType.nbjours && selectedType.nbjours > 0) {
        endDate.setDate(startDate.getDate() + selectedType.nbjours);
      }

      if (!selectedType.nbmois && !selectedType.nbjours) {
        console.warn('Type d\'abonnement sans durée définie (nbmois et nbjours sont 0).');
        this.newAbonnement.datefin = startDate.toISOString().split('T')[0];
      } else {
        this.newAbonnement.datefin = endDate.toISOString().split('T')[0];
      }

      this.newAbonnement.mtpaye = 0;
      this.newAbonnement.restepaye = this.newAbonnement.totalttc;
      this.newAbonnement.solde = false;
    } else {
      this.newAbonnement.totalhtabo = 0;
      this.newAbonnement.totalht = 0;
      this.newAbonnement.totalttc = 0;
      this.newAbonnement.datefin = '';
      this.newAbonnement.restepaye = 0;
    }
  }

  onCategorieChange(): void {
    this.typesAbonnement2 = this.typesAbonnement.filter(type => 
      String(type.id_categorie) === this.newAbonnement.categorie_abonnement_codecateg
    );
    // Reset the type selection to force manual selection
    this.newAbonnement.type_abonnement_code = '';
    // Reset dependent fields since no type is selected yet
    this.newAbonnement.totalhtabo = 0;
    this.newAbonnement.totalht = 0;
    this.newAbonnement.totalttc = 0;
    this.newAbonnement.datefin = '';
    this.newAbonnement.restepaye = 0;
    this.newAbonnement.mtpaye = 0;
    this.newAbonnement.solde = false;
  }

  updateFinancials(): void {
    const totalHTAbo = this.newAbonnement.totalhtabo || 0;
    const remisePercent = this.newAbonnement.totalremise || 0;
    const taxRate = 0.19;

    const discountAmount = totalHTAbo * (remisePercent / 100);
    this.newAbonnement.totalht = totalHTAbo - discountAmount;
    this.newAbonnement.totalttc = this.newAbonnement.totalht * (1 + taxRate);
    this.updateSolde();
  }

  updateSolde(): void {
    const montantPaye = this.newAbonnement.mtpaye || 0;
    const totalTTC = this.newAbonnement.totalttc || 0;

    this.newAbonnement.restepaye = totalTTC - montantPaye;
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
    const missingFields: string[] = [];
    if (!this.newAdherent.nom) missingFields.push('Nom');
    if (!this.newAdherent.prenom) missingFields.push('Prénom');
    if (!this.newAdherent.email) missingFields.push('Email');
    if (!this.newAdherent.cin) missingFields.push('CIN');
    if (!this.newAdherent.tel1) missingFields.push('Téléphone 1');
    if (!this.newAdherent.codetva) missingFields.push('Code TVA');
    if (!this.newAdherent.idpointage) missingFields.push('ID Pointage');
    if (!this.newAdherent.societe_code) missingFields.push('Code Société');

    if (missingFields.length > 0) {
      alert(`Veuillez remplir les champs obligatoires suivants : ${missingFields.join(', ')}`);
      return;
    }

    const validationErrors: string[] = [];
    if (!this.emailPattern.test(this.newAdherent.email!)) {
      validationErrors.push("L'email n'est pas valide.");
    }
    if (!this.cinPattern.test(this.newAdherent.cin!)) {
      validationErrors.push('Le CIN doit être composé de 8 chiffres.');
    }
    if (!this.phonePattern.test(this.newAdherent.tel1!)) {
      validationErrors.push('Le téléphone 1 doit être composé de 8 chiffres.');
    }
    if (this.newAdherent.tel2 && !this.phonePattern.test(this.newAdherent.tel2!)) {
      validationErrors.push('Le téléphone 2 doit être composé de 8 chiffres.');
    }

    if (validationErrors.length > 0) {
      alert(`Erreurs de validation :\n- ${validationErrors.join('\n- ')}`);
      return;
    }

    const emailExists = this.adherents.some(adherent => 
      adherent.email && this.newAdherent.email && 
      adherent.email.toLowerCase() === this.newAdherent.email.toLowerCase()
    );
    const cinExists = this.adherents.some(adherent => adherent.cin === this.newAdherent.cin);

    if (emailExists || cinExists) {
      const duplicateErrors: string[] = [];
      if (emailExists) duplicateErrors.push('Cet email est déjà utilisé.');
      if (cinExists) duplicateErrors.push('Ce CIN est déjà utilisé.');
      alert(`Erreurs de duplication :\n- ${duplicateErrors.join('\n- ')}`);
      return;
    }

    this.abonnementService.createAdherent(this.newAdherent).subscribe({
      next: (adherent) => {
        this.adherents.push(adherent);
        this.newAbonnement.adherent_code = adherent.code;
        this.closeAddAdherentModal();
        alert('Adhérent créé avec succès');
      },
      error: (err) => {
        console.error('Erreur lors de la création de l\'adhérent:', err);
        alert('Erreur lors de la création de l\'adhérent');
      }
    });
  }

  saveAbonnement(): void {
    const missingFields: string[] = [];
    if (!this.newAbonnement.adherent_code) missingFields.push('Adhérent');
    if (!this.newAbonnement.categorie_abonnement_codecateg) missingFields.push('Catégorie');
    if (!this.newAbonnement.type_abonnement_code) missingFields.push('Type d\'Abonnement');
    if (!this.newAbonnement.datedeb) missingFields.push('Date de Début');
    if (this.newAbonnement.mtpaye === null || this.newAbonnement.mtpaye === undefined) missingFields.push('Montant Payé');
    if (!this.newAbonnement.modalite_reg_id) missingFields.push('Mode de Paiement');

    if (missingFields.length > 0) {
      alert(`Veuillez remplir les champs obligatoires suivants : ${missingFields.join(', ')}`);
      return;
    }

    if (this.typesAbonnement2.length === 0) {
      alert('Aucun type d\'abonnement disponible pour la catégorie sélectionnée.');
      return;
    }

    console.log('Sending subscription data:', this.newAbonnement);
    this.abonnementService.createAbonnement(this.newAbonnement).subscribe({
      next: () => {
        alert('Abonnement créé avec succès');
        this.router.navigate(['abonnement/listeAbonnement']);
      },
      error: (err) => {
        console.error('Erreur lors de la création de l\'abonnement:', err);
        if (err.status === 401) {
          alert('Erreur : Accès non autorisé. Veuillez vérifier votre authentification.');
        } else {
          alert('Erreur lors de la création de l\'abonnement');
        }
      }
    });
  }

  goBack(): void {
    this.router.navigate(['abonnement/listeAbonnement']);
  }
}