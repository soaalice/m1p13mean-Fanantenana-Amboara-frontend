import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { BoxService } from '../../core/services/boxes.service';
import { Box } from '../../shared/models/box';
import { PaginatedComponent } from '../../shared/base/paginated.component';
import { ModalFormsComponent } from '../../shared/components/modal-forms/modal-forms.component';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-boxes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    ModalFormsComponent
  ],
  templateUrl: './boxes.component.html',
  styleUrls: ['./boxes.component.scss']
})
export class BoxesComponent extends PaginatedComponent<Box> {
  displayedColumns = ['label', 'state', 'rent', 'actions'];
  isModalOpen = false;
  isSubmitting = false;
  submitError = '';
  stateOptions: Box['state'][] = ['AVAILABLE', 'REPAIR', 'RENTED'];
  isEditMode = false;
  selectedBox: Box | null = null;

  boxForm = this.fb.group({
    label: ['', [Validators.required, Validators.minLength(2)]],
    state: [{ value: 'AVAILABLE', disabled: true }, [Validators.required]],
    rent: [0, [Validators.required, Validators.min(0)]]
  });

  get boxes(): Box[] {
    return this.items;
  }

  constructor(
    private boxService: BoxService,
    private sidebarService: SidebarService,
    private fb: FormBuilder
  ) {
    super();
  }

  protected fetchData(page = this.page): void {
    this.isLoading = true;
    this.loadError = '';

    this.boxService.getBoxes({ page, limit: this.limit }).subscribe({
      next: response => {
        this.applyResponse(response);
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Failed to load boxes.';
        this.isLoading = false;
      }
    });
  }

  getStateClass(state?: Box['state']): string {
    if (!state) {
      return 'status unknown';
    }

    return `status ${state.toLowerCase()}`;
  }

  openBoxModal(): void {
    this.sidebarService.requestCloseSidebar();
    this.isModalOpen = true;
    this.isSubmitting = false;
    this.isEditMode = false;
    this.selectedBox = null;
    this.submitError = '';
    this.boxForm.reset({
      label: '',
      state: 'AVAILABLE',
      rent: 0
    });
    this.boxForm.get('label')?.enable();
    this.boxForm.get('rent')?.enable();
    this.boxForm.get('state')?.disable();
  }

  closeBoxModal(): void {
    this.isModalOpen = false;
    this.isSubmitting = false;
    this.isEditMode = false;
    this.selectedBox = null;
    this.submitError = '';
    this.boxForm.reset({
      label: '',
      state: 'AVAILABLE',
      rent: 0
    });
    this.boxForm.get('label')?.enable();
    this.boxForm.get('rent')?.enable();
    this.boxForm.get('state')?.disable();
  }

  submitBox(): void {
    if (this.boxForm.invalid || this.isSubmitting) {
      this.boxForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const value = this.boxForm.getRawValue();
    const payload: Omit<Box, '_id'> = this.isEditMode
      ? { 
          label: value.label ?? '',
          state: (value.state ?? 'AVAILABLE') as Box['state'],
          rent: value.rent ?? 0
        }
      : {
          label: value.label ?? '',
          state: (value.state ?? 'AVAILABLE') as Box['state'],
          rent: value.rent ?? 0
        };

    const request$ = this.isEditMode && this.selectedBox?._id
      ? this.boxService.updateBox(this.selectedBox._id, payload)
      : this.boxService.createBox(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeBoxModal();
        this.fetchData(1);
      },
      error: () => {
        this.isSubmitting = false;
        this.submitError = this.isEditMode
          ? 'Failed to update box.'
          : 'Failed to create box.';
      }
    });
  }

  onEdit(box: Box): void {
    this.sidebarService.requestCloseSidebar();
    this.isEditMode = true;
    this.selectedBox = box;
    this.isModalOpen = true;
    this.isSubmitting = false;
    this.submitError = '';
    this.boxForm.setValue({
      label: box.label ?? '',
      state: box.state ?? 'AVAILABLE',
      rent: box.rent ?? 0
    });
    this.boxForm.get('label')?.enable();
    this.boxForm.get('state')?.disable();
    this.boxForm.get('rent')?.disable();
  }

  onDelete(box: Box): void {
    if (!box._id) {
      return;
    }

    const confirmed = window.confirm(`Delete box "${box.label || box._id}"?`);
    if (!confirmed) {
      return;
    }

    this.boxService.deleteBox(box._id).subscribe({
      next: () => {
        this.fetchData(this.page);
      },
      error: () => {
        this.loadError = 'Failed to delete box.';
      }
    });
  }
}
