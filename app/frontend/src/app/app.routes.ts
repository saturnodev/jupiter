import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/welcome/welcome-view/welcome-view.component').then((m) => m.WelcomeViewComponent) },
  { path: 'conversations', loadComponent: () => import('./features/layout/layout.component').then((m) => m.LayoutComponent) },
  { path: 'conversations/:id', loadComponent: () => import('./features/layout/layout.component').then((m) => m.LayoutComponent) },
];
