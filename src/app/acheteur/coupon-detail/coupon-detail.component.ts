import { Component, OnInit } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule }    from '@angular/material/icon';
import { MatButtonModule }  from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CouponsService }   from '../../core/services/coupons.service';
import { CouponDetails }    from '../../shared/models/coupon';
import { Product }          from '../../shared/models/product';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-coupon-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ProductCardComponent,
  ],
  templateUrl: './coupon-detail.component.html',
  styleUrl: './coupon-detail.component.scss',
})
export class CouponDetailComponent implements OnInit {

  coupon: CouponDetails | null = null;
  isLoading = true;
  loadError = '';
  copiedCode = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private couponsService: CouponsService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/acheteur/coupons']);
      return;
    }
    this.fetchDetails(id);
  }

  private fetchDetails(id: string): void {
    this.isLoading = true;
    this.loadError  = '';

    this.couponsService.getDetails(id).subscribe({
      next: data => {
        this.coupon    = data;
        this.isLoading = false;
      },
      error: () => {
        this.loadError  = 'Impossible de charger les détails de ce coupon.';
        this.isLoading  = false;
      },
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  get products(): Product[] {
    return (this.coupon?.items ?? []) as Product[];
  }

  get daysLeft(): number {
    if (!this.coupon) return 0;
    const diff = new Date(this.coupon.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  get isExpiringSoon(): boolean {
    return this.daysLeft <= 3;
  }

  get expiryLabel(): string {
    if (this.daysLeft === 0) return "Expire aujourd'hui";
    if (this.daysLeft === 1) return 'Expire demain';
    return `${this.daysLeft} jours restants`;
  }

  copyCode(): void {
    if (!this.coupon) return;
    navigator.clipboard.writeText(this.coupon.code).then(() => {
      this.copiedCode = true;
      setTimeout(() => (this.copiedCode = false), 2000);
    });
  }

  goBack(): void {
    this.router.navigate(['/acheteur/coupons']);
  }
}
