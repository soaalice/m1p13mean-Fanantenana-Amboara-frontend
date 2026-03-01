import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResult, ApiSingleResponse } from '../../shared/models/shared.model';
import { ProductType, ProductTypeSelect } from '../../shared/models/product-type';
import { CreateProductDto, Product } from '../../shared/models/product';

@Injectable({
  providedIn: 'root'
})
export class MyProductService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Récupère la liste des types de produits pour sélection
   * Transforme les données de l'API (_id) vers le format SelectItem (id)
   */
  getProductTypesForSelect(): Observable<ProductTypeSelect[]> {
    return this.http.get<ApiResponse<ProductType>>(`${this.apiUrl}/product-types/select`)
      .pipe(
        map(response => {
          return response.data.map(pt => ({
            id: pt._id,
            label: pt.label,
            attributes: pt.attributes
          }));
        })
      );
  }

  /**
   * Récupère la liste des produits (paged)
   */
  getProducts(page = 1, limit = 10): Observable<PageResult<Product>> {
    const params = {
      page: page.toString(),
      limit: limit.toString()
    };

    return this.http.get<PageResult<Product>>(`${this.apiUrl}/products`, { params });
  }

  /**
   * Récupère les produits avec filtres serveur (type, boutique, attributs) + pagination
   * @param params - clés/valeurs envoyées telles quelles en query string
   */
  getProductsFiltered(params: Record<string, string>): Observable<PageResult<Product>> {
    return this.http.get<PageResult<Product>>(`${this.apiUrl}/products`, { params });
  }
  //my-product
  getMyProduct(page = 1, limit = 10): Observable<PageResult<Product>> {
    const params = {
      page: page.toString(),
      limit: limit.toString()
    };

    return this.http.get<PageResult<Product>>(`${this.apiUrl}/products/my-product`, { params });
  }

  /**
   * Crée un nouveau produit avec upload de fichier
   */
  createProduct(productData: CreateProductDto, photoFile?: File): Observable<Product> {

    const formData = new FormData();
    // Ajouter les données du produit
    formData.append('name', productData.name);
    formData.append('price', productData.price.toString());
    formData.append('productTypeId', productData.productTypeId);

    if (productData.attributes) {
      formData.append('attributes', JSON.stringify(productData.attributes));
    }

    // Ajouter le fichier photo si présent
    if (photoFile) {
      formData.append('photo', photoFile, photoFile.name);
    }

    return this.http.post<ApiSingleResponse<Product>>(`${this.apiUrl}/products`, formData)
      .pipe(
        map(res => res.data)
      );
  }

  /**
   * Met à jour un produit existant avec upload de fichier optionnel
   * PATCH /products/:id
   */
  updateProduct(productId: string, productData: Partial<CreateProductDto> & { status?: string }, photoFile?: File): Observable<Product> {
    const formData = new FormData();

    // Ajouter les données du produit si présentes
    if (productData.name !== undefined) {
      formData.append('name', productData.name);
    }
    if (productData.price !== undefined) {
      formData.append('price', productData.price.toString());
    }
    if (productData.productTypeId !== undefined) {
      formData.append('productTypeId', productData.productTypeId);
    }
    if (productData.attributes !== undefined) {
      formData.append('attributes', JSON.stringify(productData.attributes));
    }
    if (productData.status !== undefined) {
      formData.append('status', productData.status);
    }

    // Ajouter le fichier photo si présent
    if (photoFile) {
      formData.append('photo', photoFile, photoFile.name);
    }

    return this.http.put<ApiSingleResponse<Product>>(`${this.apiUrl}/products/${productId}`, formData)
      .pipe(
        map(res => res.data)
      );
  }

  /**
   * Ajoute du stock à un produit
   * POST /products/:id/add-stock
   */
  addStock(productId: string, quantity: number): Observable<Product> {
    const body = { quantity };
    return this.http.post<ApiSingleResponse<Product>>(`${this.apiUrl}/products/${productId}/add-stock`, body)
      .pipe(
        map(res => res.data)
      );
  }

  /**
   * Supprime un produit
   * DELETE /products/:id
   */
  deleteProduct(productId: string): Observable<void> {
    return this.http.delete<ApiSingleResponse<null>>(`${this.apiUrl}/products/${productId}`)
      .pipe(
        map(() => undefined)
      );
  }

  /**
   * Met à jour uniquement la photo d'un produit
   * POST /products/:id/photo
   */
  updatePhoto(productId: string, photoFile: File): Observable<Product> {
    const formData = new FormData();
    formData.append('photo', photoFile, photoFile.name);

    return this.http.post<ApiSingleResponse<Product>>(`${this.apiUrl}/products/${productId}/photo`, formData)
      .pipe(
        map(res => res.data)
      );
  }

  /**
   * Supprime la photo d'un produit
   * DELETE /products/:id/photo
   */
  removePhoto(productId: string): Observable<Product> {
    return this.http.delete<ApiSingleResponse<Product>>(`${this.apiUrl}/products/${productId}/photo`)
      .pipe(
        map(res => res.data)
      );
  }

  /**
   * Récupère un produit par son ID
   * GET /products/:id
   */
  getProductById(id: string): Observable<Product> {
    return this.http.get<ApiSingleResponse<Product>>(`${this.apiUrl}/products/${id}`)
      .pipe(map(res => res.data));
  }
}
