import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Transaction } from '../../shared/models/transaction';
import { PageResult } from '../../shared/models/shared.model';

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

    return this.http.get<PageResult<Transaction>>(`${environment.apiUrl}/transactions/user/${userId}`, { params });
  }

  getTransactionById(transactionId: string): Observable<{ success: boolean; message: string; data: Transaction }> {
    return this.http.get<{ success: boolean; message: string; data: Transaction }>(`${environment.apiUrl}/transactions/${transactionId}`);
  }
}
