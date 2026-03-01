import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UsersService } from '../../core/services/users.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { TransactionsService } from '../../core/services/transactions.service';
import { RechargeModalComponent } from './recharge-modal/recharge-modal.component';
import { User } from '../../shared/models/user';
import { Transaction } from '../../shared/models/transaction';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    RouterModule,
    RechargeModalComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  user: User | null = null;
  transactions: Transaction[] = [];
  isRechargeModalOpen = false;
  isRecharging = false;
  rechargeError = '';

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private sidebarService: SidebarService,
    private transactionsService: TransactionsService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(u => {
      this.user = u;
      if (u?._id) this.loadRecentTransactions();
    });
    this.authService.refreshCurrentUser();
  }

  private loadRecentTransactions(): void {
    if (!this.user?._id) return;
    this.transactionsService.getTransactions(1, 3, this.user._id).subscribe({
      next: res => {
        this.transactions = res.data || [];
      },
      error: () => {
        this.transactions = [];
      }
    });
  }

  openRechargeModal(): void {
    this.sidebarService.requestCloseSidebar();
    this.isRechargeModalOpen = true;
    this.rechargeError = '';
  }

  closeRechargeModal(): void {
    this.isRechargeModalOpen = false;
    this.isRecharging = false;
    this.rechargeError = '';
  }

  submitRecharge(amount: number): void {
    if (!this.user?._id || this.isRecharging) {
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    this.isRecharging = true;
    this.rechargeError = '';

    this.usersService.rechargeUserSolde(this.user._id, amount).subscribe({
      next: response => {
        this.authService.updateCurrentUser(response.data);
        this.isRecharging = false;
        this.closeRechargeModal();
        this.loadRecentTransactions();
      },
      error: () => {
        this.isRecharging = false;
        this.rechargeError = 'Failed to recharge balance.';
      }
    });
  }
}
