import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PageResult } from '../../shared/models/shared.model';
import { Command } from '../../shared/models/command.model';

@Injectable({
  providedIn: 'root'
})
export class CommandService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMyCommands(page = 1, limit = 10): Observable<PageResult<Command>> {
    const params = {
      page: page.toString(),
      limit: limit.toString()
    };
    return this.http.get<PageResult<Command>>(`${this.apiUrl}/commands/my-commands`, { params });
  }

  getByTransactionId(transactionId: string): Observable<{ success: boolean; data: Command }> {
    return this.http.get<{ success: boolean; data: Command }>(`${this.apiUrl}/commands/transaction/${transactionId}`);
  }
}
