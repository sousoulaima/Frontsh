import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'journalcaisse',
    loadComponent: () => import('./journal-caisse/journal-caisse.component').then(m => m.JournalCaisseComponent),
    data: {
      title: 'journal de caisse'
    }
  },
  {
    path: 'listereglements',
    loadComponent: () => import('./liste-reglements/liste-reglements.component').then(m => m.ListeReglementsComponent),
    data: {
      title: 'liste des reglements'
    }
  },
 
];
