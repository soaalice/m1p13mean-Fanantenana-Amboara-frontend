import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ModalFormsComponent } from '../../../shared/components/modal-forms/modal-forms.component';
import { Shop } from '../../../shared/models/shop';

@Component({
  selector: 'app-update-shop-photo-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ModalFormsComponent
  ],
  templateUrl: './update-shop-photo-modal.component.html',
  styleUrls: ['./update-shop-photo-modal.component.scss']
})
export class UpdateShopPhotoModalComponent {
  @Input() isOpen = false;
  @Input() shop: Shop | null = null;
  @Input() isSubmitting = false;
  @Input() error = '';

  @Output() close = new EventEmitter<void>();
  @Output() update = new EventEmitter<File>();

  imagePreview: string | null = null;
  selectedFile: File | null = null;

  ngOnChanges(): void {
    if (this.isOpen && this.shop?.photoUrl) {
      this.imagePreview = this.shop.photoUrl;
    } else if (!this.isOpen) {
      this.reset();
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview = this.shop?.photoUrl || null;
    this.selectedFile = null;
  }

  onSubmit(): void {
    if (this.selectedFile) {
      this.update.emit(this.selectedFile);
    }
  }

  onClose(): void {
    this.reset();
    this.close.emit();
  }

  private reset(): void {
    this.imagePreview = null;
    this.selectedFile = null;
  }
}
