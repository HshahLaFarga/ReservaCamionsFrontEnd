import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../core/envoirment/envoirment';

@Injectable({
  providedIn: 'root'
})
export class CalendarModalService {
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
  getTimingMuelle(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/muelle/horarios`);
  }

  getDockBlockages(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/muelle/bloqueos`);
  }

  getRestrictions(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/restricciones`);
  }
}
