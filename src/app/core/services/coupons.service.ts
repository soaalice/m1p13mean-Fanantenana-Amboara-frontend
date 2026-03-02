import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Coupon, CreateCouponDto } from '../../shared/models/coupon';
import { ApiSingleResponse, PageResult } from '../../shared/models/shared.model';

@Injectable({
  providedIn: 'root'
})
export class CouponsService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMyCoupons(page = 1, limit = 10): Observable<PageResult<Coupon>> {
    const params = {
      page: page.toString(),
      limit: limit.toString(),
    };

    return this.http.get<PageResult<Coupon>>(`${this.apiUrl}/coupons/my-coupons`, { params });
  }

  createCoupon(payload: CreateCouponDto): Observable<Coupon> {
    return this.http.post<ApiSingleResponse<Coupon>>(`${this.apiUrl}/coupons`, payload)
      .pipe(map(response => response.data));
  }
}
