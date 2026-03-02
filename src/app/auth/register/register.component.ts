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
import { User, UserRole, UserStatus } from '../../shared/models/user';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  isLoading = false;
  registerForm: FormGroup;
  errorMessage: string = '';

  constructor (
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toast: ToastService,
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.email]],
      tel: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.minLength(10)]],
      login: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const user : User = {
        profile : {
          fullName: this.registerForm.value.fullName,
          email: this.registerForm.value.email,
          tel: this.registerForm.value.tel,
          solde: 0
        },
        login: this.registerForm.value.login,
        password: this.registerForm.value.password,
        role : UserRole.ACHETEUR,
        status : UserStatus.ACTIVE
      }

      this.authService.register(user).subscribe({
        next: () => {
          this.router.navigate(['/login']).then(() => {
            this.toast.success('Votre compte a bien été créé. Connectez-vous pour continuer.', {
              title: 'Inscription réussie',
              duration: 6000,
            });
          });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Registration error:', error);
          const message = error.error?.message || 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
          this.errorMessage = message;
          this.toast.error(message, { title: 'Échec de l\'inscription' });
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
