import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../../shared/models/cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private storageKey = 'app_cart';
  private panierIdKey = 'app_cart_panier_id';

  private itemsSub = new BehaviorSubject<CartItem[]>(this.loadFromStorage());
  private panierIdSub = new BehaviorSubject<string | null>(
    localStorage.getItem(this.panierIdKey)
  );

  activePanierId$ = this.panierIdSub.asObservable();
  items$ = this.itemsSub.asObservable();

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) as CartItem[] : [];
    } catch (e) {
      console.error('Failed to parse cart from storage', e);
      return [];
    }
  }

  private saveToStorage(items: CartItem[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      this.itemsSub.next(items);
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }

  getItems(): CartItem[] {
    return this.itemsSub.value;
  }

  addItem(item: CartItem, qty = 1) {
    const items = [...this.getItems()];
    const idx = items.findIndex(i => i.produitId === item.produitId);
    if (idx >= 0) {
      items[idx].qte = (items[idx].qte || 0) + qty;
    } else {
      items.push({ ...item, qte: qty });
    }
    this.saveToStorage(items);
  }

  updateQuantity(produitId: string, qte: number) {
    const items = [...this.getItems()];
    const idx = items.findIndex(i => i.produitId === produitId);
    if (idx >= 0) {
      if (qte <= 0) {
        items.splice(idx, 1);
      } else {
        items[idx].qte = qte;
      }
      this.saveToStorage(items);
    }
  }

  removeItem(produitId: string) {
    const items = this.getItems().filter(i => i.produitId !== produitId);
    this.saveToStorage(items);
  }

  clear() {
    this.saveToStorage([]);
  }

  /** Remplace tous les articles du panier (utilisé pour charger un panier PENDING depuis le backend) */
  setItems(items: CartItem[]) {
    this.saveToStorage(items);
  }

  getTotal(): number {
    return this.getItems().reduce((acc, it) => acc + (it.prix || 0) * (it.qte || 0), 0);
  }

  // ── Active panier ID ─────────────────────────────────────
  getActivePanierId(): string | null {
    return this.panierIdSub.value;
  }

  setActivePanierId(id: string): void {
    localStorage.setItem(this.panierIdKey, id);
    this.panierIdSub.next(id);
  }

  clearActivePanierId(): void {
    localStorage.removeItem(this.panierIdKey);
    this.panierIdSub.next(null);
  }
}
