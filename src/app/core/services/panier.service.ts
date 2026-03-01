import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartItem } from '../../shared/models/cart';
import { ApiSingleResponse, PageResult } from '../../shared/models/shared.model';

/** Shape expected by the backend panierItemSchema */
export interface PanierItemPayload {
  productId: string;
  name: string;
  price: number;
  qte: number;
  shop?: {
    _id: string;
    name: string;
  };
}

export interface Panier {
  _id: string;
  acheteurId?: string;
  items: PanierItemPayload[];
  total?: number;
  date?: string;
  etat?: string;
  createdAt?: string;
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
      shop: item.shop ? { _id: item.shop._id, name: item.shop.name } : undefined,
    };
  }

  /** POST /api/paniers — create a PENDING panier */
  create(items: CartItem[]): Observable<ApiSingleResponse<Panier>> {
    const payload = { items: items.map(i => this.toPayload(i)), etat: 'PENDING' };
    return this.http.post<ApiSingleResponse<Panier>>(this.base, payload);
  }

  /** POST /api/paniers — create a VALIDATED panier (achat immédiat) */
  createValidated(items: CartItem[]): Observable<ApiSingleResponse<Panier>> {
    const payload = { items: items.map(i => this.toPayload(i)), etat: 'VALIDATED' };
    return this.http.post<ApiSingleResponse<Panier>>(this.base, payload);
  }

  /** DELETE /api/paniers/:id */
  delete(id: string): Observable<ApiSingleResponse<Panier | null>> {
    return this.http.delete<ApiSingleResponse<Panier | null>>(`${this.base}/${id}`);
  }

  /** PATCH /api/paniers/:id/validate */
  validate(id: string): Observable<ApiSingleResponse<Panier>> {
    return this.http.patch<ApiSingleResponse<Panier>>(`${this.base}/${id}/validate`, {});
  }

  /** GET /api/paniers/my-paniers */
  getMyPaniers(page = 1, limit = 10): Observable<PageResult<Panier>> {
    return this.http.get<PageResult<Panier>>(`${this.base}/my-paniers?page=${page}&limit=${limit}`);
  }

  /** PUT /api/paniers/:id — update items on existing panier */
  update(id: string, items: CartItem[]): Observable<ApiSingleResponse<Panier>> {
    const payload = { items: items.map(i => this.toPayload(i)) };
    return this.http.put<ApiSingleResponse<Panier>>(`${this.base}/${id}`, payload);
  }

  /** GET /api/paniers/my-pending — panier PENDING de l'acheteur connecté */
  getMyPending(): Observable<ApiSingleResponse<Panier | null>> {
    return this.http.get<ApiSingleResponse<Panier | null>>(`${this.base}/my-pending`);
  }

  /** GET /api/paniers/transaction/:transactionId */
  getByTransactionId(transactionId: string): Observable<ApiSingleResponse<Panier>> {
    return this.http.get<ApiSingleResponse<Panier>>(`${this.base}/transaction/${transactionId}`);
  }
}
