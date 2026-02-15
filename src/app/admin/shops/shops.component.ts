import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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

  displayedColumns = ['name', 'status'];

  constructor(private shopsService: ShopsService) {
    super();
  }

  protected fetchData(page = this.page): void {
      this.isLoading = true;
      this.loadError = '';

      this.shopsService.getShops(page, this.limit).subscribe({
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

  getStatusClass(status: string): string {
    return status === 'ACTIVE' ? 'status-active' : 'status-inactive';
  }
}
