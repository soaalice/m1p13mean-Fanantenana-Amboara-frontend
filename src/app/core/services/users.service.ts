import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UsersResponse } from '../../shared/models/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor (private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http
      .get<UsersResponse>(`${environment.apiUrl}/users`)
      .pipe(map(response => response.data ?? []));
  }
}
