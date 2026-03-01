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
  private static readonly MAX_PHOTO_SIZE = 5 * 1024 * 1024;

  isSubmitting = false;
  submitError = '';
  imageError = '';
  selectedPhotoFile: File | null = null;
  imagePreview: string | null = null;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]]
  });

  constructor(
    private fb: FormBuilder,
    private shopsService: ShopsService,
    private router: Router
  ) {}

  onImageSelected(event: Event): void {
    this.imageError = '';
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.imageError = 'Please select an image file.';
      return;
    }
    if (file.size > CreateShopComponent.MAX_PHOTO_SIZE) {
      this.imageError = 'Image size should be less than 5 MB.';
      return;
    }

    this.selectedPhotoFile = file;
    const reader = new FileReader();
    reader.onload = (e) => this.imagePreview = e.target?.result as string;
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedPhotoFile = null;
    this.imagePreview = null;
  }

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

    this.shopsService.createShop(payload, this.selectedPhotoFile || undefined).subscribe({
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
