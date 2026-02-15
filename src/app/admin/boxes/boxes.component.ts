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
  stateOptions: Box['state'][] = ['AVAILABLE', 'RENTED', 'REPAIR'];

  boxForm = this.fb.group({
    label: ['', [Validators.required, Validators.minLength(2)]],
    state: ['AVAILABLE' as Box['state'], Validators.required],
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
    this.submitError = '';
    this.boxForm.reset({
      state: 'AVAILABLE',
      rent: 0
    });
  }

  closeBoxModal(): void {
    this.isModalOpen = false;
    this.isSubmitting = false;
    this.submitError = '';
    this.boxForm.reset({
      state: 'AVAILABLE',
      rent: 0
    });
  }

  submitBox(): void {
    if (this.boxForm.invalid || this.isSubmitting) {
      this.boxForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const value = this.boxForm.getRawValue();
    const payload = {
      label: value.label ?? '',
      state: value.state ?? 'AVAILABLE',
      rent: Number(value.rent ?? 0)
    };

    this.boxService.createBox(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeBoxModal();
        this.fetchData(1);
      },
      error: () => {
        this.isSubmitting = false;
        this.submitError = 'Failed to create box.';
      }
    });
  }

  onEdit(box: Box): void {
    console.log('Edit', box);
  }

  onDelete(box: Box): void {
    console.log('Delete', box);
  }
}
