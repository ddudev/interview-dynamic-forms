import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/forms',
    pathMatch: 'full',
  },
  {
    path: 'forms',
    loadComponent: () =>
      import('./forms-list/forms-list.component').then(
        (m) => m.FormsListComponent,
      ),
  },
  {
    path: 'forms/create',
    loadComponent: () =>
      import('./form-builder/form-builder.component').then(
        (m) => m.FormBuilderComponent,
      ),
  },
  {
    path: 'forms/:id/edit',
    loadComponent: () =>
      import('./form-builder/form-builder.component').then(
        (m) => m.FormBuilderComponent,
      ),
  },
  {
    path: 'forms/:id',
    loadComponent: () =>
      import('./form-detail/form-detail.component').then(
        (m) => m.FormDetailComponent,
      ),
  },
  {
    path: 'forms/:id/fill',
    loadComponent: () =>
      import('./form-filler/form-filler.component').then(
        (m) => m.FormFillerComponent,
      ),
  },
  {
    path: 'entities',
    loadComponent: () =>
      import('./entity-list/entity-list.component').then(
        (m) => m.EntityListComponent,
      ),
  },
];
