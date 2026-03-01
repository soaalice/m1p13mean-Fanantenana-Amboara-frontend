import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Transaction, TransactionType } from '../../shared/models/transaction';
import { Panier, PanierItemPayload, PanierService } from '../../core/services/panier.service';
import { TransactionsService } from '../../core/services/transactions.service';
import { AuthService } from '../../core/services/auth.service';
import { PaginatedComponent } from '../../shared/base/paginated.component';
import { ListFiltersComponent } from '../../shared/components/list-filters/list-filters.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

export interface PanierShopGroup {
  shopId: string;
  shopName: string;
  items: PanierItemPayload[];
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    ListFiltersComponent,
    LoaderComponent
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent extends PaginatedComponent<Transaction> {
  userId: string | null = null;

  get transactions(): Transaction[] {
    return this.items;
  }

  filterType = '';
  startDate = '';
  endDate = '';
  typeOptions = ['', TransactionType.PURCHASE, TransactionType.RECHARGE, TransactionType.RENT];

  displayedColumns = ['type', 'amount', 'date', 'actions'];

  readonly TransactionType = TransactionType;

  // ── Panier modal state ──────────────────────────────────────────────────
  panierModalOpen = false;
  panierLoading = false;
  panierError = '';
  selectedPanier: Panier | null = null;

  constructor(
    private transactionsService: TransactionsService,
    private authService: AuthService,
    private panierService: PanierService
  ) {
    super();
  }

  override ngOnInit(): void {
    this.userId = this.authService.getCurrentUser()?._id ?? null;
    super.ngOnInit();
  }

  protected fetchData(page = this.page): void {
    this.isLoading = true;
    this.loadError = '';

    if (!this.userId) {
      this.loadError = 'User not found.';
      this.isLoading = false;
      return;
    }

    this.transactionsService.getTransactions(page, this.limit, this.userId, {
      type: this.filterType || undefined,
      startDate: this.startDate || undefined,
      endDate: this.endDate || undefined
    }).subscribe({
      next: (response) => {
        this.applyResponse(response);
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Failed to load transactions.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.fetchData(1);
  }

  resetFilters(): void {
    this.filterType = '';
    this.startDate = '';
    this.endDate = '';
    this.fetchData(1);
  }

  openPanierModal(transaction: Transaction): void {
    if (!transaction._id) return;
    this.panierModalOpen = true;
    this.panierLoading = true;
    this.panierError = '';
    this.selectedPanier = null;

    this.panierService.getByTransactionId(transaction._id).subscribe({
      next: (res) => {
        this.selectedPanier = res.data;
        this.panierLoading = false;
      },
      error: () => {
        this.panierError = 'Aucun panier trouvé pour cette transaction.';
        this.panierLoading = false;
      }
    });
  }

  closePanierModal(): void {
    this.panierModalOpen = false;
    this.selectedPanier = null;
    this.panierError = '';
  }

  get panierSubtotal(): number {
    if (!this.selectedPanier) return 0;
    return this.selectedPanier.items.reduce(
      (sum, item) => sum + item.price * item.qte, 0
    );
  }

  get groupedPanierItems(): PanierShopGroup[] {
    if (!this.selectedPanier) return [];
    const map = new Map<string, PanierShopGroup>();
    for (const item of this.selectedPanier.items) {
      const key = item.shop?._id ?? '__no_shop__';
      if (!map.has(key)) {
        map.set(key, {
          shopId: key,
          shopName: item.shop?.name ?? 'Sans boutique',
          items: [],
        });
      }
      map.get(key)!.items.push(item);
    }
    return Array.from(map.values());
  }

  getShopGroupSubtotal(items: PanierItemPayload[]): number {
    return items.reduce((sum, i) => sum + i.price * i.qte, 0);
  }
}
