import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../shared/models/product';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { MyProductService } from '../../core/services/my-product.service';

interface ProductWithImage extends Product {
  imageUrl: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit {
  products: ProductWithImage[] = [];

  constructor(private myProductService: MyProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(page = 1, limit = 12): void {
    this.myProductService.getProducts(page, limit).subscribe({
      next: (res) => {
        this.products = res.data.map(p => ({ ...p, imageUrl: (p as any).photoUrl ?? '' }));
      },
      error: (err) => {
        console.error('Failed to load products:', err);
      }
    });
  }
}
