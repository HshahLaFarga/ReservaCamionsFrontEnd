import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../core/envoirment/envoirment';
import { Injectable } from '@angular/core';
import { Carrier } from '../../../core/models/transportista.model';


@Injectable({
  providedIn: 'root'
})

export class CarrierAddUpdateService {

  constructor(
    private http: HttpClient
  ) { }

  storeCarrier(Carrier: Carrier): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/transportistas`,Carrier);
  }

  updateCarrier(Carrier: Carrier, transportista_id: number): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/transportistas/${transportista_id}`,Carrier);
  }
}
