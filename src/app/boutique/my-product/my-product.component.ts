import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Product, CreateProductDto } from '../../shared/models/product';
import { CreateProductModalComponent } from './create-product-modal/create-product-modal.component';
import { AddStockModalComponent } from './add-stock-modal/add-stock-modal.component';
import { SidebarService } from '../../core/services/sidebar.service';
import { MyProductService } from '../../core/services/my-product.service';
import { ProductTypeSelect } from '../../shared/models/product-type';

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
    MatSelectModule,
    MatCheckboxModule,
    CreateProductModalComponent,
    AddStockModalComponent
  ],
  templateUrl:
   './my-product.component.html',
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
  productTypes: ProductTypeSelect[] = [];
  selectedProductType: ProductTypeSelect | null = null;
  isLoadingProductTypes = false;

  productForm = this.fb.group({
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    productTypeId: ['', Validators.required],
    status: ['ACTIVE', Validators.required]
  });

  attributesForm: FormGroup = this.fb.group({});

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
    private sidebarService: SidebarService,
    private myProductService: MyProductService) { }

  ngOnInit(): void {
    this.fetchData();
    this.loadProductTypes();
  }

  loadProductTypes(): void {
    this.isLoadingProductTypes = true;
    this.myProductService.getProductTypesForSelect().subscribe({
      next: (types) => {
        this.productTypes = types;
        this.isLoadingProductTypes = false;
      },
      error: (err) => {
        console.error('Error loading product types:', err);
        this.isLoadingProductTypes = false;
      }
    });
  }

  onProductTypeChange(productTypeId: string): void {
    this.selectedProductType = this.productTypes.find(pt => pt.id === productTypeId) || null;
    this.generateAttributeFields();
  }

  generateAttributeFields(): void {
    // Clear existing attribute controls
    Object.keys(this.attributesForm.controls).forEach(key => {
      this.attributesForm.removeControl(key);
    });

    if (!this.selectedProductType?.attributes) {
      return;
    }

    // Generate dynamic controls based on attribute types
    this.selectedProductType.attributes.forEach(attr => {
      let defaultValue: any = null;
      let validators = [];

      switch (attr.type) {
        case 'STRING':
          defaultValue = '';
          break;
        case 'NUMBER':
          defaultValue = attr.min || 0;
          if (attr.min !== undefined) {
            validators.push(Validators.min(attr.min));
          }
          if (attr.max !== undefined) {
            validators.push(Validators.max(attr.max));
          }
          break;
        case 'BOOLEAN':
          defaultValue = false;
          break;
        case 'ENUM':
          defaultValue = attr.values && attr.values.length > 0 ? attr.values[0] : '';
          break;
        case 'DATE':
          defaultValue = '';
          break;
      }

      this.attributesForm.addControl(attr.code, this.fb.control(defaultValue, validators));
    });
  }

  fetchData(): void {
    this.isLoading = true;
    this.loadError = '';

    this.myProductService.getProducts(this.page, this.limit).subscribe({
      next: (res) => {
        this.products = res.data;
        this.total = res.pagination?.total ?? res.data.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        // Fallback to static data when API fails
        this.products = this.allProducts;
        this.total = this.allProducts.length;
        this.isLoading = false;
        this.loadError = 'Unable to load products from server, showing local data.';
      }
    });
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
    this.selectedProductType = null;
    this.productForm.reset({ price: 0, status: 'ACTIVE' });
    this.attributesForm.reset();
    this.generateAttributeFields();
    this.isModalOpen = true;
  }

  // --- Add stock modal handlers ---
  isStockModalOpen = false;
  stockModalProduct: Product | null = null;
  isStockSubmitting = false;
  stockSubmitError = '';

  openStockModal(product: Product): void {
    this.sidebarService.requestCloseSidebar();
    this.stockModalProduct = product;
    this.stockSubmitError = '';
    this.isStockModalOpen = true;
  }

  closeStockModal(): void {
    this.isStockModalOpen = false;
    this.stockModalProduct = null;
  }

  onAddStock(quantity: number): void {
    if (!this.stockModalProduct) return;
    this.isStockSubmitting = true;
    this.stockSubmitError = '';
    // Call backend API to add stock
    this.myProductService.addStock(this.stockModalProduct._id, quantity).subscribe({
      next: (updatedProduct) => {
        const idx = this.products.findIndex(p => p._id === updatedProduct._id);
        if (idx !== -1) {
          // replace immutably so Angular change detection updates the table
          const next = [...this.products];
          next[idx] = updatedProduct;
          this.products = next;
        } else {
          // if not found, prepend to keep newest first
          this.products = [updatedProduct, ...this.products];
        }
        this.total = this.products.length;
        this.isStockSubmitting = false;
        this.closeStockModal();
      },
      error: (err) => {
        console.error('Error adding stock:', err);
        this.stockSubmitError = 'Failed to add stock. Please try again.';
        this.isStockSubmitting = false;
      }
    });
  }

  onEdit(product: Product): void {
    this.isEditMode = true;
    this.selectedProduct = product;
    this.submitError = '';
    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      productTypeId: product.productTypeId,
      status: product.status
    });
    
    // Load product type and set attributes
    this.selectedProductType = this.productTypes.find(pt => pt.id === product.productTypeId) || null;
    this.generateAttributeFields();
    
    if (product.attributes) {
      this.attributesForm.patchValue(product.attributes);
    }
    
    this.isModalOpen = true;
  }

  onDelete(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.myProductService.deleteProduct(product._id).subscribe({
        next: () => {
          // Remove product from local list after successful deletion
          this.products = this.products.filter(p => p._id !== product._id);
          this.total = this.products.length;
          console.log('Product deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          // Could add a toast notification here
          alert('Failed to delete product. Please try again.');
        }
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid || this.isSubmitting) return;
    this.isSubmitting = true;
    this.submitError = '';

    const val = this.productForm.value;
    const attributes = this.attributesForm.value;
    
    if (this.isEditMode && this.selectedProduct) {
      // Mode édition - simulation pour l'instant
      setTimeout(() => {
        const idx = this.products.findIndex(p => p._id === this.selectedProduct!._id);
        if (idx !== -1) {
          this.products[idx] = { 
            ...this.products[idx], 
            ...val as Partial<Product>,
            attributes
          };
          this.products = [...this.products];
        }
        this.isSubmitting = false;
        this.isModalOpen = false;
      }, 300);
    } else {
      // Mode création - utilise le service
      const createProductDto: CreateProductDto = {
        name: val.name!,
        price: val.price!,
        productTypeId: val.productTypeId!,
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined
      };

      this.myProductService.createProduct(createProductDto).subscribe({
        next: (createdProduct) => {
          console.log('Product created successfully:', createdProduct);
          this.products = [...this.products, createdProduct];
          this.total = this.products.length;
          this.isModalOpen = false;
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error creating product:', err);
          this.submitError = 'Failed to create product. Please try again.';
          this.isSubmitting = false;
        }
      });
    }
  }

  closeProductModal(): void {
    this.isModalOpen = false;
  }

  get nonBooleanAttributes() {
    if (!this.selectedProductType?.attributes) return [];
    return this.selectedProductType.attributes.filter(attr => attr.type !== 'BOOLEAN');
  }

  get booleanAttributes() {
    if (!this.selectedProductType?.attributes) return [];
    return this.selectedProductType.attributes.filter(attr => attr.type === 'BOOLEAN');
  }
}

