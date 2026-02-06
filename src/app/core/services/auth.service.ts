import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  register(user: User): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, user);
  }

  login( login: string, password: string ): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${environment.apiUrl}/users/login`, { login, password })
      .pipe(
        tap(response => {
          localStorage.setItem('authToken', response.token);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }
}
