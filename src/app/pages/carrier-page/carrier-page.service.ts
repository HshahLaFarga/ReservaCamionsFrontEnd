import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../core/envoirment/envoirment';
import { Injectable } from '@angular/core';
import { Carrier } from '../../core/models/transportista.model';


@Injectable({
  providedIn: 'root'
})

export class CarrierPageService {


  constructor(
    private http: HttpClient
  ) {}

  getTransportistas(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/transportistas`);
  }

  // Mètode no funcional pendent parlar amb hassan per aclarir recursivitat
  deleteCarrier(Carrier: Carrier): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/proveedores/${Carrier.transportista_id}`);
  }
}
