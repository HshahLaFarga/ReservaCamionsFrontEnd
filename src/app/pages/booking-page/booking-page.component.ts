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
import { MatDialog } from '@angular/material/dialog';
import { ConfirmData, ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { formatDate } from '../../shared/utils/date.utils';

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
      private router: Router,
      private dialog: MatDialog
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

  pagedData: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.getAllBookings();
  }

  // Paginació
  onPageChange(event: PageEvent) {
    this.updatePagedData(event.pageIndex, event.pageSize);

  }
  updatePagedData(pageIndex: number, pageSize: number) {
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    this.pagedData = this.bookings.slice(startIndex, endIndex);
  }

  // Obtenir totes les reserves
  getAllBookings() {
    this._bookingService.getAllBookings().subscribe({
        next: (response) => {
          this.bookings = response;
          this.updatePagedData(0, 10);
        },
        error: (err) => {
          console.error('Error obtenint bookings', err);
        }
      });
  }

  // Quan selecciona nova reserva
  onAdd() {
    this.router.navigate(['/bookings/add']);
  }

  // Quan seleccionar editar reserva
  onEdit(book: Booking) {
    this.router.navigate(['/bookings/edit'], {
      state: {
        book: { ...book },
        method: 'update'
      }
    });
  }

  // Quan seleeciona eliminar reserva
  onDelete(booking: Booking){
    // Construim objecte per passar al modal de confimració
    const modalInformation: ConfirmData = {
      title: 'Eliminación de Reserva',
      message: `¿Está seguro de que desea eliminar la reserva desde el <strong>${formatDate(booking.inicio1)}</strong> hasta el <strong>${formatDate(booking.fin1)}</strong>?`
    };

    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      maxWidth: '95vw',
      width: '65%',
      maxHeight: '90vh',
      data: modalInformation,
      panelClass: 'app-confirm-modal',
    });

    dialogRef.afterClosed().subscribe((result: Boolean) => {
      if (result === true) {
      // Usuari ha acceptat, crida servei per eliminar
      this._bookingService.deleteBooking(booking).subscribe(() => {
        this.getAllBookings();
      });
    }
    });
  }

  // Quan selecciona imprimir reserva
  onPrint(book: Booking){

  }
}
