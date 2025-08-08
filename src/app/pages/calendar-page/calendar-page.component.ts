import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarPageService } from './calendar-page.service';
import { Booking } from '../../core/models/booking.module';
import { Muelle } from '../../core/models/muelle.module';

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, TranslateModule],
  templateUrl: './calendar-page.component.html'
})
export class CalendarPageComponent implements OnInit {
  events: EventInput[] = [];
  bookings: Booking[] = [];
  isLoading: boolean = false;
  muelles: Muelle[] = [];
  selectedMuelles: number[] = [];

  constructor(private _calendarPageService: CalendarPageService) {}

  ngOnInit(): void {
    this.loadDefaultData();
  }

  loadDefaultData() {
    this.getMuelles();
    this.getBookings();
  }

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    dateClick: (arg) => this.handleDateClick(arg),
    nowIndicator: true,
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
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    events: []
  };

  getMuelles() {
    this._calendarPageService.getMuelles().subscribe({
      next: (muelles: Muelle[]) => {
        this.muelles = muelles;
        this.selectedMuelles = this.muelles.map(m => m.muelle_id);
        this.filterEventsBySelectedMuelles();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  getBookings() {
    this.isLoading = true;
    this._calendarPageService.getAllBookings().subscribe({
      next: (response) => {
        this.bookings = response;
        this.filterEventsBySelectedMuelles();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error obtenint bookings', err);
        this.isLoading = false;
      }
    });
  }

  filterEventsBySelectedMuelles() {
    if (!this.bookings.length || !this.selectedMuelles.length) {
      this.events = [];
    } else {
      if (this.bookings === null) return;
      this.events = this.bookings
        .filter(b => this.selectedMuelles.includes(b.muelle1!.muelle_id))
        .map(({ proveedor_id, tipo_material1_id, tipo_material2_id, inicio1, fin1, muelle1 }) => {
          const title = tipo_material2_id
            ? `${proveedor_id} - ${tipo_material1_id} - ${tipo_material2_id}`
            : `${proveedor_id} - ${tipo_material1_id}`;
          return {
            title,
            start: inicio1,
            end: fin1,
            backgroundColor: muelle1?.color
          };
        });
    }
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.events
    };
  }

  toggleMuelleSelection(muelleId: number) {
    if (this.selectedMuelles.includes(muelleId)) {
      this.selectedMuelles = this.selectedMuelles.filter(id => id !== muelleId);
    } else {
      this.selectedMuelles.push(muelleId);
    }
    this.filterEventsBySelectedMuelles();
  }

  isMuelleSelected(muelleId: number): boolean {
    return this.selectedMuelles.includes(muelleId);
  }

  toggleWeekends() {
    this.calendarOptions.weekends = !this.calendarOptions.weekends;
  }

  handleDateClick(arg: DateClickArg) {
    alert('date click! ' + arg.dateStr);
  }
}
