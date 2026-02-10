import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Transaction } from '../../shared/models/transaction';
import { TransactionsService } from '../../core/services/transactions.service';
import { AuthService } from '../../core/services/auth.service';
import { PaginatedComponent } from '../../shared/base/paginated.component';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent extends PaginatedComponent<Transaction> {
  userId: string | null = null;

  // Alias pour items du parent
  get transactions(): Transaction[] {
    return this.items;
  }

  displayedColumns = ['type', 'amount', 'date'];

  constructor(
    private transactionsService: TransactionsService, 
    private authService: AuthService
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

    this.transactionsService.getTransactions(page, this.limit, this.userId).subscribe({
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
}
