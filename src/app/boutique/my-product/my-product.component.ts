import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MyProduct, Product, CreateProductDto } from '../../shared/models/product';
import { CreateProductModalComponent } from './create-product-modal/create-product-modal.component';
import { AddStockModalComponent } from './add-stock-modal/add-stock-modal.component';
import { UpdatePhotoModalComponent } from './update-photo-modal/update-photo-modal.component';
import { SidebarService } from '../../core/services/sidebar.service';
import { MyProductService } from '../../core/services/my-product.service';
import { ProductTypeSelect } from '../../shared/models/product-type';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

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
    AddStockModalComponent,
    UpdatePhotoModalComponent,
    LoaderComponent
  ],
  templateUrl:
   './my-product.component.html',
  styleUrl: './my-product.component.scss'
})
export class MyProductComponent implements OnInit {
  displayedColumns = ['photo', 'id', 'name', 'price', 'stock', 'productType', 'attributes', 'status', 'actions'];
  pageSizeOptions = [5, 10, 25];

  products: MyProduct[] = [];
  isLoading = false;
  loadError = '';
  page = 1;
  limit = 10;
  total = 0;

  isModalOpen = false;
  isEditMode = false;
  isSubmitting = false;
  submitError = '';
  selectedProduct: MyProduct | null = null;
  selectedPhotoFile: File | null = null;

  statusOptions = ['ACTIVE', 'INACTIVE'];
  productTypes: ProductTypeSelect[] = [];
  selectedProductType: ProductTypeSelect | null = null;
  isLoadingProductTypes = false;

  productForm = this.fb.group({
    name: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    productTypeId: ['', Validators.required],
    status: ['ACTIVE', Validators.required],
    photoUrl: ['']
  });

  attributesForm: FormGroup = this.fb.group({});

