import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { User, UserRole, UsersResponse } from '../../shared/models/user';
import { UsersService } from '../../core/services/users.service';
import { ModalFormsComponent } from '../../shared/components/modal-forms/modal-forms.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalFormsComponent, MatTableModule, MatPaginatorModule, MatButtonModule],
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
  isModalOpen = false;
  isStatusModalOpen = false;
  isSubmitting = false;
  isStatusSubmitting = false;
  submitError = '';
  statusError = '';
  roles = [UserRole.ADMIN, UserRole.BOUTIQUE, UserRole.ACHETEUR];
  rolesForm = [UserRole.ADMIN, UserRole.BOUTIQUE];
  statusOptions = ['ACTIVE', 'INACTIVE'];
  displayedColumns = ['fullName', 'role', 'login', 'phone', 'status', 'actions'];
  pageSizeOptions = [5, 10, 25];
  statusFilter = '';
  roleFilter = '';
  selectedUser: User | null = null;

  userForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    login: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    tel: [''],
    role: [UserRole.ADMIN, Validators.required]
  });

  statusForm = this.fb.group({
    status: ['ACTIVE', Validators.required]
  });

  constructor(private usersService: UsersService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(page = this.page): void {
    this.isLoading = true;
    this.loadError = '';

    this.usersService.getUsers(page, this.limit, {
      status: this.statusFilter || undefined,
      role: this.roleFilter || undefined
    }).subscribe({
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

  onPageChange(event: PageEvent): void {
    this.limit = event.pageSize;
    this.fetchUsers(event.pageIndex + 1);
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

  openUserModal(): void {
    this.isModalOpen = true;
    this.submitError = '';
  }

  closeUserModal(): void {
    this.isModalOpen = false;
    this.isSubmitting = false;
    this.submitError = '';
    this.userForm.reset({ role: UserRole.ADMIN });
  }

  submitUser(): void {
    if (this.userForm.invalid || this.isSubmitting) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const value = this.userForm.getRawValue();
    const payload = {
      role: value.role ?? UserRole.ADMIN,
      login: value.login ?? '',
      password: value.password ?? '',
      profile: {
        fullName: value.fullName ?? '',
        tel: value.tel || '',
        solde: 0
      }
    };

    this.usersService.createUser(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeUserModal();
        this.fetchUsers(1);
      },
      error: () => {
        this.isSubmitting = false;
        this.submitError = 'Failed to create user.';
      }
    });
  }

  openStatusModal(user: User): void {
    this.selectedUser = user;
    this.isStatusModalOpen = true;
    this.isStatusSubmitting = false;
    this.statusError = '';
    this.statusForm.setValue({
      status: user.status ?? 'ACTIVE'
    });
  }

  closeStatusModal(): void {
    this.isStatusModalOpen = false;
    this.isStatusSubmitting = false;
    this.statusError = '';
    this.selectedUser = null;
  }

  submitStatusChange(): void {
    if (!this.selectedUser?._id || this.statusForm.invalid || this.isStatusSubmitting) {
      this.statusForm.markAllAsTouched();
      return;
    }

    this.isStatusSubmitting = true;
    this.statusError = '';

    const status = this.statusForm.getRawValue().status ?? 'ACTIVE';

    this.usersService.updateUserStatus(this.selectedUser._id, status).subscribe({
      next: () => {
        this.isStatusSubmitting = false;
        this.closeStatusModal();
        this.fetchUsers(this.page);
      },
      error: () => {
        this.isStatusSubmitting = false;
        this.statusError = 'Failed to update status.';
      }
    });
  }
}
