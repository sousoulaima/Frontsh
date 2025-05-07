import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Tableau de bord',
    iconComponent: { name: 'cil-speedometer' },
    url: '/dashboard', // URL à corriger pour chaque section
    class: 'nav-item-dashboard', // Classe personnalisée
  },
  {
    name: 'Gestion des utilisateurs',
    url: '/gestion-utilisateurs',
    iconComponent: { name: 'cil-user' },
    class: 'nav-item-users', // Classe personnalisée
  },
  {
    name: 'Paramétrages',
    url: '/paramétrages',
    iconComponent: { name: 'cilSettings' },
    class: 'nav-item-settings', // Classe personnalisée
    children: [
      {
        name: 'Modalité de Règlements',
        url: '/paramétrages/moduleReglement',
        iconComponent: { name: 'cilCreditCard' },
        class: 'nav-item-reglement', // Classe personnalisée
      },
      {
        name: 'Catégories Abonnements',
        url: '/paramétrages/categorieabonnement',
        iconComponent: { name: 'cilTags' },
        class: 'nav-item-categories', // Classe personnalisée
      },
      {
        name: 'Types Abonnements',
        url: '/paramétrages/typeAbonnement',
        iconComponent: { name: 'cil-layers' },
        class: 'nav-item-types', // Classe personnalisée
      }
    ]
  },
  {
    name: 'Abonnements',
    url: '/Abonnement',
    iconComponent: { name: 'cil-notes' },
    class: 'nav-item-abonnements', // Classe personnalisée
    children: [
      {
        name: 'Adhérents',
        url: '/abonnement/adherent',
        iconComponent: { name: 'cil-user' },
        class: 'nav-item-adherents', // Classe personnalisée
      },
      {
        name: 'Liste des Abonnements',
        url: '/abonnement/listeAbonnement',
        iconComponent: { name: 'cil-list' },
        class: 'nav-item-liste-abonnement', // Classe personnalisée
      },
      {
        name: 'Ajouter Abonnement',
        url: '/abonnement/ajoutAbonnement',
        iconComponent: { name: 'cil-pencil' },
        class: 'nav-item-ajout-abonnement', // Classe personnalisée
      }
    ]
  },

  {

    name: 'Formation',
    url: '/salle-formation',
    iconComponent: { name: 'cil-layers' }
    , children: [
      {
        name: 'Liste des Salles ',
        url: '/salle-formation/listedesSalle',
        iconComponent: { name: 'cil-list' }
      },
      {
        name: 'Formateur',
        url: '/salle-formation/formateur',
       iconComponent: { name:'cil-user'}
      },
      {
        name: 'Réservation',
        url: '/salle-formation/reservation',
        iconComponent: { name:'cil-calendar'}
      }]  },


  {
    name: 'Caisse',
    url: '/caisse',
    iconComponent: { name: 'cilCreditCard' },
    class: 'nav-item-caisse', // Classe personnalisée
    children: [
      {
        name: 'Liste des Règlements',
        url: '/caisse/listereglements',
        iconComponent: { name: 'cil-list' },
        class: 'nav-item-liste-reglement', // Classe personnalisée
      },
      {
        name: 'Journal de Caisse',
        url: '/caisse/journalcaisse',
        iconComponent: { name: 'cil-notes' },
        class: 'nav-item-journal-caisse', // Classe personnalisée
      }
    ]
  },
];
