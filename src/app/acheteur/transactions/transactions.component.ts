import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Transaction } from '../../shared/models/transaction';
import { TransactionsService } from '../../core/services/transactions.service';
import { AuthService } from '../../core/services/auth.service';

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
export class TransactionsComponent implements OnInit {
  userId: string | null = null;
  transactions: Transaction[] = [];
  isLoading = false;
  loadError = '';

  page = 1;
  limit = 10;
  total = 0;
  pages = 1;

  displayedColumns = ['type', 'amount', 'date'];
  pageSizeOptions = [5, 10, 25];

  constructor(private transactionsService: TransactionsService, private authService: AuthService) {}

  ngOnInit(): void {
    this.userId = this.authService.getCurrentUser()?._id ?? null;
    this.loadTransactions();
  }

  loadTransactions(page = this.page): void {
    this.isLoading = true;
    this.loadError = '';

    if (!this.userId) {
      this.loadError = 'User not found.';
      this.isLoading = false;
      return;
    }

    this.transactionsService.getTransactions(page, this.limit, this.userId).subscribe({
      next: (response) => {
        this.transactions = response.data ?? [];
        this.page = response.pagination?.page ?? page;
        this.limit = response.pagination?.limit ?? this.limit;
        this.total = response.pagination?.total ?? this.transactions.length;
        this.pages = response.pagination?.pages ?? 1;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Failed to load transactions.';
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.limit = event.pageSize;
    this.loadTransactions(event.pageIndex + 1);
  }

  trackById(index: number, transaction: Transaction): string | number {
    return transaction._id ?? index;
  }
}
