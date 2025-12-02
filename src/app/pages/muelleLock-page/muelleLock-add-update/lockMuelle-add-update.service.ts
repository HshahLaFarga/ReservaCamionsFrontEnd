import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../core/envoirment/envoirment';
import { Booking } from '../../../core/models/reserva.model';

@Injectable({
  providedIn: 'root'
})

export class LockMuelleAddUpdateService {

  constructor(
    private http: HttpClient
  ) { }

  addLockMuelle(lockMuelle: Booking): Observable<any> {
    console.log(lockMuelle);
    return this.http.post(`${environment.apiBaseUrl}/muelle/bloqueos`,lockMuelle);
  }

  updateLockMuelle(lockMuelle: Booking, lockMuelle_id: number): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/muelle/bloqueos/${lockMuelle_id}`,lockMuelle);
  }
}
