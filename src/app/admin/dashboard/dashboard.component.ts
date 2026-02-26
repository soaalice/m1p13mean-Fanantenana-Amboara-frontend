import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService } from '../../core/services/dashboard.service';
import { AdminDashboardData } from '../../shared/models/dashboard';
import { DashboardCardComponent } from '../../shared/components/dashboard-card/dashboard-card.component';
import { DashboardGraphComponent } from '../../shared/components/dashboard-graph/dashboard-graph.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    DashboardCardComponent,
    DashboardGraphComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  isLoading = false;
  loadError = '';
  data: AdminDashboardData | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.fetchDashboard();
  }

  fetchDashboard(): void {
    this.isLoading = true;
    this.loadError = '';

    this.dashboardService.getAdminDashboard().subscribe({
      next: response => {
        this.data = response;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Impossible de charger les statistiques admin.';
        this.isLoading = false;
      }
    });
  }

  get boxStates(): [string, number][] {
    if (!this.data) {
      return [];
    }

    return Object.entries(this.data.boxes.byState);
  }

  get userRoles(): [string, number][] {
    if (!this.data) {
      return [];
    }

    return Object.entries(this.data.users.byRole);
  }

  get netSales(): [string, number][] {
    if (!this.data) {
      return [];
    }

    return Object.entries(this.data.netSales.byPeriode);
  }
}
