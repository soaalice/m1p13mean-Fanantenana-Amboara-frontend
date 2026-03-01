import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DashboardService } from '../../core/services/dashboard.service';
import { AdminDashboardData } from '../../shared/models/dashboard';
import { DashboardCardComponent } from '../../shared/components/dashboard-card/dashboard-card.component';
import { DashboardGraphComponent } from '../../shared/components/dashboard-graph/dashboard-graph.component';
import { ListFiltersComponent } from '../../shared/components/list-filters/list-filters.component';
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
    ListFiltersComponent,
    LoaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  isLoading = false;
  isNetSalesLoading = false;
  loadError = '';
  data: AdminDashboardData | null = null;
  selectedNetSalesYear = new Date().getFullYear();
  netSalesYears: number[] = [];

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
        this.selectedNetSalesYear = response.netSales.year;
        this.ensureNetSalesYears(response.netSales.year);
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Impossible de charger les statistiques admin.';
        this.isLoading = false;
      }
    });
  }

  get boxStates(): [string, number][] {
    return Object.entries(this.data?.boxes.byState ?? {});
  }

  get userRoles(): [string, number][] {
    return Object.entries(this.data?.users.byRole ?? {});
  }

  get netSales(): [string, number][] {
    return Object.entries(this.data?.netSales.byPeriode ?? {});
  }

  onNetSalesYearChange(yearValue: string): void {
    const year = Number(yearValue);

    if (!Number.isInteger(year) || year <= 0 || year === this.selectedNetSalesYear) {
      return;
    }

    this.selectedNetSalesYear = year;
    this.fetchNetSalesByYear(year);
  }

  resetNetSalesYear(): void {
    const currentYear = new Date().getFullYear();

    if (this.selectedNetSalesYear === currentYear) {
      return;
    }

    this.selectedNetSalesYear = currentYear;
    this.ensureNetSalesYears(currentYear);
    this.fetchNetSalesByYear(currentYear);
  }

  private fetchNetSalesByYear(year: number): void {
    this.isNetSalesLoading = true;
    this.loadError = '';

    this.dashboardService.getAdminNetSales(year).subscribe({
      next: netSales => {
        if (!this.data) {
          this.isNetSalesLoading = false;
          return;
        }

        this.data = {
          ...this.data,
          netSales
        };

        this.selectedNetSalesYear = netSales.year;
        this.ensureNetSalesYears(netSales.year);
        this.isNetSalesLoading = false;
      },
      error: () => {
        this.loadError = 'Impossible de charger les ventes nettes pour cette année.';
        this.isNetSalesLoading = false;
      }
    });
  }

  private ensureNetSalesYears(referenceYear: number): void {
    const currentYear = new Date().getFullYear();
    const yearsSet = new Set<number>([referenceYear, this.selectedNetSalesYear]);

    for (let year = currentYear; year >= currentYear - 5; year--) {
      yearsSet.add(year);
    }

    this.netSalesYears = Array.from(yearsSet).sort((firstYear, secondYear) => secondYear - firstYear);
  }
}
