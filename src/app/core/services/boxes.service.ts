// box.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Box } from '../../shared/models/box';
import { environment } from '../../../environments/environment';
import { PageResult } from '../../shared/models/shared.model';

@Injectable({ providedIn: 'root' })
export class BoxService {

  private apiUrl = environment.apiUrl;
 
  constructor(private http: HttpClient) {}

  getBoxes(params?: { page?: number; limit?: number; state?: string; search?: string }): Observable<PageResult<Box>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.state) httpParams = httpParams.set('state', params.state);
      if (params.search) httpParams = httpParams.set('search', params.search);
    }

    return this.http.get<PageResult<Box>>(`${this.apiUrl}/boxes`, { params: httpParams });
  }

  createBox(payload: Omit<Box, '_id'>): Observable<Box> {
    return this.http.post<Box>(`${this.apiUrl}/boxes`, payload);
  }
}
