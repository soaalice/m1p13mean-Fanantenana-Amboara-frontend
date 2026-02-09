import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Transaction } from '../../shared/models/transaction';

export interface TransactionsResponse {
  success: boolean;
  message: string;
  data: Transaction[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  constructor(private http: HttpClient) { }

  getTransactions(
    page = 1,
    limit = 10,
    userId: string
  ): Observable<TransactionsResponse> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    return this.http.get<TransactionsResponse>(`${environment.apiUrl}/transactions/user/${userId}`, { params });
  }

  getTransactionById(transactionId: string): Observable<{ success: boolean; message: string; data: Transaction }> {
    return this.http.get<{ success: boolean; message: string; data: Transaction }>(`${environment.apiUrl}/transactions/${transactionId}`);
  }
}
