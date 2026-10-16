import { Routes } from '@angular/router';
import { Professionals } from '../enums/professionals';
import { sislicGuard } from '../guards/sislic.guard';

export const sislicRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./../pages/index-page/index.page').then(m => m.IndexPage)
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./../pages/users-page/users.page').then(m => m.UsersPage),
    canActivate: [sislicGuard],
    data: { 
      permission: 'sislic/usuário listar', 
      types: [Professionals.ADMINISTRADOR] 
    }
  },
  {
    path: 'regras',
    loadComponent: () => import('./../pages/roles-page/roles.page').then(m => m.RolesPage),
    canActivate: [sislicGuard],
    data: { 
      permission: 'sislic/regra listar', 
      types: [Professionals.ADMINISTRADOR] 
    }
  },
  {
    path: 'locais-de-trabalho',
    loadComponent: () => import('./../pages/workplaces-page/workplaces.page').then(m => m.WorkplacesPage),
    canActivate: [sislicGuard],
    data: { 
      permission: 'sislic/local de trabalho listar', 
      types: [Professionals.ADMINISTRADOR] 
    }
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];