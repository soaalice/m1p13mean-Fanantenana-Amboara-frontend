import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ProductType, ProductTypeAttribute, CreateProductTypeDto } from '../../shared/models/product-type';
import { SidebarService } from '../../core/services/sidebar.service';
import { PaginatedComponent } from '../../shared/base/paginated.component';
import { ProductTypesService } from '../../core/services/product-types.service';
import { ProductTypeModalComponent } from './product-type-modal/product-type-modal.component';

@Component({
  selector: 'app-product-types',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    ProductTypeModalComponent,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './product-types.component.html',
  styleUrl: './product-types.component.scss'
})
export class ProductTypesComponent extends PaginatedComponent<ProductType> {
  displayedColumns = ['id', 'label', 'attributes', 'actions'];
  attributeTypes: ProductTypeAttribute['type'][] = ['ENUM', 'NUMBER', 'STRING', 'BOOLEAN', 'DATE'];
  productTypeForm: FormGroup;
  submitError = '';
  isModalOpen = false;
  isSubmitting = false;
  isEditMode = false;
  selectedProductType: ProductType | null = null;

  get productTypes(): ProductType[] {
    return this.items;
  }

  get attributes(): FormArray {
    return this.productTypeForm.get('attributes') as FormArray;
  }

  formatAttributes(productType: ProductType): string {
    if (!productType.attributes || productType.attributes.length === 0) {
      return '-';
    }

    return productType.attributes
      .map(attribute => {
        const code = attribute.code || '-';
        const type = attribute.type || '-';

        if (type === 'ENUM') {
          const values = (attribute.values ?? []).join(', ');
          return `${code} (${type}${values ? `: ${values}` : ''})`;
        }

        if (type === 'NUMBER') {
          const min = attribute.min ?? '-';
          const max = attribute.max ?? '-';
          return `${code} (${type}: ${min} - ${max})`;
        }

        return `${code} (${type})`;
      })
      .join(' | ');
  }

  getAttributeBadges(productType: ProductType): Array<{ label: string; type: ProductTypeAttribute['type'] | 'NONE' }> {
    if (!productType.attributes || productType.attributes.length === 0) {
      return [{ label: 'No attributes', type: 'NONE' }];
    }

    return productType.attributes.map(attribute => {
      const code = attribute.code || '-';
      const type = attribute.type || 'STRING';

      if (type === 'ENUM') {
        const values = (attribute.values ?? []).join(', ');
        return {
          label: `${code}: ${values || '-'}`,
          type
        };
      }

      if (type === 'NUMBER') {
        const min = attribute.min ?? '-';
        const max = attribute.max ?? '-';
        return {
          label: `${code}: ${min} - ${max}`,
          type
        };
      }

      return {
        label: `${code}: ${type}`,
        type
      };
    });
  }

  constructor(
    private productTypesService: ProductTypesService,
    private sidebarService: SidebarService,
    private fb: FormBuilder
  ) {
    super();
    this.productTypeForm = this.fb.group({
      label: ['', Validators.required],
      attributes: this.fb.array([])
    });
    this.addAttribute();
  }

  protected fetchData(page = this.page): void {
    this.isLoading = true;
    this.loadError = '';

    this.productTypesService.getProductTypes(page, this.limit).subscribe({
      next: response => {
        this.applyResponse(response);
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Failed to load product types.';
        this.isLoading = false;
      }
    });
  }

  addAttribute(): void {
    const attributeGroup = this.buildAttributeGroup();
    this.attributes.push(attributeGroup);
    this.updateAttributeValidators(attributeGroup);
  }

  removeAttribute(index: number): void {
    this.attributes.removeAt(index);
  }

