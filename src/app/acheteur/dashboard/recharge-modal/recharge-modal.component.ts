import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ModalFormsComponent } from '../../../shared/components/modal-forms/modal-forms.component';

@Component({
  selector: 'app-recharge-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, ModalFormsComponent],
  templateUrl: './recharge-modal.component.html',
  styleUrl: './recharge-modal.component.scss'
})
export class RechargeModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isSubmitting = false;
  @Input() error = '';

  @Output() close = new EventEmitter<void>();
  @Output() recharge = new EventEmitter<number>();

  rechargeForm = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.rechargeForm.reset({ amount: null });
    }
  }

  emitClose(): void {
    this.close.emit();
  }

  submitRecharge(): void {
    if (this.rechargeForm.invalid || this.isSubmitting) {
      this.rechargeForm.markAllAsTouched();
      return;
    }

    const amount = Number(this.rechargeForm.getRawValue().amount ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      this.rechargeForm.markAllAsTouched();
      return;
    }

    this.recharge.emit(amount);
  }
}
