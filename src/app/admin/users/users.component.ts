import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../shared/models/user';
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

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.isLoading = true;
    this.loadError = '';

    this.usersService.getUsers().subscribe({
      next: users => {
        this.users = users;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Failed to load users.';
        this.isLoading = false;
      }
    });
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
