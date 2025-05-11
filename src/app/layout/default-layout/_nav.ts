import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Tableau de bord',
    iconComponent: { name: 'cil-speedometer' },
    url: '/dashboard',
    class: 'nav-item-dashboard bg-blue-100 hover:bg-blue-200', // Background color added
  },
  {
    name: 'Gestion des utilisateurs',
    url: '/gestion-utilisateurs',
    iconComponent: { name: 'cil-user' },
    class: 'nav-item-users bg-green-100 hover:bg-green-200', // Background color added
  },
  {
    name: 'Paramétrages',
    url: '/paramétrages',
    iconComponent: { name: 'cil-settings' },
    class: 'nav-item-settings bg-indigo-100 hover:bg-indigo-200', // Background color added
    children: [
      {
        name: 'Modalité de Règlements',
        url: '/paramétrages/moduleReglement',
        iconComponent: { name: 'cil-credit-card' },
        class: 'nav-item-reglement bg-purple-100 hover:bg-purple-200', // Background color added
      },
      {
        name: 'Catégories Abonnements',
        url: '/paramétrages/categorieabonnement',
        iconComponent: { name: 'cil-tags' },
        class: 'nav-item-categories bg-pink-100 hover:bg-pink-200', // Background color added
      },
      {
        name: 'Types Abonnements',
        url: '/paramétrages/typeAbonnement',
        iconComponent: { name: 'cil-layers' },
        class: 'nav-item-types bg-teal-100 hover:bg-teal-200', // Background color added
      }
    ]
  },
  {
    name: 'Abonnements',
    url: '/abonnement',
    iconComponent: { name: 'cil-notes' },
    class: 'nav-item-abonnements bg-yellow-100 hover:bg-yellow-200', // Background color added
    children: [
      {
        name: 'Adhérents',
        url: '/abonnement/adherent',
        iconComponent: { name: 'cil-user' },
        class: 'nav-item-adherents bg-orange-100 hover:bg-orange-200', // Background color added
      },
      {
        name: 'Liste des Abonnements',
        url: '/abonnement/listeAbonnement',
        iconComponent: { name: 'cil-list' },
        class: 'nav-item-liste-abonnement bg-red-100 hover:bg-red-200', // Background color added
      },
      {
        name: 'Ajouter Abonnement',
        url: '/abonnement/ajoutAbonnement',
        iconComponent: { name: 'cil-pencil' },
        class: 'nav-item-ajout-abonnement bg-gray-100 hover:bg-gray-200', // Background color added
      }
    ]
  },
  {
    name: 'Formation',
    url: '/salle-formation',
    iconComponent: { name: 'cil-layers' },
    class: 'nav-item-formation bg-cyan-100 hover:bg-cyan-200', // Background color added
    children: [
      {
        name: 'Liste des Salles',
        url: '/salle-formation/listedesSalle',
        iconComponent: { name: 'cil-list' },
        class: 'nav-item-list-salles bg-lime-100 hover:bg-lime-200', // Background color added
      },
      {
        name: 'Formateur',
        url: '/salle-formation/formateur',
        iconComponent: { name: 'cil-user' },
        class: 'nav-item-formateur bg-emerald-100 hover:bg-emerald-200', // Background color added
      },
      {
        name: 'Réservation',
        url: '/salle-formation/reservation',
        iconComponent: { name: 'cil-calendar' },
        class: 'nav-item-reservation bg-amber-100 hover:bg-amber-200', // Background color added
      }
    ]
  },
  {
    name: 'Caisse',
    url: '/caisse',
    iconComponent: { name: 'cil-credit-card' },
    class: 'nav-item-caisse bg-violet-100 hover:bg-violet-200', // Background color added
    children: [
      {
        name: 'Liste des Règlements',
        url: '/caisse/listereglements',
        iconComponent: { name: 'cil-list' },
        class: 'nav-item-liste-reglement bg-rose-100 hover:bg-rose-200', // Background color added
      },
      {
        name: 'Journal de Caisse',
        url: '/caisse/journalcaisse',
        iconComponent: { name: 'cil-notes' },
        class: 'nav-item-journal-caisse bg-sky-100 hover:bg-sky-200', // Background color added
      }
    ]
  },
];