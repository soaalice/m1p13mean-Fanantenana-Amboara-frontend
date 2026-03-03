import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ModalFormsComponent } from '../../../shared/components/modal-forms/modal-forms.component';

@Component({
  selector: 'app-create-product-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule,
    ModalFormsComponent
  ],
  templateUrl: './create-product-modal.component.html',
  styleUrls: ['./create-product-modal.component.scss']
})
export class CreateProductModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() isEditMode = false;
  @Input() isSubmitting = false;
  @Input() submitError = '';

  @Input() productForm!: FormGroup;
  @Input() attributesForm!: FormGroup;
  @Input() productTypes: any[] = [];
  @Input() selectedProductType: any = null;
  @Input() statusOptions: string[] = [];
  @Input() nonBooleanAttributes: any[] = [];
  @Input() booleanAttributes: any[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() productTypeChange = new EventEmitter<string>();
  @Output() submit = new EventEmitter<void>();
  @Output() imageChange = new EventEmitter<File | null>();

  imagePreview: string | null = null;
  selectedFile: File | null = null;

  emitProductTypeChange(value: string) {
    this.productTypeChange.emit(value);
  }

  emitSubmit() {
    this.submit.emit();
  }

  emitClose() {
    this.close.emit();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image valide.');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille de l\'image doit être inférieure à 5MB.');
        return;
      }

      // Store the file
      this.selectedFile = file;
      this.imageChange.emit(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview = null;
    this.selectedFile = null;
    this.imageChange.emit(null);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Réinitialiser le preview seulement quand le modal se ferme
    if (changes['isOpen'] && changes['isOpen'].previousValue === true && !this.isOpen) {
      this.imagePreview = null;
      this.selectedFile = null;
    }
    
    // En mode édition, charger la photo existante si disponible
    if (changes['isEditMode'] && this.isEditMode && this.productForm?.get('photoUrl')?.value) {
      this.imagePreview = this.productForm.get('photoUrl')?.value;
    }
    
    // Réinitialiser quand on passe en mode création
    if (changes['isEditMode'] && !this.isEditMode) {
      this.imagePreview = null;
      this.selectedFile = null;
    }
  }
}
