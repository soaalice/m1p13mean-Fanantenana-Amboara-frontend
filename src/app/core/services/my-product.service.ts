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
   * Crée un nouveau produit
   */
  createProduct(productData: CreateProductDto): Observable<Product> {
    console.log('Creating product with data:', productData);
    return this.http.post<ApiSingleResponse<Product>>(`${this.apiUrl}/products`, productData)
      .pipe(
        map(res => res.data)
      );
  }
}
