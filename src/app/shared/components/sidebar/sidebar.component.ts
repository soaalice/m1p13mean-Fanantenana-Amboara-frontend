import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarService } from '../../../core/services/sidebar.service';
import { UserRole } from '../../models/user';
import { NavItem, ROLE_LABELS, getNavItemsForRole } from '../../config/nav.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatRippleModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  menuItems: NavItem[] = [];
  userRole: UserRole | null = null;
  userName = '';
  userInitial = '?';
  userRoleLabel = '';

  constructor(
    private authService: AuthService,
    private sidebarService: SidebarService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getRoleFromToken();
    this.menuItems = getNavItemsForRole(this.userRole);
    this.loadUserInfo();
  }

  private loadUserInfo(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName      = user.profile?.fullName || user.login || '';
      this.userRoleLabel = ROLE_LABELS[user.role] ?? String(user.role);
      this.userInitial   = (this.userName.charAt(0) || '?').toUpperCase();
    } else if (this.userRole) {
      this.userRoleLabel = ROLE_LABELS[this.userRole] ?? String(this.userRole);
      this.userInitial   = this.userRoleLabel.charAt(0).toUpperCase();
      this.userName      = this.userRoleLabel;
    }
  }

  onNavItemClick(): void {
    this.sidebarService.requestCloseSidebar();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
