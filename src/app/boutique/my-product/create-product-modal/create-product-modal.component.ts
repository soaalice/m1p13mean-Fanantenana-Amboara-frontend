import { Component, EventEmitter, Input, Output } from '@angular/core';
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

  emitProductTypeChange(value: string) {
    this.productTypeChange.emit(value);
  }

  emitSubmit() {
    this.submit.emit();
  }

  emitClose() {
    this.close.emit();
  }
}
