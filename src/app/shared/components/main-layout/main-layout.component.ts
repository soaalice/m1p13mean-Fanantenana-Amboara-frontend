import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { SidebarService } from '../../../core/services/sidebar.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    SidebarComponent,
    FooterComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') drawer!: MatDrawer;
  isSidebarOpen = true;
  private destroy$ = new Subject<void>();

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    this.sidebarService.closeSidebar$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.drawer && this.isSidebarOpen) {
          this.isSidebarOpen = false;
          this.drawer.close();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.drawer.toggle();
  }
}
