export interface Product {
  _id: string;
  name: string;
  price: number;
  productTypeId: string;
  shop: {
    _id: string;
    name: string;
  };
  attributes?: Record<string, unknown>;
  stock: number;
  promotion?: {
    active: boolean;
    reduction?: number;
  };
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  updatedAt?: string;
}
