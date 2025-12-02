import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { BookingAddUpdateService } from './reserva-add-udpdate.service';
import { CalendarModalComponent } from '../../../shared/components/calendar/calendar-modal.component';
import { MatDialog } from '@angular/material/dialog';
import {
  formatDate,
  formatDateToMySQL,
} from '../../../shared/utils/date.utils';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { forkJoin, Observable, map, startWith } from 'rxjs';
import { Router } from '@angular/router';

import { TipoCamion } from '../../../core/models/tipo_camion.model';
import { Muelle } from '../../../core/models/muelle.model';
import { Material } from '../../../core/models/material.model';
import { Status } from '../../../core/models/estado.model';
import { Provider } from '../../../core/models/proveedor.model';
import { Carrier } from '../../../core/models/transportista.model';
import { CalendarReservation } from '../../../core/models/calendaro.model';
import { Booking, BookingDocument } from '../../../core/models/reserva.model';
import { MatIconModule } from '@angular/material/icon';
import {
  ConfirmData,
  ConfirmModalComponent,
} from '../../../shared/components/confirm-modal/confirm-modal.component';
import { ToastrService } from 'ngx-toastr';
import { Entidad } from '../../../core/models/entidad.model';

@Component({
  selector: 'app-booking-add',
  standalone: true,
  templateUrl: './reserva-add-update.component.html',
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
export class ReservaAddUpdateComponent implements OnInit {
  bookingform!: FormGroup;
  formatDate = formatDate;

  existingFiles: BookingDocument[] = [];
  trucks: TipoCamion[] = [];

  // Ahora se rellenan desde los materiales cargados
  itemsDisponible: { camiones: TipoCamion[]; muelles: Muelle[] } = {
    camiones: [],
    muelles: [],
  };

  rangoPeso!: { min_kg: number; max_kg: number };
  selectedFiles: File[] = [];

  displayFnProveedor = (id?: number): string => {
    const prov = this.providers.find((p) => p.proveedor_id === id);
    return prov ? prov.entidad.nombre : '';
  };
  displayFnCarrier = (id?: number): string => {
    const carrier = this.transportistas.find((c) => c.transportista_id === id);
    return carrier ? carrier.entidad.nombre : '';
  };

  materials: Material[] = [];
  status: Status[] = [];
  providers: Provider[] = [];
  transportistas: Carrier[] = [];

  filteredProviders$!: Observable<Provider[]>;
  filteredCarriers$!: Observable<Carrier[]>;

  booking: Booking = this.getEmptyBooking();
  method: 'post' | 'update' = 'post';
  loadAutocompleteUpdate = false;
  disableCleanMaterials = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private _bookingService: BookingAddUpdateService,
    private dialog: MatDialog,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.bookingform = this.buildForm();
    this.setupValueChangeSubscriptions();
    this.loadDefaultData();
  }

  buildForm(): FormGroup {
    return this.fb.group({
      matricula_camion: ['', Validators.required],
      tipo_camion: ['', Validators.required],
      numero_descargas: [1, [Validators.required, Validators.min(1)]],
      material1: ['', Validators.required],
      cantidad1: [0, [Validators.required]],
      material2: [''],
      cantidad2: [0],
      hora: [''],
      duracion_entrega: ['', Validators.required],
      muelle: ['', Validators.required],
      inicio: ['', Validators.required],
      fin: ['', Validators.required],
      estado: ['', Validators.required],
      proveedor: [null, Validators.required],
      transportista: [null, Validators.required],
      pedido1: ['', Validators.required],
      pedido2: [''],
      usarMismoCodigo: [false],
      notas: [''],
      archivos: [null],
      aduana: [false],
    });
  }

  setupValueChangeSubscriptions(): void {
    this.bookingform.get('numero_escargas')?.valueChanges.subscribe(() => {
      if (!this.disableCleanMaterials) {
        this.bookingform.patchValue({
          material1: null,
          cantidad1: null,
          tipo_camion: null,
          hora: null,
          duracion_entrega: null,
          muelle: null,
          inicio: null,
          fin: null,
          pedidio2: null,
        });
      }
      this.disableCleanMaterials = false;
    });

    // Actualizamos camiones/muelles según el material seleccionado
    this.bookingform.get('material1')?.valueChanges.subscribe((materialId) => {
      this.actualizarCamionesYMuelles(materialId);
    });

    this.bookingform
      .get('usarMismoCodigo')
      ?.valueChanges.subscribe((usarMismo) => {
        if (usarMismo) {
          const codigo = this.bookingform.get('pedido1')?.value;
          this.bookingform.get('pedido2')?.setValue(codigo);
          this.bookingform.get('pedido2')?.disable();
        } else {
          this.bookingform.get('pedido2')?.enable();
        }
      });

    this.bookingform.get('pedido1')?.valueChanges.subscribe((codigo) => {
      if (this.bookingform.get('usarMismoCodigo')?.value) {
        this.bookingform.get('pedido2')?.setValue(codigo);
      }
    });
  }

  loadDefaultData(): void {
    forkJoin({
      materials: this._bookingService.getAllMaterials(), // ahora incluyen camiones y muelles
      status: this._bookingService.getStatus(),
      providers: this._bookingService.getProvider(),
      transportistas: this._bookingService.getTransportistas(),
      rangoPeso: this._bookingService.getWeightRange(),
    }).subscribe(
      ({ materials, status, providers, transportistas, rangoPeso }) => {
        this.materials = materials;
        this.status = status;
        this.providers = providers;
        this.transportistas = transportistas;
        this.rangoPeso = rangoPeso;

        this.filteredProviders$ = this.createAutocompleteStream(
          'proveedor',
          providers
        );
        this.filteredCarriers$ = this.createAutocompleteStream(
          'transportista',
          transportistas
        );

        const state = history.state as {
          book?: Booking;
          method?: 'post' | 'update';
        };
        if (state.method === 'update') {
          this.method = 'update';
          this.booking = state.book!;
          console.log('Booking loaded for update:', this.booking);
          this.changeToUpdateForm();
          this.disableCleanMaterials = true;
          this.existingFiles = this.booking.documentos || [];
        }

        this.isLoading = false;
      }
    );
  }

  // 🔹 NUEVA FUNCIÓN: obtiene camiones/muelles del material cargado
  private actualizarCamionesYMuelles(materialId: number): void {
    const material = this.materials.find(
      (m) => m.material_id === Number(materialId)
    );

    if (material && material.tipo_camiones && material.muelles) {
      this.itemsDisponible = {
        camiones: material.tipo_camiones,
        muelles: material.muelles,
      };

      // Asignación automática si hay un solo camión
      if (
        this.method !== 'update' &&
        this.itemsDisponible.camiones.length === 1 &&
        !this.bookingform.get('tipo_camion')?.value
      ) {
        const unicoCamion = this.itemsDisponible.camiones[0];
        this.bookingform
          .get('tipo_camion')
          ?.setValue(unicoCamion.tipo_camion_id);
      }
    } else {
      this.itemsDisponible = { camiones: [], muelles: [] };
    }
  }

  createAutocompleteStream<T extends { entidad: Entidad }>(
    controlName: string,
    source: T[]
  ): Observable<T[]> {
    return this.bookingform.get(controlName)!.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value?.nombre ?? '')),
      map((name) =>
        source.filter((item) =>
          item.entidad.nombre.toLowerCase().includes(name.toLowerCase())
        )
      )
    );
  }
  // Obrir el modal de Buscar Horari
  openCalendarModal(): void {
    if (!this.isCalendarValid()) return;

    const tipoCamionId = +this.bookingform.get('tipo_camion')?.value;
    const camion = this.itemsDisponible.camiones.find(
      (c) => c.tipo_camion_id === tipoCamionId
    );

    const dialogRef = this.dialog.open(CalendarModalComponent, {
      maxWidth: '95vw',
      width: '65%',
      maxHeight: '90vh',
      data: {
        muelles: this.itemsDisponible.muelles,
        duracionEntrega: camion?.tiempo_descarga_1,
      },
      panelClass: 'custom-calendar-dialog',
    });

    dialogRef.afterClosed().subscribe((selectedDate: CalendarReservation) => {
      if (selectedDate) {
        console.log('Selected date from calendar modal:', selectedDate);
        selectedDate;
        this.bookingform.patchValue({
          inicio: selectedDate.start,
          fin: selectedDate.end,
          muelle: selectedDate.resourceId,
          duracion_entrega: camion?.tiempo_descarga_1?.toString() ?? '0',
        });
      }
    });
  }

  // Validacions modal
  isCalendarValid(): boolean {
    const cantidad0 = this.bookingform.get('cantidad1')?.value;

    if (
      !this.bookingform.get('tipo_camion')?.value ||
      !this.bookingform.get('material1')?.value
    ) {
      this.toastr.error(
        'Debe seleccionar un tipo de camión y al menos un material antes de continuar.',
        'Error en el formulario'
      );
      return false;
    }

    if (
      cantidad0 < this.rangoPeso.min_kg ||
      cantidad0 > this.rangoPeso.max_kg
    ) {
      this.toastr.error(
        `La cantidad del primer material debe estar entre ${this.rangoPeso.min_kg} y ${this.rangoPeso.max_kg} kg.`,
        'Cantidad inválida'
      );
      return false;
    }

    if (this.bookingform.get('numero_descargas')?.value === '2') {
      if (
        this.bookingform.get('material1')?.value ===
        this.bookingform.get('material2')?.value
      ) {
        this.toastr.error(
          'Se han indicado dos descargas, pero el material es el mismo. Por favor, seleccione un segundo material distinto.',
          'Error en materiales'
        );
        return false;
      }

      const cantidad1 = this.bookingform.get('cantidad2')?.value;
      if (
        !this.bookingform.get('material2')?.value ||
        cantidad1 < this.rangoPeso.min_kg ||
        cantidad1 > this.rangoPeso.max_kg
      ) {
        this.toastr.error(
          `La cantidad del segundo material debe estar entre ${this.rangoPeso.min_kg} y ${this.rangoPeso.max_kg} kg.`,
          'Cantidad inválida'
        );
        return false;
      }
    }
    return true;
  }

  // Botó reservar
  onSubmit(): void {
    if (this.bookingform.invalid) {
      this.toastr.success('Campos pendientes a rellenar', 'Error Formulario');
      return;
    }
    // this.isLoading = true;

    const form = this.bookingform;
    const formData = new FormData();

    formData.append('tipo_camion_id', String(form.get('tipo_camion')?.value));
    formData.append('material1_id', String(form.get('material1')?.value));
    formData.append('material2_id', String(form.get('material2')?.value) || '');
    formData.append('proveedor_id', String(form.get('proveedor')?.value));
    formData.append('transportista_id', String(form.get('transportista')?.value));
    formData.append('muelle_id', String(form.get('muelle')?.value));
    formData.append('estado_id', String(form.get('estado')?.value));
    formData.append('empresa_lfycs_id', String('1')); // Fixa si cal canviar
    formData.append('cantidad1', form.get('cantidad1')?.value);
    formData.append('cantidad2', form.get('cantidad2')?.value || '0');

    const pedidoLF = form.get('pedido2')?.value
      ? `${form.get('pedido1')?.value} | ${form.get('pedido2')?.value}`
      : form.get('pedido1')?.value || '';
    formData.append('pedido1', pedidoLF);

    formData.append('matricula_camion', form.get('matricula_camion')?.value);
    formData.append(
      'inicio',
      formatDateToMySQL(form.get('inicio')?.value)
    );
    formData.append('fin', formatDateToMySQL(form.get('fin')?.value));
    formData.append(
      'aduana',
      form.get('aduana')?.value === 'si' ? '1' : '0'
    );
    formData.append('notas', form.get('notas')?.value || '');
    formData.append('duracion', form.get('duracion_entrega')?.value);
    formData.append('telefono', '655454412'); // NO TINC CLAR QUIN TELÈFON S'HI HA DE POSAR, SI EL DEL PROVEÏDOR O QUE PER TANT DEIXO EL TEL FIXE TEMPORALMENT

    if (this.selectedFiles.length > 0) {
      this.selectedFiles.forEach((file, index) => {
        formData.append(`archivos[${index}]`, file, file.name);
      });
    }

    let request: Observable<any>;

    if (this.method === 'update' && this.booking?.reserva_id != null) {
      formData.append('_method', 'PUT');
      formData.append('reserva_id', this.booking.reserva_id.toString());

      request = this._bookingService.updateBooking(formData);
    } else {
      request = this._bookingService.createBooking(formData);
    }

    request.subscribe({
      next: () => {
        this.isLoading = false;
        this.method === 'update'
          ? this.toastr.success(
              'Reserva actualizada correctamente',
              'Reserva Añadida'
            )
          : this.toastr.success(
              'Reserva creada correctamente',
              'Reserva Modificada'
            );
        this.router.navigate(['/bookings']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.error.id === 1) {
          this.toastr.error(
            err.error.message,
            `Error Reserva material ${err.error.material}`
          );
        }
        if (err.error.id) {
          this.toastr.error(err.error.message, `Error`);
        } else {
          console.error('Error saving booking:', err);
        }
      },
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

        // S'ha escedit el limit de pes
        if (totalSize + fileSizeMB > maxTotalSizeMB) {
          break;
        }

        validFiles.push(file);
        totalSize += fileSizeMB;
      }

      this.selectedFiles = validFiles;
    }
  }

  // Autocompletament camps inicial
  changeToUpdateForm(): void {
    console.log('Booking a editar:', this.booking);
    // Obtenim els valors dels pedido_LF, ja que arriben XXX|YYY
    // const [lf0, lf1] = (this.booking.pedido1?.split('|').map(p => p.trim()) ?? [this.booking.pedido1 || '', '']);
    const hasSecondMaterial =
      !!this.booking?.material2?.material_id &&
      this.booking.material2.material_id !== 0;

    const material = this.materials.find(
      (m) => m.material_id === this.booking?.material1?.material_id
    );
    if (material && material.tipo_camiones && material.muelles) {
      this.itemsDisponible = {
        camiones: material.tipo_camiones,
        muelles: material.muelles,
      };
    }
    console.log('Items disponibles al cargar booking:', this.booking);
    this.bookingform.patchValue({
      matricula_camion: this.booking.matricula_camion,
      tipo_camion: this.booking?.tipo_camion?.tipo_camion_id,
      numero_descargas: hasSecondMaterial ? 2 : 1,
      material1: this.booking?.material1?.material_id,
      material2: hasSecondMaterial ? this.booking.material2?.material_id : '',
      cantidad1: this.booking.cantidad1,
      duracion_entrega: this.booking.duracion,
      muelle: this.booking?.muelle?.muelle_id,
      inicio: this.booking.inicio,
      fin: this.booking.fin,
      estado: this.booking?.estado?.estado_id,
      proveedor: this.booking?.proveedor?.proveedor_id,
      transportista: this.booking?.transportista?.transportista_id,
      pedido1: this.booking.pedido1 || '',
      pedido2: this.booking.pedido2 || '',
      usarMismoCodigo:
        this.booking.pedido1 && this.booking.pedido2 === this.booking.pedido1,
      notas: this.booking.notas,
      aduana: this.booking.aduana ? 'si' : 'no',
    });

    if (this.booking.pedido1 && this.booking.pedido1 === this.booking.pedido2) {
      this.bookingform.get('pedido2')?.disable();
    }

    // Obtenim tota la info dels camion molls etc...
    // this._bookingService.getAvailableTrucks([
    //   this.booking.material1.material_id,
    //   this.booking.material1.material_id || 0,
    // ], false).subscribe(data => {
    //   // Un cop carregada, evitem llistar
    //   this.itemsDisponible = data;
    //   this.bookingform.patchValue({
    //     matricula_camion: this.booking.matricula_camion,
    //     tipo_camion: this.booking.tipo_camion.tipo_camion_id,
    //     numero_descargas: hasSecondMaterial ? 2 : 1,
    //     material1: this.booking.material1.material_id,
    //     material2: this.booking.material1.material_id || null,
    //     cantidad0: this.booking.cantidad1,
    //     cantidad1: hasSecondMaterial ? this.booking.cantidad2 : null,
    //     duracionEntrega: this.booking.duracion1,
    //     muelle1: this.booking.muelle1.muelle_id,
    //     inicio1: this.booking.inicio1,
    //     fin1: this.booking.fin1,
    //     estado: this.booking.estado.estado_id,
    //     proveedor: this.booking.proveedor.proveedor_id,
    //     transportista: this.booking.transportista.transportista_id,
    //     pedido1: this.booking.pedido1,
    //     pedido2: this.booking.pedido2,
    //     usarMismoCodigo: this.booking.pedido1 && this.booking.pedido2 === this.booking.pedido1,
    //     notas: this.booking.notas,
    //     es_aduana: this.booking.es_aduana ? 'si' : 'no',
    //   });

    //   if (this.booking.pedido1 && this.booking.pedido1 === this.booking.pedido2) {
    //     this.bookingform.get('pedido_LF_1')?.disable();
    //   }
    // });
  }

  // Netejar bookings
  private getEmptyBooking(): Booking {
    const entidad: Entidad = {
      entidad_id: 0,
      nombre: '',
      nif: '',
      pin: '',
      email: '',
      telefono1: '',
      alerta: false,
      idioma: 'es',
      codigo_sap: '',
    };

    const proveedor: Provider = {
      proveedor_id: 0,
      tipo_proveedor_id: 0,
      entidad,
      email_notificaciones: '',
    };

    return {
      reserva_id: 0,

      empresa_lfycs_id: 0,
      empresa_lfycs: {
        empresa_lfycs_id: 0,
        nombre: '',
        descripcion: '',
        muelles: [],
        reservas: [],
        estadoFormated: '',
        conjuntoMuelles: '',
      },

      tipo_camion_id: 0,
      tipo_camion: {
        tipo_camion_id: 0,
        nombre: '',
        descripcion: '',
        tiempo_descarga_1: 30,
        bloqueo_muelles: false,
        bloqueo_muellesFormated: '',
      },

      material1_id: 0,
      material1: {
        material_id: 0,
        codigo_sap: '',
        nombre: '',
        tipo_camiones: [],
        muelles: [],
        conjuntoCamiones: '',
        conjuntoMuelles: '',
      },

      material2_id: null,
      material2: null,

      proveedor_id: 0,
      proveedor,

      transportista_id: 0,
      transportista: {
        transportista_id: 0,
        puede_gestionar: false,
        entidad,
      },

      muelle_id: 0,
      muelle: {
        muelle_id: 0,
        color: '',
        descripcion: '',
        empresa_id: 0,
        nombre: '',
        empresa: {
          transportista_id: 0,
          puede_gestionar: false,
          entidad,
        },
        horarios: [],
        abierto_festivosFormated: '',
        estadoFormated: '',
      },

      estado_id: 0,
      estado: {
        estado_id: 0,
        nombre: '',
        descripcion: '',
      },

      cantidad1: 0,
      pedido1: '',
      pedido2: null,
      matricula_camion: '',
      inicio: '',
      fin: '',
      duracion: 0,
      telefono: null,
      aduana: false,
      notas: null,

      documentos: [],
      created_at: '',
      updated_at: '',
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
            console.error('Error deleteing file:', error);
          },
        });
      }
    });
  }

  /**Función para mostrar el nombre del muelle ne vez del id al crear/modificar una reserva */
  getMuelleNombre(): string {
    const id = this.bookingform.get('muelle')?.value;
    const muelles = this.itemsDisponible?.muelles;
    if (!muelles || !id) return '';
    const muelle = muelles.find((m: any) => m.muelle_id == id);
    return muelle ? muelle.nombre : '';
  }
}
