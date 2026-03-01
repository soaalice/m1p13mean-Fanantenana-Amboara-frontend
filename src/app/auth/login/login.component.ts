import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../shared/models/user';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    LoaderComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isLoading = false;
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      login: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  private static readonly ROLE_ROUTES: Record<string, string> = {
    [UserRole.ADMIN]: '/admin',
    [UserRole.BOUTIQUE]: '/boutique',
    [UserRole.ACHETEUR]: '/acheteur',
  };

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authService.login(this.loginForm.value.login, this.loginForm.value.password).subscribe({
        next: () => {
          const role = this.authService.getRoleFromToken();
          const route = role ? LoginComponent.ROLE_ROUTES[role] : null;
          this.router.navigate([route ?? '/login']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'An error occurred during login. Please try again.';
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
