import { Component, OnInit, signal, computed } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Product } from '../../types/product';
import { FilterChange } from '../../components/inicio/inicio-barra/inicio-barra';

@Component({
  selector: 'product-list',
  imports: [CommonModule, HttpClientModule],
  providers: [ProductService],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {
  // Productos originales del servicio
  private allProducts = signal<Product[]>([]);

  // Filtros actuales
  private currentFilters = signal<FilterChange>({
    category: 'all',
    genre: 'all'
  });

  // Productos filtrados (computed signal)
  protected products = computed(() => {
    const all = this.allProducts();
    const filters = this.currentFilters();

    return all.filter(product => {
      // Filtrar por categoría
      const categoryMatch = filters.category === 'all' ||
        product.categorias.some(cat => cat === filters.category);

      // Filtrar por género
      const genreMatch = filters.genre === 'all' ||
        product.genero === filters.genre;

      return categoryMatch && genreMatch;
    });
  });

  protected loading = signal<boolean>(false);
  protected error = signal<string | null>(null);

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.allProducts.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los productos. Por favor, intenta de nuevo.');
        this.loading.set(false);
        console.error('Error:', err);
      }
    });
  }

  // Método público para aplicar filtros desde el componente padre
  public applyFilters(filters: FilterChange): void {
    console.log('Applying filters in ProductListComponent:', filters);
    this.currentFilters.set(filters);
  }

  reloadList(): void {
    this.loadProducts();
  }

  addProduct(): void {
    console.log('Add product clicked');
    // Aquí puedes abrir un modal o navegar a un formulario
  }

  viewProduct(product: Product): void {
    console.log('View product:', product);
    // Aquí puedes abrir un modal o navegar a la vista de detalle
  }

  editProduct(product: Product): void {
    console.log('Edit product:', product);
    // Aquí puedes abrir un modal de edición o navegar al formulario
  }

  deleteProduct(product: Product): void {
    if (confirm(`¿Estás seguro de eliminar "${product.nombre}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          // Actualizar la señal de todos los productos
          this.allProducts.update(current =>
            current.filter(p => p.id !== product.id)
          );
          console.log('Product deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting product:', err);
          alert('Error al eliminar el producto. Por favor, intenta de nuevo.');
        }
      });
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/80?text=No+Image';
  }
}
