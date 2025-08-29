import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import { CalendarModalService } from './calendar-modal.service';
import { CommonModule } from '@angular/common';
import { CalendarReservation } from '../../../core/models/calendar.model';
import { Booking } from '../../../core/models/booking.model';
import { Muelle } from '../../../core/models/muelle.model';


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
    slotMinTime: '07:00:00',
    slotMaxTime: '19:00:00',
    resources: this.data.muelles.map((data: Muelle) => ({ id: data.numero, title: data.nombre_muelle })),
    events: this.events,
    select: this.onTimeSlotSelected.bind(this),
    selectable: true,
    dateClick: (info) => {
      console.log('Has clicado:', info.dateStr, 'en muelle:', info.resource?.title);
    }
  };

  constructor(
    public dialogRef: MatDialogRef<CalendarModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _calendarModalService: CalendarModalService
  ) { }

  ngOnInit(): void {
    this.getAllBookings();
  }

  getAllBookings() {
    this.isLoading = true;
    this._calendarModalService.getAllBookings().subscribe({
      next: (response) => {
        this.bookings = response;
        this.bookings = this.bookings.filter(({muelle1_id}) => this.data.muelles.map((data: Muelle) => (data.numero)).includes(muelle1_id));
        this.events = this.bookings.map(({ muelle1_id, inicio1, fin1 }) => {
          return {
            resourceId: muelle1_id,
            title: 'Ocupado',
            start: new Date(inicio1),
            end: new Date(fin1),
          };
        });

        this.calendarOptions = {
          ...this.calendarOptions,
          events: this.events
        };

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error obtenint bookings', err);
        this.isLoading = false;
      }
    });
  }

  onTimeSlotSelected(info: any) {
    const duracionEntregaMin = this.data.duracionEntrega || 30;
    const start = info.start;
    const end = new Date(start.getTime() + duracionEntregaMin * 60000);

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
      {...this.newReservation}
    );
  }
}
