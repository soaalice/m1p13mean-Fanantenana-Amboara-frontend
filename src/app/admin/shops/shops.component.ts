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
import { SidebarService } from '../../core/services/sidebar.service';
import { AssignBoxModalComponent } from './assign-box-modal/assign-box-modal.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

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
    AssignBoxModalComponent,
    ListFiltersComponent,
    LoaderComponent
  ],
  templateUrl: './shops.component.html',
  styleUrl: './shops.component.scss'
})
export class ShopsComponent extends PaginatedComponent<Shop> {

  get shops(): Shop[] {
    return this.items;
  }

  displayedColumns = ['photo', 'name', 'ownerFullName', 'status', 'activeRent', 'assignedBox', 'actions'];
  statusOptions = ['ACTIVE', 'INACTIVE'];
  statusFilter = '';
  ownerNameFilter = '';
  boxesDisplayedColumns = ['select', 'label', 'state'];
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
  assignRent: number | null = null;
  assignStartDate = '';

  constructor(
    private shopsService: ShopsService, 
    private boxService: BoxService,
    private sidebarService: SidebarService
  ) {
    super();
  }

  getActiveRentInfo(shop: Shop): string {
    const rent = shop.activeRent;
    if (!rent) return '—';
    const amount = rent.amount != null ? `${rent.amount} MGA` : '—';
    const next = rent.nextDeadline ? new Date(rent.nextDeadline).toLocaleDateString() : '—';
    return `${amount} / due ${next}`;
  }

  isRentOverdue(shop: Shop): boolean {
    const deadline = shop.activeRent?.nextDeadline;
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  }

  getRentDeadlineLabel(shop: Shop): string {
    const deadline = shop.activeRent?.nextDeadline;
    if (!deadline) return '—';
    return new Date(deadline).toLocaleDateString();
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
    this.assignRent = null;
    this.assignStartDate = '';
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
    this.assignRent = null;
    this.assignStartDate = '';
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

  unassignateShop(shop: Shop): void {
    const boxId = shop.assignedBox?._id || shop.boxId;

    if (!shop._id || !boxId) {
      this.loadError = 'Box not found for this shop.';
      return;
    }

    const confirmed = window.confirm(`Unassign box from "${shop.name || shop._id}"?`);
    if (!confirmed) {
      return;
    }

    this.shopsService.assignateShopToBox({
      boxId,
      shopId: shop._id,
      isAssignate: false
    }).subscribe({
      next: () => {
        this.fetchData(this.page);
      },
      error: () => {
        this.loadError = 'Error unassigning the box.';
      }
    });
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

    if (this.assignRent === null || Number.isNaN(this.assignRent) || this.assignRent < 0) {
      this.assignError = 'Please provide a valid rent.';
      return;
    }

    if (!this.assignStartDate) {
      this.assignError = 'Please choose a start date.';
      return;
    }

    this.isAssignSubmitting = true;
    this.assignError = '';

    this.shopsService.assignateShopToBox({
      boxId: this.selectedBoxId,
      shopId: this.selectedShop._id,
      isAssignate: true,
      rent: this.assignRent,
      startDate: this.assignStartDate
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
