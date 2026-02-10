import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models/user';
import { PageResult } from '../../shared/models/shared.model';

export interface UserSoldeResponse {
  success: boolean;
  message: string;
  data: User;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor (private http: HttpClient) { }

  getUsers(
    page = 1,
    limit = 10,
    filters?: {
      role?: string;
      status?: string;
    }
  ): Observable<PageResult<User>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (filters?.role) {
      params = params.set('role', filters.role);
    }

    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<PageResult<User>>(`${environment.apiUrl}/users`, { params });
  }

  createUser(payload: Partial<User>): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, payload);
  }

  updateUserStatus(userId: string, status: string): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/users/${userId}/status`, { status });
  }

  rechargeUserSolde(userId: string, amount: number): Observable<UserSoldeResponse> {
    return this.http.patch<UserSoldeResponse>(`${environment.apiUrl}/users/${userId}/solde`, {
      amount,
      type: 'RECHARGE'
    });
  }
}
