import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarPageService } from './calendar-page.service';
import { Booking } from '../../core/models/reserva.model';
import { Muelle } from '../../core/models/muelle.model';

@Component({
  selector: 'app-calendar-page',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, TranslateModule],
  templateUrl: './calendar-page.component.html',
  styles: `
    div[fixed] {
      transition: opacity 0.1s ease-in-out;
      /* Evitamos que el tooltip parpadee si el ratón queda debajo */
      pointer-events: none; 
    }
  `,
})
export class CalendarPageComponent implements OnInit {
  events: EventInput[] = [];
  bookings: Booking[] = [];
  isLoading: boolean = false;
  muelles: Muelle[] = [];
  selectedMuelles: number[] = [];
  // tooltipData: any = null; // datos del tooltip
  tooltipStyle: any = {}; // posición CSS

  // Define estas variables en tu clase
  tooltipVisible = false;
  tooltipPos = { x: 0, y: 0 };
  tooltipData: any = {};

  constructor(private _calendarPageService: CalendarPageService) {}

  ngOnInit(): void {
    this.loadDefaultData();
  }

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    nowIndicator: true,
    firstDay: 1,
    weekends: true,
    slotMinTime: '07:00:00',
    slotMaxTime: '19:30:00',
    scrollTime: '07:00:00',
    businessHours: [],
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    events: [],
    // eventMouseEnter: this.handleEventMouseEnter.bind(this),
    // eventMouseLeave: this.handleEventMouseLeave.bind(this),
    eventMouseEnter: (info) => {
      this.tooltipVisible = true;

      // 1. Cargamos los datos
      const props = info.event.extendedProps;
      this.tooltipData = {
        title: info.event.title,
        proveedor: props['proveedor']?.entidad?.nombre || 'N/A',
        matricula: props['matricula'] || 'S/N',
      };

      // 2. Escuchamos el movimiento del ratón solo mientras estamos sobre el evento
      const moveHandler = (e: MouseEvent) => {
        this.tooltipPos = { x: e.clientX + 15, y: e.clientY + 15 };
      };

      // Guardamos la referencia para poder quitarla luego
      info.el.addEventListener('mousemove', moveHandler);

      // Al salir, limpiamos el evento de escucha
      info.el.onmouseleave = () => {
        this.tooltipVisible = false;
        info.el.removeEventListener('mousemove', moveHandler);
      };
    },

    eventMouseLeave: () => {
      this.tooltipVisible = false;
    },
  };

  loadDefaultData() {
    this.getMuelles();
    this.getBookings();
  }

  getMuelles() {
    this._calendarPageService.getMuelles().subscribe({
      next: (muelles: Muelle[]) => {
        this.muelles = muelles;
        this.selectedMuelles = this.muelles.map((m) => m.muelle_id);
        this.updateBusinessHours();
        this.filterEventsBySelectedMuelles();
      },
      error: (err) => {
        console.error(err);
      },
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
      },
    });
  }

  filterEventsBySelectedMuelles() {
    if (!this.bookings.length || !this.selectedMuelles.length) {
      this.events = [];
    } else {
      if (this.bookings === null) return;
      this.events = this.bookings
        .filter((b) => this.selectedMuelles.includes(b.muelle!.muelle_id))
        .map(({ proveedor, material1, material2, inicio, fin, muelle }) => {
          const title = material2?.material_id
            ? `${proveedor?.proveedor_id} - ${material1?.material_id} - ${material2?.material_id}`
            : `${proveedor?.proveedor_id} - ${material1?.material_id}`;
          return {
            title,
            start: inicio,
            end: fin,
            backgroundColor: muelle?.color,
          };
        });
    }
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.events,
    };
  }

  toggleMuelleSelection(muelleId: number) {
    if (this.selectedMuelles.includes(muelleId)) {
      this.selectedMuelles = this.selectedMuelles.filter(
        (id) => id !== muelleId
      );
    } else {
      this.selectedMuelles.push(muelleId);
    }
    this.filterEventsBySelectedMuelles();
    this.updateBusinessHours();
  }

  isMuelleSelected(muelleId: number): boolean {
    return this.selectedMuelles.includes(muelleId);
  }

  toggleWeekends() {
    this.calendarOptions.weekends = !this.calendarOptions.weekends;
  }

  private getGlobalDayRange(numDia: number) {
    const horariosDia = this.muelles
      .filter((m) => this.selectedMuelles.includes(m.muelle_id))
      .flatMap((m) => m.horarios || [])
      .filter((h) => Number(h.dia_semana) === numDia);

    if (!horariosDia.length) {
      return { start: '07:00:00', end: '19:30:00' }; // fallback
    }

    const start = horariosDia.reduce(
      (min, h) => (h.inicio < min ? h.inicio : min),
      horariosDia[0].inicio
    );

    const end = horariosDia.reduce(
      (max, h) => (h.fin > max ? h.fin : max),
      horariosDia[0].fin
    );

    return { start, end };
  }

  updateBusinessHours() {
    const businessHours = [1, 2, 3, 4, 5, 6, 7].map((numDia) => {
      const { start, end } = this.getGlobalDayRange(numDia);
      return {
        daysOfWeek: [numDia],
        startTime: start,
        endTime: end,
      };
    });

    const allRanges = businessHours.filter((bh) => bh.startTime && bh.endTime);
    const slotMinTime = allRanges.reduce(
      (min, bh) => (bh.startTime < min ? bh.startTime : min),
      allRanges[0]?.startTime || '07:00:00'
    );
    const slotMaxTime = allRanges.reduce(
      (max, bh) => (bh.endTime > max ? bh.endTime : max),
      allRanges[0]?.endTime || '19:30:00'
    );

    this.calendarOptions = {
      ...this.calendarOptions,
      businessHours,
      slotMinTime,
      slotMaxTime,
    };
  }

  /*Hover Effect on Full Calendar event */
  handleEventMouseEnter(info: any) {
    console.log('Info hover evento: ', info);

    const el = info.el as HTMLElement;
    el.classList.add('show-tooltip');

    // Guardamos info en atributos data-* para que CSS pueda usarlos
    el.setAttribute('data-title', info.event.title);
    el.setAttribute(
      'data-date',
      `${info.event.start?.toLocaleDateString()} - ${
        info.event.end?.toLocaleDateString() || ''
      }`
    );
  }

  handleEventMouseLeave(info: any) {
    const el = info.el as HTMLElement;
    el.classList.remove('show-tooltip');
    el.removeAttribute('data-title');
    el.removeAttribute('data-date');
  }
}
