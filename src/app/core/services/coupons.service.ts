import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Coupon, CouponDetails, CreateCouponDto } from '../../shared/models/coupon';
import { ApiSingleResponse, PageResult } from '../../shared/models/shared.model';

@Injectable({
  providedIn: 'root'
})
export class CouponsService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMyCoupons(page = 1, limit = 10, filters: { type?: string; status?: string } = {}): Observable<PageResult<Coupon>> {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };
    if (filters.type) params['type'] = filters.type;
    if (filters.status) params['status'] = filters.status;

    return this.http.get<PageResult<Coupon>>(`${this.apiUrl}/coupons/my-coupons`, { params });
  }

  getActiveCoupons(page = 1, limit = 10): Observable<PageResult<Coupon>> {
    const params = {
      page: page.toString(),
      limit: limit.toString(),
    };

    return this.http.get<PageResult<Coupon>>(`${this.apiUrl}/coupons/active`, { params });
  }

  getDetails(couponId: string): Observable<CouponDetails> {
    return this.http.get<ApiSingleResponse<CouponDetails>>(`${this.apiUrl}/coupons/${couponId}/details`)
      .pipe(map(response => response.data));
  }

  createCoupon(payload: CreateCouponDto): Observable<Coupon> {
    return this.http.post<ApiSingleResponse<Coupon>>(`${this.apiUrl}/coupons`, payload)
      .pipe(map(response => response.data));
  }

  getValidCouponByCode(code: string): Observable<Coupon> {
    return this.http.get<ApiSingleResponse<Coupon>>(`${this.apiUrl}/coupons/code/${code}`)
      .pipe(map(response => response.data));
  }
}
