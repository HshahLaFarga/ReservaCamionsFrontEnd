import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import { CalendarModalService } from './calendar-modal.service';
import { CommonModule } from '@angular/common';
import { CalendarReservation } from '../../../core/models/calendaro.model';
import { Booking } from '../../../core/models/reserva.model';
import { Muelle } from '../../../core/models/muelle.model';
import { HorarioMuelle } from '../../../core/models/horario_muelle';

@Component({
  selector: 'app-calendar-modal',
  templateUrl: './calendar-modal.component.html',
  standalone: true,
  imports: [FullCalendarModule, CommonModule],
  styles: [`
    @media only screen and (max-width: 600px) {
      ::ng-deep .fc-toolbar-title {
        font-size: 1em !important;
      }

      ::ng-deep .fc-header-toolbar {
        flex-direction: column !important;
      }
    }
  `]
})


export class CalendarModalComponent implements OnInit {
  // Creem el nou objecte de reserva
  newReservation: CalendarReservation = { id: '', title: '', start: '', end: '', resourceId: '' };

  // Càrrega reserves
  bookings: Booking[] = [];
  events: any[] = [];

  eventsPromise!: Promise<EventInput[]>;
  isLoading: boolean = false;
  
  calendarOptions: CalendarOptions = {
    schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
    plugins: [resourceTimeGridPlugin, interactionPlugin],
    initialView: 'resourceTimeGridDay',
    locale: 'es',
    slotDuration: { minutes: 20 },
    slotMinTime: '07:00:00',
    slotMaxTime: '19:00:00',
    snapDuration: `${this.data.duracion_entrega}:00`,
    selectOverlap: false,
    eventOverlap: false,
    resources: this.data.muelles.map((muelle: Muelle) => ({ id: muelle.muelle_id, title: muelle.nombre })),
    events: this.events,
    select: this.onTimeSlotSelected.bind(this),
    selectable: true,
    datesSet: (info) => {
      console.log('Cambio de fecha:', info.start);
      this.updateBusinessHoursAndResources(info.start);
    }
  };

  timingMuelles: HorarioMuelle[] | [] = [];

  constructor(
    public dialogRef: MatDialogRef<CalendarModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _calendarModalService: CalendarModalService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadTimingsAndBookings();
    console.log('Data: ', this.data);
  }

