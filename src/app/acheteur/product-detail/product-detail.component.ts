import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { MyProduct, Product } from '../../shared/models/product';
import { MyProductService } from '../../core/services/my-product.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  /** Pass a product directly to skip route loading (boutique preview mode) */
  @Input() set previewData(p: Product | MyProduct | null) {
    if (p) {
      this.product = p as Product;
      this.isLoading = false;
    }
  }
  /** When true: hides breadcrumb, cart section, and shows a close button */
  @Input() previewMode = false;
  @Output() closed = new EventEmitter<void>();

  product: Product | null = null;
  isLoading = true;
  loadError = '';
  quantity = 1;
  addedToCart = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private myProductService: MyProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    if (this.previewMode) return; // product supplied via @Input(), skip route
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/acheteur/product']);
      return;
    }
    this.fetchProduct(id);
  }

  fetchProduct(id: string): void {
    this.isLoading = true;
    this.loadError = '';

    this.myProductService.getProductById(id).subscribe({
      next: product => {
        this.product = product;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Impossible de charger ce produit.';
        this.isLoading = false;
      }
    });
  }

  get attributeEntries(): { key: string; value: unknown }[] {
    if (!this.product?.attributes) return [];
    return Object.entries(this.product.attributes).map(([key, value]) => ({ key, value }));
  }

  get discountedPrice(): number {
    if (!this.product) return 0;
    if (this.product.promotion?.active && (this.product.promotion?.reduction ?? 0) > 0) {
      return this.product.price * (1 - (this.product.promotion.reduction ?? 0) / 100);
    }
    return this.product.price;
  }

  get hasPromotion(): boolean {
    return !!(this.product?.promotion?.active && (this.product.promotion?.reduction ?? 0) > 0);
  }

  incrementQty(): void {
    if (!this.product) return;
    if (this.quantity < this.product.stock) this.quantity++;
  }

  decrementQty(): void {
    if (this.quantity > 1) this.quantity--;
  }

  addToCart(): void {
    if (!this.product || this.product.stock === 0) return;
    this.cartService.addItem({
      produitId: this.product._id,
      nom: this.product.name,
      prix: this.discountedPrice,
      qte: 1,
      shop: this.product.shop
        ? { _id: this.product.shop._id, name: this.product.shop.name }
        : undefined,
    }, this.quantity);
    this.addedToCart = true;
    setTimeout(() => (this.addedToCart = false), 2500);
  }

  goBack(): void {
    this.router.navigate(['/acheteur/product']);
  }
}
