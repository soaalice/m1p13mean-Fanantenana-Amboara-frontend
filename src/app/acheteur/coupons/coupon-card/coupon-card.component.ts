import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Coupon } from '../../../shared/models/coupon';

@Component({
  selector: 'app-coupon-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  templateUrl: './coupon-card.component.html',
  styleUrl: './coupon-card.component.scss'
})
export class CouponCardComponent {
  @Input({ required: true }) coupon!: Coupon;
  @Input() copiedCode: string | null = null;
  @Output() codeCopied = new EventEmitter<string>();

  get daysLeft(): number {
    const diff = new Date(this.coupon.expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  get isExpiringSoon(): boolean {
    return this.daysLeft <= 3;
  }

  get isCopied(): boolean {
    return this.copiedCode === this.coupon.code;
  }

  copyCode(): void {
    this.codeCopied.emit(this.coupon.code);
  }
}
