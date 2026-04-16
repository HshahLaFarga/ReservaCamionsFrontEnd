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
import { ToastrService } from 'ngx-toastr';
import { BloqueoMuelle } from '../../core/models/bloqueo_muelle.model';

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

    /* Estilos para No Asistió */
    ::ng-deep .no-asistio-event {
      opacity: 0.6 !important;
      border: 2px dashed #ef4444 !important; /* Rojo descriptivo */
      background-image: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 5px,
        rgba(239, 68, 68, 0.1) 5px,
        rgba(239, 68, 68, 0.1) 10px
      ) !important;
    }
    ::ng-deep .no-asistio-event .fc-event-title {
      text-decoration: line-through !important;
      color: #7f1d1d !important;
    }
    ::ng-deep .no-asistio-badge {
      background-color: #ef4444;
      color: white;
      font-size: 9px;
      font-weight: bold;
      padding: 1px 4px;
      border-radius: 4px;
      text-transform: uppercase;
      margin-bottom: 2px;
      display: inline-block;
    }
  `,
})
export class CalendarPageComponent implements OnInit {
  events: EventInput[] = [];
  bookings: Booking[] = [];
  bloqueos: BloqueoMuelle[] = [];
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
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.loadDefaultData();
    this.calendarOptions.editable = !this.isExternalUser;
    this.calendarOptions.eventDrop = this.handleEventDrop.bind(this);
  }

  get isExternalUser(): boolean {
    return this._loginService.currentUser?.instance === 'entidad';
  }

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    plugins: [dayGridPlugin, interactionPlugin, timeGridPlugin],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Agenda'
    },
    locale: 'es',
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
    slotDuration: '00:10:00',
    eventDurationEditable: false,
    eventDisplay: 'block', // Fuerza que en la vista mes se vea como un recuadro con color de fondo
    dayMaxEvents: true, // En vista mes, acolapsa los eventos si hay muchos en un solo día con '+X más'
    events: [],
    // eventMouseEnter: this.handleEventMouseEnter.bind(this),
    // eventMouseLeave: this.handleEventMouseLeave.bind(this),
    eventClick: (info) => {
      if (this.isExternalUser) return;
      const props = info.event.extendedProps;
      
      if (props['isBloqueo']) {
        this.toastr.info(`Muelle bloqueado: ${props['asunto']}`, 'Bloqueo');
        return;
      }

      this.router.navigate(['/bookings/edit'], {
        state: {
          book: { ...props },
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
      
      if (props['isBloqueo']) {
        this.tooltipData = {
          muelle: props['muelle']?.nombre || 'N/A',
          pedido: 'BLOQUEO DE MUELLE',
          proveedor: props['asunto'] || 'N/A',
          matricula: 'N/A',
        };
      } else {
        this.tooltipData = {
          muelle: props['muelle']?.nombre || 'N/A',
          pedido: props['displayPedido'] || props['pedido1'] || 'N/A',
          proveedor: props['proveedor']?.entidad?.nombre || 'N/A',
          matricula: props['matricula_camion'] || 'S/N',
        };
      }

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
      let html = `<div class="fc-event-main-frame" style="padding: 2px 4px;">`;
      
      const isNoAsistio = props['estado']?.nombre === 'No asistió';

      if (isNoAsistio) {
        html += `<div class="no-asistio-badge">NO ASISTIÓ</div>`;
      }

      // En la vista mensual ('dayGridMonth'), es muy útil ver la hora de inicio y fin porque no hay timeline
      if (arg.view.type === 'dayGridMonth' && !arg.event.allDay) {
        let startTime = '';
        let endTime = '';
        if (arg.event.start) {
          startTime = arg.event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        if (arg.event.end) {
           endTime = arg.event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        html += `<div style="font-weight: bold; font-size: 10px; margin-bottom: 2px;">${startTime} - ${endTime}</div>`;
      }
      
      html += `<div class="fc-event-title-container"><div class="fc-event-title fc-sticky" style="white-space: normal; line-height: 1.2;">${arg.event.title}</div></div>`;

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
    this.getBloqueos();
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
        this.isLoading = false;
      },
    });
  }

  getBloqueos() {
    this.isLoading = true;
    this._calendarPageService.getBloqueosMuelles().subscribe({
      next: (response) => {
        this.bloqueos = response;
        this.filterEventsBySelectedMuelles();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  filterEventsBySelectedMuelles() {
    if (!this.selectedMuelles.length) {
      this.events = [];
    } else {
      const newEvents: EventInput[] = [];

      if (this.bookings && this.bookings.length) {
        this.bookings
          .filter((b) => this.selectedMuelles.includes(b.muelle!.muelle_id))
        .forEach((b) => {
          const { proveedor, material1, material2, inicio, fin, muelle } = b;

          if (this.isExternalUser) {
            newEvents.push({
              groupId: String(b.reserva_id),
              id: `${b.reserva_id}`,
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
          const isNoAsistio = b.estado?.nombre === 'No asistió';
          const noAsistioClass = isNoAsistio ? ['no-asistio-event'] : [];

          if (!material2) {
            // Reserva normal de 1 material
            newEvents.push({
              groupId: String(b.reserva_id),
              id: `${b.reserva_id}`,
              title: titleMat1,
              start: inicio,
              end: fin,
              backgroundColor: muelle?.color,
              classNames: [...noAsistioClass],
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
              groupId: String(b.reserva_id),
              id: `${b.reserva_id}-1`,
              title: titleMat1,
              start: inicio,
              end: fin,
              backgroundColor: muelle?.color,
              classNames: ['split-event', 'split-event-1', ...noAsistioClass],
              extendedProps: {
                ...b,
                displayMaterial: material1?.nombre,
                displayPedido: b.pedido1,
                isSplit: true,
              },
            });

            // Evento 2 (con un estilo ligeramente rayado o diferente en CSS)
            newEvents.push({
              groupId: String(b.reserva_id),
              id: `${b.reserva_id}-2`,
              title: titleMat2,
              start: inicio,
              end: fin,
              backgroundColor: muelle?.color,
              classNames: ['split-event', 'split-event-2', ...noAsistioClass],
              extendedProps: {
                ...b,
                displayMaterial: material2.nombre,
                displayPedido: b.pedido2 || b.pedido1,
                isSplit: true,
              },
            });
          }
        });
      }

      // 🔹 Añadir Bloqueos de Muelle
      if (this.bloqueos && this.bloqueos.length) {
        this.bloqueos
          .filter((bloqueo) => this.selectedMuelles.includes(bloqueo.muelle_id || 0))
        .forEach((bloqueo) => {
          newEvents.push({
            id: `bloqueo-${bloqueo.bloqueo_muelle_id}`,
            title: `BLOQUEADO: ${bloqueo.asunto}`,
            start: bloqueo.inicio,
            end: bloqueo.fin,
            backgroundColor: bloqueo.muelle?.color || '#374151', // Color muelle o gris oscuro
            borderColor: bloqueo.muelle?.color || '#374151',
            classNames: [
              'bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.1)_10px,rgba(0,0,0,0.1)_20px)]',
              'border-2',
              'opacity-90'
            ],
            extendedProps: {
              ...bloqueo,
              isBloqueo: true
            }
          });
        });
      }

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

  handleEventDrop(info: any) {
    if (this.isExternalUser) {
      info.revert();
      return;
    }

    const event = info.event;
    const reserva_id = event.extendedProps['reserva_id'];
    const muelle_id = event.extendedProps['muelle']?.muelle_id || event.extendedProps['muelle_id'];
    
    const startObj = event.start;
    const endObj = event.end;
    
    if (!startObj || !endObj) {
      info.revert();
      return;
    }

    const inicioStr = this.formatDateToMySQL(startObj);
    const finStr = this.formatDateToMySQL(endObj);

    this._calendarPageService.updateBookingTime(reserva_id, {
      inicio: inicioStr,
      fin: finStr,
      muelle_id: muelle_id
    }).subscribe({
      next: (res) => {
        this.toastr.success('Reserva reprogramada exitosamente', 'Actualizada');
      },
      error: (err) => {
        // Revert FullCalendar visually (rollback optimista)
        info.revert();
        const errorMessage = err.error?.message || 'Error al reprogramar la reserva';
        this.toastr.error(errorMessage, 'Movimiento revertido');
      }
    });
  }

  private formatDateToMySQL(date: Date): string {
    const pad = (num: number) => num.toString().padStart(2, '0');
    // Fullcalendar usa fechas locales, así que getFullYear etc devuelve local, coincidiendo visualmente.
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
  }
}
