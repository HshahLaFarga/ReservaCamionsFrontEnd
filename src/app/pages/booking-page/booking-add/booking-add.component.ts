import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { BookingAddService } from './booking-add.service';
import { CalendarModalComponent } from '../../../shared/components/calendar/calendar-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { formatDate, formatDateToMySQL } from '../../../shared/utils/date.utils';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { map, Observable, startWith } from 'rxjs';
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
  templateUrl: './booking-add.component.html',
  imports: [ReactiveFormsModule, CommonModule, MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule]
})
export class BookingAddComponent implements OnInit {
  pedidoForm!: FormGroup;
  // Convertim la funció externa en una interna per poder-la fer servir a l'html
  formatDate = formatDate;
  trucks: any;
  mollsDisponibles: { camionesDisponibles: Trucks[], muellesDisponibles: Muelle[] } = { camionesDisponibles: [], muellesDisponibles: [] };

  // Preload FORM information
  materials: Material[] = [];
  status: Status[] = [];
  providers: Provider[] = [];
  carriers: Carrier[] = [];

  // Aplicació filtratge de Proveidor i Transportista
  displayFnProveedor = (id?: number): string => {
    const prov = this.providers.find(p => p.proveedor_id === id);
    return prov ? prov.nombre : '';
  };
  displayFnCarrier = (id?: number): string => {
    const carrier = this.carriers.find(c => c.transporte_id === id);
    return carrier ? carrier.nombre : '';
  };

  filteredProviders$!: Observable<Provider[]>;
  filteredCarriers$!: Observable<Carrier[]>;
  idProveedorControl!: FormControl<Provider | null>;
  identificadorTransportistaControl!: FormControl<Carrier | null>;

  constructor(
    private fb: FormBuilder,
    private _bookingAddService: BookingAddService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
    // Fòrmulari inicial
  this.pedidoForm = this.fb.group({
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
    notas: [''],
    archivos: [null],
    aduana: ['no'],
  });


    this.idProveedorControl = this.pedidoForm.get('idProveedor') as FormControl<Provider | null>;
    this.identificadorTransportistaControl = this.pedidoForm.get('identificadorTransportista') as FormControl<Carrier | null>;

    // Càrrega informació inicial
    this.loadDefaultData();

    // Recuperar la informació dels material i actualitzar-la quan arribi la petició
    this.pedidoForm.get('material0')?.valueChanges.subscribe(() => {
      this.consultarCamionsIMolls();
    });
    this.pedidoForm.get('material1')?.valueChanges.subscribe(() => {
      this.consultarCamionsIMolls();
    });
    this.pedidoForm.get('numeroDescargas')?.valueChanges.subscribe(() => {
      this.pedidoForm.patchValue({
        material1: [''],
        cantidad1: [0],
        tipoCamion: [''],
        hora: [''],
        duracionEntrega: [''],
        muelle: [''],
        horaInicio: [''],
        horaFin: [''],
      });
    });
  }

  // Càrrega de tota la informació
  loadDefaultData() {
    this.getAllMaterials();
    this.getStatus();
    this.getProveedor();
    this.getCarriers();
  }

  // Obtenir els materials
  getAllMaterials() {
    this._bookingAddService.getAllMaterials().subscribe((materials) => {
      this.materials = materials;
    });
  }

  // Obtenir els diferents status disponibles
  getStatus() {
    this._bookingAddService.getStatus().subscribe((status) => {
      this.status = status;
    });
  }

