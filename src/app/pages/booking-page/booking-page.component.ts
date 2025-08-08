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
import { forkJoin } from 'rxjs';
import { Material } from '../../core/models/material.module';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reservation-page',
  standalone: true,
  templateUrl: './booking-page.component.html',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatIconModule]
})
export class BookingPageComponent implements OnInit {
  bookings: Booking[] = [];
  bookingsFormated: any[] = [];
  constructor(
    private _bookingService: BookingPageService,
    private router: Router,
    private dialog: MatDialog,
    private toastr: ToastrService
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
    this.pagedData = this.bookingsFormated.slice(startIndex, endIndex);
  }

  // Obtenir totes les reserves
  getAllBookings() {
    this._bookingService.getAllBookings().subscribe({
      next: (response) => {
        this.bookings = response;
        this.bookingsFormated = this.bookings;
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
  onDelete(booking: Booking) {
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
          this.toastr.success('Reserva eliminada correctamente', 'Éxito');
        });
      }
    });
  }

  // Quan faci click a sobre d'un document
  getFile(url: string) {
    // Obtenir els arxius dels servidor
    this._bookingService.getFile(url).subscribe({
      // Definir el tipus en concret (totalment funcinal amb diversos formats)
      next: (response) => {
        let mimeType = 'application/octet-stream';
        if (url.endsWith('.pdf')) {
          mimeType = 'application/pdf';
        } else if (url.endsWith('.docx')) {
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }

        // Generem el nou blob
        const blob = new Blob([response], { type: mimeType });
        const fileURL = URL.createObjectURL(blob);

        // En el cas que sigui un PDF, donem la possibilitat de previsualitzar-lo
        // o bé descarregar-lo
        if (url.endsWith('.pdf')) {
          const modalInformation: ConfirmData = {
            title: 'Previsualicación de PDF',
            message: `¿Quieres ver una vista prévia del PDF?`,
            cancelText: 'Previsualitza i descarrega',
            confirmText: 'Vista prèvia'
          };

          const dialogRef = this.dialog.open(ConfirmModalComponent, {
            maxWidth: '95vw',
            width: '65%',
            maxHeight: '90vh',
            data: modalInformation,
            panelClass: 'app-confirm-modal',
          });

          dialogRef.afterClosed().subscribe((result: boolean) => {
            // True només es veu, false es veu i es pot descarregar
            if (result === true) {
              window.open(fileURL, '_blank');
            } else {
              this._bookingService.getFileName(url).subscribe({
                next: (file) => {
                  const a = document.createElement('a');
                  a.href = fileURL;
                  a.download = file.name;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                },
                error: (err) => {
                  console.error('Error getting NAME', err);
                },
              });
            }
          });

        } else {
          // Per altres formats que no siguin PDF, baixar directament
          this._bookingService.getFileName(url).subscribe({
            next: (file) => {
              const a = document.createElement('a');
              a.href = fileURL;
              a.download = file.name;
              document.body.appendChild(a);
              a.click();
              a.remove();
            },
            error: (err) => {
              console.error('Error getting NAME', err);
            },
          });
        }
      },
      error: (err) => {
        console.error('Error obtenint fitxer', err);
      }
    });
  }

  onPrint(book: Booking) {
    const materialsIds = book.tipo_material2_id
      ? [book.tipo_material1_id, book.tipo_material2_id]
      : [book.tipo_material1_id];
    forkJoin({
      materials: this._bookingService.getMaterials(materialsIds),
      provider: this._bookingService.getProvider(book.proveedor_id),
      empresa: this._bookingService.getCompany(book.empresa_id),
      transportista: this._bookingService.getTransportista(book.transporte_id),
      camion: this._bookingService.getTruck(book.tipo_camion_id),
    }).subscribe(({ materials, provider, empresa, transportista, camion }) => {
      const materialsHtml = materials
        .map((m: Material) => `<li>${m.nombre_material}</li>`)
        .join('');

      const html = `
        <!DOCTYPE html>
        <html lang="ca">
        <head>
          <meta charset="UTF-8" />
          <title>Detalls Llibre</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background: #fff;
              color: #333;
              margin: 0;
            }
            .logo-container {
              text-align: center;
              margin-bottom: 20px;
            }
            .logo-container img {
              max-width: 100px;
            }
            .box {
              background-color: #d3d3d3;
              border: 2px solid #999;
              border-radius: 8px;
              padding: 15px 20px;
              margin-bottom: 15px;
              max-width: 100%;
              box-sizing: border-box;
            }
            .box p {
              margin: 6px 0;
            }
            .box strong {
              display: inline;
              margin-bottom: 6px;
            }
            ul {
              margin: 0;
              padding-left: 20px;
            }
            .footer-text {
              text-align: center;
              margin-top: 30px;
              text-size: small;
            }
          </style>
        </head>
        <body>
          <div class="logo-container">
            <img src="../../../assets/img/LogoLaFarga.png" alt="Logo Empresa">
          </div>

          <div class="box">
            <p><strong>Empresa:</strong> ${empresa.nombre}</p>
            <p><strong>Pedido:</strong> ${book.pedido_LF}</p>
            <p><strong>Matricula Camión:</strong> ${book.matricula_camion}</p>
          </div>

          <div class="box">
            <p><strong>Material:</strong></p>
            <ul>${materialsHtml}</ul>
            <p><strong>Tipo Camión:</strong> ${camion.nombre}</p>
            <p><strong>Duracion Entrega:</strong> ${book.duracion1}</p>
            <p><strong>Muelle:</strong> ${book.muelle1_id}</p>
            <p><strong>Hora Inicio:</strong> ${book.inicio1}</p>
            <p><strong>Hora Fin:</strong> ${book.fin1}</p>
          </div>

          <div class="box">
            <p><strong>Proveïdor:</strong> ${provider?.nombre || 'No disponible'}</p>
            <p><strong>Transportista:</strong> ${transportista.nombre || 'No disponible'}</p>
            <p><strong>Notas:</strong> ${book.notas || 'No hay notas'}</p>
            <p><strong>Aduana:</strong> ${book.es_aduana || 'No disponible'}</p>
            <p><strong>Reserva:</strong> ${book.reserva_id || 'No disponible'}</p>
          </div>
          <p class="footer-text">
            Teléfono de incidencias cita previa: 93 859 42 86 - 93 859 41 00 ext: <strong>329</strong>
          </p>
        </body>
        </html>
        `;

      const novaFinestra = window.open('', '_blank');
      if (novaFinestra) {
        novaFinestra.document.write(html);
        novaFinestra.document.close();
        novaFinestra.focus();
        novaFinestra.print();
      } else {
        alert('No s’ha pogut obrir la nova finestra. Revisa el bloquejador de finestres.');
      }
    });
  }

}
