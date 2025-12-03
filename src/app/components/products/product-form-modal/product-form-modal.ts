import { Component, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, CreateProductDto, UpdateProductDto } from '../../../services/product.service';
import { Product } from '../../../types/product';

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
  imports: [CommonModule],
  templateUrl: './product-form-modal.html',
  standalone: true
})
export class ProductFormModal {
  // Señales de estado
  protected isOpen = signal<boolean>(false);
  protected isEditMode = signal<boolean>(false);
  protected saving = signal<boolean>(false);
  protected submitError = signal<string | null>(null);

  // Datos del formulario
  protected formData = signal<FormData>({
    nombre: '',
    descripcion: '',
    precio: 0,
    genero: '',
    categorias: [],
    imagenes: []
  });

  // Errores de validación
  protected errors = signal<FormErrors>({});

  // Campos temporales
  protected newCategory = signal<string>('');
  protected newImage = signal<string>('');

  // ID del producto en edición
  private editingProductId = signal<number | null>(null);

  // Evento de éxito
  productSaved = output<Product>();

  // Validación del formulario
  protected isFormValid = computed(() => {
    const data = this.formData();
    return (
      data.nombre.trim() !== '' &&
      data.descripcion.trim() !== '' &&
      data.precio > 0 &&
      data.genero !== '' &&
      data.categorias.length > 0 &&
      data.imagenes.length > 0
    );
  });

  constructor(private productService: ProductService) {}

  // Abrir modal para crear producto
  openForCreate(): void {
    this.resetForm();
    this.isEditMode.set(false);
    this.isOpen.set(true);
    this.editingProductId.set(null);
  }

  // Abrir modal para editar producto
  openForEdit(product: Product): void {
    this.isEditMode.set(true);
    this.isOpen.set(true);
    this.editingProductId.set(product.id);

    this.formData.set({
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      genero: product.genero,
      categorias: [...product.categorias],
      imagenes: [...product.imagenes]
    });

    this.errors.set({});
    this.submitError.set(null);
  }

  // Cerrar modal
  closeModal(): void {
    if (!this.saving()) {
      this.isOpen.set(false);
      setTimeout(() => this.resetForm(), 300); // Esperar animación
    }
  }

  // Resetear formulario
  private resetForm(): void {
    this.formData.set({
      nombre: '',
      descripcion: '',
      precio: 0,
      genero: '',
      categorias: [],
      imagenes: []
    });
    this.errors.set({});
    this.submitError.set(null);
    this.newCategory.set('');
    this.newImage.set('');
  }

  // Actualizar campo del formulario
  updateField(field: keyof FormData, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const value = field === 'precio' ? Number(target.value) : target.value;

    this.formData.update(data => ({
      ...data,
      [field]: value
    }));

    // Limpiar error del campo
    this.errors.update(errs => {
      const newErrors = { ...errs };
      delete newErrors[field];
      return newErrors;
    });
  }

  // Categorías
  updateNewCategory(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.newCategory.set(target.value);
  }

  addCategory(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    const category = this.newCategory().trim();
    if (category && !this.formData().categorias.includes(category)) {
      this.formData.update(data => ({
        ...data,
        categorias: [...data.categorias, category]
      }));
      this.newCategory.set('');
    }
  }

  removeCategory(index: number): void {
    this.formData.update(data => ({
      ...data,
      categorias: data.categorias.filter((_, i) => i !== index)
    }));
  }

  // Imágenes
  updateNewImage(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.newImage.set(target.value);
  }

  addImage(event?: Event): void {
    if (event) {
      event.preventDefault();
    }

    const imageUrl = this.newImage().trim();
    if (imageUrl && !this.formData().imagenes.includes(imageUrl)) {
      // Validar que sea una URL válida
      try {
        new URL(imageUrl);
        this.formData.update(data => ({
          ...data,
          imagenes: [...data.imagenes, imageUrl]
        }));
        this.newImage.set('');
      } catch {
        this.errors.update(errs => ({
          ...errs,
          imagenes: 'URL de imagen no válida'
        }));
      }
    }
  }

  removeImage(index: number): void {
    this.formData.update(data => ({
      ...data,
      imagenes: data.imagenes.filter((_, i) => i !== index)
    }));
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/150?text=Error';
  }

  // Validar formulario
  private validateForm(): boolean {
    const data = this.formData();
    const newErrors: FormErrors = {};

    if (!data.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!data.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (data.precio <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0';
    }

    if (!data.genero) {
      newErrors.genero = 'El género es requerido';
    }

    if (data.categorias.length === 0) {
      newErrors.categorias = 'Debe agregar al menos una categoría';
    }

    if (data.imagenes.length === 0) {
      newErrors.imagenes = 'Debe agregar al menos una imagen';
    }

    this.errors.set(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Enviar formulario
  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.saving.set(true);
    this.submitError.set(null);

    const data = this.formData();

    if (this.isEditMode()) {
      // Editar producto existente
      const productId = this.editingProductId();
      if (productId === null) {
        this.submitError.set('Error: ID de producto no encontrado');
        this.saving.set(false);
        return;
      }

      const updateDto: UpdateProductDto = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        genero: data.genero,
        categorias: data.categorias,
        imagenes: data.imagenes
      };

      this.productService.updateProduct(productId, updateDto).subscribe({
        next: (product) => {
          this.saving.set(false);
          this.productSaved.emit(product);
          this.closeModal();
        },
        error: (err) => {
          this.saving.set(false);
          this.submitError.set('Error al actualizar el producto. Por favor, intenta de nuevo.');
          console.error('Error updating product:', err);
        }
      });
    } else {
      // Crear nuevo producto
      const createDto: CreateProductDto = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        genero: data.genero,
        categorias: data.categorias,
        imagenes: data.imagenes
      };

      this.productService.createProduct(createDto).subscribe({
        next: (product) => {
          this.saving.set(false);
          this.productSaved.emit(product);
          this.closeModal();
        },
        error: (err) => {
          this.saving.set(false);
          this.submitError.set('Error al crear el producto. Por favor, intenta de nuevo.');
          console.error('Error creating product:', err);
        }
      });
    }
  }
}
