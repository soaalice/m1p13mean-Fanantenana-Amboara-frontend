import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProductDetailComponent } from '../../acheteur/product-detail/product-detail.component';
import { MyProductService } from '../../core/services/my-product.service';
import { Product } from '../../shared/models/product';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-boutique-product-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ProductDetailComponent,
    LoaderComponent,
  ],
  templateUrl: './product-preview.component.html',
  styleUrl: './product-preview.component.scss',
})
export class BoutiqueProductPreviewComponent implements OnInit {
  product: Product | null = null;
  isLoading = true;
  loadError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private myProductService: MyProductService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/boutique/my-product']);
      return;
    }

    this.myProductService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Impossible de charger ce produit.';
        this.isLoading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/boutique/my-product']);
  }
}
