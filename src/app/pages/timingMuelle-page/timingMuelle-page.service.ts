import { HttpClient } from '@angular/common/http';
import { Component, Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { TimingMuelle } from '../../core/models/timingMuelle.model';

@Injectable({
  providedIn: 'root'
})

export class TimingMuellePageService {

  constructor(
    private http: HttpClient
  ) { }

  getTimingMuelles(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/muelle/horarios`);
  }

  deleteTimingMuelle(timingMuelle: TimingMuelle): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/muelle/horarios/${timingMuelle.horarios_muelle_id}`);
  }
}
