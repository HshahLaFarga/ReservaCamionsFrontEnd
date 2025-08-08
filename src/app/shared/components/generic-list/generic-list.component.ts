import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Column {
  key: string;
  label: string;
}

@Component({
  selector: 'app-generic-list',
  standalone: true,
  templateUrl: './generic-list.component.html',
  imports: [CommonModule, FormsModule]
})
export class GenericListComponent {
  @Input() items: any[] = [];
  @Input() columns: Column[] = [];

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  currentPage = 1;
  pageSize = 10;
  searchTerm = '';

  // Accés segur a propietats anidades (tipo_proveedor.nombre)
  getNestedProperty(item: any, key: string): any {
    return key.split('.').reduce((acc, part) => acc?.[part], item) ?? '';
  }

  get totalPages(): number {
    return Math.ceil(this.filteredItems.length / this.pageSize);
  }

  get filteredItems(): any[] {
    if (!this.searchTerm.trim()) return this.items;

    return this.items.filter(item =>
      this.columns.some(col => {
        const value = this.getNestedProperty(item, col.key).toString().toLowerCase();
        return value.includes(this.searchTerm.toLowerCase());
      })
    );
  }

  get paginatedItems(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredItems.slice(start, start + this.pageSize);
  }

  onEdit(item: any) {
    this.edit.emit(item);
  }

  onDelete(item: any) {
    this.delete.emit(item);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
