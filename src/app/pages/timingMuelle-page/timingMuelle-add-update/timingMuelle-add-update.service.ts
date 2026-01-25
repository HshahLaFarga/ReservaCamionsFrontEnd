import { HttpClient } from '@angular/common/http';
import { Component, Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../core/envoirment/envoirment';
import { HorarioMuelle } from '../../../core/models/horario_muelle';

@Injectable({
  providedIn: 'root'
})

export class TimingMuelleAddUpdateService {

  constructor(
    private http: HttpClient
  ) { }

  addTimingMuelle(timingMuelle: HorarioMuelle): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/muelle/horarios`,timingMuelle);
  }

  updateTimingMuelle(timingMuelle: HorarioMuelle, timingMuelle_id: number): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/muelle/horarios/${timingMuelle_id}`,timingMuelle);
  }
}
