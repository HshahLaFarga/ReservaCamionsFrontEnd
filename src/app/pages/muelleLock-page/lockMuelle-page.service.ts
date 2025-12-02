import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { Booking } from '../../core/models/reserva.model';

@Injectable({
  providedIn: 'root'
})

export class LockMuellePageService {

  constructor(
    private http: HttpClient
  ) { }

  getLockMuelles(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/muelle/bloqueos`);
  }

  deleteLockMuelles(lockMuelle: Booking): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/muelle/bloqueo/${lockMuelle.reserva_id}`);
  }
}
