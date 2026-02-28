import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ModalFormsComponent } from '../../../shared/components/modal-forms/modal-forms.component';

@Component({
  selector: 'app-box-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, ModalFormsComponent],
  templateUrl: './box-modal.component.html',
  styleUrl: './box-modal.component.scss'
})
export class BoxModalComponent {
  @Input() isOpen = false;
  @Input() isEditMode = false;
  @Input() isSubmitting = false;
  @Input() error = '';
  @Input({ required: true }) form!: FormGroup;

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  onSubmit(): void {
    this.submit.emit();
  }

  onClose(): void {
    this.close.emit();
  }
}
