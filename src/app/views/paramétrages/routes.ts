import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'moduleReglement',
    loadComponent: () => import('./module-reglement/module-reglement.component').then(m => m.ModuleReglementComponent),
    data: {
      title: 'Module de réglement'
    }
  },
  {
    path: 'categorieabonnement',
    loadComponent: () => import('./categorie-abonnement/categorie-abonnement.component').then(m => m.CategorieAbonnementComponent),
    data: {
      title: 'Categorie Abonnement'
    }
  },
  {
    path: 'typeAbonnement',
    loadComponent: () => import('./types-abonnement/types-abonnement.component').then(m => m.TypesAbonnementComponent),
    data: {
      title: 'Type Abonnement'
    }
  }
];
