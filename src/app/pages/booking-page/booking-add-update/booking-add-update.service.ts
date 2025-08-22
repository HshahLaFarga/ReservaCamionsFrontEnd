import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { observable, Observable } from 'rxjs';
import { environment } from '../../../core/envoirment/envoirment';

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
    materiales = materiales.filter(m => m !== 0);
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

  updateReservation(formData: FormData): Observable<any> {
    return this.http.post(`${environment.apiBaseUrl}/reserva/${formData.get('reserva_id')}`, formData);
  }

  deleteFile(document_booking_id: number): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/file/name/${document_booking_id}`);
  }

  getWeightRange(): Observable<any>{
    return this.http.get(`${environment.apiBaseUrl}/rango/cantidad`);
  }
}
