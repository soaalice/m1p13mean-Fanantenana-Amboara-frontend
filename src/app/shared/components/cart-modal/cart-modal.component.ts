import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { PanierService } from '../../../core/services/panier.service';
import { AuthService } from '../../../core/services/auth.service';
import { CouponsService } from '../../../core/services/coupons.service';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { LoaderComponent } from '../loader/loader.component';
import { CartItem } from '../../models/cart';
import { Coupon } from '../../models/coupon';
import { map, Subscription } from 'rxjs';

export interface ShopGroup {
  shopId: string;
  shopName: string;
  items: CartItem[];
}

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf, AsyncPipe, LoaderComponent],
  templateUrl: './cart-modal.component.html',
  styleUrls: ['./cart-modal.component.scss']
})
export class CartModalComponent implements OnInit, OnDestroy {
  private readonly appliedCouponStorageKey = 'cart_modal_applied_coupon';
  private itemsSubscription?: Subscription;

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

  // Coupon
  couponCode = '';
  appliedCoupon: Coupon | null = null;
  couponLoading = false;
  couponError: string | null = null;

  constructor(
    private cartService: CartService,
    private panierService: PanierService,
    private authService: AuthService,
    private couponsService: CouponsService
  ) {}

  ngOnInit(): void {
    this.restoreAppliedCouponFromStorage();
    this.itemsSubscription = this.items$.subscribe(() => {
      this.invalidateAppliedCouponIfNeeded();
    });

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

  ngOnDestroy(): void {
    this.itemsSubscription?.unsubscribe();
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

  // ── Coupon ──────────────────────────────────────────────────────────────

  applyCoupon(): void {
    const code = this.couponCode.trim();
    if (!code) return;
    this.couponLoading = true;
    this.couponError = null;
    this.appliedCoupon = null;

    this.couponsService.getValidCouponByCode(code).subscribe({
      next: (coupon) => {
        this.couponLoading = false;
        if (!coupon) {
          this.couponError = 'Coupon introuvable';
          return;
        }
        // Vérifier expiration
        if (new Date(coupon.expiresAt) < new Date()) {
          this.couponError = 'Ce coupon a expiré';
          return;
        }
        // Pour PACK : vérifier que TOUS les produits du coupon sont dans le panier
        if (coupon.type === 'PACK') {
          const cartItems = this.cartService.getItems();
          const cartProductIds = new Set(cartItems.map(i => i.produitId));
          const allPresent = coupon.items.every(ci => cartProductIds.has(ci._id!));
          if (!allPresent) {
            this.couponError = 'Tous les produits du pack doivent être dans le panier';
            return;
          }
        }
        // Pour SINGLE : vérifier qu'au moins un produit éligible est dans le panier
        if (coupon.type === 'SINGLE') {
          const cartItems = this.cartService.getItems();
          const cartProductIds = new Set(cartItems.map(i => i.produitId));
          const hasAny = coupon.items.some(ci => cartProductIds.has(ci._id!));
          if (!hasAny) {
            this.couponError = 'Aucun article éligible à ce coupon dans votre panier';
            return;
          }
        }
        this.appliedCoupon = coupon;
        this.persistAppliedCouponToStorage(coupon);
      },
      error: (err) => {
        this.couponLoading = false;
        this.couponError = err?.error?.message || 'Coupon invalide ou introuvable';
      },
    });
  }

  removeCoupon(): void {
    this.appliedCoupon = null;
    this.couponCode = '';
    this.couponError = null;
    this.clearAppliedCouponStorage();
  }

  private restoreAppliedCouponFromStorage(): void {
    const rawCoupon = localStorage.getItem(this.appliedCouponStorageKey);
    if (!rawCoupon) return;

    try {
      const coupon = JSON.parse(rawCoupon) as Coupon;

      if (!coupon || new Date(coupon.expiresAt) < new Date()) {
        this.clearAppliedCouponStorage();
        return;
      }

      if (!this.isCouponEligibleForCurrentCart(coupon)) {
        this.clearAppliedCouponStorage();
        return;
      }

      this.appliedCoupon = coupon;
      this.couponCode = coupon.code;
    } catch {
      this.clearAppliedCouponStorage();
    }
  }

  private isCouponEligibleForCurrentCart(coupon: Coupon): boolean {
    const cartItems = this.cartService.getItems();
    const cartProductIds = new Set(cartItems.map(item => item.produitId));

    if (coupon.type === 'PACK') {
      return coupon.items.every(item => !!item._id && cartProductIds.has(item._id));
    }

    if (coupon.type === 'SINGLE') {
      return coupon.items.some(item => !!item._id && cartProductIds.has(item._id));
    }

    return false;
  }

  private persistAppliedCouponToStorage(coupon: Coupon): void {
    localStorage.setItem(this.appliedCouponStorageKey, JSON.stringify(coupon));
  }

  private clearAppliedCouponStorage(): void {
    localStorage.removeItem(this.appliedCouponStorageKey);
  }

  private invalidateAppliedCouponIfNeeded(): void {
    if (!this.appliedCoupon) return;

    if (new Date(this.appliedCoupon.expiresAt) < new Date()) {
      this.appliedCoupon = null;
      this.clearAppliedCouponStorage();
      this.couponError = 'Ce coupon a expiré';
      return;
    }

    if (this.isCouponEligibleForCurrentCart(this.appliedCoupon)) {
      return;
    }

    const previousType = this.appliedCoupon.type;
    this.appliedCoupon = null;
    this.clearAppliedCouponStorage();

    this.couponError = previousType === 'PACK'
      ? 'Tous les produits du pack doivent être dans le panier'
      : 'Aucun article éligible à ce coupon dans votre panier';
  }

  /** Retourne les détails de la réduction par article */
  getDiscountDetails(): { item: CartItem; discount: number }[] {
    if (!this.appliedCoupon) return [];
    const cartItems = this.cartService.getItems();
    const couponItemIds = new Set(this.appliedCoupon.items.map(ci => ci._id));
    const pct = this.appliedCoupon.percentage / 100;

    if (this.appliedCoupon.type === 'SINGLE') {
      // Remise par article individuel
      return cartItems
        .filter(ci => couponItemIds.has(ci.produitId))
        .map(ci => ({ item: ci, discount: ci.prix * ci.qte * pct }));
    }

    // PACK : remise sur le total du pack
    if (this.appliedCoupon.type === 'PACK') {
      const matched = cartItems.filter(ci => couponItemIds.has(ci.produitId));
      const packTotal = matched.reduce((s, ci) => s + ci.prix * ci.qte, 0);
      const packDiscount = packTotal * pct;
      // On affiche une seule ligne pour le pack
      if (matched.length > 0) {
        return [{ item: matched[0], discount: packDiscount }];
      }
    }
    return [];
  }

  /** Montant total de la réduction */
  getTotalDiscount(): number {
    return this.getDiscountDetails().reduce((s, d) => s + d.discount, 0);
  }

  /** Total après réduction */
  getDiscountedTotal(): number {
    return this.getTotal() - this.getTotalDiscount();
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
      this.panierService.createValidated(items, this.appliedCoupon?._id ?? null).subscribe({
        next: (res) => {
          this.buying = false;
          if (res.success) {
            this.cartService.clear();
            this.cartService.clearActivePanierId();
            this.removeCoupon();
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
        this.removeCoupon();
      },
      error: (err) => {
        this.deleting = false;
        this.saveError = err?.error?.message || 'Erreur lors de la suppression du panier';
      },
    });
  }
}
