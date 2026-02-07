import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User, UsersResponse } from '../../shared/models/user';
import { UsersService } from '../../core/services/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  isLoading = false;
  loadError = '';
  page = 1;
  limit = 10;
  total = 0;
  pages = 1;

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(page = this.page): void {
    this.isLoading = true;
    this.loadError = '';

    this.usersService.getUsers(page, this.limit).subscribe({
      next: response => {
        this.applyResponse(response);
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Failed to load users.';
        this.isLoading = false;
      }
    });
  }

  private applyResponse(response: UsersResponse): void {
    this.users = response.data ?? [];
    this.page = response.pagination?.page ?? this.page;
    this.limit = response.pagination?.limit ?? this.limit;
    this.total = response.pagination?.total ?? this.users.length;
    this.pages = response.pagination?.pages ?? 1;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.pages || page === this.page) {
      return;
    }

    this.fetchUsers(page);
  }

  previousPage(): void {
    this.goToPage(this.page - 1);
  }

  nextPage(): void {
    this.goToPage(this.page + 1);
  }

  get canGoPrevious(): boolean {
    return this.page > 1 && !this.isLoading;
  }

  get canGoNext(): boolean {
    return this.page < this.pages && !this.isLoading;
  }

  trackById(index: number, user: User): string | number {
    return user._id ?? index;
  }

  getStatusClass(status?: string): string {
    if (!status) {
      return 'status unknown';
    }

    return `status ${status.toLowerCase()}`;
  }

}
