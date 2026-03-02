import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { CouponsService } from '../../core/services/coupons.service';
import { Coupon, CreateCouponDto } from '../../shared/models/coupon';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { ListFiltersComponent } from '../../shared/components/list-filters/list-filters.component';
import { AddCouponModalComponent } from './add-coupon-modal/add-coupon-modal.component';

@Component({
  selector: 'app-my-coupon',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatPaginatorModule,
    MatTableModule,
    LoaderComponent,
    ListFiltersComponent,
    AddCouponModalComponent
  ],
  templateUrl: './my-coupon.component.html',
  styleUrl: './my-coupon.component.scss'
})
export class MyCouponComponent implements OnInit {

  displayedColumns = ['code', 'percentage', 'type', 'expiresAt', 'itemsCount'];
  pageSizeOptions = [5, 10, 25];

  coupons: Coupon[] = [];
  isLoading = false;
  loadError = '';
  page = 1;
  limit = 10;
  total = 0;
  isAddModalOpen = false;
  isSubmitting = false;
  submitError = '';

  filterType = '';
  filterStatus = '';

  constructor(private couponsService: CouponsService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;
    this.loadError = '';

    this.couponsService.getMyCoupons(this.page, this.limit, {
      type: this.filterType || undefined,
      status: this.filterStatus || undefined
    }).subscribe({
      next: (result) => {
        this.coupons = result.data;
        this.total = result.pagination?.total ?? result.data.length;
        this.isLoading = false;
      },
      error: (err) => {
        this.loadError = err?.error?.message || 'Impossible de charger les coupons.';
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.fetchData();
  }

  applyFilters(): void {
    this.page = 1;
    this.fetchData();
  }

  resetFilters(): void {
    this.filterType = '';
    this.filterStatus = '';
    this.page = 1;
    this.fetchData();
  }

  openAddModal(): void {
    this.submitError = '';
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
    this.isSubmitting = false;
    this.submitError = '';
  }

  createCoupon(payload: CreateCouponDto): void {
    this.isSubmitting = true;
    this.submitError = '';

    this.couponsService.createCoupon(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeAddModal();
        this.page = 1;
        this.fetchData();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err?.error?.message || 'Impossible de créer le coupon.';
      }
    });
  }

}
