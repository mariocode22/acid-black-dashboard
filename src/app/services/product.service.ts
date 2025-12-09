import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, shareReplay, tap, catchError } from 'rxjs';
import { Product } from '../types/product';

export interface CreateProductDto {
  nombre: string;
  descripcion: string;
  precio: number;
  imagenes: string[];
  categorias: string[];
  genero: string;
}

export interface UpdateProductDto {
  nombre: string;
  descripcion: string;
  precio: number;
  imagenes: string[];
  categorias: string[];
  genero: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = 'https://acidblack-catalog-api.onrender.com/api/productos';

  constructor(private http: HttpClient) {}

  // Headers explícitos para asegurar el Content-Type
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // Obtener todos los productos con cache
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
      tap(products => console.log('Products loaded:', products.length)),
      shareReplay(1)
    );
  }

  // Obtener producto por ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  // Crear nuevo producto con logging detallado
  createProduct(product: CreateProductDto): Observable<Product> {
    const body = {
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      categorias: product.categorias,
      imagenes: product.imagenes,
      genero: product.genero
    };

    console.log('Creating product with data:', body);

    return this.http.post<Product>(this.apiUrl, body, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => console.log('Product created successfully:', response)),
      catchError(error => {
        console.error('Error creating product:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        throw error;
      })
    );
  }

  // Actualizar producto existente con logging detallado
  updateProduct(id: number, product: UpdateProductDto): Observable<Product> {
    const body = {
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      categorias: product.categorias,
      imagenes: product.imagenes,
      genero: product.genero
    };

    console.log('Updating product', id, 'with data:', body);

    return this.http.put<Product>(`${this.apiUrl}/${id}`, body, {
      headers: this.getHeaders()
    }).pipe(
      tap(response => console.log('Product updated successfully:', response)),
      catchError(error => {
        console.error('Error updating product:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        throw error;
      })
    );
  }

  // Eliminar producto
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    }).pipe(
      tap(() => console.log('Product deleted successfully:', id)),
      catchError(error => {
        console.error('Error deleting product:', error);
        throw error;
      })
    );
  }

  // Buscar por categoría
  searchByCategory(categoria: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/categoria/${categoria}`, {
      headers: this.getHeaders()
    });
  }

  // Buscar por rango de precio
  searchByPriceRange(min: number, max: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/precio?min=${min}&max=${max}`, {
      headers: this.getHeaders()
    });
  }

  // Buscar por texto
  searchByText(texto: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/buscar?texto=${texto}`, {
      headers: this.getHeaders()
    });
  }

  // Buscar por género
  searchByGenre(genero: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/genero/${genero}`, {
      headers: this.getHeaders()
    });
  }

  // Búsqueda combinada
  searchProducts(filters: {
    category?: string;
    genre?: string;
    minPrice?: number;
    maxPrice?: number;
    text?: string;
  }): Observable<Product[]> {
    if (filters.category && filters.category !== 'all') {
      return this.searchByCategory(filters.category);
    }

    if (filters.genre && filters.genre !== 'all') {
      return this.searchByGenre(filters.genre);
    }

    return this.getProducts();
  }
}
