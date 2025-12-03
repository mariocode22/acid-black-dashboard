export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenes: string[]; // <--- IMPORTANTE
  categorias: string[];
  genero: string;
}
