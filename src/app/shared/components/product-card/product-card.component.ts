import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() imageUrl: string = '';

  getDiscountedPrice(): number {
    if (this.product.promotion?.active && this.product.promotion?.reduction) {
      return this.product.price * (1 - this.product.promotion.reduction / 100);
    }
    return this.product.price;
  }

  hasPromotion(): boolean {
    return !!(this.product.promotion?.active && (this.product.promotion?.reduction ?? 0) > 0);
  }

  onAddToCart(): void {
    console.log('Add to cart:', this.product);
    // TODO: Implement add to cart functionality
  }
}
