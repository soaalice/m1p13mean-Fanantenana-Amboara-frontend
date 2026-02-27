import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UserRole } from '../../shared/models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSub = new BehaviorSubject<User | null>(this._loadUser());
  /** Stream réactif de l'utilisateur courant — émis à chaque refresh */
  currentUser$ = this.currentUserSub.asObservable();

  constructor(private http: HttpClient) {}

  private _loadUser(): User | null {
    try {
      const raw = localStorage.getItem('currentUser');
      return raw ? JSON.parse(raw) as User : null;
    } catch { return null; }
  }

  private _saveUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSub.next(user);
  }

  /** Met à jour l'utilisateur courant (localStorage + currentUser$) */
  updateCurrentUser(user: User): void {
    this._saveUser(user);
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, user);
  }

  login(login: string, password: string): Observable<{ token: string, user: User }> {
    return this.http.post<{ token: string, user: User }>(`${environment.apiUrl}/users/login`, { login, password })
      .pipe(
        tap(response => {
          localStorage.setItem('authToken', response.token);
          this._saveUser(response.user);
        })
      );
  }




  /**
   * Recharge les données de l'utilisateur depuis le backend (GET /me)
   * et met à jour le localStorage + currentUser$.
   */
  refreshCurrentUser(): void {
    this.http.get<{ success: boolean; data: User }>(`${environment.apiUrl}/users/me`)
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this._saveUser(res.data);
          }
        },
        error: () => { /* silencieux */ }
      });
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getCurrentUser(): User | null {
    return this.currentUserSub.value ?? this._loadUser();
  }

  getRoleFromToken(): UserRole | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    const payload = this.decodeJwtPayload(token);
    if (!payload || typeof payload['role'] !== 'string') {
      return null;
    }

    const role = payload['role'].toUpperCase();
    if (role === UserRole.ADMIN || role === UserRole.BOUTIQUE || role === UserRole.ACHETEUR) {
      return role as UserRole;
    }

    return null;
  }

  private decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) {
        return null;
      }

      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, '=');
      const json = atob(padded);
      return JSON.parse(json) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSub.next(null);
  }
}
