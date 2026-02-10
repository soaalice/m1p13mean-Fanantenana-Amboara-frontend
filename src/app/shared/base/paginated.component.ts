import { Directive, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { PageResult } from '../models/shared.model';

/**
 * Classe de base abstraite pour les composants avec pagination
 * Fournit les propriétés et méthodes communes pour gérer la pagination
 */
@Directive()
export abstract class PaginatedComponent<T> implements OnInit {
  // Propriétés de pagination
  page = 1;
  limit = 10;
  total = 0;
  pages = 1;
  
  // État de chargement
  isLoading = false;
  loadError = '';

  // Données paginées
  items: T[] = [];

  // Configuration de la pagination Material
  pageSizeOptions = [5, 10, 25];

  ngOnInit(): void {
    this.fetchData();
  }

  /**
   * Méthode abstraite à implémenter par les composants enfants
   * pour charger les données avec pagination
   */
  protected abstract fetchData(page?: number): void;

  /**
   * Applique la réponse de pagination aux propriétés du composant
   */
  protected applyResponse(response: PageResult<T>): void {
    this.items = response.data ?? [];
    this.page = response.pagination?.page ?? this.page;
    this.limit = response.pagination?.limit ?? this.limit;
    this.total = response.pagination?.total ?? this.items.length;
    this.pages = response.pagination?.pages ?? 1;
  }

  /**
   * Navigue vers une page spécifique
   */
  goToPage(page: number): void {
    if (page < 1 || page > this.pages || page === this.page) {
      return;
    }
    this.fetchData(page);
  }

  /**
   * Navigue vers la page précédente
   */
  previousPage(): void {
    this.goToPage(this.page - 1);
  }

  /**
   * Navigue vers la page suivante
   */
  nextPage(): void {
    this.goToPage(this.page + 1);
  }

  /**
   * Gère le changement de page depuis le paginator Material
   */
  onPageChange(event: PageEvent): void {
    this.limit = event.pageSize;
    this.fetchData(event.pageIndex + 1);
  }

  /**
   * Vérifie si on peut aller à la page précédente
   */
  get canGoPrevious(): boolean {
    return this.page > 1 && !this.isLoading;
  }

  /**
   * Vérifie si on peut aller à la page suivante
   */
  get canGoNext(): boolean {
    return this.page < this.pages && !this.isLoading;
  }

  /**
   * Fonction de tracking pour *ngFor avec des objets ayant un _id
   */
  trackById(index: number, item: any): string | number {
    return item._id ?? index;
  }
}
