import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { BookingAddService } from './booking-add-update.service';
import { CalendarModalComponent } from '../../../shared/components/calendar/calendar-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { formatDate, formatDateToMySQL } from '../../../shared/utils/date.utils';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { forkJoin, Observable, map, startWith } from 'rxjs';
import { Router } from '@angular/router';

import { Truck } from '../../../core/models/truck.module';
import { Muelle } from '../../../core/models/muelle.module';
import { Material } from '../../../core/models/material.module';
import { Status } from '../../../core/models/status.module';
import { Provider } from '../../../core/models/provider.module';
import { Carrier } from '../../../core/models/carrier.module';
import { CalendarReservation } from '../../../core/models/calendar.module';
import { Booking, BookingDocument } from '../../../core/models/booking.module';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmData, ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-booking-add',
  standalone: true,
  templateUrl: './booking-add-update.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatIconModule,
  ],
})
export class BookingAddComponent implements OnInit {
  pedidoForm!: FormGroup;
  formatDate = formatDate;

  // Fitxers ja existents
  existingFiles: BookingDocument[] = [];

  trucks: Truck[] = [];
  mollsDisponibles: { camionesDisponibles: Truck[]; muellesDisponibles: Muelle[] } = {
    camionesDisponibles: [],
    muellesDisponibles: [],
  };

  selectedFiles: File[] = [];

  displayFnProveedor = (id?: number): string => {
    const prov = this.providers.find(p => p.proveedor_id === id);
    return prov ? prov.nombre : '';
  };
  displayFnCarrier = (id?: number): string => {
    const carrier = this.carriers.find(c => c.transporte_id === id);
    return carrier ? carrier.nombre : '';
  };

  materials: Material[] = [];
  status: Status[] = [];
  providers: Provider[] = [];
  carriers: Carrier[] = [];

  filteredProviders$!: Observable<Provider[]>;
  filteredCarriers$!: Observable<Carrier[]>;

