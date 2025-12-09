// product-form-modal.component.ts

import { Component, signal, computed, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, CreateProductDto, UpdateProductDto } from '../../../services/product.service';
import { Product } from '../../../types/product';
import { FormsModule } from '@angular/forms';

interface FormData {
  nombre: string;
  descripcion: string;
  precio: number;
  genero: string;
  categorias: string[];
  imagenes: string[];
}

interface FormErrors {
  nombre?: string;
  descripcion?: string;
  precio?: string;
  genero?: string;
  categorias?: string;
  imagenes?: string;
}

@Component({
  selector: 'product-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form-modal.html',
})
export class ProductFormModal {

  newCategory: string = '';
  newImage: string = '';

  private readonly productService = inject(ProductService);

  // Signals de estado
  protected readonly isOpen = signal(false);
  protected readonly isEditMode = signal(false);
  protected readonly saving = signal(false);
  protected readonly submitError = signal<string | null>(null);

  // Signal del formulario principal
  protected readonly formData = signal<FormData>({
    nombre: '', descripcion: '', precio: 0, genero: '', categorias: [], imagenes: []
  });

  protected readonly errors = signal<FormErrors>({});
  private readonly editingProductId = signal<number | null>(null);

  // Output para notificar al padre
  productSaved = output<Product>();

  // Computed para validación básica (opcional, usado en UI)
  protected readonly isFormValid = computed(() => {
    const d = this.formData();
    return (
      d.nombre.trim() !== '' &&
      d.descripcion.trim() !== '' &&
      d.precio > 0 &&
      d.genero !== '' &&
      d.categorias.length > 0 &&
      d.imagenes.length > 0
    );
  });

  // ---------------------- MODAL ----------------------

  openForCreate(): void {
    this.resetForm();
    this.isEditMode.set(false);
    this.editingProductId.set(null);
    this.isOpen.set(true);
  }

  openForEdit(product: Product): void {
    this.isEditMode.set(true);
    this.editingProductId.set(product.id!);

    this.formData.set({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      genero: product.genero,
      categorias: [...product.categorias],
      imagenes: [...product.imagenes]
    });

    this.isOpen.set(true);
  }

  closeModal(): void {
    if (this.saving()) return;
    this.isOpen.set(false);
  }

  private resetForm(): void {
    this.formData.set({ nombre: '', descripcion: '', precio: 0, genero: '', categorias: [], imagenes: [] });
    this.errors.set({});
    this.submitError.set(null);
  }

  // ---------------------- FORM INPUTS ----------------------

  updateField(field: keyof FormData, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    let value: any = target.value;

    if (field === 'precio') value = Number(value) || 0;

    this.formData.update(d => ({ ...d, [field]: value }));
  }

  // ---------------------- CATEGORÍAS (Nuevo - Sin Prompt) ----------------------

  addCategory(): void {
    const val = this.newCategory.trim();
    if (!val) return;

    const currentData = this.formData();

    if (!currentData.categorias.includes(val)) {
      this.formData.update(d => ({
        ...d,
        categorias: [...d.categorias, val]
      }));
    }

    // Limpiamos el input
    this.newCategory = '';
  }

  removeCategory(i: number): void {
    this.formData.update(d => ({
      ...d,
      categorias: d.categorias.filter((_, x) => x !== i)
    }));
  }

  // ---------------------- IMÁGENES (Nuevo - Sin Prompt) ----------------------

  addImage(): void {
    const val = this.newImage.trim();
    if (!val) return;

    this.formData.update(d => ({
      ...d,
      imagenes: [...d.imagenes, val]
    }));

    // Limpiamos el input
    this.newImage = '';
  }

  removeImage(i: number): void {
    this.formData.update(d => ({
      ...d,
      imagenes: d.imagenes.filter((_, x) => x !== i)
    }));
  }

  // ---------------------- VALIDACIÓN ----------------------

  private validateForm(): boolean {
    const d = this.formData();
    const e: FormErrors = {};

    if (!d.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!d.descripcion.trim()) e.descripcion = 'La descripción es requerida';
    if (d.precio <= 0) e.precio = 'El precio debe ser mayor que 0';
    if (!d.genero) e.genero = 'El género es requerido';
    if (d.categorias.length === 0) e.categorias = 'Debe agregar al menos una categoría';
    if (d.imagenes.length === 0) e.imagenes = 'Debe agregar al menos una imagen';

    this.errors.set(e);
    return Object.keys(e).length === 0;
  }

  // ---------------------- SUBMIT (Sin cambios lógicos) ----------------------

  onSubmit(): void {
    console.log("🔥 FORMULARIO INTENTÓ ENVIARSE");

    if (this.saving()) return;
    if (!this.validateForm()) {
      this.submitError.set('Corregir errores antes de continuar');
      return;
    }

    console.log("📦 DATOS DEL FORMULARIO:", this.formData());

    this.saving.set(true);
    this.submitError.set(null);

    const data = this.formData();

    if (this.isEditMode()) {
      console.log("✏️ MODO EDICIÓN — Enviando updateProduct()");
      this.updateProduct(data);
    } else {
      console.log("🆕 MODO CREACIÓN — Enviando createProduct()");
      this.createProduct(data);
    }
  }

  // ---------------------- CREAR ----------------------

  private createProduct(data: FormData): void {
    const dto: CreateProductDto = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: data.precio,
      categorias: data.categorias,
      imagenes: data.imagenes,
      genero: data.genero
    };

    console.log("🚀 ENVIANDO DTO AL SERVICIO:", dto);

    this.productService.createProduct(dto).subscribe({
      next: (p) => {
        console.log("✅ PRODUCTO CREADO:", p);
        this.saving.set(false);
        this.productSaved.emit(p);
        this.closeModal();
      },
      error: (err) => {
        console.error("❌ ERROR EN LA CREACIÓN:", err);
        this.saving.set(false);
        this.submitError.set(this.extractError(err));
      }
    });
  }

  // ---------------------- ACTUALIZAR ----------------------

  private updateProduct(data: FormData): void {
    const id = this.editingProductId();
    if (!id) {
      this.submitError.set('No se encontró ID del producto');
      this.saving.set(false);
      return;
    }

    const dto: UpdateProductDto = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      precio: data.precio,
      categorias: data.categorias,
      imagenes: data.imagenes,
      genero: data.genero
    };

    this.productService.updateProduct(id, dto).subscribe({
      next: (p) => {
        this.saving.set(false);
        this.productSaved.emit(p);
        this.closeModal();
      },
      error: (err) => {
        this.saving.set(false);
        this.submitError.set(this.extractError(err));
      }
    });
  }

  // ---------------------- ERRORES ----------------------

  private extractError(err: any): string {
    if (typeof err === 'string') return err;
    if (err?.error?.message) return err.error.message;
    if (err?.message) return err.message;
    return 'Error inesperado';
  }
}
