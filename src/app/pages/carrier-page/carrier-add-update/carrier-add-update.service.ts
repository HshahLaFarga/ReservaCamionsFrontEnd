import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../core/envoirment/envoirment';
import { Injectable } from '@angular/core';
import { Carrier } from '../../../core/models/carrier.model';


@Injectable({
  providedIn: 'root'
})

export class CarrierAddUpdateService {

  constructor(
    private http: HttpClient
  ) { }

  storeCarrier(carrier: Carrier): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/transportistas`,carrier);
  }

  updateCarrier(carrier: Carrier, carrier_id: number): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/transportistas/${carrier_id}`,carrier);
  }
}
