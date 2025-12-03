import { Component, signal, output, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../services/product.service';

interface FilterOption {
  value: string;
  label: string;
}

export interface FilterChange {
  category: string;
  genre: string;
}

@Component({
  selector: 'inicio-barra',
  imports: [CommonModule],
  templateUrl: './inicio-barra.html',
  standalone: true
})
export class InicioBarra implements OnInit {
  // Señales para el estado reactivo
  protected selectedCategory = signal<string>('all');
  protected selectedGenre = signal<string>('all');

  // Señales para las opciones dinámicas
  protected categories = signal<FilterOption[]>([{ value: 'all', label: 'Todas las Categorías' }]);
  protected genres = signal<FilterOption[]>([{ value: 'all', label: 'Todos los Géneros' }]);

  protected loading = signal<boolean>(true);

  // Output para comunicar cambios al componente padre
  filterChange = output<FilterChange>();

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadFiltersFromProducts();
  }

  private loadFiltersFromProducts(): void {
    this.loading.set(true);

    this.productService.getProducts().subscribe({
      next: (products) => {
        // Extraer categorías únicas
        const uniqueCategories = new Set<string>();
        const uniqueGenres = new Set<string>();

        products.forEach(product => {
          // Agregar todas las categorías del producto
          product.categorias.forEach(cat => {
            if (cat && cat.trim()) {
              uniqueCategories.add(cat.trim());
            }
          });

          // Agregar género si existe
          if (product.genero && product.genero.trim()) {
            uniqueGenres.add(product.genero.trim());
          }
        });

        // Convertir a FilterOption y ordenar alfabéticamente
        const categoryOptions: FilterOption[] = [
          { value: 'all', label: 'Todas las Categorías' },
          ...Array.from(uniqueCategories)
            .sort()
            .map(cat => ({ value: cat, label: cat }))
        ];

        const genreOptions: FilterOption[] = [
          { value: 'all', label: 'Todos los Géneros' },
          ...Array.from(uniqueGenres)
            .sort()
            .map(genre => ({ value: genre, label: genre }))
        ];

        this.categories.set(categoryOptions);
        this.genres.set(genreOptions);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading filters:', err);
        this.loading.set(false);
      }
    });
  }

  onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory.set(target.value);
    this.emitFilterChange();
  }

  onGenreChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedGenre.set(target.value);
    this.emitFilterChange();
  }

  private emitFilterChange(): void {
    this.filterChange.emit({
      category: this.selectedCategory(),
      genre: this.selectedGenre()
    });
  }

  clearFilters(): void {
    this.selectedCategory.set('all');
    this.selectedGenre.set('all');
    this.emitFilterChange();
  }
}
