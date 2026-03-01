import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ModalFormsComponent } from '../../../shared/components/modal-forms/modal-forms.component';

@Component({
  selector: 'app-product-type-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, ModalFormsComponent],
  templateUrl: './product-type-modal.component.html',
  styleUrl: './product-type-modal.component.scss'
})
export class ProductTypeModalComponent {
  @Input() isOpen = false;
  @Input() isEditMode = false;
  @Input() isSubmitting = false;
  @Input() submitError = '';
  @Input() attributeTypes: string[] = [];
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) attributes!: FormArray;

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();
  @Output() addAttribute = new EventEmitter<void>();
  @Output() removeAttribute = new EventEmitter<number>();

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    this.submit.emit();
  }

  onAddAttribute(): void {
    this.addAttribute.emit();
  }

  onRemoveAttribute(index: number): void {
    this.removeAttribute.emit(index);
  }
}
