import { Routes } from '@angular/router';
import '@angular/localize/init';  // Importation de la localisation

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent),
    data: {
      title: $localize`Dashboard`  // Utilisation de la localisation
    }
  }
];
