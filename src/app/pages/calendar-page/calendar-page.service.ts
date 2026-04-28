import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';

@Injectable({
  providedIn: 'root'
})
export class CalendarPageService {
  constructor(
    private http: HttpClient
  ) { }

  getAllBookings(start?: string, end?: string): Observable<any> {
    let url = `${environment.apiBaseUrl}/reservas/calendar`;
    if (start && end) {
      url += `?start=${start}&end=${end}`;
    }
    return this.http.get(url);
  }

  getMuelles(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/muelles`);
  }

  updateBookingTime(id: number, payload: { inicio: string, fin: string, muelle_id: number, admin_override?: boolean }): Observable<any> {
    return this.http.patch(`${environment.apiBaseUrl}/reserva/${id}`, payload);
  }

  getBloqueosMuelles(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/muelle/bloqueos`);
  }
}