  onSubmit(): void {
    this.submitError = '';

    if (this.productTypeForm.invalid || this.isSubmitting) {
      this.productTypeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const payload = this.buildPayload();
    const request$ = this.isEditMode && this.selectedProductType?._id
      ? this.productTypesService.updateProductType(this.selectedProductType._id, payload)
      : this.productTypesService.createProductType(payload);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeProductTypeModal();
        this.fetchData(1);
      },
      error: () => {
        this.isSubmitting = false;
        this.submitError = this.isEditMode
          ? 'Failed to update product type.'
          : 'Failed to create product type.';
      }
    });
  }

  openProductTypeModal(): void {
    this.sidebarService.requestCloseSidebar();
    this.isModalOpen = true;
    this.isEditMode = false;
    this.selectedProductType = null;
    this.submitError = '';
  }

  closeProductTypeModal(): void {
    this.isModalOpen = false;
    this.isSubmitting = false;
    this.isEditMode = false;
    this.selectedProductType = null;
    this.submitError = '';
    this.productTypeForm.reset();
    this.attributes.clear();
    this.addAttribute();
  }

  private buildPayload(): CreateProductTypeDto {
    const raw = this.productTypeForm.getRawValue();

    const attributes = (raw.attributes ?? []).map((attr: any) => {
      const type = attr.type as ProductTypeAttribute['type'];
      const values = this.parseEnumValues(attr.valuesText);
      const min = this.parseNumber(attr.min);
      const max = this.parseNumber(attr.max);

      return {
        code: (attr.code ?? '').trim().toUpperCase(),
        type,
        values: type === 'ENUM' ? values : undefined,
        min: type === 'NUMBER' ? min : undefined,
        max: type === 'NUMBER' ? max : undefined
      } as ProductTypeAttribute;
    });

    return {
      label: (raw.label ?? '').trim(),
      attributes
    };
  }

  private buildAttributeGroup(): FormGroup {
    const group = this.fb.group({
      code: ['', Validators.required],
      type: ['STRING', Validators.required],
      valuesText: [''],
      min: [''],
      max: ['']
    });

    group.get('type')?.valueChanges.subscribe(() => {
      this.updateAttributeValidators(group);
    });

    return group;
  }

  private updateAttributeValidators(group: FormGroup): void {
    const type = group.get('type')?.value as ProductTypeAttribute['type'];
    const valuesControl = group.get('valuesText');
    const minControl = group.get('min');
    const maxControl = group.get('max');

    valuesControl?.clearValidators();
    minControl?.clearValidators();
    maxControl?.clearValidators();

    if (type === 'ENUM') {
      valuesControl?.setValidators([Validators.required]);
    }

    if (type === 'NUMBER') {
      minControl?.setValidators([Validators.required]);
      maxControl?.setValidators([Validators.required]);
    }

    valuesControl?.updateValueAndValidity({ emitEvent: false });
    minControl?.updateValueAndValidity({ emitEvent: false });
    maxControl?.updateValueAndValidity({ emitEvent: false });
  }

  private parseEnumValues(valuesText: string): string[] {
    if (!valuesText) {
      return [];
    }

    return valuesText
      .split(',')
      .map((value: string) => value.trim())
      .filter((value: string) => value.length > 0);
  }

  private parseNumber(value: string): number | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  onEdit(productType: ProductType): void {
    this.sidebarService.requestCloseSidebar();
    this.isEditMode = true;
    this.isModalOpen = true;
    this.selectedProductType = productType;
    this.submitError = '';

    this.productTypeForm.reset();
    this.attributes.clear();

    this.productTypeForm.patchValue({
      label: productType.label || ''
    });

    const attributes = productType.attributes ?? [];
    if (attributes.length === 0) {
      this.addAttribute();
      return;
    }

    attributes.forEach(attribute => {
      const group = this.buildAttributeGroupFromModel(attribute);
      this.attributes.push(group);
      this.updateAttributeValidators(group);
    });
  }

  onDelete(productType: ProductType): void {
    if (!productType._id) {
      return;
    }

    const confirmed = window.confirm(`Delete product type "${productType.label || productType._id}"?`);
    if (!confirmed) {
      return;
    }

    this.productTypesService.deleteProductType(productType._id).subscribe({
      next: () => {
        this.fetchData(this.page);
      },
      error: () => {
        this.loadError = 'Failed to delete product type.';
      }
    });
  }

  private buildAttributeGroupFromModel(attribute: ProductTypeAttribute): FormGroup {
    const valuesText = attribute.values ? attribute.values.join(', ') : '';

    return this.fb.group({
      code: [attribute.code || '', Validators.required],
      type: [attribute.type || 'STRING', Validators.required],
      valuesText: [valuesText],
      min: [attribute.min ?? ''],
      max: [attribute.max ?? '']
    });
  }
}
