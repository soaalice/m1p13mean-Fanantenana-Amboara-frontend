import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UsersResponse } from '../../shared/models/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor (private http: HttpClient) { }

  getUsers(page = 1, limit = 10): Observable<UsersResponse> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.http.get<UsersResponse>(`${environment.apiUrl}/users`, { params });
  }

  createUser(payload: Partial<User>): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, payload);
  }
}
