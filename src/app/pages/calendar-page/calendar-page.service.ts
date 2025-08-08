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
  ) {}

  getAllBookings(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/reserva`);
  }

  getMuelles(): Observable<any>{
    return this.http.get(`${environment.apiBaseUrl}/muelles`);
  }
}
