import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ModalFormsComponent } from '../../../shared/components/modal-forms/modal-forms.component';

@Component({
  selector: 'app-add-stock-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, ModalFormsComponent],
  templateUrl: './add-stock-modal.component.html',
  styleUrls: ['./add-stock-modal.component.scss']
})
export class AddStockModalComponent {
  @Input() isOpen = false;
  @Input() product: any = null;
  @Input() isSubmitting = false;
  @Input() error = '';

  @Output() close = new EventEmitter<void>();
  @Output() add = new EventEmitter<number>();

  quantity: number = 1;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && this.isOpen) {
      // reset quantity when modal opens
      this.quantity = 1;
      this.error = '';
    }
    if (changes['product'] && this.product) {
      // when product changes, ensure quantity reset
      this.quantity = 1;
    }
  }

  emitClose() { this.close.emit(); }

  doAdd() {
    if (this.quantity == null || this.quantity <= 0) {
      this.error = 'Please enter a positive quantity';
      return;
    }
    this.error = '';
    this.add.emit(this.quantity);
  }
}
