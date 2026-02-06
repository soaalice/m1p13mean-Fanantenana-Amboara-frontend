import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './shared/models/user';

export const routes: Routes = [
    {path: '', redirectTo: '/login', pathMatch: 'full'},
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
    },
    // ADMIN LINKS
    {
        path: 'admin/users',
        loadComponent: () => import('./admin/users/users.component').then(m => m.UsersComponent),
        canActivate: [roleGuard([UserRole.ADMIN])]
    },
    // BOUTIQUE LINKS
    {
        path: 'boutique/dashboard',
        loadComponent: () => import('./boutique/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [roleGuard([UserRole.BOUTIQUE])]
    },
    // ACHETEUR LINKS
    {
        path: 'acheteur/home',
        loadComponent: () => import('./acheteur/home/home.component').then(m => m.HomeComponent),
        canActivate: [roleGuard([UserRole.ACHETEUR])]
    }
];
