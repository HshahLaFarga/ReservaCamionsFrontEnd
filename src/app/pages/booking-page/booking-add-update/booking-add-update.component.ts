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

import { Trucks } from '../../../core/models/truck.module';
import { Muelle } from '../../../core/models/muelle.module';
import { Material } from '../../../core/models/material.module';
import { Status } from '../../../core/models/status.module';
import { Provider } from '../../../core/models/provider.module';
import { Carrier } from '../../../core/models/carrier.module';
import { CalendarReservation } from '../../../core/models/calendar.module';
import { Booking } from '../../../core/models/booking.module';

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
  ],
})
export class BookingAddComponent implements OnInit {
  pedidoForm!: FormGroup;
  formatDate = formatDate;

  trucks: Trucks[] = [];
  mollsDisponibles: { camionesDisponibles: Trucks[]; muellesDisponibles: Muelle[] } = {
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
    private bookingService: BookingAddService,
    private dialog: MatDialog,
    private router: Router
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
      materials: this.bookingService.getAllMaterials(),
      status: this.bookingService.getStatus(),
      providers: this.bookingService.getProvider(),
      carriers: this.bookingService.getCarriers(),
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
    this.bookingService.getAvailableTrucks(materiales, true).subscribe(data => {
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

    if (!this.pedidoForm.get('tipoCamion')?.value || !this.pedidoForm.get('material0')?.value) return false;
    if (cantidad0 < 200 || cantidad0 > 30000) return false;
    if (this.pedidoForm.get('numeroDescargas')?.value === '2') {
      if (this.pedidoForm.get('material0')?.value == this.pedidoForm.get('material1')?.value) return false;
      const cantidad1 = this.pedidoForm.get('cantidad1')?.value;
      if (!this.pedidoForm.get('material1')?.value || cantidad1 < 200 || cantidad1 > 30000) return false;
    }
    return true;
  }

  // Botó reservar
onSubmit(): void {
  if (this.pedidoForm.invalid) return;
  this.isLoading = true;

  const form = this.pedidoForm;
  const formData = new FormData();

  // Afegeix els camps normals al FormData
  formData.append('tipo_camion_id', form.get('tipoCamion')?.value);
  formData.append('tipo_material1_id', form.get('material0')?.value);
  formData.append('tipo_material2_id', form.get('material1')?.value || '');
  formData.append('proveedor_id', form.get('idProveedor')?.value);
  formData.append('transporte_id', form.get('identificadorTransportista')?.value);
  formData.append('muelle1_id', form.get('muelle')?.value);
  formData.append('status_id', form.get('idStatus')?.value);
  formData.append('empresa_id', '1');
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
  formData.append('tel1', '655454412');

  // Afegeix els fitxers
  if (this.selectedFiles.length > 0) {
    this.selectedFiles.forEach(file => {
      formData.append('archivos[]', file, file.name);
    });
  }

  // Si és update, afegeix la reserva_id
  if (this.method === 'update' && this.booking?.reserva_id != null) {
    formData.append('reserva_id', this.booking.reserva_id.toString());
  }

  // Crida al servei amb FormData
  const request = this.method === 'update'
    ? this.bookingService.updateReservation(formData)
    : this.bookingService.createReservation(formData);

  request.subscribe({
    next: () => {
      this.isLoading = false;
      this.router.navigate(['/bookings']);
    },
    error: err => {
      this.isLoading = false;
      console.error('Error saving booking:', err);
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
    this.bookingService.getAvailableTrucks([
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
}
