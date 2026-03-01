import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Shop } from '../../shared/models/shop';
import { ApiSingleResponse, PageResult } from '../../shared/models/shared.model';

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
    return this.http
      .get<ApiSingleResponse<Shop | Shop[] | null>>(`${this.apiUrl}/shops/owner/${ownerId}`)
      .pipe(map(response => response.data));
  }

  createShop(shopData: Partial<Shop>, photoFile?: File): Observable<Shop> {
    const formData = new FormData();
    if (shopData.name) formData.append('name', shopData.name);
    if (photoFile) formData.append('photo', photoFile, photoFile.name);
    return this.http.post<ApiSingleResponse<Shop>>(`${this.apiUrl}/shops`, formData)
      .pipe(map(response => response.data));
  }

  updateShop(shopId: string, shopData: Partial<Shop>, photoFile?: File): Observable<Shop> {
    const formData = new FormData();
    if (shopData.name !== undefined) formData.append('name', shopData.name);
    if (shopData.status !== undefined) formData.append('status', shopData.status);
    if (photoFile) formData.append('photo', photoFile, photoFile.name);
    return this.http.put<ApiSingleResponse<Shop>>(`${this.apiUrl}/shops/${shopId}`, formData)
      .pipe(map(response => response.data));
  }

  /** POST /shops/:id/photo — update only the photo */
  updatePhoto(shopId: string, photoFile: File): Observable<Shop> {
    const formData = new FormData();
    formData.append('photo', photoFile, photoFile.name);
    return this.http.post<ApiSingleResponse<Shop>>(`${this.apiUrl}/shops/${shopId}/photo`, formData)
      .pipe(map(res => res.data));
  }

  /** DELETE /shops/:id/photo — remove the photo */
  removePhoto(shopId: string): Observable<Shop> {
    return this.http.delete<ApiSingleResponse<Shop>>(`${this.apiUrl}/shops/${shopId}/photo`)
      .pipe(map(res => res.data));
  }

  assignateShopToBox(payload: {
    boxId: string;
    shopId: string;
    isAssignate: boolean;
    rent?: number | null;
    startDate?: string;
  }): Observable<Shop> {
    return this.http.patch<ApiSingleResponse<Shop>>(`${this.apiUrl}/shops/assignate`, payload)
      .pipe(map(response => response.data));
  }
}
