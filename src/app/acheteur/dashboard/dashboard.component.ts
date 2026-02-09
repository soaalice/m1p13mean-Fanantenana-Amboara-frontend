import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { UsersService } from '../../core/services/users.service';
import { ModalFormsComponent } from '../../shared/components/modal-forms/modal-forms.component';
import { User } from '../../shared/models/user';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    ModalFormsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  isRechargeModalOpen = false;
  isRecharging = false;
  rechargeError = '';

  rechargeForm = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  openRechargeModal(): void {
    this.isRechargeModalOpen = true;
    this.rechargeError = '';
    this.rechargeForm.reset({ amount: null });
  }

  closeRechargeModal(): void {
    this.isRechargeModalOpen = false;
    this.isRecharging = false;
    this.rechargeError = '';
    this.rechargeForm.reset({ amount: null });
  }

  submitRecharge(): void {
    if (!this.user?._id || this.rechargeForm.invalid || this.isRecharging) {
      this.rechargeForm.markAllAsTouched();
      return;
    }

    const amount = Number(this.rechargeForm.getRawValue().amount ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      this.rechargeForm.markAllAsTouched();
      return;
    }

    this.isRecharging = true;
    this.rechargeError = '';

    this.usersService.rechargeUserSolde(this.user._id, amount).subscribe({
      next: response => {
        this.user = response.data;
        localStorage.setItem('currentUser', JSON.stringify(response.data));
        this.isRecharging = false;
        this.closeRechargeModal();
      },
      error: () => {
        this.isRecharging = false;
        this.rechargeError = 'Failed to recharge balance.';
      }
    });
  }
}
