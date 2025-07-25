import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { BookingPageService } from './booking-page.service';
import { Router } from '@angular/router';
import { Booking } from '../../core/models/booking.module';

@Component({
  selector: 'app-reservation-page',
  standalone: true,
  templateUrl: './booking-page.component.html',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule,MatIconModule]
})
export class BookingPageComponent implements OnInit {
  bookings: Booking[] = [];

  constructor(
      private _bookingService: BookingPageService,
      private router: Router
  ) { }

  displayedColumns: string[] = [
    'hora_inicio',
    'tipo_camion',
    'matricula',
    'id_materials',
    'muelle',
    'cantidad',
    'id_proveedor',
    'pedido',
    'documentos',
    'acciones'
  ];

  data = [
    {
      hora_inicio: '08:00',
      tipo_camion: 'Gran tonelatge',
      matricula: '1234 ABC',
      id_materials: 'MAT001',
      muelle: 'A1',
      cantidad: 50,
      id_proveedor: 'PROV123',
      pedido: 'PED001',
      documentos: 'DOC001'
    },
  ];

  pagedData: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.getAllBookings();

  }

  onPageChange(event: PageEvent) {
    this.updatePagedData(event.pageIndex, event.pageSize);
  }

  updatePagedData(pageIndex: number, pageSize: number) {
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    this.pagedData = this.bookings.slice(startIndex, endIndex);
  }

  getAllBookings() {
    this._bookingService.getAllBookings().subscribe({
        next: (response) => {
          this.bookings = response;
          console.log(this.bookings);
          this.updatePagedData(0, 10);
        },
        error: (err) => {
          console.error('Error obtenint bookings', err);
        }
      });
  }
  onAdd() {
    this.router.navigate(['/bookings/add']);
  }

  onEdit(book: Booking){

  }

  onDelete(book: Booking){

  }

  onPrint(book: Booking){

  }
}
