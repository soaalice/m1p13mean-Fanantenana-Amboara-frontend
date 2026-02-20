import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rent } from '../../shared/models/rent';
import { PageResult } from '../../shared/models/shared.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RentsService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getRents(
    page = 1,
    limit = 10,
  ): Observable<PageResult<Rent>> {
    const params = {
      page: page.toString(),
      limit: limit.toString()
    };

    return this.http.get<PageResult<Rent>>(`${this.apiUrl}/rents`, { params });
  }

  payRent(rentId: string, userId: string, periode: string): Observable<Rent> {
    return this.http.patch<Rent>(`${this.apiUrl}/rents/${rentId}/pay`, { userId, periode });
  }

  getRentById(rentId: string): Observable<Rent> {
    return this.http.get<Rent>(`${this.apiUrl}/rents/${rentId}`);
  }
}