  // Obtenir els proveidors
  getProveedor() {
    this._bookingAddService.getProvider().subscribe((providers) => {
      this.providers = providers;
      this.filteredProviders$ = this.pedidoForm.get('idProveedor')!.valueChanges.pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value?.nombre),
        map(nombre => this.filterProviders(nombre))
      );
    });
  }

  // Obtenir els transportistes
  getCarriers() {
    this._bookingAddService.getCarriers().subscribe((carriers) => {
      this.carriers = carriers
      this.filteredCarriers$ = this.pedidoForm.get('identificadorTransportista')!.valueChanges.pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value?.nombre),
        map(nombre => this.filterCarriers(nombre))
      );
    })
  }

  // Obtenir els camions disponibles tenint en compte els materials que es demanen
  consultarCamionsIMolls() {
    const materiales: number[] = [];

    const mat0 = this.pedidoForm.get('material0')?.value;
    if (mat0) materiales.push(+mat0);

    const mat1 = this.pedidoForm.get('material1')?.value;
    if (mat1) materiales.push(+mat1);

    // Validacions seleccio 1 o 2 materials
    if (materiales.some((mat) => mat === 0)) {
      this.pedidoForm.get('material1')?.setValue(null);
      return;
    };


    // Validació en el cas que no tingui longitud o bé l'usuari hagi seleccionat els mateixos
    if (materiales.length === 0) {
      this.mollsDisponibles = { camionesDisponibles: [], muellesDisponibles: [] };
      return;
    } else if (materiales.length === 2 && materiales[0] === materiales[1]) {
      this.mollsDisponibles = { camionesDisponibles: [], muellesDisponibles: [] };
      return;
    }

    this._bookingAddService.getAvailableTrucks(materiales).subscribe(data => {
      this.mollsDisponibles = data;
    });
  }

  // Obrir calendari per seleccionar les hores disponibles
  openCalendarModal() {
    // Validar camio i material introduit i validacions de pes
    if (this.pedidoForm.get('tipoCamion')?.value !== '' && this.pedidoForm.get('material0')?.value !== '' && this.pedidoForm.get('cantidad0')?.value > 200 && this.pedidoForm.get('cantidad0')?.value < 30000) {

      // Validar 2 descàrregues conté alguna cosa i validacions de pes
      if (this.pedidoForm.get('numeroDescargas')?.value == '2') {
        if (this.pedidoForm.get('material1')?.value === '' || this.pedidoForm.get('cantidad1')?.value < 200 || this.pedidoForm.get('cantidad1')?.value > 30000) return
      }

      const dialogRef = this.dialog.open(CalendarModalComponent, {
        maxWidth: '95vw',
        width: '65%',
        maxHeight: '90vh',
        data: {
          muelles: this.mollsDisponibles.muellesDisponibles,
          duracionEntrega: this.mollsDisponibles.camionesDisponibles.find((camion) => camion.tipo_camion_id === +this.pedidoForm.get('tipoCamion')?.value)?.timpo_descarga_a
        },
        panelClass: 'custom-calendar-dialog'
      });

      dialogRef.afterClosed().subscribe((selectedDate: CalendarReservation) => {
        if (selectedDate) {
          this.pedidoForm.patchValue({
            horaInicio: selectedDate.start,
            horaFin: selectedDate.end,
            muelle: selectedDate.resourceId,
            duracionEntrega: this.mollsDisponibles.camionesDisponibles.find((camion) => camion.tipo_camion_id === +this.pedidoForm.get('tipoCamion')?.value)?.timpo_descarga_a.toString() || '0'
          });
        }
      });
    }
  }

  // Filtre dels proveidors
  filterProviders(nombre: string | undefined): Provider[] {
    if (!nombre) return this.providers;
    const filterValue = nombre.toLowerCase();
    return this.providers.filter(provider => provider.nombre.toLowerCase().includes(filterValue));
  }

  // Filtre dels transportistes
  filterCarriers(nombre: string | undefined): Carrier[] {
    if (!nombre) return this.carriers;
    const filterValue = nombre.toLowerCase();
    return this.carriers.filter(carrier => carrier.nombre.toLowerCase().includes(filterValue));
  }

  onSubmit() {
    if (this.pedidoForm.valid) {
      const booking: Booking = {
        tipo_camion_id: this.pedidoForm.get('tipoCamion')?.value,
        tipo_material1_id: this.pedidoForm.get('material0')?.value,
        tipo_material2_id: this.pedidoForm.get('material1')?.value,
        proveedor_id: this.pedidoForm.get('idProveedor')?.value,
        transporte_id: this.pedidoForm.get('identificadorTransportista')?.value,
        muelle1_id: this.pedidoForm.get('muelle')?.value,
        status_id: this.pedidoForm.get('idStatus')?.value,
        empresa_id: 1, //DEFECTE
        cantidad1: this.pedidoForm.get('cantidad1')?.value,
        cantidad2: this.pedidoForm.get('cantidad0')?.value,
        pedido_LF: 'prova no se que posar',
        matricula_camion: this.pedidoForm.get('matriculaCamion')?.value,
        inicio1: formatDateToMySQL(this.pedidoForm.get('horaInicio')?.value),
        fin1: formatDateToMySQL(this.pedidoForm.get('horaFin')?.value),
        es_aduana: this.pedidoForm.get('aduana')?.value == 1 ? true : false,
        notas: this.pedidoForm.get('notas')?.value,
        tel1: '655454412',
        duracion1: this.pedidoForm.get('duracionEntrega')?.value,
      };

      this._bookingAddService.createReservation(booking).subscribe({
        next: (respuesta) => {
          this.router.navigate(['/bookings']);
        },
        error: (err) => {
          console.error('Error creating booking:', err);
        }
      });
    }
  }
}
