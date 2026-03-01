import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Transaction } from '../../shared/models/transaction';
import { ApiSingleResponse, PageResult } from '../../shared/models/shared.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  constructor(private http: HttpClient) { }

  getTransactions(
    page = 1,
    limit = 10,
    userId: string,
    filters?: {
      type?: string;
      startDate?: string;
      endDate?: string;
      rentId?: string;
    }
  ): Observable<PageResult<Transaction>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (filters?.type) {
      params = params.set('type', filters.type);
    }

    if (filters?.startDate) {
      params = params.set('startDate', filters.startDate);
    }

    if (filters?.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    if (filters?.rentId) {
      params = params.set('rentId', filters.rentId);
    }

    return this.http.get<PageResult<Transaction>>(`${environment.apiUrl}/transactions/user/${userId}`, { params });
  }

  getAllTransactions(
    page = 1,
    limit = 10,
    filters?: {
      type?: string;
      startDate?: string;
      endDate?: string;
      rentId?: string;
    }
  ): Observable<PageResult<Transaction>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (filters?.type) {
      params = params.set('type', filters.type);
    }

    if (filters?.startDate) {
      params = params.set('startDate', filters.startDate);
    }

    if (filters?.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    if (filters?.rentId) {
      params = params.set('rentId', filters.rentId);
    }

    return this.http.get<PageResult<Transaction>>(`${environment.apiUrl}/transactions`, { params });
  }

  getTransactionById(transactionId: string): Observable<ApiSingleResponse<Transaction>> {
    return this.http.get<ApiSingleResponse<Transaction>>(`${environment.apiUrl}/transactions/${transactionId}`);
  }
}
