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
import { LoginService } from '../../features/auth/login/login.service';
import { Router } from '@angular/router';

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

    ::ng-deep .fc-event-main,
    ::ng-deep .fc-event-title,
    ::ng-deep .fc-event-time {
      font-size: 11px !important;
      color: black !important;
    }

    /* Indicador visual para las reservas partidas (2 materiales) */
    ::ng-deep .split-event {
      border-radius: 4px;
    }
    ::ng-deep .split-event-1 {
      border-bottom: 2px dashed rgba(0, 0, 0, 0.5) !important;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
    ::ng-deep .split-event-2 {
      border-top: 0 !important;
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      opacity: 0.85; /* Un poco más transparente para diferenciarlo */
    }
    
    /* Etiqueta de compra */
    ::ng-deep .purchase-tag-icon {
      position: absolute !important;
      top: 2px !important;
      right: 2px !important;
      font-family: 'Material Icons' !important;
      font-size: 14px !important;
      line-height: 1 !important;
      width: 14px !important;
      height: 14px !important;
      color: rgba(0,0,0,0.6) !important;
      z-index: 10 !important;
      display: inline-block !important;
      background: rgba(255,255,255,0.3);
      border-radius: 50%;
      padding: 1px;
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

  constructor(
    private _calendarPageService: CalendarPageService,
    private _loginService: LoginService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadDefaultData();
  }

  get isExternalUser(): boolean {
    return this._loginService.currentUser?.instance === 'entidad';
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
    displayEventTime: false, // Ocultar la hora en los eventos
    slotLabelFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    },
    slotDuration: '00:10:00', // Cada slot de 30 minutos (hace que se vea más amplio)
    events: [],
    // eventMouseEnter: this.handleEventMouseEnter.bind(this),
    // eventMouseLeave: this.handleEventMouseLeave.bind(this),
    eventClick: (info) => {
      if (this.isExternalUser) return;
      const bookData = info.event.extendedProps;
      this.router.navigate(['/bookings/edit'], {
        state: {
          book: { ...bookData },
          method: 'update',
        },
      });
    },
    eventMouseEnter: (info) => {
      // Si es externo NO mostramos tooltip con detalles
      if (this.isExternalUser) return;

      this.tooltipVisible = true;

      // 1. Cargamos los datos
      const props = info.event.extendedProps;
      this.tooltipData = {
        muelle: props['muelle']?.nombre || 'N/A',
        pedido: props['displayPedido'] || props['pedido1'] || 'N/A',
        proveedor: props['proveedor']?.entidad?.nombre || 'N/A',
        matricula: props['matricula_camion'] || 'S/N',
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
    eventContent: (arg) => {
      // Intentamos recuperar la entidad de "Compra"
      let isCompra = false;
      const props = arg.event.extendedProps;

      if (props['proveedor']?.tipo_proveedor?.nombre) {
        isCompra = props['proveedor'].tipo_proveedor.nombre.toLowerCase() === 'compra';
      } else if (props['proveedor']?.tipo_proveedor_id === 1) {
        isCompra = true;
      }

      // Reconstruimos la estructura base de FullCalendar
      let html = `<div class="fc-event-main-frame">`;
      html += `<div class="fc-event-title-container"><div class="fc-event-title fc-sticky">${arg.event.title}</div></div>`;

      if (isCompra && !this.isExternalUser) {
        html += `<i class="material-icons purchase-tag-icon">sell</i>`;
      }
      html += `</div>`;

      return { html };
    },
    height: '100%',
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
    console.log('Check isExternalUser:', this.isExternalUser);
    this._calendarPageService.getAllBookings().subscribe({
      next: (response) => {
        console.log('Datos raw del backend (Reservas):', response);
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

      const newEvents: EventInput[] = [];

      this.bookings
        .filter((b) => this.selectedMuelles.includes(b.muelle!.muelle_id))
        .forEach((b) => {
          const { proveedor, material1, material2, inicio, fin, muelle } = b;

          if (this.isExternalUser) {
            newEvents.push({
              title: 'OCUPADO',
              start: inicio,
              end: fin,
              backgroundColor: muelle?.color,
              extendedProps: { ...b, isSplit: false },
            });
            return;
          }

          const proveedorNombre = proveedor?.entidad?.nombre || 'Sin proveedor';
          const titleMat1 = `${proveedorNombre} - ${material1?.nombre || 'Sin material'}`;

          if (!material2) {
            // Reserva normal de 1 material
            newEvents.push({
              title: titleMat1,
              start: inicio,
              end: fin,
              backgroundColor: muelle?.color,
              extendedProps: {
                ...b,
                displayMaterial: material1?.nombre,
                displayPedido: b.pedido1,
                isSplit: false,
              },
            });
          } else {
            // Reserva de 2 materiales -> Creamos 2 eventos separados visualmente
            const titleMat2 = `${proveedorNombre} - ${material2.nombre}`;

            // Evento 1
            newEvents.push({
              title: titleMat1,
              start: inicio,
              end: fin,
              backgroundColor: muelle?.color,
              classNames: ['split-event', 'split-event-1'],
              extendedProps: {
                ...b,
                displayMaterial: material1?.nombre,
                displayPedido: b.pedido1,
                isSplit: true,
              },
            });

            // Evento 2 (con un estilo ligeramente rayado o diferente en CSS)
            newEvents.push({
              title: titleMat2,
              start: inicio,
              end: fin,
              backgroundColor: muelle?.color,
              classNames: ['split-event', 'split-event-2'],
              extendedProps: {
                ...b,
                displayMaterial: material2.nombre,
                displayPedido: b.pedido2 || b.pedido1,
                isSplit: true,
              },
            });
          }
        });

      this.events = newEvents;
    }
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.events,
    };
  }

  toggleMuelleSelection(muelleId: number) {
    if (this.selectedMuelles.includes(muelleId)) {
      this.selectedMuelles = this.selectedMuelles.filter(
        (id) => id !== muelleId,
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
      horariosDia[0].inicio,
    );

    const end = horariosDia.reduce(
      (max, h) => (h.fin > max ? h.fin : max),
      horariosDia[0].fin,
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
      allRanges[0]?.startTime || '07:00:00',
    );
    const slotMaxTime = allRanges.reduce(
      (max, bh) => (bh.endTime > max ? bh.endTime : max),
      allRanges[0]?.endTime || '19:30:00',
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
      `${info.event.start?.toLocaleDateString()} - ${info.event.end?.toLocaleDateString() || ''
      }`,
    );
  }

  handleEventMouseLeave(info: any) {
    const el = info.el as HTMLElement;
    el.classList.remove('show-tooltip');
    el.removeAttribute('data-title');
    el.removeAttribute('data-date');
  }
}
