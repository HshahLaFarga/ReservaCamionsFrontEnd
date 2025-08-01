import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { observable, Observable } from 'rxjs';
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
    return this.http.get(`${environment.apiBaseUrl}/tipocamiones`);
  }

  getAllMaterials(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/materiales`);
  }

  getAvailableTrucks(materiales: number[], requirements: boolean): Observable<any>{
    return this.http.post(`${environment.apiBaseUrl}/controlCamion`,{ materiales, restricciones:requirements });
  }

  getStatus(): Observable<any>{
    return this.http.get(`${environment.apiBaseUrl}/status`);
  }

  getProvider(): Observable<any>{
    return this.http.get(`${environment.apiBaseUrl}/proveedores`);
  }

  getCarriers(): Observable<any>{
    return this.http.get(`${environment.apiBaseUrl}/transportistas`);
  }

  createReservation(booking: any): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/reserva`,booking);
  }
  updateReservation(booking: any): Observable<any> {
    console.log(booking);
    return this.http.put(`${environment.apiBaseUrl}/reserva/${booking.reserva_id}`,booking);
  }
}
