import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { Booking } from '../../core/models/booking.module';
// import { Profile } from './reservation-page.types';

@Injectable({
  providedIn: 'root'
})
export class BookingPageService {
  constructor(
    private http: HttpClient
  ) {}

  getAllBookings(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/reserva`);
  }

  deleteBooking(booking: Booking): Observable<any>{
    return this.http.delete(`${environment.apiBaseUrl}/reserva/${booking.reserva_id}`, { withCredentials: true});
  }
}
