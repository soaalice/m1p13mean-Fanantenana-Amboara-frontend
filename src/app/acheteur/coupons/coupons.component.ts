import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CouponsService } from '../../core/services/coupons.service';
import { Coupon } from '../../shared/models/coupon';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { CouponCardComponent } from './coupon-card/coupon-card.component';

@Component({
  selector: 'app-coupons',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    LoaderComponent,
    CouponCardComponent
  ],
  templateUrl: './coupons.component.html',
  styleUrl: './coupons.component.scss'
})
export class CouponsComponent implements OnInit, OnDestroy, AfterViewInit {
  coupons: Coupon[] = [];
  isLoading = false;
  isLoadingMore = false;
  loadError = '';

  // Pagination (internal)
  private currentPage = 1;
  private totalPages = 1;
  private readonly pageLimit = 12;

  get hasMorePages(): boolean {
    return this.currentPage < this.totalPages;
  }

  // Infinite scroll
  @ViewChild('scrollSentinel') scrollSentinel!: ElementRef;
  private observer: IntersectionObserver | null = null;

  copiedCode: string | null = null;
  private copyTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private couponsService: CouponsService) {}

  ngOnInit(): void {
    this.fetchData(1);
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.copyTimeout) clearTimeout(this.copyTimeout);
    this.observer?.disconnect();
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry.isIntersecting && this.hasMorePages && !this.isLoading && !this.isLoadingMore) {
        this.fetchData(this.currentPage + 1);
      }
    }, { threshold: 0.1 });

    if (this.scrollSentinel?.nativeElement) {
      this.observer.observe(this.scrollSentinel.nativeElement);
    }
  }

  fetchData(page = 1): void {
    if (page === 1) {
      this.isLoading = true;
    } else {
      this.isLoadingMore = true;
    }
    this.loadError = '';

    this.couponsService.getActiveCoupons(page, this.pageLimit).subscribe({
      next: (result) => {
        const now = new Date();
        const fresh = result.data.filter((coupon) => new Date(coupon.expiresAt) >= now);

        if (page === 1) {
          this.coupons = fresh;
        } else {
          this.coupons = [...this.coupons, ...fresh];
        }

        this.currentPage = result.pagination?.page ?? page;
        this.totalPages = result.pagination?.pages ?? 1;
        this.isLoading = false;
        this.isLoadingMore = false;
      },
      error: (err) => {
        this.loadError = err?.error?.message || 'Impossible de charger les coupons actifs.';
        this.isLoading = false;
        this.isLoadingMore = false;
      }
    });
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.copiedCode = code;
      if (this.copyTimeout) clearTimeout(this.copyTimeout);
      this.copyTimeout = setTimeout(() => { this.copiedCode = null; }, 2000);
    });
  }

}
