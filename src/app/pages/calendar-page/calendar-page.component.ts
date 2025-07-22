import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarPageService } from './calendar-page.service';
import { Booking } from '../booking-page/booking-page.types';

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, TranslateModule],
  templateUrl: './calendar-page.component.html'
})

export class CalendarPageComponent implements OnInit {
  events: any[] = [];
  bookings: Booking[] = [];

  ngOnInit(): void {
    this.getAllBookings();
  }

  constructor(
    private _calendarPageService: CalendarPageService,
  ) { }

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    dateClick: (arg) => this.handleDateClick(arg),

    firstDay: 1,
    weekends: true,

    slotMinTime: '07:00:00',
    slotMaxTime: '19:30:00',
    scrollTime: '07:00:00',

    businessHours: {
      daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
      startTime: '07:00',
      endTime: '19:30',
    },

    // Modificar format horari
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },

    events: this.events
  };

  eventsPromise!: Promise<EventInput[]>;

  handleDateClick(arg: DateClickArg) {
    alert('date click! ' + arg.dateStr)
  }

  toggleWeekends() {
    this.calendarOptions.weekends = !this.calendarOptions.weekends
  }

  getAllBookings() {
    this._calendarPageService.getAllBookings().subscribe({
      next: (response) => {
        this.bookings = response;
        this.events = this.bookings.map(({ proveedor_id, tipo_material1_id, tipo_material2_id, inicio1, fin1 }) => {
          const title = tipo_material2_id
            ? `${proveedor_id} - ${tipo_material1_id} - ${tipo_material2_id}`
            : `${proveedor_id} - ${tipo_material1_id}`;

          return {
            title,
            start: inicio1,
            end: fin1,
          };
        });
        this.calendarOptions = {
          ...this.calendarOptions,
          events: this.events
        };
      },
      error: (err) => {
        console.error('Error obtenint bookings', err);
      }
    });
  }
}
