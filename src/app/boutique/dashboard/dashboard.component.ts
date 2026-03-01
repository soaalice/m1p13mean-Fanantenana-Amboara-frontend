import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardCardComponent } from '../../shared/components/dashboard-card/dashboard-card.component';
import { DashboardGraphComponent } from '../../shared/components/dashboard-graph/dashboard-graph.component';
import { ListFiltersComponent } from '../../shared/components/list-filters/list-filters.component';
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
    LoaderComponent,
    ListFiltersComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  isLoading = false;
  isNetSalesLoading = false;
  loadError = '';
  data: BoutiqueDashboardData | null = null;
  selectedYear = new Date().getFullYear();
  availableYears: number[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.buildAvailableYears(this.selectedYear);
    this.fetchDashboard();
  }

  fetchDashboard(): void {
    this.isLoading = true;
    this.loadError = '';

    this.dashboardService.getBoutiqueDashboard(this.selectedYear).subscribe({
      next: response => {
        this.data = response;
        this.buildAvailableYears(response.netSales.year);
        this.selectedYear = response.netSales.year;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Impossible de charger les statistiques de la boutique.';
        this.isLoading = false;
      }
    });
  }

  onYearChange(yearValue: string): void {
    const year = Number(yearValue);
    if (!Number.isInteger(year) || year <= 0 || year === this.selectedYear) {
      return;
    }
    this.selectedYear = year;
    this.fetchDashboard();
  }

  resetYear(): void {
    const currentYear = new Date().getFullYear();
    if (this.selectedYear === currentYear) {
      return;
    }
    this.selectedYear = currentYear;
    this.fetchDashboard();
  }

  get customersByMonth(): [string, number][] {
    if (!this.data) return [];
    return Object.entries(this.data.customers.byMonth);
  }

  get netSalesByMonth(): [string, number][] {
    if (!this.data) return [];
    return Object.entries(this.data.netSales.byMonth);
  }

  private buildAvailableYears(referenceYear: number): void {
    const currentYear = new Date().getFullYear();
    const yearsSet = new Set<number>([referenceYear, this.selectedYear]);
    for (let y = currentYear; y >= currentYear - 5; y--) {
      yearsSet.add(y);
    }
    this.availableYears = Array.from(yearsSet).sort((a, b) => b - a);
  }
}

