import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../types/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://acidblack-catalog-api.onrender.com/api/productos'; // Cambia esto a tu API

  constructor(private http: HttpClient) {}

  // Obtener todos los productos
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  // Obtener producto por ID
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
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
}
