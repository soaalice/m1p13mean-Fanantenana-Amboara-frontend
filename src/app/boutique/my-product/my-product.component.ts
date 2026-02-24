import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { Product } from '../../shared/models/product';
import { ModalFormsComponent } from '../../shared/components/modal-forms/modal-forms.component';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-my-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    ModalFormsComponent
  ],
  templateUrl: './my-product.component.html',
  styleUrl: './my-product.component.scss'
})
export class MyProductComponent implements OnInit {
  displayedColumns = ['id', 'name', 'price', 'stock', 'productType', 'shop', 'attributes', 'status', 'actions'];
  pageSizeOptions = [5, 10, 25];

  products: Product[] = [];
  isLoading = false;
  loadError = '';
  page = 1;
  limit = 10;
  total = 0;

  isModalOpen = false;
  isEditMode = false;
  isSubmitting = false;
  submitError = '';
  selectedProduct: Product | null = null;

  statusOptions = ['ACTIVE', 'INACTIVE'];

  productForm = this.fb.group({
    _id: ['', Validators.required],
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    productTypeId: ['', Validators.required],
    status: ['ACTIVE', Validators.required]
  });

  // Static mock data
  private allProducts: Product[] = [
    {
      _id: 'PRD-001',
      name: 'Tomates cerises',
      price: 2500,
      productTypeId: 'PT-001',
      shop: { _id: 'SHP-001', name: 'Légumes du marché' },
      attributes: { COLOR: 'RED', BRAND: 'BioFarm' },
      stock: 120,
      promotion: { active: true, reduction: 10 },
      status: 'ACTIVE'
    },
    {
      _id: 'PRD-002',
      name: 'Carottes',
      price: 1800,
      productTypeId: 'PT-001',
      shop: { _id: 'SHP-001', name: 'Légumes du marché' },
      attributes: { SIZE: 'LARGE' },
      stock: 80,
      promotion: { active: false },
      status: 'ACTIVE'
    },
    {
      _id: 'PRD-003',
      name: 'Pommes golden',
      price: 4500,
      productTypeId: 'PT-002',
      shop: { _id: 'SHP-001', name: 'Légumes du marché' },
      attributes: {},
      stock: 0,
      promotion: { active: false },
      status: 'INACTIVE'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private sidebarService: SidebarService) { }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;
    this.loadError = '';
    // Static: simulate a short delay
    setTimeout(() => {
      this.products = this.allProducts;
      this.total = this.allProducts.length;
      this.isLoading = false;
    }, 300);
  }

  onPageChange(event: PageEvent): void {
    this.limit = event.pageSize;
    this.page = event.pageIndex + 1;
    this.fetchData();
  }

  getAttributeBadges(product: Product): Array<{ label: string; key: string }> {
    if (!product.attributes || Object.keys(product.attributes).length === 0) {
      return [{ label: 'No attributes', key: 'NONE' }];
    }
    return Object.entries(product.attributes).map(([key, value]) => ({
      label: `${key}: ${value}`,
      key
    }));
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE': return 'status-badge status-active';
      case 'INACTIVE': return 'status-badge status-inactive';
      default: return 'status-badge';
    }
  }

  openProductModal(): void {
    this.sidebarService.requestCloseSidebar();
    this.isEditMode = false;
    this.selectedProduct = null;
    this.submitError = '';
    this.productForm.reset({ price: 0, stock: 0, status: 'ACTIVE' });
    this.isModalOpen = true;
  }

  onEdit(product: Product): void {
    this.isEditMode = true;
    this.selectedProduct = product;
    this.submitError = '';
    this.productForm.patchValue({
      _id: product._id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      productTypeId: product.productTypeId,
      status: product.status
    });
    this.isModalOpen = true;
  }

  onDelete(product: Product): void {
    // Static: just remove from list
    this.products = this.products.filter(p => p._id !== product._id);
    this.total = this.products.length;
  }

  onSubmit(): void {
    if (this.productForm.invalid) return;
    this.isSubmitting = true;
    this.submitError = '';

    setTimeout(() => {
      const val = this.productForm.value;
      if (this.isEditMode && this.selectedProduct) {
        const idx = this.products.findIndex(p => p._id === this.selectedProduct!._id);
        if (idx !== -1) {
          this.products[idx] = { ...this.products[idx], ...val as Partial<Product> };
          this.products = [...this.products];
        }
      } else {
        const newProduct: Product = {
          _id: val._id!,
          name: val.name!,
          price: val.price!,
          stock: val.stock!,
          productTypeId: val.productTypeId!,
          shop: { _id: '', name: '' },
          status: (val.status as 'ACTIVE' | 'INACTIVE') ?? 'ACTIVE'
        };
        this.products = [...this.products, newProduct];
        this.total = this.products.length;
      }
      this.isSubmitting = false;
      this.isModalOpen = false;
    }, 300);
  }

  closeProductModal(): void {
    this.isModalOpen = false;
  }
}

