import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { BoxService } from '../../core/services/boxes.service';
import { Box } from '../../shared/models/box';
import { PaginatedComponent } from '../../shared/base/paginated.component';

@Component({
  selector: 'app-boxes',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './boxes.component.html',
  styleUrls: ['./boxes.component.scss']
})
export class BoxesComponent extends PaginatedComponent<Box> {
  displayedColumns = ['label', 'state', 'rent', 'actions'];

  get boxes(): Box[] {
    return this.items;
  }

  constructor(private boxService: BoxService) {
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

  onEdit(box: Box): void {
    console.log('Edit', box);
  }

  onDelete(box: Box): void {
    console.log('Delete', box);
  }
}
