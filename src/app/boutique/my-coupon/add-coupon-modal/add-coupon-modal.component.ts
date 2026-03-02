import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ModalFormsComponent } from '../../../shared/components/modal-forms/modal-forms.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { MyProductService } from '../../../core/services/my-product.service';
import { MyProduct } from '../../../shared/models/product';
import { CreateCouponDto } from '../../../shared/models/coupon';

@Component({
  selector: 'app-add-coupon-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    ModalFormsComponent,
    LoaderComponent
  ],
  templateUrl: './add-coupon-modal.component.html',
  styleUrl: './add-coupon-modal.component.scss'
})
export class AddCouponModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isSubmitting = false;
  @Input() submitError = '';

  @Output() close = new EventEmitter<void>();
  @Output() submitCoupon = new EventEmitter<CreateCouponDto>();

  displayedColumns: string[] = ['select', 'name', 'price', 'stock'];
  pageSizeOptions: number[] = [5, 10, 25];

  code = '';
  expiresAt = new Date().toISOString().split('T')[0];
  percentage = 10;
  type: 'PACK' | 'SINGLE' = 'SINGLE';

  products: MyProduct[] = [];
  productsLoading = false;
  productsLoadError = '';
  productsPage = 1;
  productsLimit = 5;
  productsTotal = 0;

  private selectedProductsMap = new Map<string, { _id: string; name: string }>();

  constructor(private myProductService: MyProductService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue === true && !changes['isOpen']?.firstChange) {
      this.resetForm();
      this.fetchProducts();
    }

    if (changes['isOpen']?.firstChange && this.isOpen) {
      this.fetchProducts();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onProductsPageChange(event: PageEvent): void {
    this.productsPage = event.pageIndex + 1;
    this.productsLimit = event.pageSize;
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.productsLoading = true;
    this.productsLoadError = '';

    this.myProductService.getMyProduct(this.productsPage, this.productsLimit).subscribe({
      next: (result) => {
        this.products = result.data;
        this.productsTotal = result.pagination?.total ?? result.data.length;
        this.productsLoading = false;
      },
      error: (err) => {
        this.productsLoadError = err?.error?.message || 'Impossible de charger les produits.';
        this.productsLoading = false;
      }
    });
  }

  toggleProduct(product: MyProduct): void {
    if (this.selectedProductsMap.has(product._id)) {
      this.selectedProductsMap.delete(product._id);
      return;
    }

    this.selectedProductsMap.set(product._id, { _id: product._id, name: product.name });
  }

  isSelected(productId: string): boolean {
    return this.selectedProductsMap.has(productId);
  }

  get selectedCount(): number {
    return this.selectedProductsMap.size;
  }

  get canSubmit(): boolean {
    const code = this.code.trim();
    const percentageIsValid = this.percentage >= 1 && this.percentage <= 100;
    return !!code && !!this.expiresAt && percentageIsValid && !this.isSubmitting;
  }

  onSubmit(): void {
    if (!this.canSubmit) {
      return;
    }

    const payload: CreateCouponDto = {
      code: this.code.trim().toUpperCase(),
      expiresAt: this.expiresAt,
      percentage: Number(this.percentage),
      type: this.type,
      items: Array.from(this.selectedProductsMap.values())
    };

    this.submitCoupon.emit(payload);
  }

  private resetForm(): void {
    this.code = '';
    this.expiresAt = new Date().toISOString().split('T')[0];
    this.percentage = 10;
    this.type = 'SINGLE';
    this.products = [];
    this.productsPage = 1;
    this.productsLimit = 5;
    this.productsTotal = 0;
    this.productsLoadError = '';
    this.selectedProductsMap.clear();
  }
}
