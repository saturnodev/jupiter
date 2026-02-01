import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/layout/layout.component').then((m) => m.LayoutComponent) },
  { path: 'conversations/:id', loadComponent: () => import('./features/layout/layout.component').then((m) => m.LayoutComponent) },
];
