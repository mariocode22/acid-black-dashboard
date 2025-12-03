import { Component, signal, ViewChild, AfterViewInit } from '@angular/core';
import { InicioBarra, FilterChange } from '../../components/inicio/inicio-barra/inicio-barra';
import { ProductListComponent } from '../product-list.component.ts/product-list.component';

@Component({
  selector: 'Inicio',
  imports: [InicioBarra, ProductListComponent],
  templateUrl: './inicio.html',
})
export class Inicio implements AfterViewInit {
  @ViewChild(ProductListComponent) productList!: ProductListComponent;

  protected currentFilters = signal<FilterChange>({
    category: 'all',
    genre: 'all'
  });

  ngAfterViewInit(): void {
    // Asegurarse de que el ViewChild esté disponible
    console.log('ProductList component:', this.productList);
  }

  onFilterChange(filters: FilterChange): void {
    console.log('Filters changed in Inicio:', filters);
    this.currentFilters.set(filters);

    // Aplicar filtros al componente de productos
    if (this.productList) {
      this.productList.applyFilters(filters);
    } else {
      console.warn('ProductList component not available yet');
    }
  }
}
