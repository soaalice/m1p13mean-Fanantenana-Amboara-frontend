import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { User, UserRole } from '../../shared/models/user';
import { UsersService } from '../../core/services/users.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { PaginatedComponent } from '../../shared/base/paginated.component';
import { ListFiltersComponent } from '../../shared/components/list-filters/list-filters.component';
import { AddUserModalComponent } from './add-user-modal/add-user-modal.component';
import { UserStatusModalComponent } from './user-status-modal/user-status-modal.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    AddUserModalComponent,
    UserStatusModalComponent,
    MatTableModule, 
    MatPaginatorModule, 
    MatButtonModule,
    ListFiltersComponent
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent extends PaginatedComponent<User> {
  // Alias pour items du parent
  get users(): User[] {
    return this.items;
  }

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
  statusFilter = '';
  roleFilter = '';
  selectedUser: User | null = null;

  userForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    login: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.email]],
    tel: [''],
    role: [UserRole.ADMIN, Validators.required]
  });

  statusForm = this.fb.group({
    status: ['ACTIVE', Validators.required]
  });

  constructor(
    private usersService: UsersService,
    private sidebarService: SidebarService,
    private fb: FormBuilder
  ) {
    super();
  }

  protected fetchData(page = this.page): void {
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

  getStatusClass(status?: string): string {
    if (!status) {
      return 'status unknown';
    }

    return `status ${status.toLowerCase()}`;
  }

  resetFilters(): void {
    this.statusFilter = '';
    this.roleFilter = '';
    this.fetchData(1);
  }

  openUserModal(): void {
    this.sidebarService.requestCloseSidebar();
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
        email: value.email ?? '',
        tel: value.tel || '',
        solde: 0
      }
    };

    this.usersService.createUser(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeUserModal();
        this.fetchData(1);
      },
      error: () => {
        this.isSubmitting = false;
        this.submitError = 'Failed to create user.';
      }
    });
  }

  openStatusModal(user: User): void {
    this.sidebarService.requestCloseSidebar();
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
        this.fetchData(this.page);
      },
      error: () => {
        this.isStatusSubmitting = false;
        this.statusError = 'Failed to update status.';
      }
    });
  }
}