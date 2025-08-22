import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { Booking } from '../../core/models/booking.module';

@Injectable({
  providedIn: 'root'
})

export class LockMuellePageService {

  constructor(
    private http: HttpClient
  ) { }

  getLockMuelles(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/reservas/bloqueos`);
  }

  deleteLockMuelles(lockMuelle: Booking): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/reservas/bloqueo/${lockMuelle.reserva_id}`);
  }
}
