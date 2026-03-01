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
  photoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * DTO retourné par GET /api/products/my-product
 * Allégé : pas de shop (toujours celui de l'utilisateur), productTypeName résolu côté serveur.
 */
export interface MyProduct {
  _id: string;
  name: string;
  price: number;
  stock: number;
  productTypeId: string;
  productTypeName: string;
  attributes?: Record<string, unknown>;
  promotion?: {
    active: boolean;
    reduction?: number;
  };
  status: 'ACTIVE' | 'INACTIVE';
  photoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDto {
  name: string;
  price: number;
  productTypeId: string;
  attributes?: Record<string, any>;
}

export interface UpdateProductDto {
  name?: string;
  price?: number;
  productTypeId?: string;
  attributes?: Record<string, any>;
  status?: 'ACTIVE' | 'INACTIVE';
  photoUrl?: string;
}
