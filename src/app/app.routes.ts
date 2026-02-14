import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './shared/models/user';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';

export const routes: Routes = [
    // DEFAULT ROUTE
    {path: '', redirectTo: '/login', pathMatch: 'full'},
    // AUTH ROUTES
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
    },
    // ERROR PAGE
    {
        path: '403',
        loadComponent: () => import('./shared/components/error-page/error-page.component').then(m => m.ErrorPageComponent),
        data: { status: 403 }
    },
    {
        path: '404',
        loadComponent: () => import('./shared/components/error-page/error-page.component').then(m => m.ErrorPageComponent),
        data: { status: 404 }
    },
    // ADMIN ROUTES
    {
        path: 'admin',
        component: MainLayoutComponent,
        canActivate: [roleGuard([UserRole.ADMIN])],
        children: [
            {
                path: '',
                redirectTo: 'users',
                pathMatch: 'full'
            },
            {
                path: 'users',
                loadComponent: () => import('./admin/users/users.component').then(m => m.UsersComponent)
            },
            {
                path: 'boxes',
                loadComponent: () => import('./admin/boxes/boxes.component').then(m => m.BoxesComponent)
            },
            {
                path: 'product-types',
                loadComponent: () => import('./admin/product-types/product-types.component').then(m => m.ProductTypesComponent)
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
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
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
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./acheteur/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            {
                path: 'transactions',
                loadComponent: () => import('./acheteur/transactions/transactions.component').then(m => m.TransactionsComponent)
            }
        ]
    },
    // WILDCARD ROUTE
    {
        path: '**',
        redirectTo: '/404'
    }
];
