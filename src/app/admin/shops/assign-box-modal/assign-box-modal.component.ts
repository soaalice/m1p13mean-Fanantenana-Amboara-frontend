import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ModalFormsComponent } from '../../../shared/components/modal-forms/modal-forms.component';
import { Box } from '../../../shared/models/box';

@Component({
  selector: 'app-assign-box-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatPaginatorModule, MatButtonModule, ModalFormsComponent],
  templateUrl: './assign-box-modal.component.html',
  styleUrl: './assign-box-modal.component.scss'
})
export class AssignBoxModalComponent {
  @Input() isOpen = false;
  @Input() isSubmitting = false;
  @Input() boxesLoading = false;
  @Input() boxesLoadError = '';
  @Input() assignError = '';
  @Input() boxesDisplayedColumns: string[] = ['select', 'label', 'state'];
  @Input() availableBoxes: Box[] = [];
  @Input() selectedBoxId = '';
  @Input() assignRent: number | null = null;
  @Input() assignStartDate = new Date().toISOString().split('T')[0]; // Default to today's date in YYYY-MM-DD format
  @Input() boxesTotal = 0;
  @Input() boxesPage = 1;
  @Input() boxesLimit = 5;
  @Input() boxesPageSizeOptions: number[] = [5, 10, 20];

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<void>();
  @Output() selectBox = new EventEmitter<Box>();
  @Output() boxesPageChange = new EventEmitter<PageEvent>();
  @Output() selectedBoxIdChange = new EventEmitter<string>();
  @Output() assignRentChange = new EventEmitter<number | null>();
  @Output() assignStartDateChange = new EventEmitter<string>();

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    this.submit.emit();
  }

  onSelectBox(box: Box): void {
    this.selectBox.emit(box);
  }

  onBoxesPageChange(event: PageEvent): void {
    this.boxesPageChange.emit(event);
  }

  onSelectedBoxIdChange(value: string): void {
    this.selectedBoxIdChange.emit(value);
  }

  onAssignRentChange(value: string | number | null): void {
    if (value === '' || value === null || value === undefined) {
      this.assignRentChange.emit(null);
      return;
    }

    this.assignRentChange.emit(Number(value));
  }

  onAssignStartDateChange(value: string): void {
    this.assignStartDateChange.emit(value);
  }

  getStateClass(state?: Box['state']): string {
    if (!state) {
      return 'status unknown';
    }

    return `status ${state.toLowerCase()}`;
  }
}
