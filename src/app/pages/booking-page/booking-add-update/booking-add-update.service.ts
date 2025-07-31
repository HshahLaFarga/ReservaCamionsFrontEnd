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
    return this.http.get(`${environment.apiBaseUrl}/tipo_camion`, { withCredentials: true});
  }

  getAllMaterials(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}/materiales`, { withCredentials: true});
  }

  getAvailableTrucks(materiales: number[], restrictions: boolean): Observable<any>{
    // Apliquem aquest filtre per evitar que a l'hora de carregar el filtre de l'update, es passi 0 com a material 2
    const materialsFiltrats = materiales.filter(material => material !== 0);
    return this.http.post(`${environment.apiBaseUrl}/controlCamion`,{ materiales: materialsFiltrats, restricciones: restrictions}, { withCredentials: true});
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

  createReservation(booking: any): Observable<any> {
    console.log('creat ' + booking);
    return this.http.post(`${environment.apiBaseUrl}/reserva`,booking, { withCredentials: true});
  }
  updateReservation(booking: any): Observable<any> {
    console.log(booking);
    return this.http.put(`${environment.apiBaseUrl}/reserva/${booking.reserva_id}`,booking, { withCredentials: true});
  }
}