  constructor(
    private fb: FormBuilder,
    private router: Router,
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
      error: () => {
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

    this.myProductService.getMyProduct(this.page, this.limit).subscribe({
      next: (res) => {
        this.products = res.data;
        this.total = res.pagination?.total ?? res.data.length;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.loadError = err.error?.message || 'Impossible de charger les produits.';
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.limit = event.pageSize;
    this.page = event.pageIndex + 1;
    this.fetchData();
  }

  getAttributeBadges(product: MyProduct): Array<{ label: string; key: string }> {
    if (!product.attributes || Object.keys(product.attributes).length === 0) {
      return [{ label: 'Aucune attribut', key: 'NONE' }];
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
    this.selectedPhotoFile = null;
    this.submitError = '';
    this.selectedProductType = null;
    this.productForm.reset({ price: 0, status: 'ACTIVE', photoUrl: '' });
    this.attributesForm.reset();
    this.generateAttributeFields();
    this.isModalOpen = true;
  }

  // --- Preview navigation ---
  navigateToPreview(product: MyProduct): void {
    this.router.navigate(['/boutique/product-preview', product._id]);
  }

  // --- Add stock modal handlers ---
  isStockModalOpen = false;
  stockModalProduct: MyProduct | null = null;
  isStockSubmitting = false;
  stockSubmitError = '';

  openStockModal(product: MyProduct): void {
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

    this.myProductService.addStock(this.stockModalProduct._id, quantity).subscribe({
      next: (updatedProduct) => {
        this.patchProductField(updatedProduct._id, { stock: updatedProduct.stock });
        this.isStockSubmitting = false;
        this.closeStockModal();
      },
      error: (err) => {
        this.stockSubmitError = err.error?.message || 'Impossible d\'ajouter le stock.';
        this.isStockSubmitting = false;
      }
    });
  }

  onEdit(product: MyProduct): void {
    this.isEditMode = true;
    this.selectedProduct = product;
    this.submitError = '';
    this.productForm.patchValue({
      name: product.name,
      price: product.price,
      productTypeId: product.productTypeId,
      status: product.status,
      photoUrl: product.photoUrl || ''
    });
    
    // Load product type and set attributes
    this.selectedProductType = this.productTypes.find(pt => pt.id === product.productTypeId) || null;
    this.generateAttributeFields();
    
    if (product.attributes) {
      this.attributesForm.patchValue(product.attributes);
    }

    this.isModalOpen = true;
  }

  onDelete(product: MyProduct): void {
    if (confirm(`Vous êtes sûr de vouloir supprimer "${product.name}"?`)) {
      this.myProductService.deleteProduct(product._id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p._id !== product._id);
          this.total--;
        },
        error: (err) => {
          this.loadError = err.error?.message || 'Impossible de supprimer le produit.';
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
      const updateData: Partial<CreateProductDto> & { status?: string } = {
        name: val.name!,
        price: val.price!,
        productTypeId: val.productTypeId!,
        status: val.status!,
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined
      };

      this.myProductService.updateProduct(
        this.selectedProduct._id, 
        updateData, 
        this.selectedPhotoFile || undefined
      ).subscribe({
        next: () => {
          this.fetchData();
          this.isSubmitting = false;
          this.isModalOpen = false;
        },
        error: (err) => {
          this.submitError = err.error?.message || 'Impossible de mettre à jour le produit.';
          this.isSubmitting = false;
        }
      });
    } else {
      const createProductDto: CreateProductDto = {
        name: val.name!,
        price: val.price!,
        productTypeId: val.productTypeId!,
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined
      };

      this.myProductService.createProduct(createProductDto, this.selectedPhotoFile || undefined).subscribe({
        next: () => {
          this.fetchData();
          this.isModalOpen = false;
          this.isSubmitting = false;
        },
        error: (err) => {
          this.submitError = err.error?.message || 'Impossible de créer le produit.';
          this.isSubmitting = false;
        }
      });
    }
  }

  onImageChange(file: File | null): void {
    this.selectedPhotoFile = file;
  }

  closeProductModal(): void {
    this.isModalOpen = false;
  }

  // --- Update photo modal handlers ---
  isPhotoModalOpen = false;
  photoModalProduct: MyProduct | null = null;
  isPhotoSubmitting = false;
  photoSubmitError = '';

  openPhotoModal(product: MyProduct): void {
    this.sidebarService.requestCloseSidebar();
    this.photoModalProduct = product;
    this.photoSubmitError = '';
    this.isPhotoModalOpen = true;
  }

  closePhotoModal(): void {
    this.isPhotoModalOpen = false;
    this.photoModalProduct = null;
  }

  onUpdatePhoto(photoFile: File): void {
    if (!this.photoModalProduct) return;
    this.isPhotoSubmitting = true;
    this.photoSubmitError = '';

    this.myProductService.updatePhoto(this.photoModalProduct._id, photoFile).subscribe({
      next: (updatedProduct) => {
        this.patchProductField(updatedProduct._id, { photoUrl: updatedProduct.photoUrl });
        this.isPhotoSubmitting = false;
        this.closePhotoModal();
      },
      error: (err) => {
        this.photoSubmitError = err.error?.message || 'Impossible de mettre à jour la photo. Réessayez plus tard.';
        this.isPhotoSubmitting = false;
      }
    });
  }

  onRemovePhoto(product: MyProduct): void {
    if (!product.photoUrl) return;

    if (confirm(`Vous êtes sûr de vouloir supprimer la photo pour "${product.name}"?`)) {
      this.myProductService.removePhoto(product._id).subscribe({
        next: () => {
          this.patchProductField(product._id, { photoUrl: null });
        },
        error: (err) => {
          this.loadError = err.error?.message || 'Impossible de supprimer la photo. Réessayez plus tard.';
        }
      });
    }
  }

  get nonBooleanAttributes() {
    if (!this.selectedProductType?.attributes) return [];
    return this.selectedProductType.attributes.filter(attr => attr.type !== 'BOOLEAN');
  }

  get booleanAttributes() {
    if (!this.selectedProductType?.attributes) return [];
    return this.selectedProductType.attributes.filter(attr => attr.type === 'BOOLEAN');
  }

  /** Patch specific fields on a product in the list (immutable update for change detection) */
  private patchProductField(id: string, patch: Partial<MyProduct>): void {
    const idx = this.products.findIndex(p => p._id === id);
    if (idx !== -1) {
      const next = [...this.products];
      next[idx] = { ...next[idx], ...patch };
      this.products = next;
    }
  }
}

