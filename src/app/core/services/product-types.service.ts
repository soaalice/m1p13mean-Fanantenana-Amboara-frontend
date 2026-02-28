import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiSingleResponse, PageResult } from '../../shared/models/shared.model';
import { ProductType, CreateProductTypeDto } from '../../shared/models/product-type';

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

  createProductType(productType: CreateProductTypeDto): Observable<ProductType> {
    return this.http.post<ApiSingleResponse<ProductType>>(`${environment.apiUrl}/product-types`, productType)
      .pipe(map(response => response.data));
  }

  updateProductType(id: string, productType: CreateProductTypeDto): Observable<ProductType> {
    return this.http.put<ApiSingleResponse<ProductType>>(`${environment.apiUrl}/product-types/${id}`, productType)
      .pipe(map(response => response.data));
  }

  deleteProductType(id: string): Observable<void> {
    return this.http.delete<ApiSingleResponse<null>>(`${environment.apiUrl}/product-types/${id}`)
      .pipe(map(() => undefined));
  }
}