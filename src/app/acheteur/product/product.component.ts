import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../shared/models/product';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { MyProductService } from '../../core/services/my-product.service';

interface ProductWithImage extends Product {
  imageUrl: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit {
  products: ProductWithImage[] = [];
  isLoading = true;
  searchQuery = '';

  get filteredProducts(): ProductWithImage[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.products;
    return this.products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.shop?.name ?? '').toLowerCase().includes(q)
    );
  }

  get skeletons(): number[] {
    return Array.from({ length: 8 }, (_, i) => i);
  }

  constructor(private myProductService: MyProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(page = 1, limit = 24): void {
    this.isLoading = true;
    this.myProductService.getProducts(page, limit).subscribe({
      next: (res) => {
        this.products = res.data.map(p => ({ ...p, imageUrl: (p as any).photoUrl ?? '' }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
