import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ModalFormsComponent } from '../../../shared/components/modal-forms/modal-forms.component';

export interface RentPaymentPayload {
  month: string;
  year: number;
}

@Component({
  selector: 'app-rent-payment-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    ModalFormsComponent
  ],
  templateUrl: './rent-payment-modal.component.html',
  styleUrl: './rent-payment-modal.component.scss'
})
export class RentPaymentModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isSubmitting = false;
  @Input() error = '';

  @Output() close = new EventEmitter<void>();
  @Output() submitPayment = new EventEmitter<RentPaymentPayload>();

  readonly currentYear = new Date().getFullYear();
  readonly currentMonth = ("0" + (new Date().getMonth() + 1)).slice(-2);

  readonly monthOptions = [
    { value: '01', label: 'Janvier' },
    { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' },
    { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];

  paymentForm = this.fb.group({
    month: [this.currentMonth, Validators.required],
    year: [this.currentYear, [Validators.required, Validators.min(2000), Validators.max(9999)]]
  });

  constructor(private fb: FormBuilder) {}

  ngOnChanges(): void {
    if (this.isOpen) {
      this.paymentForm.reset({ month: this.currentMonth, year: this.currentYear });
    }
  }

  onSubmit(): void {
    if (this.paymentForm.invalid || this.isSubmitting) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    const raw = this.paymentForm.getRawValue();
    this.submitPayment.emit({
      month: raw.month ?? '',
      year: raw.year ?? this.currentYear
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
