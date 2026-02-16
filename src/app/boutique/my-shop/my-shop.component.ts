import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../core/services/auth.service';
import { ShopsService } from '../../core/services/shops.service';
import { Shop } from '../../shared/models/shop';

interface ShopResponse {
  success: boolean;
  data: Shop | Shop[] | null;
}

@Component({
  selector: 'app-my-shop',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './my-shop.component.html',
  styleUrl: './my-shop.component.scss'
})
export class MyShopComponent implements OnInit {
  shop: Shop | null = null;
  isLoading = false;
  loadError: string | null = null;

  constructor(
    private authService: AuthService,
    private shopsService: ShopsService
  ) {}

  ngOnInit(): void {
    this.fetchShop();
  }

  fetchShop(): void {
    const currentUser = this.authService.getCurrentUser();
    const ownerId = currentUser?._id;

    if (!ownerId) {
      this.loadError = 'Impossible de recuperer le compte utilisateur.';
      return;
    }

    this.isLoading = true;
    this.shopsService.getShopByOwner(ownerId).subscribe({
      next: response => {
        const payload = this.unwrapResponse(response);
        this.shop = this.normalizeShop(payload);
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Erreur lors du chargement de la boutique.';
        this.isLoading = false;
      }
    });
  }

  private unwrapResponse(response: Shop | Shop[] | null | ShopResponse): Shop | Shop[] | null {
    if (response && typeof response === 'object' && 'success' in response) {
      return (response as ShopResponse).data ?? null;
    }

    return response as Shop | Shop[] | null;
  }

  private normalizeShop(response: Shop | Shop[] | null): Shop | null {
    if (!response) {
      return null;
    }

    if (Array.isArray(response)) {
      return response.length > 0 ? response[0] : null;
    }

    return response;
  }
}
