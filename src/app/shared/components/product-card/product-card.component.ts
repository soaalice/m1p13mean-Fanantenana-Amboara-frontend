import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() imageUrl: string = '';
  /** Optional base route for the detail link, e.g. '/acheteur/product' */
  @Input() detailBasePath: string = '/acheteur/product';

  constructor(private cartService: CartService) {}

  getAttributeEntries(): Array<{ key: string; value: any }> {
    if (!this.product.attributes) return [];
    return Object.entries(this.product.attributes).map(([key, value]) => ({ key, value }));
  }

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
    if (this.product.stock === 0) return;
    const item = {
      produitId: (this.product._id || '').toString(),
      nom: this.product.name || 'Produit',
      prix: this.getDiscountedPrice(),
      qte: 1,
      shop: this.product.shop
        ? { _id: this.product.shop._id, name: this.product.shop.name }
        : undefined,
    };
    this.cartService.addItem(item, 1);
    console.log('Added to cart:', item);
  }
}
