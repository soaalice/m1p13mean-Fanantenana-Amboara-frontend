

import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Product } from '../../shared/models/product';
import { ProductType, ProductTypeAttribute } from '../../shared/models/product-type';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { MyProductService } from '../../core/services/my-product.service';
import { ProductTypesService } from '../../core/services/product-types.service';
import { ShopsService } from '../../core/services/shops.service';

interface ProductWithImage extends Product {
  imageUrl: string;
}

export interface AttributeFilter {
  code: string;
  label: string;
  type: ProductTypeAttribute['type'];
  enumValues?: string[];
  numAttrMin: number | null;
  numAttrMax: number | null;
  // current values
  selectedEnum: string;
  textValue: string;
  numMin: number | null;
  numMax: number | null;
  boolValue: string;
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit, OnDestroy, AfterViewInit {
  products: ProductWithImage[] = [];
  isLoading = true;
  isLoadingMore = false;
  loadingTypes = false;
  searchQuery = '';
  selectedShopId = '';
  shopsForSelect: { _id: string; name: string }[] = [];
  private destroy$ = new Subject<void>();

  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalProducts = 0;
  readonly pageLimit = 12;

  productTypes: ProductType[] = [];
  selectedTypeId = '';
  attributeFilters: AttributeFilter[] = [];

  // Infinite scroll sentinel
  @ViewChild('scrollSentinel') scrollSentinel!: ElementRef;
  private observer: IntersectionObserver | null = null;

  /** Text-only client-side filter on the already-fetched products */
  get filteredProducts(): ProductWithImage[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.products;
    return this.products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.shop?.name ?? '').toLowerCase().includes(q)
    );
  }

  get selectedTypeName(): string {
    return this.productTypes.find(t => t._id === this.selectedTypeId)?.label ?? '';
  }

  get selectedShopName(): string {
    return this.shopsForSelect.find(s => s._id === this.selectedShopId)?.name ?? '';
  }

  get activeAttributeFilterCount(): number {
    return this.attributeFilters.filter(f =>
      f.selectedEnum || f.textValue?.trim() || f.numMin != null || f.numMax != null || f.boolValue !== ''
    ).length;
  }

  get skeletons(): number[] {
    return Array.from({ length: 8 }, (_, i) => i);
  }

  get hasMorePages(): boolean {
    return this.currentPage < this.totalPages;
  }

  constructor(
    private myProductService: MyProductService,
    private productTypesService: ProductTypesService,
    private shopsService: ShopsService,
  ) {}

  ngOnInit(): void {
    this.loadProducts(1);
    this.loadProductTypes();
    this.loadShops();
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.observer?.disconnect();
  }

  private setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(entries => {
      const entry = entries[0];
      if (entry.isIntersecting && this.hasMorePages && !this.isLoading && !this.isLoadingMore) {
        this.loadProducts(this.currentPage + 1);
      }
    }, { threshold: 0.1 });

    if (this.scrollSentinel?.nativeElement) {
      this.observer.observe(this.scrollSentinel.nativeElement);
    }
  }

  private buildFilterParams(page: number): Record<string, string> {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: this.pageLimit.toString()
    };

    if (this.selectedShopId) params['shopIds'] = this.selectedShopId;
    if (this.selectedTypeId) params['typeProduitIds'] = this.selectedTypeId;

    // Attribute filters – sent as individual query params  (backend supports them)
    for (const f of this.attributeFilters) {
      if (f.type === 'ENUM' && f.selectedEnum) {
        params[f.code] = f.selectedEnum;
      } else if (f.type === 'STRING' && f.textValue?.trim()) {
        params[f.code] = f.textValue.trim();
      } else if (f.type === 'BOOLEAN' && f.boolValue !== '') {
        params[f.code] = f.boolValue;
      } else if (f.type === 'NUMBER') {
        if (f.numMin != null) params['priceMin'] = f.numMin.toString();
        if (f.numMax != null) params['priceMax'] = f.numMax.toString();
      }
    }

    return params;
  }

  private loadProducts(page: number): void {
    if (page === 1) {
      this.isLoading = true;
    } else {
      this.isLoadingMore = true;
    }

    const params = this.buildFilterParams(page);

    this.myProductService.getProductsFiltered(params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        const newItems = res.data.map(p => ({ ...p, imageUrl: (p as any).photoUrl ?? '' }));
        if (page === 1) {
          this.products = newItems;
        } else {
          this.products = [...this.products, ...newItems];
        }
        this.currentPage = res.pagination.page;
        this.totalPages = res.pagination.pages;
        this.totalProducts = res.pagination.total;
        this.isLoading = false;
        this.isLoadingMore = false;
      },
      error: () => {
        this.isLoading = false;
        this.isLoadingMore = false;
      }
    });
  }

  private resetAndLoad(): void {
    this.products = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.loadProducts(1);
  }

  private loadShops(): void {
    this.shopsService.getShopsForSelect().pipe(takeUntil(this.destroy$)).subscribe({
      next: shops => { this.shopsForSelect = shops; },
      error: () => {}
    });
  }

  private loadProductTypes(): void {
    this.loadingTypes = true;
    this.productTypesService.getProductTypes(1, 100).subscribe({
      next: (res) => {
        this.productTypes = res.data;
        this.loadingTypes = false;
      },
      error: () => { this.loadingTypes = false; }
    });
  }

  onTypeChange(): void {
    const type = this.productTypes.find(t => t._id === this.selectedTypeId);
    this.attributeFilters = (type?.attributes ?? []).map(attr => ({
      code: attr.code,
      label: attr.code.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      type: attr.type,
      enumValues: attr.values,
      numAttrMin: attr.min ?? null,
      numAttrMax: attr.max ?? null,
      selectedEnum: '',
      textValue: '',
      numMin: null,
      numMax: null,
      boolValue: '',
    }));
    this.resetAndLoad();
  }

  onShopChange(): void {
    this.resetAndLoad();
  }

  applyAttributeFilters(): void {
    this.resetAndLoad();
  }

  resetAttributeFilters(): void {
    this.attributeFilters.forEach(f => {
      f.selectedEnum = '';
      f.textValue = '';
      f.numMin = null;
      f.numMax = null;
      f.boolValue = '';
    });
    this.resetAndLoad();
  }

  resetAll(): void {
    this.searchQuery = '';
    this.selectedTypeId = '';
    this.selectedShopId = '';
    this.attributeFilters = [];
    this.resetAndLoad();
  }

  formatLabel(code: string): string {
    return code.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
