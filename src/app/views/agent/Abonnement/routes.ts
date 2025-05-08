import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'adherent',
    loadComponent: () => import('./adherent/adherent.component').then(m => m.AdherentComponent),
    data: {
      title: 'Adherent'
    }
  },
  {
    path: 'listeAbonnement',
    loadComponent: () => import('./liste-abonnement/liste-abonnement.component').then(m => m.ListeAbonnementComponent),
    data: {
      title: 'Liste desAbonnement'
    }
  },
  {
    path: 'ajoutAbonnement',
    loadComponent: () => import('./ajout-abonnement/ajout-abonnement.component').then(m => m.AjoutAbonnementComponent),
    data: {
      title: 'Ajout Abonnemenet'
    }
  }
];