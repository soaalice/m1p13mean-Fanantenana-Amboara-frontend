import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ProductType, ProductTypeAttribute } from '../../shared/models/product-type';
import { SidebarService } from '../../core/services/sidebar.service';
import { PaginatedComponent } from '../../shared/base/paginated.component';
import { ProductTypesService } from '../../core/services/product-types.service';
import { ModalFormsComponent } from '../../shared/components/modal-forms/modal-forms.component';

@Component({
  selector: 'app-product-types',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    ModalFormsComponent
  ],
  templateUrl: './product-types.component.html',
  styleUrl: './product-types.component.scss'
})
export class ProductTypesComponent extends PaginatedComponent<ProductType> {
  displayedColumns = ['label'];
  attributeTypes: ProductTypeAttribute['type'][] = ['ENUM', 'NUMBER', 'STRING', 'BOOLEAN', 'DATE'];
  productTypeForm: FormGroup;
  submitError = '';
  isModalOpen = false;
  isSubmitting = false;

  get productTypes(): ProductType[] {
    return this.items;
  }

  get attributes(): FormArray {
    return this.productTypeForm.get('attributes') as FormArray;
  }

  constructor(
    private productTypesService: ProductTypesService,
    private sidebarService: SidebarService,
    private fb: FormBuilder
  ) {
    super();
    this.productTypeForm = this.fb.group({
      _id: ['', Validators.required],
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
    this.productTypesService.createProductType(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.closeProductTypeModal();
        this.fetchData(1);
      },
      error: () => {
        this.isSubmitting = false;
        this.submitError = 'Failed to create product type.';
      }
    });
  }

  openProductTypeModal(): void {
    this.sidebarService.requestCloseSidebar();
    this.isModalOpen = true;
    this.submitError = '';
  }

  closeProductTypeModal(): void {
    this.isModalOpen = false;
    this.isSubmitting = false;
    this.submitError = '';
    this.productTypeForm.reset();
    this.attributes.clear();
    this.addAttribute();
  }

  private buildPayload(): ProductType {
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
      _id: (raw._id ?? '').trim(),
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


}
