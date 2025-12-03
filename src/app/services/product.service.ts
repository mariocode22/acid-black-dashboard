import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
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

  // Obtener todos los productos con cache
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      shareReplay(1) // Cache la última respuesta
    );
  }

  // Obtener producto por ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  // Crear nuevo producto (sin id, createdAt, updatedAt)
createProduct(product: CreateProductDto): Observable<Product> {
  const body = {
    nombre: product.nombre,
    descripcion: product.descripcion,
    precio: product.precio,
    categorias: product.categorias,
    imagenes: product.imagenes,
    genero: product.genero
  };

  return this.http.post<Product>(this.apiUrl, body);
}



  // Actualizar producto existente (sin id, createdAt, updatedAt)
 updateProduct(id: number, product: UpdateProductDto): Observable<Product> {
  const body = {
    nombre: product.nombre,
    descripcion: product.descripcion,
    precio: product.precio,
    categoria: product.categorias[0],
    imagenUrl: product.imagenes[0]
  };

  return this.http.put<Product>(`${this.apiUrl}/${id}`, body);
}


  // Eliminar producto
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Buscar por categoría
  searchByCategory(categoria: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/categoria/${categoria}`);
  }

  // Buscar por rango de precio
  searchByPriceRange(min: number, max: number): Observable<Product[]> {
    const params = new HttpParams()
      .set('min', min.toString())
      .set('max', max.toString());
    return this.http.get<Product[]>(`${this.apiUrl}/precio`, { params });
  }

  // Buscar por texto
  searchByText(texto: string): Observable<Product[]> {
    const params = new HttpParams().set('texto', texto);
    return this.http.get<Product[]>(`${this.apiUrl}/buscar`, { params });
  }

  // Buscar por género
  searchByGenre(genero: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/genero/${genero}`);
  }

  // Búsqueda combinada (nuevo método para filtros múltiples)
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
