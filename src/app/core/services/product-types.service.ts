import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models/user';
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
}