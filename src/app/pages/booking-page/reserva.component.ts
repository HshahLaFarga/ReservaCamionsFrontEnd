import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReservaService } from './reserva.service';
import { Booking } from '../../core/models/reserva.model';
import { LoginService } from '../../features/auth/login/login.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmData, ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { formatDate } from '../../shared/utils/date.utils';
import { forkJoin, of } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Material } from '../../core/models/material.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reservation-page',
  standalone: true,
  templateUrl: './reserva.component.html',
  styleUrl: './reserva.component.scss',
  imports: [
    CommonModule, 
    TranslateModule, 
    ReactiveFormsModule, 
    MatTableModule, 
    MatPaginatorModule, 
    MatIconModule, 
    MatSelectModule, 
    MatInputModule, 
    MatFormFieldModule, 
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [DatePipe],
  encapsulation: ViewEncapsulation.None
})
export class ReservaComponent implements OnInit, AfterViewInit {

  bookings: Booking[] = [];

  totalRecords: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;

  searchControl = new FormControl('');
  statusFilterControl = new FormControl('pendientes');

  sortField: string = 'inicio';
  sortDir: string = 'desc';

  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null)
  });

  // Data for printing
  printingBooking: any = null;
  printData: any = null;

  constructor(
    private _bookingService: ReservaService,
    public _loginService: LoginService,
    private router: Router,
    private dialog: MatDialog,
    private toastr: ToastrService,
    private datePipe: DatePipe
  ) { }

  displayedColumns: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.setDisplayedColumns();
    this.getAllBookings();

    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageIndex = 0;
      if (this.paginator) this.paginator.pageIndex = 0;
      this.getAllBookings();
    });

    this.statusFilterControl.valueChanges.subscribe(() => {
      this.pageIndex = 0;
      if (this.paginator) this.paginator.pageIndex = 0;
      this.getAllBookings();
    });

    this.dateRange.valueChanges.subscribe((value: { start?: Date | null, end?: Date | null }) => {
      if ((value.start && value.end) || (!value.start && !value.end)) {
        this.pageIndex = 0;
        if (this.paginator) this.paginator.pageIndex = 0;
        this.getAllBookings();
      }
    });
  }

  clearDateRange(event: Event) {
    event.stopPropagation();
    this.dateRange.reset();
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe((sortState: Sort) => {
      this.sortField = sortState.active;
      this.sortDir = sortState.direction || 'desc';
      this.pageIndex = 0;
      if (this.paginator) this.paginator.pageIndex = 0;
      this.getAllBookings();
    });
  }

  // Paginació
  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getAllBookings();
  }

  // Obtenir totes les reserves
  getAllBookings() {
    const page = this.pageIndex + 1; // Laravel usa base-1
    const search = this.searchControl.value || '';
    const filter = this.statusFilterControl.value || 'pendientes';
    
    // Formatear fechas para la API (YYYY-MM-DD) respetando la zona horaria local
    const startDate = this.dateRange.value.start ? 
      this.datePipe.transform(this.dateRange.value.start, 'yyyy-MM-dd') || undefined : undefined;
    const endDate = this.dateRange.value.end ? 
      this.datePipe.transform(this.dateRange.value.end, 'yyyy-MM-dd') || undefined : undefined;

    this._bookingService.getAllBookings(
      page, 
      this.pageSize, 
      search, 
      filter, 
      this.sortField, 
      this.sortDir,
      startDate,
      endDate
    ).subscribe({
      next: (response) => {
        this.bookings = response.data; // Paginación de Laravel devuelve data i totals a part
        this.totalRecords = response.total;
      },
      error: (err) => {
      }
    });
  }

  // Quan selecciona nova reserva
  onAdd() {
    this.router.navigate(['/bookings/add']);
  }

  setDisplayedColumns() {
    const user = this._loginService.currentUser;
    if (user && user.instance === 'entidad') {
      this.displayedColumns = [
        'pedido',
        'id_materials',
        'cantidad',
        'hora_inicio',
        'fin',
        'documentos',
        'acciones'
      ];
    } else {
      // ADMIN o USUARIO (Vista completa)
      this.displayedColumns = [
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
    }
  }

  // Quan determinar editar reserva
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
      message: `¿Está seguro de que desea eliminar la reserva desde el <strong>${formatDate(booking.inicio)}</strong> hasta el <strong>${formatDate(booking.fin)}</strong>?`
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

          // depenent de l'opció que es vulgui es podrà descarregar i visualitzar o només visualitzar
          dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
              window.open(fileURL, '_blank');
            } else {
              this._bookingService.getFileName(url).subscribe({
                next: (file) => {
                  const a = document.createElement('a');
                  a.href = fileURL;
                  a.download = file.nombre;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                },
                error: (err) => {
                }
              });
            }
          });

        } else {
          // Per altres formats que no siguin PDF, baixar directament
          this._bookingService.getFileName(url).subscribe({
            next: (file) => {
              const a = document.createElement('a');
              a.href = fileURL;
              a.download = file.nombre;
              document.body.appendChild(a);
              a.click();
              a.remove();
            },
            error: (err) => {
            },
          });
        }
      },
      error: (err) => {
      }
    });
  }

  onPrint(book: Booking) {
    const materialsIds = [
      book?.material1?.material_id,
      book?.material2?.material_id
    ].filter((id): id is number => id !== undefined);

    forkJoin({
      materials: this._bookingService.getMaterials(materialsIds),
      provider: book?.proveedor?.proveedor_id ? this._bookingService.getProvider(book?.proveedor?.proveedor_id) : of(null),
      empresa: book?.empresa_lfycs?.empresa_lfycs_id ? this._bookingService.getCompany(book?.empresa_lfycs?.empresa_lfycs_id) : of(null),
      Carrier: book?.transportista?.transportista_id ? this._bookingService.getCarrier(book?.transportista?.transportista_id) : of(null),
      camion: book?.tipo_camion?.tipo_camion_id ? this._bookingService.getTruck(book?.tipo_camion?.tipo_camion_id) : of(null),
    }).subscribe(({ materials, provider, empresa, Carrier, camion }) => {

      this.printingBooking = book;
      this.printData = {
        materials,
        provider,
        empresa,
        Carrier,
        camion,
        today: new Date()
      };

      // Wait for view update then print
      setTimeout(() => {
        window.print();
        // Optional: clear after print dialog closes (though JS validation of print dialog close is tricky)
        // this.printingBooking = null; 
      }, 500);
    });
  }

}
