import { INavData } from '@coreui/angular';

export const navAgentItems: INavData[] = [
  {
    name: 'Tableau de bord',
    iconComponent: { name: 'cil-speedometer' },
    url: '/agent-dashboard', // URL à corriger pour chaque section
    class: 'nav-item-dashboard', // Classe personnalisée
  },
  {
    name: 'Abonnements',
    url: '/agent-abonnement',
    iconComponent: { name: 'cil-notes' },
    class: 'nav-item-abonnements', // Classe personnalisée
    children: [
      {
        name: 'Adhérents',
        url: '/agent-abonnement/adherent',
        iconComponent: { name: 'cil-user' },
        class: 'nav-item-adherents', // Classe personnalisée
      },
      {
        name: 'Liste des Abonnements',
        url: '/agent-abonnement/listeAbonnement',
        iconComponent: { name: 'cil-list' },
        class: 'nav-item-liste-abonnement', // Classe personnalisée
      },
      {
        name: 'Ajout Abonnement',
        url: '/agent-abonnement/ajoutAbonnement',
        iconComponent: { name: 'cil-pencil' },
        class: 'nav-item-ajout-abonnement', // Classe personnalisée
      }
    ]
  },
      {

        name: 'Salle-formation',
        url: '/agent-salle-formation',
        iconComponent: { name: 'cil-layers' }
        , children: [
          {
            name: 'Liste des Salles ',
            url: '/agent-salle-formation/listedesSalle',
            iconComponent: { name: 'cil-list' }
          },
          {
            name: 'Formateur',
            url: '/agent-salle-formation/formateur',
           iconComponent: { name:'cil-user'}
          },
          {
            name: 'Réservation',
            url: '/agent-salle-formation/reservation',
            iconComponent: { name:'cil-calendar'}
          }]  },


        ];



    

