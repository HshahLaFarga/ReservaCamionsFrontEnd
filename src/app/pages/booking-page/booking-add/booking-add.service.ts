import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../core/envoirment/envoirment';
import { Booking } from '../../../core/models/booking.module';

@Injectable({
  providedIn: 'root'
})
export class BookingAddService {
  constructor(
    private http: HttpClient,
  ) {}

  getAllTrucks(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/tipo_camion`, { withCredentials: true});
  }

  getAllMaterials(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/materiales`, { withCredentials: true});
  }

  getAvailableTrucks(materiales: number[]): Observable<any>{
    return this.http.post(`${environment.apiBaseUrl}/controlCamion`,{ materiales }, { withCredentials: true});
  }

  getStatus(): Observable<any>{
    return this.http.get(`${environment.apiBaseUrl}/status`, { withCredentials: true});
  }

  getProvider(): Observable<any>{
    return this.http.get(`${environment.apiBaseUrl}/proveedores`, { withCredentials: true});
  }

  getCarriers(): Observable<any>{
    return this.http.get(`${environment.apiBaseUrl}/transportistas`, { withCredentials: true});
  }

  createReservation(booking: Booking): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/reserva`,booking, { withCredentials: true});
  }
}