  private loadTimingsAndBookings() {
    // Primer carreguem horaris dels muelles
    this._calendarModalService.getTimingMuelle().subscribe({
      next: (timings: HorarioMuelle[]) => {
        this.timingMuelles = timings;
        // Després carreguem les bookings
        this.getAllBookings();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  private getAllBookings() {
    this._calendarModalService.getAllBookings().subscribe({
      next: (response: Booking[]) => {
        this.bookings = response.filter(b => {
          const muelleId = b.muelle?.muelle_id;
          return muelleId !== undefined && 
                this.data.muelles.some((m: Muelle) => m.muelle_id === muelleId);
        });

        this.events = this.bookings.map(b => ({
          resourceId: b.muelle?.muelle_id ?? 0, // default value if undefined
          title: 'Ocupado',
          start: new Date(b.inicio),
          end: new Date(b.fin),
        }));

        this.setupCalendarOptions();

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error obtenint bookings', err);
        this.isLoading = false;
      }
    });
  }
  

  private setupCalendarOptions(currentDate?: Date) {
    const dayOfWeek = currentDate ? (currentDate.getDay() === 0 ? 7 : currentDate.getDay()) : 1;
    // getDay() retorna 0=diumenge, 1=dilluns,..., convertim a 1-7

    const businessHours = [];
    let slotMinTimeGlobal = '23:59:00';
    let slotMaxTimeGlobal = '00:00:00';

    // Generem businessHours per cada dia amb timings existents
    const timingsDia = this.timingMuelles.filter(t => t.dia_semana === dayOfWeek);

    if (timingsDia.length) {
      const startTimes = timingsDia.map(t => t.inicio.toString());
      const endTimes = timingsDia.map(t => t.fin.toString());

      const minStart = startTimes.reduce((min, val) => val < min ? val : min, startTimes[0]);
      const maxEnd = endTimes.reduce((max, val) => val > max ? val : max, endTimes[0]);

      slotMinTimeGlobal = minStart;
      slotMaxTimeGlobal = maxEnd;

      businessHours.push({
        daysOfWeek: [dayOfWeek],
        startTime: minStart,
        endTime: maxEnd
      });
    }

    // Prepare resources amb horari només del dia actual
    const resources = this.data.muelles.map((m: Muelle) => {
      const timingsMuelleDia = this.timingMuelles
        .filter(t => t.muelle_id === m.muelle_id && t.dia_semana === dayOfWeek);

      const timingStrings = timingsMuelleDia.map(t => `${t.inicio} - ${t.fin}`);
      return { id: m.muelle_id, title: `${m.nombre} ${timingStrings.join(', ')}` };
    });

    this.calendarOptions = {
      ...this.calendarOptions,
      businessHours,
      slotMinTime: slotMinTimeGlobal,
      slotMaxTime: slotMaxTimeGlobal,
      resources
    };
  }

  private updateBusinessHoursAndResources(currentDate: Date) {
    if (!this.timingMuelles || this.timingMuelles.length === 0) {
      console.warn('⏳ timingMuelles aún no cargado, se omite updateBusinessHoursAndResources');
      return;
    }

    const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay(); // 1-7

    // Filtramos los horarios solo del día que se muestra
    const timingsDia = this.timingMuelles.filter(t => t.dia_semana === dayOfWeek);

    let slotMinTimeGlobal = '23:59:00';
    let slotMaxTimeGlobal = '00:00:00';
    const businessHours = [];

    if (timingsDia.length) {
      const startTimes = timingsDia.map(t => t.inicio.toString());
      const endTimes = timingsDia.map(t => t.fin.toString());

      slotMinTimeGlobal = startTimes.reduce((min, val) => val < min ? val : min, startTimes[0]);
      slotMaxTimeGlobal = endTimes.reduce((max, val) => val > max ? val : max, endTimes[0]);

      businessHours.push({
        daysOfWeek: [dayOfWeek],
        startTime: slotMinTimeGlobal,
        endTime: slotMaxTimeGlobal
      });

    }

    // Actualizamos los recursos mostrando solo el horario de este día
    const resources = this.data.muelles.map((m: Muelle )=> {
      const timingsMuelleDia = this.timingMuelles.filter(t => t.muelle_id === m.muelle_id && t.dia_semana === dayOfWeek);
      const timingStrings = timingsMuelleDia.map(t => `${t.inicio} - ${t.fin}`);
      return { id: m.muelle_id, title: `${m.nombre} ${timingStrings.join(', ')}` };
    });

    // Asignamos a calendarOptions
    this.calendarOptions = {
      ...this.calendarOptions,
      businessHours,
      slotMinTime: slotMinTimeGlobal,
      slotMaxTime: slotMaxTimeGlobal,
      resources
    };

  }



  onTimeSlotSelected(info: any) {
    const duracionEntregaMin = this.data.duracionEntrega || 30;
    const start = info.start;
    const end = new Date(start.getTime() + duracionEntregaMin * 60000);

    // 🔍 Validar solapamientos
    const eventos = this.calendarOptions.events as any[];

    // const haySolape = eventos.some(e => {
    //   if (e.id === 'planning-reservation') return false;

    //   const eStart = new Date(e.start);
    //   const eEnd = new Date(e.end);

    //   return start < eEnd && end > eStart;
    // });

    // if (haySolape) {
    //   // ❌ No cabe exactamente
    //   return;
    // }

    this.newReservation = {
      id: "planning-reservation",
      title: 'Nova reserva',
      start: start.toISOString(),
      end: end.toISOString(),
      resourceId: info.resource.id
    };

    // Fem un filter per treure la reserva en el cas que l'usuari faci més d'un click en una franja diferent
    const events = (this.calendarOptions.events as any[]).filter((e) => e.id !== 'planning-reservation');

    // Utilitzem l'spreet operator per concatenar totes les reserves llistades amb l'actual.
    this.calendarOptions.events = [...events, this.newReservation];
  }

  onDateClick(info: any) {
    this.dialogRef.close(info.dateStr);
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    this.dialogRef.close(
      { ...this.newReservation }
    );
  }
}
