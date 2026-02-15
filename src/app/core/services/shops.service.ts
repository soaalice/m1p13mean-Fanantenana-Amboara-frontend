import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Shop } from '../../shared/models/shop';
import { PageResult } from '../../shared/models/shared.model';

@Injectable({
  providedIn: 'root'
})
export class ShopsService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getShops(
    page = 1,
    limit = 10,
  ): Observable<PageResult<Shop>> {
    const params = {
      page: page.toString(),
      limit: limit.toString()
    };

    return this.http.get<PageResult<Shop>>(`${this.apiUrl}/shops`, { params });
  }
}
