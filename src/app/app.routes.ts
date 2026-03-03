import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';
import { UserRole } from './shared/models/user';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';

export const routes: Routes = [
  // DEFAULT ROUTE
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  // AUTH ROUTES
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
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
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
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
      },
      {
        path: 'shops',
        loadComponent: () => import('./admin/shops/shops.component').then(m => m.ShopsComponent)
      },
      {
        path: 'transactions-calendar',
        loadComponent: () => import('./admin/transactions-calendar/transactions-calendar.component').then(m => m.TransactionsCalendarComponent)
      },
      {
        path: 'change-password',
        loadComponent: () => import('./shared/components/change-password/change-password.component').then(m => m.ChangePasswordComponent)
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
      },
      {
        path: 'my-shop',
        loadComponent: () => import('./boutique/my-shop/my-shop.component').then(m => m.MyShopComponent)
      },
      {
        path: 'create-shop',
        loadComponent: () => import('./boutique/create-shop/create-shop.component').then(m => m.CreateShopComponent)
      },
      {
        path: 'my-product',
        loadComponent: () => import('./boutique/my-product/my-product.component').then(m => m.MyProductComponent)
      },
      {
        path: 'my-command',
        loadComponent: () => import('./boutique/my-command/my-command.component').then(m => m.MyCommandComponent)
      },
      {
        path: 'my-coupon',
        loadComponent: () => import('./boutique/my-coupon/my-coupon.component').then(m => m.MyCouponComponent)
      },
      {
        path: 'product-preview/:id',
        loadComponent: () => import('./boutique/product-preview/product-preview.component').then(m => m.BoutiqueProductPreviewComponent)
      },
      {
        path: 'change-password',
        loadComponent: () => import('./shared/components/change-password/change-password.component').then(m => m.ChangePasswordComponent)
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
      },
      {
        path: 'product',
        loadComponent: () => import('./acheteur/product/product.component').then(m => m.ProductComponent)
      },
      {
        path: 'product/:id',
        loadComponent: () => import('./acheteur/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
      },
      {
        path: 'coupons',
        loadComponent: () => import('./acheteur/coupons/coupons.component').then(m => m.CouponsComponent)
      },
      {
        path: 'coupons/:id',
        loadComponent: () => import('./acheteur/coupon-detail/coupon-detail.component').then(m => m.CouponDetailComponent)
      },
      {
        path: 'change-password',
        loadComponent: () => import('./shared/components/change-password/change-password.component').then(m => m.ChangePasswordComponent)
      }
    ]
  },
  // WILDCARD ROUTE
  {
    path: '**',
    redirectTo: '/404'
  }
];
