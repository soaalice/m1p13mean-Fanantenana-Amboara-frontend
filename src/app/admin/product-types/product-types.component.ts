import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ProductType } from '../../shared/models/product-type';
import { PaginatedComponent } from '../../shared/base/paginated.component';
import { ProductTypesService } from '../../core/services/product-types.service';

@Component({
  selector: 'app-product-types',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatButtonModule],
  templateUrl: './product-types.component.html',
  styleUrl: './product-types.component.scss'
})
export class ProductTypesComponent extends PaginatedComponent<ProductType> {
  displayedColumns = ['label'];

  get productTypes(): ProductType[] {
    return this.items;
  }

  constructor(private productTypesService: ProductTypesService) {
    super();
  }

  protected fetchData(page = this.page): void {
    this.isLoading = true;
    this.loadError = '';

    this.productTypesService.getProductTypes(page, this.limit).subscribe({
      next: response => {
        this.applyResponse(response);
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Failed to load product types.';
        this.isLoading = false;
      }
    });
  }


}
