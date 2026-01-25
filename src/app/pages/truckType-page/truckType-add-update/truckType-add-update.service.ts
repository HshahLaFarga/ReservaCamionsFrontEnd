import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../core/envoirment/envoirment';
import { TipoCamion } from '../../../core/models/tipo_camion.model';

@Injectable({
  providedIn: 'root'
})

export class TruckTypeAddUpdateService {

  constructor(
    private http: HttpClient
  ) { }

  addTruckType(truckType: TipoCamion): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/tipocamiones`,truckType);
  }

  updateTruckType(truckType: TipoCamion, truck_id: number): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/tipocamiones/${truck_id}`,truckType);
  }
}
