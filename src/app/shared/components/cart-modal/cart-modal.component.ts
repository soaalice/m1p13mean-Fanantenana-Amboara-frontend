import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { PanierService } from '../../../core/services/panier.service';
import { AuthService } from '../../../core/services/auth.service';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';
import { CartItem } from '../../models/cart';
import { map } from 'rxjs';

export interface ShopGroup {
  shopId: string;
  shopName: string;
  items: CartItem[];
}

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, AsyncPipe, LoaderComponent],
  templateUrl: './cart-modal.component.html',
  styleUrls: ['./cart-modal.component.scss']
})
export class CartModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  items$ = this.cartService.items$;
  activePanierId$ = this.cartService.activePanierId$;

  groupedItems$ = this.cartService.items$.pipe(
    map(items => this.groupByShop(items))
  );

  saving = false;
  buying = false;
  deleting = false;
  updating = false;
  saveError: string | null = null;
  buySuccess = false;
  checkingPending = false;

  constructor(
    private cartService: CartService,
    private panierService: PanierService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Si aucun panier PENDING en localStorage, on vérifie côté backend
    if (!this.cartService.getActivePanierId()) {
      this.checkingPending = true;
      this.panierService.getMyPending().subscribe({
        next: (res) => {
          this.checkingPending = false;
          const panier = res.data;
          if (res.success && panier?._id) {
            // Sauvegarder l'ID du panier PENDING
            this.cartService.setActivePanierId(panier._id);

            // Mapper les items backend → CartItem et charger dans le panier local
            const mapped = (panier.items ?? []).map((it: any) => ({
              produitId: it.productId,
              nom: it.name,
              prix: it.price,
              qte: it.qte,
              shop: it.shop ? { _id: it.shop._id, name: it.shop.name } : undefined,
            }));
            this.cartService.setItems(mapped);
          }
        },
        error: () => {
          // Pas de panier PENDING ou erreur réseau — on continue normalement
          this.checkingPending = false;
        },
      });
    }
  }

  increment(item: any) {
    this.cartService.updateQuantity(item.produitId, (item.qte || 0) + 1);
  }

  decrement(item: any) {
    const next = (item.qte || 0) - 1;
    if (next <= 0) {
      this.cartService.removeItem(item.produitId);
    } else {
      this.cartService.updateQuantity(item.produitId, next);
    }
  }

  remove(item: any) {
    this.cartService.removeItem(item.produitId);
  }

  onQtyChange(item: any, event: Event) {
    const qty = +(event.target as HTMLInputElement).value;
    if (qty <= 0) {
      this.cartService.removeItem(item.produitId);
    } else {
      this.cartService.updateQuantity(item.produitId, qty);
    }
  }

  getTotal(): number {
    return this.cartService.getTotal();
  }

  getGroupTotal(items: CartItem[]): number {
    return items.reduce((acc, it) => acc + (it.prix || 0) * (it.qte || 0), 0);
  }

  private groupByShop(items: CartItem[]): ShopGroup[] {
    const map = new Map<string, ShopGroup>();
    for (const item of items) {
      const key = item.shop?._id ?? '__no_shop__';
      if (!map.has(key)) {
        map.set(key, {
          shopId: key,
          shopName: item.shop?.name ?? 'Sans boutique',
          items: [],
        });
      }
      map.get(key)!.items.push(item);
    }
    return Array.from(map.values());
  }

  onClose() {
    this.buySuccess = false;
    this.close.emit();
  }

  /**
   * Acheter : crée un panier VALIDATED directement sur le backend.
   * Les items locaux sont effacés après succès → panier vide.
   * Si un panier PENDING existait, il est supprimé avant l'achat.
   */
  buyNow(): void {
    const items = this.cartService.getItems();
    if (!items.length) return;

    this.buying = true;
    this.saveError = null;

    const existingId = this.cartService.getActivePanierId();
    const doCreate = () => {
      this.panierService.createValidated(items).subscribe({
        next: (res) => {
          this.buying = false;
          if (res.success) {
            this.cartService.clear();
            this.cartService.clearActivePanierId();
            this.buySuccess = true;
            // Rafraîchit le solde de l'utilisateur depuis le backend
            this.authService.refreshCurrentUser();
          }
        },
        error: (err) => {
          this.buying = false;
          this.saveError = err?.error?.message || "Erreur lors de l'achat";
        },
      });
    };

    if (existingId) {
      // Supprimer le panier PENDING avant de créer le VALIDATED
      this.panierService.delete(existingId).subscribe({
        next: () => {
          this.cartService.clearActivePanierId();
          doCreate();
        },
        error: () => doCreate(), // si la suppression échoue, on achète quand même
      });
    } else {
      doCreate();
    }
  }

  /** Enregistrer le panier comme PENDING (pour y revenir plus tard) */
  savePanier(): void {
    const items = this.cartService.getItems();
    if (!items.length) return;
    this.saving = true;
    this.saveError = null;

    this.panierService.create(items).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.success && res.data?._id) {
          this.cartService.setActivePanierId(res.data._id);
        }
      },
      error: (err) => {
        this.saving = false;
        this.saveError = err?.error?.message || 'Erreur lors de la sauvegarde du panier';
      },
    });
  }

  /** Mettre à jour les items du panier PENDING enregistré */
  updatePanier(): void {
    const id = this.cartService.getActivePanierId();
    const items = this.cartService.getItems();
    if (!id || !items.length) return;
    this.updating = true;
    this.saveError = null;

    this.panierService.update(id, items).subscribe({
      next: () => {
        this.updating = false;
      },
      error: (err) => {
        this.updating = false;
        this.saveError = err?.error?.message || 'Erreur lors de la mise à jour du panier';
      },
    });
  }

  /** Supprimer le panier PENDING et vider le panier local */
  deletePanier(): void {
    const id = this.cartService.getActivePanierId();
    if (!id) return;
    this.deleting = true;
    this.saveError = null;

    this.panierService.delete(id).subscribe({
      next: () => {
        this.deleting = false;
        this.cartService.clearActivePanierId();
        this.cartService.clear();
      },
      error: (err) => {
        this.deleting = false;
        this.saveError = err?.error?.message || 'Erreur lors de la suppression du panier';
      },
    });
  }
}
