import { HttpClient, HttpParams } from '@angular/common/http';
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

  searchShops(
    page = 1,
    limit = 10,
    filters?: {
      ownerFullName?: string;
      status?: string;
    }
  ): Observable<PageResult<Shop>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters?.ownerFullName) {
      params = params.set('ownerFullName', filters.ownerFullName);
    }

    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    return this.http.get<PageResult<Shop>>(`${this.apiUrl}/shops/search`, { params });
  }

  getShopByOwner(ownerId: string | number): Observable<Shop | Shop[] | null> {
    return this.http.get<Shop | Shop[] | null>(`${this.apiUrl}/shops/owner/${ownerId}`);
  }

  createShop(shopData: Partial<Shop>): Observable<Shop> {
    return this.http.post<Shop>(`${this.apiUrl}/shops`, shopData);
  }

  updateShop(shopId: number, shopData: Partial<Shop>): Observable<Shop> {
    return this.http.put<Shop>(`${this.apiUrl}/shops/${shopId}`, shopData);
  }

  assignateShopToBox(payload: {
    boxId: string;
    shopId: string;
    isAssignate: boolean;
    rent?: number | null;
    startDate?: string;
  }): Observable<Shop> {
    return this.http.patch<Shop>(`${this.apiUrl}/shops/assignate`, payload);
  }
}
