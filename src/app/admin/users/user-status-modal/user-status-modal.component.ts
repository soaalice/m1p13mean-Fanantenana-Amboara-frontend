import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ModalFormsComponent } from '../../../shared/components/modal-forms/modal-forms.component';
import { User } from '../../../shared/models/user';

@Component({
  selector: 'app-user-status-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, ModalFormsComponent],
  templateUrl: './user-status-modal.component.html',
  styleUrl: './user-status-modal.component.scss'
})
export class UserStatusModalComponent {
  @Input() isOpen = false;
  @Input() isSubmitting = false;
  @Input() error = '';
  @Input() statusOptions: string[] = [];
  @Input() selectedUser: User | null = null;
  @Input({ required: true }) form!: FormGroup;

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    this.submit.emit();
  }
}
