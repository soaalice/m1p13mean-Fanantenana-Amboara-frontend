import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Command, CommandItem } from '../../shared/models/command.model';
import { CommandService } from '../../core/services/command.service';
import { ListFiltersComponent } from '../../shared/components/list-filters/list-filters.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

@Component({
  selector: 'app-my-command',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTooltipModule,
    ListFiltersComponent,
    LoaderComponent
  ],
  templateUrl: './my-command.component.html',
  styleUrl: './my-command.component.scss'
})
export class MyCommandComponent implements OnInit {
  pageSizeOptions = [5, 10, 25];

  page = 1;
  limit = 10;
  total = 0;
  dataSource: Command[] = [];
  startDate = '';
  endDate = '';

  isLoading = false;
  loadError = '';
  expandedCommand: Command | null = null;

  constructor(private commandService: CommandService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;
    this.loadError = '';
    this.expandedCommand = null;

    this.commandService.getMyCommands(this.page, this.limit, {
      startDate: this.startDate || undefined,
      endDate: this.endDate || undefined
    }).subscribe({
      next: (result) => {
        this.dataSource = result.data;
        this.total = result.pagination.total;
        this.isLoading = false;
      },
      error: (err) => {
        this.loadError = err?.error?.message || 'Failed to load commands.';
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.limit = event.pageSize;
    this.fetchData();
  }

  applyFilters(): void {
    this.page = 1;
    this.fetchData();
  }

  resetFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.page = 1;
    this.fetchData();
  }

  toggleDetails(command: Command): void {
    this.expandedCommand = this.expandedCommand?._id === command._id ? null : command;
  }

  getItemSubtotal(item: CommandItem): number {
    return item.produit.price * item.produit.qte;
  }

  getCommandTotalBeforeDiscount(command: Command): number {
    return command.totalBeforeDiscount ?? command.totalAmount;
  }

  getCommandDiscount(command: Command): number {
    return command.discount ?? 0;
  }

  getCommandFinalTotal(command: Command): number {
    return command.totalAmount;
  }
}
