import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

interface Column {
  key: string;
  label: string;
}

@Component({
  selector: 'app-generic-list',
  standalone: true,
  templateUrl: './generic-list.component.html',
  imports: [CommonModule]
})
export class GenericListComponent {
  @Input() items: any[] = [];
  @Input() columns: Column[] = [];

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  // Paginació
  currentPage = 1;
  pageSize = 10;

  get totalPages(): number {
    return Math.ceil(this.items.length / this.pageSize);
  }

  get paginatedItems(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.items.slice(start, start + this.pageSize);
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
