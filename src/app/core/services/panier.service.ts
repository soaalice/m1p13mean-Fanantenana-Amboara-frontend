import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartItem } from '../../shared/models/cart';

/** Shape expected by the backend panierItemSchema */
export interface PanierItemPayload {
  productId: string;
  name: string;
  price: number;
  qte: number;
}

export interface PanierResponse {
  success: boolean;
  message?: string;
  data: any;
}

@Injectable({ providedIn: 'root' })
export class PanierService {
  private base = `${environment.apiUrl}/paniers`;

  constructor(private http: HttpClient) {}

  /** Map frontend CartItem → backend payload */
  private toPayload(item: CartItem): PanierItemPayload {
    return {
      productId: item.produitId,
      name: item.nom,
      price: item.prix,
      qte: item.qte,
    };
  }

  /** POST /api/paniers — create a PENDING panier */
  create(items: CartItem[]): Observable<PanierResponse> {
    const payload = { items: items.map(i => this.toPayload(i)), etat: 'PENDING' };
    return this.http.post<PanierResponse>(this.base, payload);
  }

  /** POST /api/paniers — create a VALIDATED panier (achat immédiat) */
  createValidated(items: CartItem[]): Observable<PanierResponse> {
    const payload = { items: items.map(i => this.toPayload(i)), etat: 'VALIDATED' };
    return this.http.post<PanierResponse>(this.base, payload);
  }

  /** DELETE /api/paniers/:id */
  delete(id: string): Observable<PanierResponse> {
    return this.http.delete<PanierResponse>(`${this.base}/${id}`);
  }

  /** PATCH /api/paniers/:id/validate */
  validate(id: string): Observable<PanierResponse> {
    return this.http.patch<PanierResponse>(`${this.base}/${id}/validate`, {});
  }

  /** GET /api/paniers/my-paniers */
  getMyPaniers(page = 1, limit = 10): Observable<PanierResponse> {
    return this.http.get<PanierResponse>(`${this.base}/my-paniers?page=${page}&limit=${limit}`);
  }

  /** PUT /api/paniers/:id — update items on existing panier */
  update(id: string, items: CartItem[]): Observable<PanierResponse> {
    const payload = { items: items.map(i => this.toPayload(i)) };
    return this.http.put<PanierResponse>(`${this.base}/${id}`, payload);
  }

  /** GET /api/paniers/my-pending — panier PENDING de l'acheteur connecté */
  getMyPending(): Observable<PanierResponse> {
    return this.http.get<PanierResponse>(`${this.base}/my-pending`);
  }
}