  booking: Booking = this.getEmptyBooking();
  method: 'post' | 'update' = 'post';
  loadAutocompleteUpdate: boolean = false;
  disableCleanMaterials: boolean = false;

  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private _bookingService: BookingAddService,
    private dialog: MatDialog,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.isLoading = true
    // Càrrega del formulari
    this.pedidoForm = this.buildForm();
    // Càrrega de tots els camps que necessitin estar subscrits
    this.setupValueChangeSubscriptions();
    // Càrrega de tota la info
    this.loadDefaultData();
  }

  buildForm(): FormGroup {
    return this.fb.group({
      matriculaCamion: ['', Validators.required],
      tipoCamion: ['', Validators.required],
      numeroDescargas: [1, [Validators.required, Validators.min(1)]],
      material0: ['', Validators.required],
      cantidad0: [0, [Validators.required, Validators.min(200), Validators.max(30000)]],
      material1: [''],
      cantidad1: [0],
      hora: [''],
      duracionEntrega: ['', Validators.required],
      muelle: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      idStatus: ['', Validators.required],
      idProveedor: [null, Validators.required],
      identificadorTransportista: [null, Validators.required],
      pedido_LF_0: ['', Validators.required],
      pedido_LF_1: [''],
      usarMismoCodigo: [false],
      notas: [''],
      archivos: [null],
      aduana: ['no'],
    });
  }

  setupValueChangeSubscriptions(): void {
    this.pedidoForm.get('material0')?.valueChanges.subscribe(() => this.consultarCamionsIMolls());
    this.pedidoForm.get('material1')?.valueChanges.subscribe(() => this.consultarCamionsIMolls());

    this.pedidoForm.get('numeroDescargas')?.valueChanges.subscribe(() => {
      if (!this.disableCleanMaterials) {
        this.pedidoForm.patchValue({
          material1: null,
          cantidad1: null,
          tipoCamion: null,
          hora: null,
          duracionEntrega: null,
          muelle: null,
          horaInicio: null,
          horaFin: null,
          pedido_LF_1: null,
        });
      }
      this.disableCleanMaterials = false;
    });

    this.pedidoForm.get('usarMismoCodigo')?.valueChanges.subscribe((usarMismo) => {
      if (usarMismo) {
        const codigo = this.pedidoForm.get('pedido_LF_0')?.value;
        this.pedidoForm.get('pedido_LF_1')?.setValue(codigo);
        this.pedidoForm.get('pedido_LF_1')?.disable();
      } else {
        this.pedidoForm.get('pedido_LF_1')?.enable();
      }
    });

    this.pedidoForm.get('pedido_LF_0')?.valueChanges.subscribe((codigo) => {
      if (this.pedidoForm.get('usarMismoCodigo')?.value) {
        this.pedidoForm.get('pedido_LF_1')?.setValue(codigo);
      }
    });
  }

  loadDefaultData(): void {
    // Fem el fork join per poder fer totes les peticions
    // i un cop tinguem la info de totes entre dins del subscribe
    forkJoin({
      materials: this._bookingService.getAllMaterials(),
      status: this._bookingService.getStatus(),
      providers: this._bookingService.getProvider(),
      carriers: this._bookingService.getCarriers(),
    }).subscribe(({ materials, status, providers, carriers }) => {
      this.materials = materials;
      this.status = status;
      this.providers = providers;
      this.carriers = carriers;

      this.filteredProviders$ = this.createAutocompleteStream('idProveedor', providers);
      this.filteredCarriers$ = this.createAutocompleteStream('identificadorTransportista', carriers);

      const state = history.state as { book?: Booking; method?: 'post' | 'update' };
      if (state.method === 'update') {
        this.method = 'update';
        this.booking = state.book!;
        this.changeToUpdateForm();
        this.disableCleanMaterials = true;
        this.existingFiles = this.booking.documentos || [];
      }
      this.isLoading = false;
    });
  }
  // Funció genèrica per autocompletar els camps del formulari
  createAutocompleteStream<T extends { nombre: string }>(controlName: string, source: T[]): Observable<T[]> {
    return this.pedidoForm.get(controlName)!.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.nombre ?? ''),
      map(name => source.filter(item => item.nombre.toLowerCase().includes(name.toLowerCase())))
    );
  }

  // A partir del Mat0 i Mat1 obtenir tots els materials
  consultarCamionsIMolls(): void {
    const mat0 = this.pedidoForm.get('material0')?.value;
    const mat1 = this.pedidoForm.get('material1')?.value;
    const materiales = [mat0, mat1].filter((m, i, arr) => m && (i === 0 || m !== arr[0])).map(Number);

    if (materiales.length === 0) {
      this.mollsDisponibles = { camionesDisponibles: [], muellesDisponibles: [] };
      return;
    }
    // Consultem els trucks disponibles amb les restriccions
    this._bookingService.getAvailableTrucks(materiales, true).subscribe(data => {
      this.mollsDisponibles = data;
      // Validació que es faci un update el primer autocompletat,
      // no s'assigni la info per defecte a tipo_camion
      const tipoCamionValor = this.pedidoForm.get('tipoCamion')?.value;
      const valorAssignat = tipoCamionValor !== null && tipoCamionValor !== undefined;
      if (
        this.method !== 'update' &&
        this.mollsDisponibles?.camionesDisponibles?.length === 1 &&
        !valorAssignat
      ) {
        const camioUnic = this.mollsDisponibles.camionesDisponibles[0];
        this.pedidoForm.get('tipoCamion')?.setValue(camioUnic.tipo_camion_id);
      }
    });
  }

  // Obrir el modal de Buscar Horari
  openCalendarModal(): void {
    if (!this.isCalendarValid()) return;

    const tipoCamionId = +this.pedidoForm.get('tipoCamion')?.value;
    const camion = this.mollsDisponibles.camionesDisponibles.find(c => c.tipo_camion_id === tipoCamionId);

    const dialogRef = this.dialog.open(CalendarModalComponent, {
      maxWidth: '95vw',
      width: '65%',
      maxHeight: '90vh',
      data: {
        muelles: this.mollsDisponibles.muellesDisponibles,
        duracionEntrega: camion?.timpo_descarga_a,
      },
      panelClass: 'custom-calendar-dialog',
    });

    dialogRef.afterClosed().subscribe((selectedDate: CalendarReservation) => {
      if (selectedDate) {
        this.pedidoForm.patchValue({
          horaInicio: selectedDate.start,
          horaFin: selectedDate.end,
          muelle: selectedDate.resourceId,
          duracionEntrega: camion?.timpo_descarga_a?.toString() ?? '0',
        });
      }
    });
  }

  // Validacions modal
  isCalendarValid(): boolean {
    const cantidad0 = this.pedidoForm.get('cantidad0')?.value;

    if (!this.pedidoForm.get('tipoCamion')?.value || !this.pedidoForm.get('material0')?.value) {
      this.toastr.error(
        'Debe seleccionar un tipo de camión y al menos un material antes de continuar.',
        'Error en el formulario'
      );
      return false;
    }

    if (cantidad0 < 200 || cantidad0 > 30000) {
      this.toastr.error(
        'La cantidad del primer material debe estar entre 200 y 30.000 kg.',
        'Cantidad inválida'
      );
      return false;
    }

    if (this.pedidoForm.get('numeroDescargas')?.value === '2') {
      if (this.pedidoForm.get('material0')?.value === this.pedidoForm.get('material1')?.value) {
        this.toastr.error(
          'Se han indicado dos descargas, pero el material es el mismo. Por favor, seleccione un segundo material distinto.',
          'Error en materiales'
        );
        return false;
      }

      const cantidad1 = this.pedidoForm.get('cantidad1')?.value;
      if (!this.pedidoForm.get('material1')?.value || cantidad1 < 200 || cantidad1 > 30000) {
        this.toastr.error(
          'La cantidad del segundo material debe estar entre 200 y 30.000 kg.',
          'Cantidad inválida'
        );
        return false;
      }
    }
    return true;
  }

  // Botó reservar
  onSubmit(): void {
    if (this.pedidoForm.invalid) {
      this.toastr.success('Campos pendientes a rellenar', 'Error Formulario')
      return;
    };
    this.isLoading = true;

    const form = this.pedidoForm;
    const formData = new FormData();

    formData.append('tipo_camion_id', form.get('tipoCamion')?.value);
    formData.append('tipo_material1_id', form.get('material0')?.value);
    formData.append('tipo_material2_id', form.get('material1')?.value || '');
    formData.append('proveedor_id', form.get('idProveedor')?.value);
    formData.append('transporte_id', form.get('identificadorTransportista')?.value);
    formData.append('muelle1_id', form.get('muelle')?.value);
    formData.append('status_id', form.get('idStatus')?.value);
    formData.append('empresa_id', '1'); // Fixa si cal canviar
    formData.append('cantidad1', form.get('cantidad0')?.value);
    formData.append('cantidad2', form.get('cantidad1')?.value || '0');

    const pedidoLF = form.get('pedido_LF_1')?.value
      ? `${form.get('pedido_LF_0')?.value} | ${form.get('pedido_LF_1')?.value}`
      : form.get('pedido_LF_0')?.value || '';
    formData.append('pedido_LF', pedidoLF);

    formData.append('matricula_camion', form.get('matriculaCamion')?.value);
    formData.append('inicio1', formatDateToMySQL(form.get('horaInicio')?.value));
    formData.append('fin1', formatDateToMySQL(form.get('horaFin')?.value));
    formData.append('es_aduana', form.get('aduana')?.value === 'si' ? '1' : '0');
    formData.append('notas', form.get('notas')?.value || '');
    formData.append('duracion1', form.get('duracionEntrega')?.value);
    formData.append('tel1', '655454412'); // NO TINC CLAR QUIN TELÈFON S'HI HA DE POSAR, SI EL DEL PROVEÏDOR O QUE PER TANT DEIXO EL TEL FIXE TEMPORALMENT

    if (this.selectedFiles.length > 0) {
      this.selectedFiles.forEach((file, index) => {
        formData.append(`archivos[${index}]`, file, file.name);
      });
    }

    let request: Observable<any>;

    if (this.method === 'update' && this.booking?.reserva_id != null) {
      formData.append('_method', 'PUT');
      formData.append('reserva_id', this.booking.reserva_id.toString());

      request = this._bookingService.updateReservation(formData);
    } else {
      request = this._bookingService.createReservation(formData);
    }


    request.subscribe({
      next: () => {
        this.isLoading = false;
        this.method === 'update' ? this.toastr.success('Reserva actualizada correctamente', 'Reserva Añadida') : this.toastr.success('Reserva creada correctamente', 'Reserva Modificada');
        this.router.navigate(['/bookings']);
      },
      error: err => {
        this.isLoading = false;
        if (err.error.id === 1) {
          this.toastr.error(err.error.message, `Error Reserva material ${err.error.material}`);
        } else {
          console.error('Error saving booking:', err);
        }
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      const maxSizePerFileMB = 5;
      const maxTotalSizeMB = 20;

      let totalSize = 0;
      const validFiles: File[] = [];

      for (const file of files) {
        const fileSizeMB = file.size / (1024 * 1024);

        // Arxiu massa pesat
        if (fileSizeMB > maxSizePerFileMB) {
          continue;
        }

        // S'ha escedit el limit de pés
        if (totalSize + fileSizeMB > maxTotalSizeMB) {
          break;
        }

        validFiles.push(file);
        totalSize += fileSizeMB;
      }

      this.selectedFiles = validFiles;
    }
  }

  // Autocompletamnet camps inicial
  changeToUpdateForm(): void {
    // Obtenim els valors dels pedido_LF, ja que arriben XXX|YYY
    const [lf0, lf1] = (this.booking.pedido_LF?.split('|').map(p => p.trim()) ?? [this.booking.pedido_LF || '', '']);
    const hasSecondMaterial = !!this.booking.tipo_material2_id && this.booking.tipo_material2_id !== 0;
    // Obtenim tota la info dels camion molls etc...
    this._bookingService.getAvailableTrucks([
      this.booking.tipo_material1_id,
      this.booking.tipo_material2_id || 0,
    ], false).subscribe(data => {
      // Un cop carregada, evitem llistar
      this.mollsDisponibles = data;
      this.pedidoForm.patchValue({
        matriculaCamion: this.booking.matricula_camion,
        tipoCamion: this.booking.tipo_camion_id,
        numeroDescargas: hasSecondMaterial ? 2 : 1,
        material0: this.booking.tipo_material1_id,
        material1: this.booking.tipo_material2_id || '',
        cantidad0: this.booking.cantidad1,
        cantidad1: hasSecondMaterial ? this.booking.cantidad2 : '',
        duracionEntrega: this.booking.duracion1,
        muelle: this.booking.muelle1_id,
        horaInicio: this.booking.inicio1,
        horaFin: this.booking.fin1,
        idStatus: this.booking.status_id,
        idProveedor: this.booking.proveedor_id,
        identificadorTransportista: this.booking.transporte_id,
        pedido_LF_0: lf0,
        pedido_LF_1: lf1,
        usarMismoCodigo: lf0 && lf0 === lf1,
        notas: this.booking.notas,
        aduana: this.booking.es_aduana ? 'si' : 'no',
      });

      if (lf0 && lf0 === lf1) {
        this.pedidoForm.get('pedido_LF_1')?.disable();
      }
    });
  }

  // Netejar bookings
  private getEmptyBooking(): Booking {
    return {
      tipo_camion_id: 0,
      tipo_material1_id: 0,
      tipo_material2_id: 0,
      proveedor_id: 0,
      transporte_id: 0,
      muelle1_id: 0,
      status_id: 0,
      empresa_id: 0,
      cantidad1: '',
      cantidad2: '',
      pedido_LF: '',
      matricula_camion: '',
      inicio1: '',
      fin1: '',
      es_aduana: false,
      notas: '',
      duracion1: 0,
    };
  }

  // Eliminar fitxers
  deleteFile(file: BookingDocument) {
    const modalInformation: ConfirmData = {
      title: 'Eliminación de Documento',
      message: `¿Está seguro de que desea eliminar el documento ${file.name}?, una vez eliminado no se podrá recuperar`,
    };

    const dialogRef = this.dialog.open(ConfirmModalComponent, {
      maxWidth: '95vw',
      width: '65%',
      maxHeight: '90vh',
      data: modalInformation,
      panelClass: 'app-confirm-modal',
    });

    dialogRef.afterClosed().subscribe((result: Boolean) => {
      if (result === true && file.documento_reserva_id) {
        this._bookingService.deleteFile(file.documento_reserva_id).subscribe({
          next: () => {
            this.router.navigate(['bookings']);
          },
          error: (error) => {
            console.error('Error deleteing file:', error)
          }
        });
      }
    });
  }
}
