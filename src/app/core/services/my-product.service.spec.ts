import { TestBed } from '@angular/core/testing';

import { MyProductService } from './my-product.service';

describe('MyProductService', () => {
  let service: MyProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
