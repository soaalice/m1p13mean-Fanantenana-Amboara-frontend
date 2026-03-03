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
import { SidebarService } from '../../core/services/sidebar.service';
import { BoxModalComponent } from './box-modal/box-modal.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

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
    BoxModalComponent,
    LoaderComponent
  ],
  templateUrl: './boxes.component.html',
  styleUrls: ['./boxes.component.scss']
})
export class BoxesComponent extends PaginatedComponent<Box> {
  displayedColumns = ['label', 'state', 'rent', 'actions'];
  isModalOpen = false;
  isSubmitting = false;
  submitError = '';
  isEditMode = false;
  selectedBox: Box | null = null;

  private readonly defaultState: Box['state'] = 'AVAILABLE';
  private readonly defaultRent = 0;

  boxForm = this.fb.group({
    label: ['', [Validators.required, Validators.minLength(2)]]
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
      error: (err) => {
        this.loadError = err.error?.message || 'Impossible de charger les boîtes.';
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
      label: ''
    });
    this.boxForm.get('label')?.enable();
  }

  closeBoxModal(): void {
    this.isModalOpen = false;
    this.isSubmitting = false;
    this.isEditMode = false;
    this.selectedBox = null;
    this.submitError = '';
    this.boxForm.reset({
      label: ''
    });
    this.boxForm.get('label')?.enable();
  }

  submitBox(): void {
    if (this.boxForm.invalid || this.isSubmitting) {
      this.boxForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const value = this.boxForm.getRawValue();
    const payload: Omit<Box, '_id'> = {
      label: value.label ?? '',
      state: this.isEditMode ? (this.selectedBox?.state ?? this.defaultState) : this.defaultState,
      rent: this.isEditMode ? (this.selectedBox?.rent ?? this.defaultRent) : this.defaultRent,
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
      error: (err) => {
        this.isSubmitting = false;
        this.submitError = err.error?.message || this.isEditMode
          ? 'Impossible de mettre à jour la boîte.'
          : 'Impossible de créer la boîte.';
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
      label: box.label ?? ''
    });
    this.boxForm.get('label')?.enable();
  }

  onDelete(box: Box): void {
    if (!box._id) {
      return;
    }

    const confirmed = window.confirm(`Voulez-vous supprimer la box "${box.label || box._id}"?`);
    if (!confirmed) {
      return;
    }

    this.boxService.deleteBox(box._id).subscribe({
      next: () => {
        this.fetchData(this.page);
      },
      error: (err) => {
        this.loadError = err.error?.message || 'Impossible de supprimer la box.';
      }
    });
  }
}
