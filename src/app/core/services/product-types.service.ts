import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResult } from '../../shared/models/shared.model';
import { ProductType } from '../../shared/models/product-type';

@Injectable({
  providedIn: 'root'
})
export class ProductTypesService {

  constructor(private http: HttpClient) { }

  getProductTypes(
    page = 1,
    limit = 10
  ): Observable<PageResult<ProductType>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    return this.http.get<PageResult<ProductType>>(`${environment.apiUrl}/product-types`, { params });
  }

  createProductType(productType: ProductType): Observable<ProductType> {
    return this.http.post<ProductType>(`${environment.apiUrl}/product-types`, productType);
  }

  updateProductType(id: string, productType: ProductType): Observable<ProductType> {
    return this.http.put<ProductType>(`${environment.apiUrl}/product-types/${id}`, productType);
  }

  deleteProductType(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/product-types/${id}`);
  }
}