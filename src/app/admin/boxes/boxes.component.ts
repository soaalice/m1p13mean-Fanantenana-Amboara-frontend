import { Component, OnInit, ViewChild } from '@angular/core';
import { BoxService } from '../../core/services/boxes.service';
import { Box } from '../../shared/models/box';
import { NgClass, NgIf } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-boxes',
  standalone: true,
  imports: [
    NgClass,
    MatTableModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatPaginatorModule,
    NgIf
],
  templateUrl: './boxes.component.html',
  styleUrls: ['./boxes.component.scss']
})
export class BoxesComponent implements OnInit {
  displayedColumns = ['label', 'state', 'rent', 'actions'];
  boxes: Box[] = [];

  isLoading = false;
  loadError = '';

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0; // Angular Material uses zero-based index

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private boxService: BoxService) {}

  ngOnInit(): void {
    this.loadBoxes();
  }

  loadBoxes(page: number = 1, limit: number = this.pageSize) {
    this.isLoading = true;
    this.loadError = '';

    this.boxService.getBoxes({ page, limit }).subscribe({
      next: (result) => {
        if (result.success) {
          this.boxes = result.data;
          this.totalItems = result.pagination.total;
          this.pageSize = result.pagination.limit;
          this.pageIndex = result.pagination.page - 1; // convert to zero-based index
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.loadError = err.response.message;
        this.isLoading = false;
      },
    });
  }

  onPageChange(event: PageEvent) {
    this.loadBoxes(event.pageIndex + 1, event.pageSize);
  }

  onEdit(box: Box) {
    console.log('Edit', box);
  }

  onDelete(box: Box) {
    console.log('Delete', box);
  }
}
