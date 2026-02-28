import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardCardComponent } from '../../shared/components/dashboard-card/dashboard-card.component';
import { DashboardGraphComponent } from '../../shared/components/dashboard-graph/dashboard-graph.component';
import { BoutiqueDashboardData } from '../../shared/models/dashboard';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    DashboardCardComponent,
    DashboardGraphComponent,
    LoaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  isLoading = false;
  loadError = '';
  data: BoutiqueDashboardData | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.fetchDashboard();
  }

  fetchDashboard(): void {
    this.isLoading = true;
    this.loadError = '';

    this.dashboardService.getBoutiqueDashboard().subscribe({
      next: response => {
        this.data = response;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Impossible de charger les statistiques de la boutique.';
        this.isLoading = false;
      }
    });
  }

  get customersByMonth(): [string, number][] {
    if (!this.data) {
      return [];
    }

    return Object.entries(this.data.customers.byMonth);
  }

}
