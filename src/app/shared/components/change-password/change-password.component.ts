import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoaderComponent } from '../loader/loader.component';
import { UsersService } from '../../../core/services/users.service';
import { ToastService } from '../../../core/services/toast.service';

const passwordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const newPwd = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return newPwd && confirm && newPwd !== confirm ? { passwordsMismatch: true } : null;
};

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    LoaderComponent
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
  isLoading = false;
  form: FormGroup;

  hideOld = true;
  hideNew = true;
  hideConfirm = true;

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private toast: ToastService
  ) {
    this.form = this.fb.group(
      {
        oldPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^\S+$/)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: passwordsMatchValidator }
    );
  }

  get newPasswordErrors() {
    return this.form.get('newPassword')?.errors;
  }

  /** 1 = weak, 2 = fair, 3 = good, 4 = strong */
  get passwordStrength(): number {
    const val: string = this.form.get('newPassword')?.value ?? '';
    if (!val) return 0;
    let score = 0;
    if (val.length >= 6)  score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) || /[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    return Math.min(score, 4) || 1;
  }

  get strengthLabel(): string {
    return ['', 'Faible', 'Moyen', 'Bon', 'Fort'][this.passwordStrength] ?? '';
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.usersService.changePassword(this.form.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toast.success(res.message || 'Mot de passe changé avec succès');
        this.form.reset();
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.message || 'Erreur lors du changement de mot de passe';
        this.toast.error(msg);
      }
    });
  }
}
