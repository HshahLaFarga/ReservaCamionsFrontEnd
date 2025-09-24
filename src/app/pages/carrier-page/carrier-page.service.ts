import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { Injectable } from '@angular/core';
import { Carrier } from '../../core/models/carrier.model';


@Injectable({
  providedIn: 'root'
})

export class CarrierPageService {


  constructor(
    private http: HttpClient
  ) {}

  getCarriers(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/transportistas`);
  }

  // Mètode no funcional pendent parlar amb hassan per aclarir recursivitat
  deleteCarrier(carrier: Carrier): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/proveedores/${carrier.transporte_id}`);
  }
}
