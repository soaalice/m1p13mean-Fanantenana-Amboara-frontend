import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { Product } from '../../shared/models/product';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CartModalComponent } from '../../shared/components/cart-modal/cart-modal.component';
import { MyProductService } from '../../core/services/my-product.service';
import { CartService } from '../../core/services/cart.service';

interface ProductWithImage extends Product {
  imageUrl: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, CartModalComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit {
  products: ProductWithImage[] = [];
  cartOpen = false;
  cartCount$ = this.cartService.items$.pipe(
    map(items => items.reduce((acc, i) => acc + (i.qte || 0), 0))
  );

  constructor(
    private myProductService: MyProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(page = 1, limit = 12): void {
    this.myProductService.getProducts(page, limit).subscribe({
      next: (res) => {
        // map backend photoUrl to imageUrl used by product-card (use empty string when missing)
        this.products = res.data.map(p => ({ ...p, imageUrl: (p as any).photoUrl ?? '' }));
      },
      error: (err) => {
        console.error('Failed to load products:', err);
      }
    });
  }

  openCart() {
    this.cartOpen = true;
  }
}
