import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ListFiltersComponent } from '../../shared/components/list-filters/list-filters.component';
import { PaginatedComponent } from '../../shared/base/paginated.component';
import { Shop } from '../../shared/models/shop';
import { ShopsService } from '../../core/services/shops.service';

@Component({
  selector: 'app-shops',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    ListFiltersComponent
  ],
  templateUrl: './shops.component.html',
  styleUrl: './shops.component.scss'
})
export class ShopsComponent extends PaginatedComponent<Shop> {

  get shops(): Shop[] {
    return this.items;
  }

  displayedColumns = ['name', 'ownerFullName', 'status'];
  statusOptions = ['ACTIVE', 'INACTIVE'];
  statusFilter = '';
  ownerNameFilter = '';

  constructor(private shopsService: ShopsService) {
    super();
  }

  protected fetchData(page = this.page): void {
      this.isLoading = true;
      this.loadError = '';

      const filters: { ownerFullName?: string; status?: string } = {};

      if (this.ownerNameFilter) {
        filters.ownerFullName = this.ownerNameFilter.trim();
      }

      if (this.statusFilter) {
        filters.status = this.statusFilter;
      }

      this.shopsService.searchShops(
        page,
        this.limit,
        filters
      ).subscribe({
        next: (result) => {
          this.applyResponse(result);
          this.isLoading = false;
        },
        error: () => {
          this.loadError = 'Erreur lors du chargement des boutiques';
          this.isLoading = false;
        }
      });
  }

  resetFilters(): void {
    this.statusFilter = '';
    this.ownerNameFilter = '';
    this.fetchData(1);
  }

  getStatusClass(status: string): string {
    return status === 'ACTIVE' ? 'status-active' : 'status-inactive';
  }

  getOwnerFullName(shop: Shop): string {
    return shop.ownerUser?.profile?.fullName || 'N/A';
  }
}
