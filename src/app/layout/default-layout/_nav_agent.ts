import { INavData } from '@coreui/angular';

export const navAgentItems: INavData[] = [
  {
    name: 'Tableau de bord',
    iconComponent: { name: 'cil-speedometer' },
    url: '/agent-dashboard',
    class: 'nav-item-dashboard',
  },
  {
    name: 'Abonnements',
    url: '/agent-abonnement',
    iconComponent: { name: 'cil-notes' },
    class: 'nav-item-abonnements bg-yellow-100 hover:bg-yellow-200',
    children: [
      {
        name: 'Adhérents',
        url: '/agent-abonnement/adherent',
        iconComponent: { name: 'cil-user' },
        class: 'nav-item-adherents bg-orange-100 hover:bg-orange-200',
      },
      {
        name: 'Liste des Abonnements',
        url: '/agent-abonnement/listeAbonnement',
        iconComponent: { name: 'cil-list' },
        class: 'nav-item-liste-abonnement bg-red-100 hover:bg-red-200',
      },
      {
        name: 'Ajout Abonnement',
        url: '/agent-abonnement/ajoutAbonnement',
        iconComponent: { name: 'cil-pencil' },
        class: 'nav-item-ajout-abonnement bg-gray-100 hover:bg-gray-200',
      }
    ]
  },
  {
    name: 'Salle-formation',
    url: '/agent-salle-formation',
    iconComponent: { name: 'cil-layers' },
    class: 'nav-item-salle-formation bg-blue-100 hover:bg-blue-200',
    children: [
      {
        name: 'Liste des Salles',
        url: '/agent-salle-formation/listedesSalle',
        iconComponent: { name: 'cil-list' },
        class: 'nav-item-liste-salles bg-indigo-100 hover:bg-indigo-200',
      },
      {
        name: 'Formateur',
        url: '/agent-salle-formation/formateur',
        iconComponent: { name: 'cil-user' },
        class: 'nav-item-formateur bg-teal-100 hover:bg-teal-200',
      },
      {
        name: 'Réservation',
        url: '/agent-salle-formation/reservation',
        iconComponent: { name: 'cil-calendar' },
        class: 'nav-item-reservation bg-cyan-100 hover:bg-cyan-200',
      }
    ]
  }
];