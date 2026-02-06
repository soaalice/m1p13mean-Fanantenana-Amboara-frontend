import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './shared/models/user';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';

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
    // ADMIN ROUTES
    {
        path: 'admin',
        component: MainLayoutComponent,
        canActivate: [roleGuard([UserRole.ADMIN])],
        children: [
            {
                path: 'users',
                loadComponent: () => import('./admin/users/users.component').then(m => m.UsersComponent)
            }
        ]
    },
    // BOUTIQUE ROUTES
    {
        path: 'boutique',
        component: MainLayoutComponent,
        canActivate: [roleGuard([UserRole.BOUTIQUE])],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./boutique/dashboard/dashboard.component').then(m => m.DashboardComponent)
            }
        ]
    },
    // ACHETEUR ROUTES
    {
        path: 'acheteur',
        component: MainLayoutComponent,
        canActivate: [roleGuard([UserRole.ACHETEUR])],
        children: [
            {
                path: 'home',
                loadComponent: () => import('./acheteur/home/home.component').then(m => m.HomeComponent)
            }
        ]
    }
];
