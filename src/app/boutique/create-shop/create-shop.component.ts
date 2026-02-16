import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ShopsService } from '../../core/services/shops.service';

@Component({
  selector: 'app-create-shop',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './create-shop.component.html',
  styleUrl: './create-shop.component.scss'
})
export class CreateShopComponent {
  isSubmitting = false;
  submitError = '';

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]]
  });

  constructor(
    private fb: FormBuilder,
    private shopsService: ShopsService,
    private router: Router
  ) {}

  submit(): void {
    this.submitError = '';
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const payload = {
      name: this.form.value.name?.trim()
    };

    this.shopsService.createShop(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/boutique/my-shop']);
      },
      error: () => {
        this.submitError = 'Erreur lors de la creation de la boutique';
        this.isSubmitting = false;
      }
    });
  }

}
