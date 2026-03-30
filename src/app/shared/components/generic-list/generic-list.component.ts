import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface Column {
  key: string;
  label: string;
}

@Component({
  selector: 'app-generic-list',
  standalone: true,
  templateUrl: './generic-list.component.html',
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class GenericListComponent implements AfterViewInit, OnChanges {
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [];

  @Input() items: any[] = [];
  @Input() columns: Column[] = [];

  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.dataSource.data = this.items || [];
    }
    if (changes['columns']) {
      this.displayedColumns = [...(this.columns || []).map(c => c.key), 'actions'];
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    // Soporte para propiedades anidadas en el sort (ej: tipo_proveedor.nombre)
    this.dataSource.sortingDataAccessor = (item: any, property: string): string | number => {
      const value = this.getNestedProperty(item, property);
      return typeof value === 'string' ? value.toLowerCase() : value;
    };

    // Filtro personalizado que busca en todas las columnas visibles
    this.dataSource.filterPredicate = (data: any, filter: string): boolean => {
      const searchTerm = filter.trim().toLowerCase();
      return this.columns.some(col => {
        const value = this.getNestedProperty(data, col.key);
        return value != null && value.toString().toLowerCase().includes(searchTerm);
      });
    };
  }

  // Accés segur a propietats anidades (tipo_proveedor.nombre)
  getNestedProperty(item: any, key: string): any {
    return key.split('.').reduce((acc, part) => acc?.[part], item) ?? '';
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onEdit(item: any) {
    this.edit.emit(item);
  }

  onDelete(item: any) {
    this.delete.emit(item);
  }
}
