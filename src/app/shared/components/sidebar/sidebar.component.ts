import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../models/user';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  menuItems: MenuItem[] = [];
  userRole: UserRole | null = null;

  private allMenuItems: MenuItem[] = [
    // ADMIN MENU
    { label: 'Boxes', icon: 'store', route: '/admin/boxes', roles: [UserRole.ADMIN] },
    { label: 'Product Types', icon: 'category', route: '/admin/product-types', roles: [UserRole.ADMIN] },
    { label: 'Shops', icon: 'shop', route: '/admin/shops', roles: [UserRole.ADMIN] },
    { label: 'Users', icon: 'people', route: '/admin/users', roles: [UserRole.ADMIN] },
    { label: 'Transactions Calendar', icon: 'calendar_today', route: '/admin/transactions-calendar', roles: [UserRole.ADMIN] },

    // BOUTIQUE MENU
    { label: 'Dashboard', icon: 'dashboard', route: '/boutique/dashboard', roles: [UserRole.BOUTIQUE] },
    { label: 'My Shop', icon: 'storefront', route: '/boutique/my-shop', roles: [UserRole.BOUTIQUE] },
    { label: 'My Product', icon: 'inventory_2', route: '/boutique/my-product', roles: [UserRole.BOUTIQUE] },

    // ACHETEUR MENU
    { label: 'Home', icon: 'home', route: '/acheteur', roles: [UserRole.ACHETEUR] },
    { label: 'Transactions', icon: 'receipt_long', route: '/acheteur/transactions', roles: [UserRole.ACHETEUR] },
    { label: 'Product', icon: 'receipt_long', route: '/acheteur/product', roles: [UserRole.ACHETEUR] }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userRole = this.authService.getRoleFromToken();
    this.filterMenuByRole();
  }

  private filterMenuByRole(): void {
    if (!this.userRole) {
      this.menuItems = [];
      return;
    }

    this.menuItems = this.allMenuItems.filter(item =>
      item.roles.includes(this.userRole!)
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
