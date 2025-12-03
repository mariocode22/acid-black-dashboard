import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Product } from '../../types/product';

@Component({
  selector: 'product-list',
  imports: [CommonModule, HttpClientModule],
  providers: [ProductService],
  templateUrl: './product-list.component.html',

})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar los productos. Por favor, intenta de nuevo.';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  reloadList(): void {
    this.loadProducts();
  }

  addProduct(): void {
    console.log('Add product clicked');
  }

  viewProduct(product: Product): void {
    console.log('View product:', product);
  }

  editProduct(product: Product): void {
    console.log('Edit product:', product);
  }

  deleteProduct(product: Product): void {
    if (confirm(`¿Estás seguro de eliminar "${product.nombre}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.products = this.products.filter(p => p.id !== product.id);
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
      minimumFractionDigits: 2
    }).format(price);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/80?text=No+Image';
  }

}
