import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../core/services/auth.service';
import { ShopsService } from '../../core/services/shops.service';
import { Shop } from '../../shared/models/shop';
import { Transaction, TransactionType } from '../../shared/models/transaction';
import { TransactionsService } from '../../core/services/transactions.service';
import { ListFiltersComponent } from '../../shared/components/list-filters/list-filters.component';

interface ShopResponse {
  success: boolean;
  data: Shop | Shop[] | null;
}

@Component({
  selector: 'app-my-shop',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    ListFiltersComponent
  ],
  templateUrl: './my-shop.component.html',
  styleUrl: './my-shop.component.scss'
})
export class MyShopComponent implements OnInit {
  shop: Shop | null = null;
  isLoading = false;
  loadError: string | null = null;
  currentUserId: string | null = null;

  transactionHistory: Transaction[] = [];
  isLoadingTransactions = false;
  loadTransactionsError: string | null = null;
  transactionsPage = 1;
  transactionsLimit = 5;
  transactionsTotal = 0;
  transactionsPages = 1;
  pageSizeOptions = [5, 10, 25];
  startDateFilter = '';
  endDateFilter = '';
  displayedColumns: string[] = ['date', 'amount', 'type'];

  constructor(
    private authService: AuthService,
    private shopsService: ShopsService,
    private transactionsService: TransactionsService
  ) {}

  ngOnInit(): void {
    this.fetchShop();
  }

  fetchShop(): void {
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?._id ?? null;
    const ownerId = this.currentUserId;

    if (!ownerId) {
      this.loadError = 'Impossible de recuperer le compte utilisateur.';
      return;
    }

    this.isLoading = true;
    this.shopsService.getShopByOwner(ownerId).subscribe({
      next: response => {
        const payload = this.unwrapResponse(response);
        this.shop = this.normalizeShop(payload);
        if (this.shop?.activeRent?._id) {
          this.fetchRentTransactions(1);
        } else {
          this.transactionHistory = [];
          this.transactionsTotal = 0;
        }
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Erreur lors du chargement de la boutique.';
        this.isLoading = false;
      }
    });
  }

  fetchRentTransactions(page = this.transactionsPage): void {
    if (!this.currentUserId) {
      this.loadTransactionsError = 'Impossible de recuperer les transactions.';
      return;
    }

    const rentId = this.shop?.activeRent?._id;
    if (!rentId) {
      this.transactionHistory = [];
      this.transactionsTotal = 0;
      this.isLoadingTransactions = false;
      return;
    }

    this.isLoadingTransactions = true;
    this.loadTransactionsError = null;

    this.transactionsService.getTransactions(page, this.transactionsLimit, this.currentUserId, {
      type: TransactionType.RENT,
      startDate: this.startDateFilter || undefined,
      endDate: this.endDateFilter || undefined,
      rentId
    }).subscribe({
      next: (response) => {
        this.transactionHistory = response.data ?? [];
        this.transactionsPage = response.pagination?.page ?? page;
        this.transactionsLimit = response.pagination?.limit ?? this.transactionsLimit;
        this.transactionsTotal = response.pagination?.total ?? this.transactionHistory.length;
        this.transactionsPages = response.pagination?.pages ?? 1;
        this.isLoadingTransactions = false;
      },
      error: () => {
        this.loadTransactionsError = 'Erreur lors du chargement des transactions de loyer.';
        this.isLoadingTransactions = false;
      }
    });
  }

  applyTransactionFilters(): void {
    this.fetchRentTransactions(1);
  }

  resetTransactionFilters(): void {
    this.startDateFilter = '';
    this.endDateFilter = '';
    this.fetchRentTransactions(1);
  }

  onTransactionsPageChange(event: PageEvent): void {
    this.transactionsLimit = event.pageSize;
    this.fetchRentTransactions(event.pageIndex + 1);
  }

  trackById(index: number, item: Transaction): string | number {
    return item._id ?? index;
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
