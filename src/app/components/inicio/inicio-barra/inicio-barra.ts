import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface FilterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'inicio-barra',
  imports: [CommonModule, FormsModule],
  templateUrl: './inicio-barra.html',
  standalone: true
})
export class InicioBarra {
  selectedCategory: string = 'all';
  selectedGenre: string = 'all';

  categories: FilterOption[] = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'books', label: 'Books' },
    { value: 'home', label: 'Home & Garden' }
  ];

  genres: FilterOption[] = [
    { value: 'all', label: 'All Genres' },
    { value: 'action', label: 'Action' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'drama', label: 'Drama' },
    { value: 'scifi', label: 'Sci-Fi' }
  ];

  onCategoryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedCategory = target.value;
    console.log('Category selected:', this.selectedCategory);
  }

  onGenreChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedGenre = target.value;
    console.log('Genre selected:', this.selectedGenre);
  }
}
