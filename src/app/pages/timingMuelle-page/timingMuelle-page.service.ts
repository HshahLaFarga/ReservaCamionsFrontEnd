import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { HorarioMuelle } from '../../core/models/horario_muelle';

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

  deleteTimingMuelle(timingMuelle: HorarioMuelle): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/muelle/horarios/${timingMuelle.horarios_muelle_id}`);
  }
}
