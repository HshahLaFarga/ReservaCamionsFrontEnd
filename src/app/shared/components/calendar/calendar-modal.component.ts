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
  restrictions: any[] = []; // Dock restrictions

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
    hiddenDays: [0, 6], // Hide Sunday (0) and Saturday (6)
    resources: this.data.muelles.map((muelle: Muelle) => ({ id: muelle.muelle_id, title: muelle.nombre })),
    events: this.events,
    select: this.onTimeSlotSelected.bind(this),
    selectable: true,
    selectAllow: this.isTimeSlotAllowed.bind(this),
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
    // Load restrictions first, then load bookings
    this.loadRestrictions(() => {
      this.loadTimingsAndBookings();
      this.loadDockBlockages();
    });
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
        // Get IDs of muelles for this material
        const materialMuelleIds = this.data.muelles.map((m: Muelle) => m.muelle_id);

        // Get IDs of restricted muelles (bidirectional)
        const restrictedMuelleIds = this.restrictions
          .filter(r =>
            materialMuelleIds.includes(r.muelle_id) ||
            materialMuelleIds.includes(r.muelle_restringido_id)
          )
          .flatMap(r => [r.muelle_id, r.muelle_restringido_id])
          .filter((id, index, self) => self.indexOf(id) === index); // unique

        // Combine both sets of muelle IDs
        const allRelevantMuelleIds = [...new Set([...materialMuelleIds, ...restrictedMuelleIds])];

        console.log('📊 Muelles relevantes para validación:', {
          materialMuelles: materialMuelleIds,
          restrictedMuelles: restrictedMuelleIds,
          allRelevant: allRelevantMuelleIds
        });

        // Filter bookings to include material muelles AND restricted muelles
        this.bookings = response.filter(b => {
          const muelleId = b.muelle?.muelle_id;
          return muelleId !== undefined && allRelevantMuelleIds.includes(muelleId);
        });

        // Show events for the material's muelles as regular events
        const regularEvents = response
          .filter(b => {
            const muelleId = b.muelle?.muelle_id;
            return muelleId !== undefined && materialMuelleIds.includes(muelleId);
          })
          .map(b => ({
            resourceId: b.muelle?.muelle_id ?? 0,
            title: 'Ocupado',
            start: new Date(b.inicio),
            end: new Date(b.fin),
          }));

        console.log('🔍 Debug restricted events:', {
          materialMuelleIds,
          restrictedMuelleIds,
          allBookings: response.length,
          bookingsInRestrictedDocks: response.filter(b => {
            const muelleId = b.muelle?.muelle_id;
            return muelleId !== undefined &&
              restrictedMuelleIds.includes(muelleId) &&
              !materialMuelleIds.includes(muelleId);
          }).map(b => ({ id: b.reserva_id, muelle: b.muelle?.muelle_id, inicio: b.inicio }))
        });

        // Show bookings from restricted docks as background events
        // These will appear on the material's docks to indicate restriction conflicts
        const restrictedEvents = response
          .filter(b => {
            const muelleId = b.muelle?.muelle_id;
            // Include bookings from ALL restricted docks (both material and non-material)
            return muelleId !== undefined && restrictedMuelleIds.includes(muelleId);
          })
          .flatMap(b => {
            // For each booking on a restricted dock, create background events
            // on all material docks that are restricted by that dock
            const bookingDockId = b.muelle?.muelle_id;

            // Find which material docks are restricted by this booking's dock
            const affectedMaterialDocks = this.restrictions
              .filter(r =>
                (r.muelle_id === bookingDockId && materialMuelleIds.includes(r.muelle_restringido_id)) ||
                (r.muelle_restringido_id === bookingDockId && materialMuelleIds.includes(r.muelle_id))
              )
              .map(r => r.muelle_id === bookingDockId ? r.muelle_restringido_id : r.muelle_id)
              .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates

            // Only create background events on OTHER docks (not the booking's own dock)
            // This prevents duplicating regular events as background events
            const docksToShowRestriction = affectedMaterialDocks.filter(dockId => dockId !== bookingDockId);

            console.log(`  📍 Booking ${b.reserva_id} en muelle ${bookingDockId}: afecta a muelles`, docksToShowRestriction);

            // Create a background event for each affected material dock
            return docksToShowRestriction.map(dockId => ({
              resourceId: dockId,
              title: 'Ocupado',
              start: new Date(b.inicio),
              end: new Date(b.fin),
              display: 'background',
              backgroundColor: '#ff9800', // Orange color for restrictions
              editable: false
            }));
          });

        // Combine regular events and restricted events
        this.events = [...regularEvents, ...restrictedEvents];

        console.log('📊 Eventos generados:', {
          regularEvents: regularEvents.length,
          restrictedEvents: restrictedEvents.length,
          totalEvents: this.events.length,
          restrictedEventsSample: restrictedEvents.slice(0, 5).map(e => ({
            dock: e.resourceId,
            title: e.title,
            start: e.start,
            display: e.display,
            bgColor: e.backgroundColor
          }))
        });

        console.log(`📅 Bookings cargados: ${this.bookings.length} (para validación), Events mostrados: ${this.events.length}`);

        this.setupCalendarOptions();

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error obteniendo reservas', err);
        this.isLoading = false;
      }
    });
  }

  private loadDockBlockages() {
    this._calendarModalService.getDockBlockages().subscribe({
      next: (blockages: any[]) => {
        // Filtrar bloqueos para incluir solo los muelles mostrados
        const relevantBlockages = blockages.filter(bloqueo =>
          this.data.muelles.some((m: Muelle) => m.muelle_id === bloqueo.muelle_id)
        );

        // Convertir bloqueos a eventos de calendario
        const blockageEvents = relevantBlockages.map(bloqueo => ({
          resourceId: bloqueo.muelle_id,
          title: bloqueo.asunto || 'Bloqueado',
          start: new Date(bloqueo.inicio),
          end: new Date(bloqueo.fin),
          display: 'background',
          backgroundColor: '#ff4444',
          editable: false
        }));

        // Añadir eventos de bloqueo a los eventos existentes
        this.events = [...this.events, ...blockageEvents];
        this.setupCalendarOptions();
      },
      error: (err) => {
        console.error('Error cargando bloqueos de muelles', err);
      }
    });
  }

  private loadRestrictions(callback?: () => void) {
    this._calendarModalService.getRestrictions().subscribe({
      next: (restrictions: any[]) => {
        this.restrictions = restrictions;
        console.log('Restricciones cargadas:', restrictions);
        // Execute callback after restrictions are loaded
        if (callback) {
          callback();
        }
      },
      error: (err) => {
        console.error('Error cargando restricciones', err);
        // Execute callback even on error to prevent blocking
        if (callback) {
          callback();
        }
      }
    });
  }

  /**
   * Check if a time slot selection is allowed based on dock restrictions
   * Returns true if allowed, false if blocked
   */
  private isTimeSlotAllowed(selectInfo: any): boolean {
    const selectedDockId = Number(selectInfo.resource?.id); // Convert to number
    const selectedStart = new Date(selectInfo.start);
    const selectedEnd = new Date(selectInfo.end);

    console.log('🔍 Validando selección:', {
      selectedDockId,
      selectedStart: selectedStart.toISOString(),
      selectedEnd: selectedEnd.toISOString(),
      totalBookings: this.bookings.length
    });

    if (!selectedDockId) {
      console.log('⚠️ No hay dock seleccionado, permitiendo');
      return true;
    }

    // Find all docks that are restricted from the selected dock (bidirectional)
    const restrictedDockIds = this.restrictions
      .filter(r =>
        r.muelle_id === selectedDockId || r.muelle_restringido_id === selectedDockId
      )
      .map(r =>
        r.muelle_id === selectedDockId ? r.muelle_restringido_id : r.muelle_id
      );

    console.log('🚫 Muelles restringidos para muelle', selectedDockId, ':', restrictedDockIds);

    if (restrictedDockIds.length === 0) {
      console.log('✅ No hay restricciones, permitiendo');
      return true;
    }

    // Check if any restricted docks have bookings that overlap with the selected time
    const hasConflict = this.bookings.some(booking => {
      const bookingDockId = booking.muelle?.muelle_id;

      console.log('  Checking booking:', {
        bookingId: booking.reserva_id,
        bookingDockId,
        isRestricted: restrictedDockIds.includes(bookingDockId),
        inicio: booking.inicio,
        fin: booking.fin
      });

      // Check if this booking is on a restricted dock
      if (!restrictedDockIds.includes(bookingDockId)) return false;

      // Check for time overlap - normalize dates to handle timezone issues
      // Database returns "2026-02-11 08:00:00" which needs to be parsed as local time
      const bookingStart = new Date(booking.inicio.replace(' ', 'T'));
      const bookingEnd = new Date(booking.fin.replace(' ', 'T'));

      const overlaps = selectedStart < bookingEnd && selectedEnd > bookingStart;

      console.log('  Comparación de tiempos:', {
        selectedStart: selectedStart.toISOString(),
        selectedEnd: selectedEnd.toISOString(),
        bookingStart: bookingStart.toISOString(),
        bookingEnd: bookingEnd.toISOString(),
        overlaps
      });

      if (overlaps) {
        console.log('❌ CONFLICTO encontrado:', {
          bookingDockId,
          bookingStart: bookingStart.toISOString(),
          bookingEnd: bookingEnd.toISOString()
        });
      }

      return overlaps;
    });

    console.log(hasConflict ? '❌ BLOQUEANDO selección' : '✅ PERMITIENDO selección');

    // Return false to block selection if there's a conflict
    return !hasConflict;
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
      resources,
      events: this.events
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
    const resources = this.data.muelles.map((m: Muelle) => {
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
      resources,
      events: this.events
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
