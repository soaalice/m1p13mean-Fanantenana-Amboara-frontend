import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { SidebarService } from '../../../core/services/sidebar.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../models/user';
import { NavItem, getNavItemsForRole } from '../../config/nav.config';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    SidebarComponent,
    FooterComponent,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') drawer!: MatDrawer;
  isMobile = false;
  isAcheteur = false;
  private destroy$ = new Subject<void>();

  readonly acheteurNavItems: NavItem[] = getNavItemsForRole(UserRole.ACHETEUR);

  constructor(
    private sidebarService: SidebarService,
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver,
    private cdRef: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isAcheteur = this.authService.getRoleFromToken() === UserRole.ACHETEUR;

    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        const wasMobile = this.isMobile;
        this.isMobile = result.matches;
        if (this.isAcheteur) {
          // Acheteur desktop → fermer le drawer (nav passe dans la toolbar)
          if (wasMobile && !this.isMobile) this.drawer?.close();
        } else {
          // Admin / Boutique : ouvrir/fermer selon breakpoint
          if (!wasMobile && this.isMobile)  this.drawer?.close();
          if (wasMobile  && !this.isMobile) this.drawer?.open();
        }
        this.cdRef.markForCheck();
      });

    this.sidebarService.closeSidebar$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isMobile) {
          this.drawer?.close();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get drawerMode(): 'side' | 'over' {
    return this.isMobile ? 'over' : 'side';
  }

  get drawerOpened(): boolean {
    if (this.isAcheteur) return false; // acheteur : drawer fermé (nav toolbar) sauf si l'user l'ouvre manuellement sur mobile
    return !this.isMobile;             // admin / boutique : ouvert sur desktop
  }

  toggleSidebar(): void {
    this.drawer.toggle();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
