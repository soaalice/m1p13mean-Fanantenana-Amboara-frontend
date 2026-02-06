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
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;

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

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Login Data:', this.loginForm.value);

      this.authService.login(this.loginForm.value.login, this.loginForm.value.password).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          const role = this.authService.getRoleFromToken();

          switch (role) {
            case UserRole.ADMIN:
              this.router.navigate(['/admin/users']);
              break;
            case UserRole.BOUTIQUE:
              this.router.navigate(['/boutique/dashboard']);
              break;
            case UserRole.ACHETEUR:
              this.router.navigate(['/acheteur/home']);
              break;
            default:
              this.router.navigate(['/login']);
              break;
          }
        },
        error: (error) => {
          console.error('Login error:', error);
        }
      });
    }
  }
}
