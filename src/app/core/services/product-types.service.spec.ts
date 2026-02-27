import { TestBed } from '@angular/core/testing';

import { ProductTypesService } from './product-types.service';

describe('ProductTypesService', () => {
  let service: ProductTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
