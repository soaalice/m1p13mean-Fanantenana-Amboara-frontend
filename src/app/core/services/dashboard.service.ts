import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiSingleResponse } from '../../shared/models/shared.model';
import { AdminDashboardData, AdminNetSalesData } from '../../shared/models/dashboard';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAdminDashboard(): Observable<AdminDashboardData> {
    return this.http
      .get<ApiSingleResponse<AdminDashboardData>>(`${this.apiUrl}/dashboard/admin`)
      .pipe(map(response => response.data));
  }

  getAdminNetSales(year: number): Observable<AdminNetSalesData> {
    return this.http
      .get<ApiSingleResponse<AdminNetSalesData>>(`${this.apiUrl}/dashboard/admin/net-sales?year=${year}`)
      .pipe(map(response => response.data));
  }

}
