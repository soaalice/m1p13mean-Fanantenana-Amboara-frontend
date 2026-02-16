import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ListFiltersComponent } from '../../shared/components/list-filters/list-filters.component';
import { PaginatedComponent } from '../../shared/base/paginated.component';
import { Shop } from '../../shared/models/shop';
import { ShopsService } from '../../core/services/shops.service';
import { BoxService } from '../../core/services/boxes.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { Box } from '../../shared/models/box';
import { ModalFormsComponent } from '../../shared/components/modal-forms/modal-forms.component';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-shops',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    ModalFormsComponent,
    ListFiltersComponent
  ],
  templateUrl: './shops.component.html',
  styleUrl: './shops.component.scss'
})
export class ShopsComponent extends PaginatedComponent<Shop> {

  get shops(): Shop[] {
    return this.items;
  }

  displayedColumns = ['name', 'ownerFullName', 'status', 'assignedBox', 'actions'];
  statusOptions = ['ACTIVE', 'INACTIVE'];
  statusFilter = '';
  ownerNameFilter = '';
  boxesDisplayedColumns = ['select', 'label', 'state', 'rent'];
  isAssignModalOpen = false;
  isAssignSubmitting = false;
  assignError = '';
  boxesLoading = false;
  boxesLoadError = '';
  boxesPage = 1;
  boxesLimit = 5;
  boxesTotal = 0;
  boxesPageSizeOptions = [5, 10, 20];
  availableBoxes: Box[] = [];
  selectedBoxId = '';
  selectedShop: Shop | null = null;

  constructor(
    private shopsService: ShopsService, 
    private boxService: BoxService,
    private sidebarService: SidebarService
  ) {
    super();
  }

  protected fetchData(page = this.page): void {
      this.isLoading = true;
      this.loadError = '';

      const filters: { ownerFullName?: string; status?: string } = {};

      if (this.ownerNameFilter) {
        filters.ownerFullName = this.ownerNameFilter.trim();
      }

      if (this.statusFilter) {
        filters.status = this.statusFilter;
      }

      this.shopsService.searchShops(
        page,
        this.limit,
        filters
      ).subscribe({
        next: (result) => {
          this.applyResponse(result);
          this.isLoading = false;
        },
        error: () => {
          this.loadError = 'Error loading shops.';
          this.isLoading = false;
        }
      });
  }

  resetFilters(): void {
    this.statusFilter = '';
    this.ownerNameFilter = '';
    this.fetchData(1);
  }

  getStatusClass(status: string): string {
    return status === 'ACTIVE' ? 'status-active' : 'status-inactive';
  }

  getStateClass(state?: Box['state']): string {
    if (!state) {
      return 'status unknown';
    }

    return `status ${state.toLowerCase()}`;
  }

  getAssignedBoxName(shop: Shop): string {
    if (!shop.assignedBox) {
      return 'Unassigned';
    }
    return shop.assignedBox.label || 'Unnamed Box';
  }

  getOwnerFullName(shop: Shop): string {
    return shop.ownerUser?.profile?.fullName || 'N/A';
  }

  assignateShop(shop: Shop): void {
    this.sidebarService.requestCloseSidebar();
    this.selectedShop = shop;
    this.selectedBoxId = '';
    this.assignError = '';
    this.isAssignModalOpen = true;
    this.loadAvailableBoxes(1);
  }

  closeAssignModal(): void {
    this.isAssignModalOpen = false;
    this.isAssignSubmitting = false;
    this.assignError = '';
    this.selectedBoxId = '';
    this.selectedShop = null;
    this.availableBoxes = [];
    this.boxesLoadError = '';
  }

  loadAvailableBoxes(page = this.boxesPage): void {
    this.boxesLoading = true;
    this.boxesLoadError = '';

    this.boxService.getBoxes({
      page,
      limit: this.boxesLimit,
      state: 'AVAILABLE'
    }).subscribe({
      next: response => {
        this.availableBoxes = response.data;
        this.boxesTotal = response.pagination.total;
        this.boxesPage = response.pagination.page;
        this.boxesLimit = response.pagination.limit;
        this.boxesLoading = false;
      },
      error: () => {
        this.boxesLoadError = 'Error loading available boxes.';
        this.boxesLoading = false;
      }
    });
  }

  onBoxesPageChange(event: PageEvent): void {
    this.boxesPage = event.pageIndex + 1;
    this.boxesLimit = event.pageSize;
    this.loadAvailableBoxes(this.boxesPage);
  }

  submitAssignation(): void {
    if (!this.selectedShop?._id) {
      this.assignError = 'Invalid shop.';
      return;
    }

    if (!this.selectedBoxId) {
      this.assignError = 'Please choose a available box.';
      return;
    }

    this.isAssignSubmitting = true;
    this.assignError = '';

    this.shopsService.assignateShopToBox({
      boxId: this.selectedBoxId,
      shopId: this.selectedShop._id,
      isAssignate: true
    }).subscribe({
      next: () => {
        this.isAssignSubmitting = false;
        this.closeAssignModal();
        this.fetchData(this.page);
      },
      error: () => {
        this.isAssignSubmitting = false;
        this.assignError = 'Error assigning the box.';
      }
    });
  }

  selectBox(box: Box): void {
    this.selectedBoxId = box._id;
  }
}
