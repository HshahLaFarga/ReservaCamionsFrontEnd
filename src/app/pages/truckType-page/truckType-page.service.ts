import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';

@Injectable({
  providedIn: 'root'
})

export class TruckTypePageService {

  constructor(
    private http: HttpClient
  ) {}

  getTruckTypes(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/tipocamiones`);
  }

  deleteTruckType(tipo_camion_id: number): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/tipocamiones/${tipo_camion_id}`);
  }
}
