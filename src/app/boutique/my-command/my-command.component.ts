import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Command, CommandItem } from '../../shared/models/command.model';
import { CommandService } from '../../core/services/command.service';

@Component({
  selector: 'app-my-command',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatTooltipModule
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

    this.commandService.getMyCommands(this.page, this.limit).subscribe({
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

  toggleDetails(command: Command): void {
    this.expandedCommand = this.expandedCommand?._id === command._id ? null : command;
  }

  getItemSubtotal(item: CommandItem): number {
    return item.produit.price * item.produit.qte;
  }
}
